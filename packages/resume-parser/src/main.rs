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
use tracing_subscriber::{
    filter::{EnvFilter, LevelFilter},
    fmt::format::FmtSpan,
    layer::SubscriberExt,
    util::SubscriberInitExt,
};

#[tokio::main]
async fn main() -> Result<()> {
    // Configure logging to filter out noisy AWS SDK logs but keep our app logs
    let filter = EnvFilter::builder()
        .with_default_directive(LevelFilter::DEBUG.into())
        .parse("resume_parser=debug,info")?;

    // Build a subscriber with our custom configuration
    let subscriber = tracing_subscriber::registry()
        .with(tracing_subscriber::fmt::layer()
            .with_span_events(FmtSpan::CLOSE)
            .with_target(true)
            .with_thread_ids(true)
            .with_line_number(true)
            .with_file(true))  // Add file name to logs
        .with(filter);

    // Set the subscriber as the default in a way that won't panic
    match subscriber.try_init() {
        Ok(_) => info!("Logging initialized successfully"),
        Err(e) => eprintln!("Warning: Could not initialize logging: {}", e),
    }

    info!("Starting resume-parser service with version {}", env!("CARGO_PKG_VERSION"));
    
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
