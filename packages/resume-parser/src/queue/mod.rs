use crate::error::{ParserError, Result};
use crate::metrics::ACTIVE_JOBS;
use crate::notifications::{NotificationClient, ParseResult};
use futures_util::StreamExt;
use lapin::{
    options::*, types::FieldTable, Connection, ConnectionProperties,
    Channel,
};
use serde::{Deserialize, Serialize};
use tokio::time::{timeout, Duration};
use tracing::{error, info};
use crate::parser::ResumeParser;
use crate::storage::S3Client;

const PROCESSING_TIMEOUT: Duration = Duration::from_secs(300); // 5 minutes

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ParseJob {
    pub resume_id: String,
    pub user_id: String,
    pub pdf_key: String,
    pub retries: Option<u32>,
}

pub struct QueueClient {
    channel: Channel,
    queue_name: String,
    notification_client: NotificationClient,
}

impl QueueClient {
    pub async fn new(url: &str) -> Result<Self> {
        let conn = Connection::connect(
            url,
            ConnectionProperties::default(),
        ).await.map_err(|e| ParserError::Queue {
            message: format!("Failed to connect: {}", e),
            source: Some(e),
        })?;

        let channel = conn.create_channel().await?;
        
        // Declare main queue
        channel.queue_declare(
            "resume_parsing",
            QueueDeclareOptions::default(),
            FieldTable::default(),
        ).await?;

        let notification_client = NotificationClient::new(channel.clone()).await?;

        Ok(Self {
            channel,
            queue_name: "resume_parsing".to_string(),
            notification_client,
        })
    }

    pub async fn process_jobs(&self) -> Result<()> {
        info!("Starting to consume jobs from queue: {}", self.queue_name);

        let mut consumer = self.channel.basic_consume(
            &self.queue_name,
            "resume_parser",
            BasicConsumeOptions::default(),
            FieldTable::default(),
        ).await?;

        while let Some(delivery) = consumer.next().await {
            match delivery {
                Ok(delivery) => {
                    let job: ParseJob = serde_json::from_slice(&delivery.data)
                        .map_err(|e| ParserError::InvalidData {
                            message: format!("Failed to parse job: {}", e),
                            field: None,
                        })?;

                    ACTIVE_JOBS.inc();
                    let retry_count = job.retries.unwrap_or(0);

                    match timeout(PROCESSING_TIMEOUT, self.process_job(job.clone(), retry_count)).await {
                        Ok(process_result) => {
                            match process_result {
                                Ok(_) => {
                                    self.channel
                                        .basic_ack(delivery.delivery_tag, BasicAckOptions::default())
                                        .await?;
                                }
                                Err(_) => {
                                    self.channel
                                        .basic_nack(delivery.delivery_tag, BasicNackOptions::default())
                                        .await?;
                                }
                            }
                        }
                        Err(_) => {
                            error!("Job processing timed out");
                            self.handle_timeout(&job).await?;
                            self.channel
                                .basic_nack(delivery.delivery_tag, BasicNackOptions::default())
                                .await?;
                        }
                    }
                    ACTIVE_JOBS.dec();
                }
                Err(e) => {
                    error!("Failed to receive message: {}", e);
                }
            }
        }

        Ok(())
    }

    async fn handle_timeout(&self, job: &ParseJob) -> Result<()> {
        let result = ParseResult {
            resume_id: job.resume_id.clone(),
            user_id: job.user_id.clone(),
            pdf_key: job.pdf_key.clone(),
            status: "timeout".to_string(),
            result_key: None,
            error: Some("Processing timed out".to_string()),
            timestamp: chrono::Utc::now().to_rfc3339(),
        };

        self.notification_client.notify_completion(result).await
    }

    async fn process_job(&self, job: ParseJob, retry_count: u32) -> Result<()> {
        const MAX_RETRIES: u32 = 3;
        
        info!("Processing resume for user: {}, pdf: {}, attempt: {}", 
            job.user_id, job.pdf_key, retry_count + 1);

        let s3_client = S3Client::new().await?;
        
        // Get the PDF from S3
        let pdf_data = s3_client.get_file(&job.pdf_key).await?;

        // Parse the resume
        let resume_data = ResumeParser::parse_from_bytes(&pdf_data).await?;

        // Store results in S3
        let result_key = s3_client
            .store_results(&job.user_id, &job.pdf_key, &serde_json::to_vec(&resume_data)?)
            .await?;

        // Send completion notification
        let result = ParseResult {
            resume_id: job.resume_id.clone(),
            user_id: job.user_id.clone(),
            pdf_key: job.pdf_key.clone(),
            status: "completed".to_string(),
            result_key: Some(result_key),
            error: None,
            timestamp: chrono::Utc::now().to_rfc3339(),
        };

        self.notification_client.notify_completion(result).await
    }
}
