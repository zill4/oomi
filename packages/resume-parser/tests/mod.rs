use sqlx::PgPool;
use dotenv::dotenv;

async fn setup_test_db() -> PgPool {
    dotenv().ok();
    let database_url = std::env::var("DATABASE_URL")
        .unwrap_or_else(|_| "postgres://postgres:postgres@127.0.0.1:5433/oomi".to_string());
    
    PgPool::connect(&database_url)
        .await
        .expect("Failed to connect to database")
} 