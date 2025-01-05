use thiserror::Error;
use tracing::error;

#[derive(Error, Debug)]
pub enum ParserError {
    #[error("Configuration error: {0}")]
    Config(String),

    #[error("PDF processing error: {0}")]
    PdfProcessing(String),

    #[error("Database error: {0}")]
    Database(#[from] sqlx::Error),

    #[error("Queue error: {message}")]
    Queue {
        message: String,
        source: Option<lapin::Error>,
    },

    #[error("S3 storage error: {message}")]
    Storage {
        message: String,
        source: Option<aws_sdk_s3::Error>,
    },

    #[error("Invalid data: {message}")]
    InvalidData {
        message: String,
        field: Option<String>,
    },
}

impl ParserError {
    pub fn log_error(&self) {
        error!(error = %self, "An error occurred");
    }

    pub fn invalid_data<S: Into<String>>(message: S, field: Option<String>) -> Self {
        Self::InvalidData {
            message: message.into(),
            field,
        }
    }

    pub fn queue<S: Into<String>>(message: S, source: Option<lapin::Error>) -> Self {
        Self::Queue {
            message: message.into(),
            source,
        }
    }
}

pub type Result<T> = std::result::Result<T, ParserError>;
