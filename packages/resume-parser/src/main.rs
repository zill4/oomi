mod config;
mod error;
mod logging;
mod pdf;
mod text;
mod resume;
mod entities;
mod models;
mod parser;
mod scoring;
mod storage;
mod queue;
mod metrics;
mod health;
mod notifications;

use crate::config::Config;
use crate::error::{ParserError, Result};
use crate::queue::QueueClient;
use tracing::info;

#[tokio::main]
async fn main() -> Result<()> {
    // Initialize logging and metrics
    logging::init_logging().map_err(|e| ParserError::Config(e.to_string()))?;
    metrics::register_metrics();
    info!("Starting resume-parser service");

    // Load configuration
    let config = Config::new()?;

    // Initialize queue client
    let queue_client = QueueClient::new(&config.queue.url).await?;
    info!("Connected to message queue");

    // Start processing jobs
    info!("Waiting for parse jobs...");
    queue_client.process_jobs().await?;

    Ok(())
}
