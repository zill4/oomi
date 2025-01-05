mod config;
mod error;
mod logging;

use config::Config;
use error::{ParserError, Result};
use tokio::signal;
use tracing::{info, instrument};

#[tokio::main]
async fn main() -> Result<()> {
    // Initialize logging
    if let Err(e) = logging::init_logging() {
        eprintln!("Failed to initialize logging: {}", e);
        return Err(ParserError::Config("Failed to initialize logging".into()));
    }

    // Load configuration
    let config = Config::new().map_err(|e| ParserError::Config(e.to_string()))?;
    
    // Validate configuration
    if let Err(e) = config.validate() {
        return Err(ParserError::Config(e));
    }

    info!(
        version = env!("CARGO_PKG_VERSION"),
        environment = %config.environment,
        "Resume Parser Service starting up..."
    );

    // Run the service until interrupted
    run_service(config).await?;

    info!("Resume Parser Service shutting down...");
    Ok(())
}

#[instrument(skip(config))]
async fn run_service(config: Config) -> Result<()> {
    info!(
        "Service configured and running...\n\
        Database URL: {}\n\
        S3 Configuration:\n\
          - Bucket: {}\n\
          - Region: {}\n\
          - Endpoint: {:?}\n\
        Queue URL: {}",
        config.database.url,
        config.s3.bucket,
        config.s3.region,
        config.s3.endpoint.as_deref().unwrap_or("not set"),
        config.queue.url
    );

    // Create a future that never resolves
    let running = tokio::spawn(async {
        loop {
            tokio::time::sleep(tokio::time::Duration::from_secs(60)).await;
            info!("Service heartbeat...");
        }
    });

    // Wait for interrupt signal
    match signal::ctrl_c().await {
        Ok(()) => {
            info!("Interrupt received, starting graceful shutdown");
            running.abort();
        }
        Err(err) => {
            eprintln!("Unable to listen for shutdown signal: {}", err);
            running.abort();
        }
    }

    Ok(())
}
