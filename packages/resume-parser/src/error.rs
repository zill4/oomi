use thiserror::Error;

#[derive(Error, Debug)]
pub enum ParserError {
    #[error("Configuration error: {0}")]
    Config(String),

    #[error("PDF processing error: {0}")]
    PdfProcessing(String),

    #[error("Database error: {0}")]
    Database(#[from] sqlx::Error),

    #[error("Queue error: {0}")]
    Queue(String),

    #[error("Storage error: {0}")]
    Storage(String),

    #[error("Invalid data: {0}")]
    InvalidData(String),
}

pub type Result<T> = std::result::Result<T, ParserError>;
