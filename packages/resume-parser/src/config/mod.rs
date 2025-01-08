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
    pub access_key_id: String,
    pub secret_access_key: String,
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
            .add_source(config::Environment::with_prefix("APP")
                .separator("_")
                .try_parsing(true))
            .build()
            .map_err(|e| {
                error!("Failed to build config: {}", e);
                crate::error::ParserError::Config(e.to_string())
            })?;

        info!("Configuration loaded, attempting to deserialize...");
        
        // Get the raw config values for logging
        if let Ok(s3_config) = config.get_table("s3") {
            info!("S3 Configuration:");
            info!("  bucket: {:?}", s3_config.get("bucket"));
            info!("  region: {:?}", s3_config.get("region"));
            info!("  endpoint: {:?}", s3_config.get("endpoint"));
            info!("  access_key_id: {}", if s3_config.contains_key("access_key_id") { "SET" } else { "NOT SET" });
            info!("  secret_access_key: {}", if s3_config.contains_key("secret_access_key") { "SET" } else { "NOT SET" });
        }

        config.try_deserialize()
            .map_err(|e| {
                error!("Failed to deserialize config: {}", e);
                crate::error::ParserError::Config(e.to_string())
            })
    }
} 