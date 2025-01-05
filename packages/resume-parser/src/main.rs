mod error;
mod logging;

use error::{ParserError, Result};
use tracing::{info, instrument};

#[tokio::main]
async fn main() -> Result<()> {
    // Initialize logging
    if let Err(e) = logging::init_logging() {
        eprintln!("Failed to initialize logging: {}", e);
        return Err(ParserError::Config("Failed to initialize logging".into()));
    }

    info!(
        version = env!("CARGO_PKG_VERSION"),
        "Resume Parser Service starting up..."
    );

    // Example structured logging
    let log_level = logging::get_log_level();
    info!(
        level = ?log_level,
        "Log level configured"
    );

    run_service().await
}

#[instrument]
async fn run_service() -> Result<()> {
    info!("Service running...");
    // Future service logic will go here
    Ok(())
}
