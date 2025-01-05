mod config;
mod error;
mod logging;
mod server;
mod pdf;
mod text;
mod resume;
mod entities;

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

    // Run both the service and HTTP server
    run_service(config).await?;

    info!("Resume Parser Service shutting down...");
    Ok(())
}

#[instrument(skip(config))]
async fn run_service(config: Config) -> Result<()> {
    info!(
        "Service configured and running...\n\
        Server port: {}\n\
        Database URL: {}\n\
        S3 Configuration:\n\
          - Bucket: {}\n\
          - Region: {}\n\
          - Endpoint: {:?}\n\
        Queue URL: {}",
        config.server.port,
        config.database.url,
        config.s3.bucket,
        config.s3.region,
        config.s3.endpoint.as_deref().unwrap_or("not set"),
        config.queue.url
    );

    // Spawn the health check server
    let server_handle = tokio::spawn(server::start_server(
        config.server.port,
        config.environment.clone(),
    ));

    // Create the heartbeat task
    let heartbeat = tokio::spawn(async {
        loop {
            tokio::time::sleep(tokio::time::Duration::from_secs(60)).await;
            info!("Service heartbeat...");
        }
    });

    // Wait for interrupt signal
    match signal::ctrl_c().await {
        Ok(()) => {
            info!("Interrupt received, starting graceful shutdown");
            heartbeat.abort();
            server_handle.abort();
        }
        Err(err) => {
            eprintln!("Unable to listen for shutdown signal: {}", err);
            heartbeat.abort();
            server_handle.abort();
        }
    }

    Ok(())
}
