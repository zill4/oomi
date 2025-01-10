use crate::error::{ParserError, Result};
use crate::notifications::{NotificationClient, ParseResult};
use futures_util::StreamExt;
use lapin::{
    options::*, types::FieldTable, Connection, ConnectionProperties,
    Channel, message::Delivery, Consumer
};
use serde::{Deserialize, Serialize};
use tokio::time::Duration;
use tracing::{error, info};
use crate::parser::ResumeParser;
use crate::storage::S3Client;
use chrono::Utc;
use crate::models::ResumeData;

const PROCESSING_TIMEOUT: Duration = Duration::from_secs(300); // 5 minutes

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ParseJob {
    pub resumeId: String,
    pub userId: String,
    pub pdf_key: String,
    pub retries: Option<u32>,
    pub callback_url: String,
}

pub struct QueueClient {
    channel: Channel,
    queue_name: String,
    notification_client: NotificationClient,
}

impl QueueClient {
    pub async fn new(queue_url: &str) -> Result<Self> {
        info!("Connecting to RabbitMQ at: {}", queue_url);
        
        let connection = match Connection::connect(
            queue_url,
            ConnectionProperties::default()
        ).await {
            Ok(conn) => {
                info!("Successfully connected to RabbitMQ");
                conn
            },
            Err(e) => {
                error!("Failed to connect to RabbitMQ: {}", e);
                return Err(ParserError::Queue {
                    message: format!("Failed to connect to RabbitMQ: {}", e),
                    source: None,
                });
            }
        };

        let channel = match connection.create_channel().await {
            Ok(ch) => {
                info!("Successfully created RabbitMQ channel");
                ch
            },
            Err(e) => {
                error!("Failed to create RabbitMQ channel: {}", e);
                return Err(ParserError::Queue {
                    message: format!("Failed to create channel: {}", e),
                    source: None,
                });
            }
        };

        // Declare the queue
        info!("Declaring queue...");
        match channel
            .queue_declare(
                "resume_parsing",
                QueueDeclareOptions {
                    durable: true,
                    auto_delete: false,
                    ..QueueDeclareOptions::default()
                },
                FieldTable::default(),
            )
            .await {
                Ok(_) => info!("Queue declared successfully"),
                Err(e) => error!("Failed to declare queue: {}", e),
            };

        let notification_client = NotificationClient::new(channel.clone()).await?;

        Ok(Self {
            channel,
            queue_name: "resume_parsing".to_string(),
            notification_client,
        })
    }

    pub async fn process_jobs(&self) -> Result<()> {
        info!("Starting to process jobs...");
        
        info!("Waiting for messages...");
        
        let mut consecutive_errors = 0;
        const MAX_CONSECUTIVE_ERRORS: u32 = 10;
        const BASE_DELAY: u64 = 5;
        
        loop {
            info!("Setting up consumer...");
            match self.setup_consumer().await {
                Ok(mut consumer) => {
                    info!("Consumer setup successful, waiting for messages");
                    consecutive_errors = 0; // Reset error count on success
                    
                    while let Some(delivery) = consumer.next().await {
                        info!("Received delivery");
                        match delivery {
                            Ok(delivery) => {
                                info!("Processing delivery");
                                if let Err(e) = self.handle_job(&delivery).await {
                                    error!("Failed to process job: {:?}", e);
                                    consecutive_errors += 1;
                                } else {
                                    consecutive_errors = 0; // Reset on success
                                }
                            }
                            Err(e) => {
                                error!("Error receiving delivery: {:?}", e);
                                consecutive_errors += 1;
                            }
                        }

                        // Exponential backoff if we're having issues
                        if consecutive_errors > 0 {
                            let delay = BASE_DELAY * (2_u64.pow(consecutive_errors.min(6)));
                            tokio::time::sleep(Duration::from_secs(delay)).await;
                        }

                        // Safety check - exit if too many consecutive errors
                        if consecutive_errors >= MAX_CONSECUTIVE_ERRORS {
                            error!("Too many consecutive errors ({}), exiting", consecutive_errors);
                            return Err(ParserError::Queue {
                                message: "Too many consecutive errors".to_string(),
                                source: None,
                            });
                        }
                    }
                }
                Err(e) => {
                    error!("Failed to setup consumer: {:?}", e);
                    consecutive_errors += 1;
                    let delay = BASE_DELAY * (2_u64.pow(consecutive_errors.min(6)));
                    tokio::time::sleep(Duration::from_secs(delay)).await;
                }
            }
            
            error!("Consumer loop ended unexpectedly, restarting...");
        }
    }

    async fn setup_consumer(&self) -> Result<Consumer> {
        self.channel
            .basic_qos(1, BasicQosOptions::default())
            .await?;

        let consumer = self.channel
            .basic_consume(
                &self.queue_name,
                "resume-parser",
                BasicConsumeOptions::default(),
                FieldTable::default(),
            )
            .await?;

        Ok(consumer)
    }

    async fn handle_job(&self, delivery: &Delivery) -> Result<()> {
        const MAX_RETRIES: u32 = 3;
        
        info!("Received message: {}", String::from_utf8_lossy(&delivery.data));
        
        let job: ParseJob = match serde_json::from_slice(&delivery.data) {
            Ok(job) => {
                info!("Successfully parsed job data: {:?}", job);
                job
            },
            Err(e) => {
                error!("Failed to parse job data: {}", e);
                return Err(ParserError::Queue {
                    message: format!("Failed to parse job data: {}", e),
                    source: None,
                });
            }
        };

        let attempt = job.retries.unwrap_or(0) + 1;
        info!("Processing attempt {} for resumeId: {}", attempt, job.resumeId);

        if attempt > MAX_RETRIES {
            error!("Job exceeded maximum retry attempts: {}", serde_json::to_string(&job)?);
            return Err(ParserError::Queue { 
                message: "Max retries exceeded".to_string(),
                source: None 
            });
        }

        info!("Processing job for resumeId: {}", job.resumeId);

        // Process the job
        match self.process_job(job.clone(), attempt).await {
            Ok(_) => {
                info!("Successfully processed job for resumeId: {}", job.resumeId);
            }
            Err(e) => {
                error!("Failed to process job for resumeId {}: {:?}", job.resumeId, e);
                return Err(e);
            }
        }

        // Acknowledge the message
        match self.channel
            .basic_ack(delivery.delivery_tag, BasicAckOptions::default())
            .await {
                Ok(_) => info!("Successfully acknowledged message for resumeId: {}", job.resumeId),
                Err(e) => error!("Failed to acknowledge message: {}", e),
            }

        Ok(())
    }

    async fn handle_timeout(&self, job: &ParseJob) -> Result<()> {
        let result = ParseResult {
            resumeId: job.resumeId.clone(),
            userId: job.userId.clone(),
            pdf_key: job.pdf_key.clone(),
            status: "timeout".to_string(),
            parsed_data: ResumeData::default(),
            confidence: None,
            result_key: None,
            error: Some("Processing timed out".to_string()),
            timestamp: chrono::Utc::now().to_rfc3339(),
        };

        self.notification_client.notify_completion(result).await
    }

    async fn process_job(&self, job: ParseJob, retry_count: u32) -> Result<()> {
        info!("Starting to process resume for user: {}, pdf: {}, attempt: {}", 
            job.userId, job.pdf_key, retry_count);

        let s3_client = match S3Client::new().await {
            Ok(client) => {
                info!("Successfully created S3 client");
                client
            },
            Err(e) => {
                error!("Failed to create S3 client: {}", e);
                return Err(e);
            }
        };
        
        // Get the PDF from S3
        info!("Fetching PDF from S3: {}", job.pdf_key);
        let pdf_data = match s3_client.get_file(&job.pdf_key).await {
            Ok(data) => {
                info!("Successfully fetched PDF from S3");
                data
            },
            Err(e) => {
                error!("Failed to fetch PDF from S3: {}", e);
                return Err(e);
            }
        };

        // Parse the resume
        info!("Starting resume parsing");
        let resume_data = match ResumeParser::parse_from_bytes(&pdf_data).await {
            Ok(data) => {
                info!("Successfully parsed resume");
                data
            },
            Err(e) => {
                error!("Failed to parse resume: {}", e);
                return Err(e);
            }
        };

        // Send notification to backend
        let notification = ParseResult {
            resumeId: job.resumeId,
            userId: job.userId,
            pdf_key: job.pdf_key.clone(),
            status: "completed".to_string(),
            parsed_data: resume_data,
            confidence: Some(0.8),
            result_key: None,
            error: None,
            timestamp: Utc::now().to_rfc3339(),
        };

        let client = reqwest::Client::new();
        let response = client
            .post(&job.callback_url)
            .json(&notification)
            .send()
            .await?;

        if !response.status().is_success() {
            error!("Failed to send notification: {}", response.status());
            return Err(ParserError::Http("Failed to send notification".to_string()));
        }

        info!("Successfully sent parse notification");

        Ok(())
    }
}