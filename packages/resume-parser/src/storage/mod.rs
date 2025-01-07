use aws_sdk_s3::{Client, Config};
use crate::error::Result;
use tracing::info;

pub struct S3Client {
    client: Client,
    bucket: String,
}

impl S3Client {
    pub async fn new() -> Result<Self> {
        let config = Config::builder()
            .region(std::env::var("AWS_REGION").unwrap_or_else(|_| "auto".to_string()))
            .endpoint_url(std::env::var("AWS_ENDPOINT_URL_S3").ok())
            .build();

        let client = Client::from_conf(config);
        let bucket = std::env::var("BUCKET_NAME")
            .expect("BUCKET_NAME must be set");

        Ok(Self { client, bucket })
    }

    pub async fn get_file(&self, key: &str) -> Result<Vec<u8>> {
        info!("Fetching file from S3: {}", key);
        let response = self.client
            .get_object()
            .bucket(&self.bucket)
            .key(key)
            .send()
            .await?;

        Ok(response.body.collect().await?.into_bytes().to_vec())
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
