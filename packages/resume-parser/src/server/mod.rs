use crate::error::{ParserError, Result};
use crate::parser::ResumeParser;
use crate::scoring::ResumeScorer;
use axum::{
    extract::{Multipart, State},
    routing::{get, post},
    Json, Router,
    response::{IntoResponse, Response},
    http::StatusCode,
};
use serde_json::json;
use std::fs;
use std::net::SocketAddr;
use tempfile::NamedTempFile;
use tokio::fs::File;
use tokio::io::AsyncWriteExt;
use tower_http::cors::CorsLayer;
use tracing::{debug, error, info};
use serde::Deserialize;
use crate::database;

// Add error handling for axum
impl IntoResponse for ParserError {
    fn into_response(self) -> Response {
        let (status, message) = match self {
            ParserError::Config(msg) => (StatusCode::INTERNAL_SERVER_ERROR, msg),
            ParserError::Server(msg) => (StatusCode::INTERNAL_SERVER_ERROR, msg),
            ParserError::PdfExtraction(msg) => (StatusCode::BAD_REQUEST, msg),
            ParserError::PdfProcessing(msg) => (StatusCode::BAD_REQUEST, msg),
            ParserError::Io(err) => (StatusCode::INTERNAL_SERVER_ERROR, err.to_string()),
            ParserError::Database(err) => (StatusCode::INTERNAL_SERVER_ERROR, err.to_string()),
            ParserError::Queue { message, .. } => (StatusCode::INTERNAL_SERVER_ERROR, message),
            ParserError::Storage { message, .. } => (StatusCode::INTERNAL_SERVER_ERROR, message),
            ParserError::InvalidData { message, .. } => (StatusCode::BAD_REQUEST, message),
            ParserError::Other(err) => (StatusCode::INTERNAL_SERVER_ERROR, err.to_string()),
        };

        let body = Json(json!({
            "error": message,
            "status": "error"
        }));

        (status, body).into_response()
    }
}

// Add the request structure
#[derive(Debug, Deserialize)]
pub struct ParseRequest {
    pub resume_id: String,
    pub user_id: String,
    pub pdf_key: String,
}

// Add AppState struct
#[derive(Clone)]
pub struct AppState {
    pub s3_client: crate::storage::S3Client,
    pub db_pool: sqlx::PgPool,
}

pub async fn create_router(state: AppState) -> Router {
    Router::new()
        .route("/health", get(health_check))
        .route("/parse", post(parse_resume))
        .route("/process", post(process_resume))
        .layer(CorsLayer::permissive())
        .with_state(state)
}

pub async fn start_server(port: u16) -> Result<()> {
    let state = AppState {
        db_pool: pool,
        s3_client: s3_client,
    };
    let app = create_router(state).await;
    let addr = SocketAddr::from(([0, 0, 0, 0], port));
    let listener = tokio::net::TcpListener::bind(addr).await.map_err(|e| {
        error!("Failed to bind server: {}", e);
        ParserError::Server(e.to_string())
    })?;
    
    info!("Server listening on {}", addr);
    axum::serve(listener, app).await.map_err(|e| {
        error!("Server error: {}", e);
        ParserError::Server(e.to_string())
    })?;
    
    Ok(())
}

async fn health_check() -> impl IntoResponse {
    Json(json!({ "status": "healthy" }))
}

#[axum::debug_handler]
async fn parse_resume(
    State(app_state): State<AppState>,
    Json(payload): Json<ParseRequest>,
) -> Result<impl IntoResponse> {
    info!("Starting resume parse for user: {}, resume: {}", 
          payload.user_id, payload.resume_id);

    // Get PDF from S3
    let pdf_data = app_state.s3_client
        .get_object()
        .bucket(&crate::config::Config::new()?.s3.bucket)
        .key(&payload.pdf_key)
        .send()
        .await?
        .body
        .collect()
        .await?
        .to_vec();

    // Parse the resume
    let resume_data = ResumeParser::parse_file_from_bytes(&pdf_data).await?;
    
    // Calculate confidence scores
    let confidence_scores = ResumeScorer::score_resume(&resume_data);

    // Store in database
    database::store_resume(
        &app_state.db_pool,
        &payload.user_id,
        &payload.pdf_key,
        serde_json::to_value(&resume_data)?
    ).await?;

    Ok(Json(json!({
        "message": "Resume parsed successfully",
        "resume_id": payload.resume_id,
        "data": resume_data,
        "confidence_scores": confidence_scores,
        "status": "success"
    })))
}

async fn process_resume(mut multipart: Multipart) -> Result<Json<serde_json::Value>> {
    info!("Received resume parsing request");

    // Create a temporary file to store the uploaded PDF
    let temp_file = NamedTempFile::new()?;
    let temp_path = temp_file.path().to_owned();
    let mut file = File::create(&temp_path).await?;

    // Process the multipart form data
    while let Some(field) = multipart.next_field().await.map_err(|e| {
        error!("Error processing multipart form: {}", e);
        ParserError::Server(e.to_string())
    })? {
        if field.name().unwrap_or("") == "file" {
            debug!("Processing uploaded file");
            let data = field.bytes().await.map_err(|e| {
                error!("Error reading file data: {}", e);
                ParserError::Server(e.to_string())
            })?;

            file.write_all(&data).await.map_err(|e| {
                error!("Error writing to temporary file: {}", e);
                ParserError::Server(e.to_string())
            })?;
        }
    }

    // Parse the resume
    let resume_data = ResumeParser::parse_file(&temp_path).await?;
    
    // Calculate confidence scores
    let confidence_scores = ResumeScorer::score_resume(&resume_data);

    // Clean up temporary file
    drop(file);
    fs::remove_file(&temp_path).map_err(|e| {
        error!("Error removing temporary file: {}", e);
        ParserError::Server(e.to_string())
    })?;

    Ok(Json(json!({
        "data": resume_data,
        "confidence_scores": confidence_scores,
        "status": "success"
    })))
}

#[cfg(test)]
mod tests {
    use super::*;
    use axum::http::StatusCode;

    #[tokio::test]
    async fn test_health_check() {
        let app = create_router().await;
        
        let addr = SocketAddr::from(([127, 0, 0, 1], 0));
        let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
        let addr = listener.local_addr().unwrap();
        
        tokio::spawn(async move {
            axum::serve(listener, app).await.unwrap();
        });

        let client = reqwest::Client::new();
        let response = client.get(&format!("http://{}/health", addr))
            .send()
            .await
            .unwrap();

        assert_eq!(response.status().as_u16(), StatusCode::OK.as_u16());
    }
} 