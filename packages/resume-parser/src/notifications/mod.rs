use crate::error::Result;
use crate::metrics::QUEUE_OPERATIONS;
use lapin::{
    options::*, types::FieldTable, Channel,
    BasicProperties,
};
use serde::Serialize;
use tracing::info;
use crate::models::ResumeData;

const RESULT_QUEUE: &str = "resume_parsing_results";

#[derive(Debug, Serialize)]
pub struct ParseResult {
    pub resumeId: String,
    pub userId: String,
    pub pdf_key: String,
    pub status: String,
    pub result_key: Option<String>,
    pub parsed_data: ResumeData,
    pub confidence: Option<f64>,
    pub error: Option<String>,
    pub timestamp: String,
}

impl Clone for ParseResult {
    fn clone(&self) -> Self {
        ParseResult {
            resumeId: self.resumeId.clone(),
            userId: self.userId.clone(),
            pdf_key: self.pdf_key.clone(),
            status: self.status.clone(),
            result_key: self.result_key.clone(),
            parsed_data: self.parsed_data.clone(),
            confidence: self.confidence,
            error: self.error.clone(),
            timestamp: self.timestamp.clone(),
        }
    }
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
        info!("Sending completion notification for resume: {}", result.resumeId);
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