use serde::Deserialize;
use std::env;
use config::ConfigError;
use dotenvy::dotenv;

#[derive(Debug, Deserialize)]
pub struct S3Config {
    pub bucket: String,
    pub region: String,
    pub endpoint: Option<String>,
    pub access_key_id: Option<String>,
    pub secret_access_key: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct QueueConfig {
    pub url: String,
    pub queue_name: String,
}

#[derive(Debug, Deserialize)]
pub struct Config {
    pub environment: String,
    pub s3: S3Config,
    pub queue: QueueConfig,
}

impl Config {
    pub fn new() -> Result<Self, ConfigError> {
        // Load .env file if it exists
        dotenv().ok();

        let environment = env::var("APP_ENVIRONMENT").unwrap_or_else(|_| "development".into());
        let port = env::var("PORT")
            .unwrap_or_else(|_| "3001".into())
            .parse()
            .unwrap_or(3001);

        // First, get environment variables directly
        let s3_bucket = env::var("BUCKET_NAME").unwrap_or_else(|_| "resumes".into());
        let s3_region = env::var("AWS_REGION").unwrap_or_else(|_| "auto".into());
        let s3_endpoint = env::var("AWS_ENDPOINT_URL_S3").ok();
        let s3_access_key = env::var("AWS_ACCESS_KEY_ID").ok();
        let s3_secret_key = env::var("AWS_SECRET_ACCESS_KEY").ok();
        let db_url = env::var("DATABASE_URL")
            .unwrap_or_else(|_| "postgresql://postgres:postgres@db:5432/oomi".into());
        let rabbitmq_url = env::var("RABBITMQ_URL")
            .unwrap_or_else(|_| "amqp://guest:guest@rabbitmq:5672".into());

        let config = Config {
            environment,
            s3: S3Config {
                bucket: s3_bucket,
                region: s3_region,
                endpoint: s3_endpoint,
                access_key_id: s3_access_key,
                secret_access_key: s3_secret_key,
            },
            queue: QueueConfig {
                url: rabbitmq_url,
                queue_name: "resume_parsing".into(),
            },
        };

        tracing::debug!("Loaded configuration: {:?}", Self::redact_sensitive(&config));

        Ok(config)
    }

    fn redact_sensitive(config: &Config) -> Config {
        Config {
            environment: config.environment.clone(),
            s3: S3Config {
                bucket: config.s3.bucket.clone(),
                region: config.s3.region.clone(),
                endpoint: config.s3.endpoint.clone(),
                access_key_id: Some("[REDACTED]".to_string()),
                secret_access_key: Some("[REDACTED]".to_string()),
            },
            queue: QueueConfig {
                url: "[REDACTED]".to_string(),
                queue_name: config.queue.queue_name.clone(),
            },
        }
    }

    pub fn validate(&self) -> Result<(), String> {
        // Validate S3 configuration
        if self.s3.bucket.is_empty() {
            return Err("S3 bucket name is required".into());
        }
        if self.s3.region.is_empty() {
            return Err("S3 region is required".into());
        }

        // Validate queue configuration
        if self.queue.url.is_empty() {
            return Err("Queue URL is required".into());
        }
        if self.queue.queue_name.is_empty() {
            return Err("Queue name is required".into());
        }

        Ok(())
    }
}
