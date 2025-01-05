use axum::{
    routing::get,
    Router,
    http::StatusCode,
    Json,
};
use serde::Serialize;
use std::net::SocketAddr;
use std::sync::Arc;
use tracing::info;

#[derive(Serialize)]
struct HealthResponse {
    status: String,
    version: String,
    environment: String,
}

pub async fn start_server(port: u16, environment: String) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    let env = Arc::new(environment);
    let app = Router::new()
        .route("/health", get(move || health_check(env.clone())))
        .layer(tower_http::trace::TraceLayer::new_for_http());

    let addr = SocketAddr::from(([0, 0, 0, 0], port));
    info!("Health check server listening on {}", addr);

    axum::serve(
        tokio::net::TcpListener::bind(&addr).await?,
        app.into_make_service(),
    )
    .await?;

    Ok(())
}

async fn health_check(environment: Arc<String>) -> (StatusCode, Json<HealthResponse>) {
    let response = HealthResponse {
        status: "healthy".into(),
        version: env!("CARGO_PKG_VERSION").into(),
        environment: environment.to_string(),
    };

    (StatusCode::OK, Json(response))
} 