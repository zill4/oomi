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

use config::Config;
use error::{ParserError, Result};
use queue::QueueClient;
use tracing::{info, error};

#[tokio::main]
async fn main() -> Result<()> {
    // Initialize logging
    logging::init_logging()?;
    info!("Starting resume-parser service");

    // Load configuration
    let config = Config::new()?;
    config.validate()?;

    // Initialize queue client
    let queue_client = QueueClient::new(&config.queue.url).await?;
    info!("Connected to message queue");

    // Start processing jobs
    info!("Waiting for parse jobs...");
    queue_client.process_jobs().await?;

    Ok(())
}
