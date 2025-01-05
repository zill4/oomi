use tracing::{info, Level};
use tracing_subscriber::FmtSubscriber;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Initialize logging
    let subscriber = FmtSubscriber::builder()
        .with_max_level(Level::INFO)
        .build();
    tracing::subscriber::set_global_default(subscriber)?;

    info!("Resume Parser Service starting up...");

    Ok(())
}
