use aws_sdk_s3::Client;
use aws_types::region::Region;
use crate::error::ParserError;
use tracing::info;

pub struct S3Client {
    client: Client,
    bucket: String,
}

impl S3Client {
    pub async fn new() -> Result<Self, ParserError> {
        let config = aws_sdk_s3::Config::builder()
            .behavior_version_latest()
            .region(Region::new(std::env::var("AWS_REGION").unwrap_or_else(|_| "auto".to_string())))
            .endpoint_url(
                std::env::var("AWS_ENDPOINT_URL_S3")
                    .ok()
                    .unwrap_or_default()
            )
            .build();

        let client = Client::from_conf(config);
        let bucket = std::env::var("BUCKET_NAME")
            .map_err(|e| ParserError::Config(format!("Missing BUCKET_NAME: {}", e)))?;

        Ok(Self { client, bucket })
    }

    pub async fn check_connection(&self) -> Result<(), ParserError> {
        self.client
            .list_buckets()
            .send()
            .await
            .map_err(|e| ParserError::S3(format!("Failed to connect to S3: {}", e)))?;
        Ok(())
    }

    pub async fn get_file(&self, key: &str) -> Result<Vec<u8>, ParserError> {
        info!("Fetching file from S3: {}", key);
        let response = self.client
            .get_object()
            .bucket(&self.bucket)
            .key(key)
            .send()
            .await?;

        Ok(response.body.collect().await?.into_bytes().to_vec())
    }

    pub async fn store_results(&self, user_id: &str, pdf_key: &str, results: &[u8]) -> Result<String, ParserError> {
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
