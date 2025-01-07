use serde::Deserialize;
use tracing::{info, error};

#[derive(Debug, Deserialize, Default)]
pub struct ProcessingConfig {
    #[serde(default = "default_timeout_seconds")]
    pub timeout_seconds: u64,
    
    #[serde(default = "default_max_concurrent_jobs")]
    pub max_concurrent_jobs: usize,
}

fn default_timeout_seconds() -> u64 {
    300 // 5 minutes
}

fn default_max_concurrent_jobs() -> usize {
    3
}

#[derive(Debug, Deserialize)]
pub struct S3Config {
    pub bucket: String,
    pub region: String,
    pub endpoint: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct QueueConfig {
    pub url: String,
    pub queue_name: String,
}

#[derive(Debug, Deserialize)]
pub struct Config {
    #[serde(default = "default_environment")]
    pub environment: String,
    pub s3: S3Config,
    pub queue: QueueConfig,
    #[serde(default)]
    pub processing: ProcessingConfig,
}

fn default_environment() -> String {
    "development".to_string()
}

impl Config {
    pub fn new() -> Result<Self, crate::error::ParserError> {
        info!("Loading configuration...");
        let config = config::Config::builder()
            .add_source(config::File::with_name("config/default"))
            .add_source(config::Environment::default())
            .build()
            .map_err(|e| {
                error!("Failed to build config: {}", e);
                crate::error::ParserError::Config(e.to_string())
            })?;

        info!("Configuration loaded, attempting to deserialize...");
        config.try_deserialize()
            .map_err(|e| {
                error!("Failed to deserialize config: {}", e);
                crate::error::ParserError::Config(e.to_string())
            })
    }
} 