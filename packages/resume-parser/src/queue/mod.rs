use lapin::{
    options::*, types::FieldTable, BasicProperties,
    Connection, ConnectionProperties, Channel
};
use crate::error::{ParserError, Result};
use tracing::{error, info};
use serde::{Serialize, Deserialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct ParseJob {
    pub resume_id: String,
    pub user_id: String,
    pub pdf_key: String,
}

pub struct QueueClient {
    channel: Channel,
}

impl QueueClient {
    pub async fn new(url: &str) -> Result<Self> {
        let conn = Connection::connect(
            url,
            ConnectionProperties::default()
        ).await.map_err(|e| {
            error!("Failed to connect to RabbitMQ: {}", e);
            ParserError::Queue {
                message: e.to_string(),
                operation: "connect".into()
            }
        })?;

        let channel = conn.create_channel().await.map_err(|e| {
            error!("Failed to create channel: {}", e);
            ParserError::Queue {
                message: e.to_string(),
                operation: "create_channel".into()
            }
        })?;

        // Declare the queue
        channel
            .queue_declare(
                "resume_parse_queue",
                QueueDeclareOptions::default(),
                FieldTable::default(),
            )
            .await
            .map_err(|e| {
                error!("Failed to declare queue: {}", e);
                ParserError::Queue {
                    message: e.to_string(),
                    operation: "queue_declare".into()
                }
            })?;

        info!("Successfully connected to RabbitMQ");
        Ok(Self { channel })
    }

    pub async fn publish_job(&self, job: ParseJob) -> Result<()> {
        let payload = serde_json::to_vec(&job).map_err(|e| {
            error!("Failed to serialize job: {}", e);
            ParserError::Queue {
                message: e.to_string(),
                operation: "serialize".into()
            }
        })?;

        self.channel
            .basic_publish(
                "",
                "resume_parse_queue",
                BasicPublishOptions::default(),
                &payload,
                BasicProperties::default(),
            )
            .await
            .map_err(|e| {
                error!("Failed to publish job: {}", e);
                ParserError::Queue {
                    message: e.to_string(),
                    operation: "publish".into()
                }
            })?;

        info!("Successfully published parse job for resume: {}", job.resume_id);
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tokio;
    use std::env;

    fn get_test_url() -> String {
        env::var("RABBITMQ_URL")
            .unwrap_or_else(|_| "amqp://guest:guest@localhost:5672".to_string())
    }

    #[tokio::test]
    async fn test_queue_connection() {
        let client = QueueClient::new(&get_test_url()).await;
        assert!(client.is_ok(), "Should connect to RabbitMQ successfully");
    }

    #[tokio::test]
    async fn test_publish_job() {
        let client = QueueClient::new(&get_test_url())
            .await
            .expect("Failed to create queue client");

        let job = ParseJob {
            resume_id: "test-resume-123".to_string(),
            user_id: "test-user-123".to_string(),
            pdf_key: "test-key.pdf".to_string(),
        };

        let result = client.publish_job(job).await;
        assert!(result.is_ok(), "Should publish job successfully");
    }

    #[tokio::test]
    async fn test_queue_declaration() {
        let client = QueueClient::new(&get_test_url())
            .await
            .expect("Failed to create queue client");

        // Test queue exists by trying to declare it again
        let result = client.channel
            .queue_declare(
                "resume_parse_queue",
                QueueDeclareOptions::default(),
                FieldTable::default(),
            )
            .await;

        assert!(result.is_ok(), "Queue should exist and be declarable");
    }

    #[tokio::test]
    async fn test_invalid_connection() {
        let result = QueueClient::new("amqp://invalid:5672").await;
        assert!(result.is_err(), "Should fail with invalid connection URL");
    }
}
