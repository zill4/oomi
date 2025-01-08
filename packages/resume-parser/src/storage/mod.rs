use aws_sdk_s3::Client;
use aws_types::region::Region;
use crate::error::ParserError;
use tracing::{info, error, debug};
use crate::error::Result;
use std::time::{Duration, Instant};
use tokio::time::sleep;

pub struct S3Client {
    client: Client,
    bucket: String,
}

impl S3Client {
    pub async fn new() -> Result<Self> {
        info!("Initializing S3 client");
        
        // Log config (safely)
        info!("S3 Configuration:");
        info!("  Bucket: {}", std::env::var("BUCKET_NAME").unwrap_or_else(|_| "NOT_SET".to_string()));
        info!("  Region: {}", std::env::var("AWS_REGION").unwrap_or_else(|_| "NOT_SET".to_string()));
        info!("  Endpoint: {}", std::env::var("AWS_ENDPOINT_URL_S3").unwrap_or_else(|_| "NOT_SET".to_string()));
        info!("  Access Key ID set: {}", std::env::var("AWS_ACCESS_KEY_ID").is_ok());
        info!("  Secret Access Key set: {}", std::env::var("AWS_SECRET_ACCESS_KEY").is_ok());

        let config = aws_config::defaults(aws_config::BehaviorVersion::latest())
            .region(Region::new(std::env::var("AWS_REGION")?))
            .endpoint_url(std::env::var("AWS_ENDPOINT_URL_S3")?)
            .load()
            .await;

        let client = Client::new(&config);
        let bucket = std::env::var("BUCKET_NAME")?;

        info!("S3 client initialized for bucket: {}", bucket);

        // Test connection
        let result = client
            .list_objects_v2()
            .bucket(&bucket)
            .max_keys(1)
            .send()
            .await;

        match result {
            Ok(_) => info!("Successfully tested S3 connection"),
            Err(e) => error!("Failed to test S3 connection: {:?}", e),
        }

        Ok(Self { client, bucket })
    }

    pub async fn check_connection(&self) -> Result<()> {
        self.client
            .list_buckets()
            .send()
            .await
            .map_err(|e| ParserError::S3(format!("Failed to connect to S3: {}", e)))?;
        Ok(())
    }

    pub async fn get_file(&self, key: &str) -> Result<Vec<u8>> {
        info!("Starting S3 fetch for key: {}", key);
        
        let start = Instant::now();
        
        // Add rate limiting - only one request every 2 seconds
        static LAST_REQUEST: tokio::sync::Mutex<Option<Instant>> = tokio::sync::Mutex::const_new(None);
        let mut last = LAST_REQUEST.lock().await;
        if let Some(last_time) = *last {
            let elapsed = last_time.elapsed();
            if elapsed < Duration::from_secs(2) {
                sleep(Duration::from_secs(2) - elapsed).await;
            }
        }
        *last = Some(Instant::now());
        drop(last);

        let output = self.client.get_object()
            .bucket(&self.bucket)
            .key(key)
            .send()
            .await
            .map_err(|e| {
                error!("S3 GetObject error after {:?}: {:?}", start.elapsed(), e);
                ParserError::S3(format!("Failed to get object: {}", e))
            })?;
            
        let content_length = output.content_length();
        let content_type = output.content_type().map(|s| s.to_string());
        
        info!("S3 GetObject response received in {:?}. Content length: {:?}, Content type: {:?}", 
            start.elapsed(),
            content_length,
            content_type
        );
        
        let mut buffer = Vec::with_capacity(
            content_length.unwrap_or(1024 * 1024) as usize
        );
        
        let mut stream = output.body;
        while let Some(chunk) = stream.next().await {
            let chunk = chunk.map_err(|e| {
                error!("Failed to read chunk from S3 after {:?}: {:?}", start.elapsed(), e);
                ParserError::S3(format!("Failed to read chunk: {}", e))
            })?;
            buffer.extend_from_slice(&chunk);
            
            debug!("Read chunk of {} bytes, total buffer size: {}", chunk.len(), buffer.len());
        }
        
        info!("Successfully read {} bytes from S3 in {:?}", 
            buffer.len(),
            start.elapsed()
        );
        
        Ok(buffer)
    }

    pub async fn store_results(&self, user_id: &str, pdf_key: &str, results: &[u8]) -> Result<String> {
        let result_key = format!("results/{}/{}.json", user_id, pdf_key);
        
        info!("Storing parsing results in S3: {}", result_key);
        self.client
            .put_object()
            .bucket(&self.bucket)
            .key(&result_key)
            .body(results.to_vec().into())
            .content_type("application/json")
            .send()
            .await?;

        Ok(result_key)
    }
}
