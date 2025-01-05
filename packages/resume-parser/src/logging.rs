use std::str::FromStr;
use tracing::Level;
use tracing_subscriber::{
    fmt::format::FmtSpan,
    EnvFilter,
};

pub fn init_logging() -> Result<(), Box<dyn std::error::Error>> {
    let env_filter = EnvFilter::try_from_default_env().unwrap_or_else(|_| {
        // Default to INFO level if RUST_LOG is not set
        EnvFilter::new("resume_parser=info,warn")
    });

    tracing_subscriber::fmt()
        // Include source code file and line numbers
        .with_file(true)
        .with_line_number(true)
        // Include thread IDs
        .with_thread_ids(true)
        // Include span events (enter, exit, close)
        .with_span_events(FmtSpan::FULL)
        // Use a more compact format
        .compact()
        // Add the environment filter
        .with_env_filter(env_filter)
        .init();

    Ok(())
}

pub fn get_log_level() -> Level {
    std::env::var("LOG_LEVEL")
        .ok()
        .and_then(|l| Level::from_str(&l).ok())
        .unwrap_or(Level::INFO)
} 