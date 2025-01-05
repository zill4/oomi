use aws_config::BehaviorVersion;
use aws_sdk_s3::{Client, primitives::ByteStream, Error as S3Error};
use std::path::Path;
use tokio::fs::File;
use tokio::io::AsyncWriteExt;
use tracing::{debug, info};
use uuid::Uuid;

use crate::error::{ParserError, Result};

pub struct S3Storage {
    client: Client,
    bucket: String,
}

impl S3Storage {
    pub async fn new(bucket: String) -> Result<Self> {
        let config = aws_config::defaults(BehaviorVersion::latest())
            .load()
            .await;
        
        let client = Client::new(&config);
        
        Ok(Self { client, bucket })
    }

    pub async fn upload_pdf(&self, file_path: &Path, user_id: &str) -> Result<String> {
        info!("Uploading PDF for user {}", user_id);
        
        // Generate a unique filename
        let file_name = format!("{}.pdf", Uuid::new_v4());
        let key = format!("users/resumes/uploaded/{}/{}", user_id, file_name);

        // Read the file
        let body = ByteStream::from_path(file_path).await.map_err(|e| {
            ParserError::Storage { 
                message: format!("Failed to read file: {}", e),
                source: None
            }
        })?;

        // Upload to S3
        self.client
            .put_object()
            .bucket(&self.bucket)
            .key(&key)
            .body(body)
            .content_type("application/pdf")
            .send()
            .await
            .map_err(|e| {
                ParserError::Storage { 
                    message: format!("Failed to upload to S3: {}", e),
                    source: Some(S3Error::from(e))
                }
            })?;

        debug!("Successfully uploaded PDF to {}", key);
        Ok(key)
    }

    pub async fn download_pdf(&self, key: &str, output_path: &Path) -> Result<()> {
        info!("Downloading PDF from {}", key);

        // Get object from S3
        let resp = self.client
            .get_object()
            .bucket(&self.bucket)
            .key(key)
            .send()
            .await
            .map_err(|e| {
                ParserError::Storage { 
                    message: format!("Failed to download from S3: {}", e),
                    source: Some(S3Error::from(e))
                }
            })?;

        // Create the output file
        let mut file = File::create(output_path).await.map_err(|e| {
            ParserError::Storage { 
                message: format!("Failed to create output file: {}", e),
                source: None
            }
        })?;

        // Write the data to the file
        let data = resp.body.collect().await.map_err(|e| {
            ParserError::Storage { 
                message: format!("Failed to read S3 object data: {}", e),
                source: None
            }
        })?;

        file.write_all(&data.into_bytes()).await.map_err(|e| {
            ParserError::Storage { 
                message: format!("Failed to write to output file: {}", e),
                source: None
            }
        })?;

        debug!("Successfully downloaded PDF to {:?}", output_path);
        Ok(())
    }

    pub async fn delete_pdf(&self, key: &str) -> Result<()> {
        info!("Deleting PDF at {}", key);

        self.client
            .delete_object()
            .bucket(&self.bucket)
            .key(key)
            .send()
            .await
            .map_err(|e| {
                ParserError::Storage { 
                    message: format!("Failed to delete from S3: {}", e),
                    source: Some(S3Error::from(e))
                }
            })?;

        debug!("Successfully deleted PDF at {}", key);
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::env;
    use tempfile::NamedTempFile;
    use tokio::fs;

    #[tokio::test]
    async fn test_s3_operations() {
        // Skip test if no AWS credentials are configured
        if env::var("AWS_ACCESS_KEY_ID").is_err() {
            println!("Skipping S3 test - no AWS credentials found");
            return;
        }

        let bucket = env::var("AWS_TEST_BUCKET")
            .expect("AWS_TEST_BUCKET must be set for tests");

        let storage = S3Storage::new(bucket).await.unwrap();
        
        // Create a test file
        let temp_file = NamedTempFile::new().unwrap();
        fs::write(&temp_file, b"test content").await.unwrap();

        // Test upload
        let key = storage.upload_pdf(temp_file.path(), "test-user").await.unwrap();
        assert!(key.contains("test-user"));
        assert!(key.ends_with(".pdf"));

        // Test download
        let output_file = NamedTempFile::new().unwrap();
        storage.download_pdf(&key, output_file.path()).await.unwrap();

        // Verify content
        let content = fs::read_to_string(output_file.path()).await.unwrap();
        assert_eq!(content, "test content");

        // Test delete
        storage.delete_pdf(&key).await.unwrap();
    }
}
