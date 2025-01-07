use thiserror::Error;
use aws_sdk_s3::error::SdkError;
use aws_sdk_s3::operation::get_object::GetObjectError;
use aws_sdk_s3::operation::put_object::PutObjectError;
use aws_sdk_s3::primitives::ByteStreamError;
use aws_smithy_runtime_api::http::Response;

#[derive(Error, Debug)]
pub enum ParserError {
    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),

    #[error("Queue error: {message}")]
    Queue {
        message: String,
        #[source]
        source: Option<lapin::Error>,
    },

    #[error("Config error: {0}")]
    Config(String),

    #[error("S3 error: {0}")]
    S3(String),

    #[error("Invalid data: {message} {}", .field.as_deref().unwrap_or(""))]
    InvalidData {
        message: String,
        field: Option<String>,
    },

    #[error("Parser error: {0}")]
    Parser(String),

    #[error("PDF extraction error: {0}")]
    PdfExtraction(String),

    #[error("Serialization error: {0}")]
    Serialization(#[from] serde_json::Error),
}

impl From<lapin::Error> for ParserError {
    fn from(err: lapin::Error) -> Self {
        Self::Queue {
            message: err.to_string(),
            source: Some(err),
        }
    }
}

impl From<SdkError<GetObjectError, Response>> for ParserError {
    fn from(err: SdkError<GetObjectError, Response>) -> Self {
        Self::S3(err.to_string())
    }
}

impl From<ByteStreamError> for ParserError {
    fn from(err: ByteStreamError) -> Self {
        Self::S3(err.to_string())
    }
}

impl From<SdkError<PutObjectError, Response>> for ParserError {
    fn from(err: SdkError<PutObjectError, Response>) -> Self {
        Self::S3(err.to_string())
    }
}

pub type Result<T> = std::result::Result<T, ParserError>;
