use lapin::{
    options::*, types::FieldTable, BasicProperties,
    Connection, ConnectionProperties, Channel
};
use crate::error::{ParserError, Result};
use tracing::{error, info};
use serde::{Serialize, Deserialize};
use crate::parser::ResumeParser;
use crate::storage::S3Client;
use serde_json::json;

#[derive(Debug, Serialize, Deserialize)]
pub struct ParseJob {
    pub resume_id: String,
    pub user_id: String,
    pub pdf_key: String,
}

pub struct QueueClient {
    channel: Channel,
    queue_name: String,
}

impl QueueClient {
    pub async fn new(url: &str) -> Result<Self> {
        // Connect to RabbitMQ
        let conn = Connection::connect(
            url,
            ConnectionProperties::default()
        ).await.map_err(|e| {
            error!("Failed to connect to RabbitMQ: {}", e);
            ParserError::Queue(format!("Connection error: {}", e))
        })?;

        // Create channel
        let channel = conn.create_channel().await.map_err(|e| {
            error!("Failed to create channel: {}", e);
            ParserError::Queue(format!("Channel creation error: {}", e))
        })?;

        // Declare queue
        let queue_name = "resume_parsing";
        channel.queue_declare(
            queue_name,
            QueueDeclareOptions::default(),
            FieldTable::default()
        ).await.map_err(|e| {
            error!("Failed to declare queue: {}", e);
            ParserError::Queue(format!("Queue declaration error: {}", e))
        })?;

        Ok(Self { channel, queue_name: queue_name.to_string() })
    }

    pub async fn process_jobs(&self) -> Result<()> {
        info!("Starting to consume jobs from queue: {}", self.queue_name);

        let mut consumer = self.channel.basic_consume(
            &self.queue_name,
            "resume_parser",
            BasicConsumeOptions::default(),
            FieldTable::default(),
        ).await.map_err(|e| ParserError::Queue(format!("Consumer error: {}", e)))?;

        while let Some(delivery) = consumer.next().await {
            match delivery {
                Ok(delivery) => {
                    let job: ParseJob = serde_json::from_slice(&delivery.data)
                        .map_err(|e| ParserError::Queue(format!("Job parsing error: {}", e)))?;

                    info!("Processing job: {:?}", job);
                    // Process job here...

                    self.channel.basic_ack(
                        delivery.delivery_tag,
                        BasicAckOptions::default()
                    ).await.map_err(|e| ParserError::Queue(format!("Ack error: {}", e)))?;
                }
                Err(e) => {
                    error!("Error receiving message: {}", e);
                }
            }
        }

        Ok(())
    }

    async fn process_job(&self, job: ParseJob) -> Result<()> {
        info!("Processing resume for user: {}, pdf: {}", job.user_id, job.pdf_key);

        // Initialize S3 client
        let s3_client = S3Client::new().await?;
        
        // Get the PDF from S3
        let pdf_data = s3_client.get_file(&job.pdf_key).await?;

        // Parse the resume
        let resume_data = ResumeParser::parse_from_bytes(&pdf_data).await?;

        // Store results in S3
        let results = json!({
            "user_id": job.user_id,
            "pdf_key": job.pdf_key,
            "resume_id": job.resume_id,
            "parsed_data": resume_data,
            "status": "completed",
            "timestamp": chrono::Utc::now().to_rfc3339()
        });

        let result_key = s3_client
            .store_results(&job.user_id, &job.pdf_key, &serde_json::to_vec(&results)?)
            .await?;

        info!("Successfully processed resume. Results stored at: {}", result_key);
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tokio;

    fn get_test_url() -> String {
        std::env::var("TEST_RABBITMQ_URL")
            .unwrap_or_else(|_| "amqp://guest:guest@localhost:5672".to_string())
    }

    #[tokio::test]
    async fn test_queue_connection() {
        let result = QueueClient::new(&get_test_url()).await;
        assert!(result.is_ok(), "Should connect to RabbitMQ successfully");
    }

    #[tokio::test]
    async fn test_invalid_connection() {
        let result = QueueClient::new("amqp://invalid:5672").await;
        assert!(result.is_err(), "Should fail with invalid connection URL");
    }
}
