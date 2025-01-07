use crate::error::Result;
use crate::metrics::QUEUE_OPERATIONS;
use lapin::{
    options::*, types::FieldTable, Channel,
    BasicProperties,
};
use serde::Serialize;
use tracing::info;

const RESULT_QUEUE: &str = "resume_parsing_results";

#[derive(Debug, Serialize, Clone)]
pub struct ParseResult {
    pub resume_id: String,
    pub user_id: String,
    pub pdf_key: String,
    pub status: String,
    pub result_key: Option<String>,
    pub error: Option<String>,
    pub timestamp: String,
}

#[derive(Clone)]
pub struct NotificationClient {
    channel: Channel,
}

impl NotificationClient {
    pub async fn new(channel: Channel) -> Result<Self> {
        channel.queue_declare(
            RESULT_QUEUE,
            QueueDeclareOptions::default(),
            FieldTable::default(),
        ).await?;

        Ok(Self { channel })
    }

    pub async fn notify_completion(&self, result: ParseResult) -> Result<()> {
        info!("Sending completion notification for resume: {}", result.resume_id);
        QUEUE_OPERATIONS.with_label_values(&["notify", "success"]).inc();

        self.channel
            .basic_publish(
                "",
                RESULT_QUEUE,
                BasicPublishOptions::default(),
                &serde_json::to_vec(&result)?,
                BasicProperties::default()
                    .with_content_type("application/json".into())
                    .with_delivery_mode(2), // persistent delivery
            )
            .await?;

        Ok(())
    }
} 