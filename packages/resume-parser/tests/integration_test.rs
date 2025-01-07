use resume_parser::{
    config::Config,
    error::Result,
    queue::QueueClient,
    storage::S3Client,
    parser::ResumeParser,
};
use std::path::PathBuf;

async fn setup() -> Result<()> {
    // Initialize environment for tests
    dotenvy::dotenv().ok();
    
    // Verify we can connect to required services
    let s3_client = S3Client::new().await?;
    s3_client.check_connection().await?;

    Ok(())
}

#[tokio::test]
async fn test_pdf_parsing() -> Result<()> {
    setup().await?;

    let test_pdf_path = PathBuf::from("tests/fixtures/test_resume.pdf");
    let result = ResumeParser::parse_file(&test_pdf_path).await?;

    assert!(result.metadata.contains_key("source"));
    assert!(result.metadata.contains_key("parsed_date"));
    
    Ok(())
}

#[tokio::test]
async fn test_queue_connection() -> Result<()> {
    setup().await?;

    let config = Config::new()?;
    let _queue_client = QueueClient::new(&config.queue.url).await?;
    
    Ok(())
} 