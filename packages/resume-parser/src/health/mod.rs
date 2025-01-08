use crate::storage::S3Client;
use crate::error::Result;
use serde::Serialize;
use std::time::Instant;
use tracing::{info, error};

#[derive(Debug, Serialize)]
pub struct HealthStatus {
    pub status: String,
    pub s3_status: String,
    pub queue_status: String,
    pub uptime_seconds: u64,
    pub version: String,
}

pub struct HealthChecker {
    start_time: Instant,
    s3_client: S3Client,
}

impl HealthChecker {
    pub fn new(s3_client: S3Client) -> Self {
        Self {
            start_time: Instant::now(),
            s3_client,
        }
    }

    pub async fn check_health(&self) -> Result<HealthStatus> {
        info!("Performing health check");
        
        // Check S3 connection
        let s3_status = match self.s3_client.check_connection().await {
            Ok(_) => {
                info!("S3 connection healthy");
                "healthy".to_string()
            },
            Err(e) => {
                error!("S3 connection unhealthy: {}", e);
                format!("unhealthy: {}", e)
            },
        };

        let status = HealthStatus {
            status: "running".to_string(),
            s3_status,
            queue_status: "connected".to_string(),
            uptime_seconds: self.start_time.elapsed().as_secs(),
            version: env!("CARGO_PKG_VERSION").to_string(),
        };

        info!("Health check complete: {:?}", status);
        Ok(status)
    }
} 