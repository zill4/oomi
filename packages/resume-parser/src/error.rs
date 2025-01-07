use thiserror::Error;
use tracing::error;
use aws_sdk_s3::operation::get_object::GetObjectError;
use aws_sdk_s3::primitives::ByteStreamError;
use aws_smithy_runtime_api::client::result::SdkError;

#[derive(Error, Debug)]
pub enum ParserError {
    #[error("PDF extraction error: {0}")]
    PdfExtraction(String),

    #[error("PDF processing error: {0}")]
    PdfProcessing(String),

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

impl From<serde_json::Error> for ParserError {
    fn from(err: serde_json::Error) -> Self {
        ParserError::InvalidData {
            message: err.to_string(),
            field: None,
        }
    }
}

impl<R> From<SdkError<GetObjectError, R>> for ParserError {
    fn from(err: SdkError<GetObjectError, R>) -> Self {
        ParserError::Storage {
            message: err.to_string(),
            source: None,
        }
    }
}

impl From<ByteStreamError> for ParserError {
    fn from(err: ByteStreamError) -> Self {
        ParserError::Storage {
            message: err.to_string(),
            source: None,
        }
    }
}

impl From<config::ConfigError> for ParserError {
    fn from(err: config::ConfigError) -> Self {
        ParserError::Config(err.to_string())
    }
}

pub type Result<T> = std::result::Result<T, ParserError>;
