use uuid::Uuid;
use sqlx::{postgres::PgPoolOptions, Pool, Postgres, PgPool};
use tracing::{info, error};
use chrono::NaiveDate;

use crate::error::{ParserError, Result};
use crate::models::{ResumeData, StoredResume};
use serde_json::Value;

pub struct Database {
    pool: Pool<Postgres>,
}

impl Database {
    pub async fn new(database_url: &str) -> Result<Self> {
        info!("Connecting to database");
        
        let pool = PgPoolOptions::new()
            .max_connections(5)
            .connect(database_url)
            .await
            .map_err(|e| {
                error!("Failed to connect to database: {}", e);
                ParserError::Database(e)
            })?;

        // Run migrations
        sqlx::migrate!("./migrations")
            .run(&pool)
            .await
            .map_err(|e| {
                error!("Failed to run migrations: {}", e);
                ParserError::Database(e.into())
            })?;

        Ok(Self { pool })
    }

    pub async fn store_resume(&self, user_id: &str, resume: &ResumeData, pdf_key: &str) -> Result<i32> {
        let resume_json = serde_json::to_value(resume).map_err(|e| {
            error!("Failed to serialize resume data: {}", e);
            ParserError::InvalidData { 
                message: e.to_string(),
                field: Some("resume_data".to_string())
            }
        })?;

        let user_uuid = Uuid::parse_str(user_id)
            .map_err(|e| ParserError::Database(sqlx::Error::Protocol(e.to_string())))?;

        let record_id = sqlx::query!(
            r#"
            INSERT INTO resumes (user_id, pdf_key, data, created_at, updated_at)
            VALUES ($1, $2, $3, NOW(), NOW())
            RETURNING id
            "#,
            user_uuid,
            pdf_key,
            resume_json
        )
        .fetch_one(&self.pool)
        .await
        .map_err(|e| {
            error!("Failed to store resume: {}", e);
            ParserError::Database(e)
        })?
        .id;

        Ok(record_id)
    }

    pub async fn get_resume(
        pool: &PgPool,
        id: i32,
        user_id: &str,
    ) -> Result<Option<ResumeData>> {
        let user_uuid = Uuid::parse_str(user_id)
            .map_err(|e| ParserError::Database(sqlx::Error::Protocol(e.to_string())))?;

        let record = sqlx::query!(
            r#"
            SELECT data
            FROM resumes
            WHERE id = $1 AND user_id = $2
            "#,
            id,
            user_uuid
        )
        .fetch_optional(pool)
        .await?;

        match record {
            Some(row) => {
                let resume: ResumeData = serde_json::from_value(row.data).map_err(|e| {
                    error!("Failed to deserialize resume data: {}", e);
                    ParserError::Database(sqlx::Error::Protocol(e.to_string()))
                })?;
                Ok(Some(resume))
            }
            None => Ok(None),
        }
    }

    pub async fn list_user_resumes(&self, user_id: &str) -> Result<Vec<(i32, String)>> {
        let user_uuid = Uuid::parse_str(user_id)
            .map_err(|e| ParserError::Database(sqlx::Error::Protocol(e.to_string())))?;

        let records = sqlx::query!(
            r#"
            SELECT id, pdf_key
            FROM resumes
            WHERE user_id = $1
            ORDER BY created_at DESC
            "#,
            user_uuid
        )
        .fetch_all(&self.pool)
        .await
        .map_err(|e| {
            error!("Failed to list resumes: {}", e);
            ParserError::Database(e)
        })?;

        Ok(records.into_iter().map(|r| (r.id, r.pdf_key)).collect())
    }
}

pub async fn insert_resume_parse_result(
    pool: &PgPool,
    user_id: &str,
    resume_id: &str,
    pdf_key: &str,
    data: Option<Value>,
    error: Option<String>,
    confidence_scores: Option<Value>
) -> Result<i32> {
    let user_uuid = Uuid::parse_str(user_id)
        .map_err(|e| ParserError::Database(sqlx::Error::Protocol(e.to_string())))?;

    let record = sqlx::query!(
        r#"
        INSERT INTO resume_parses (
            user_id, 
            resume_id,
            pdf_key, 
            parsed_data,
            error_message,
            confidence_scores,
            status
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id
        "#,
        user_uuid,
        resume_id,
        pdf_key,
        data,
        error,
        confidence_scores,
        if data.is_some() { "PARSED" } else { "FAILED" }
    )
    .fetch_one(pool)
    .await?;

    Ok(record.id)
}

pub async fn get_parse_result(
    pool: &PgPool,
    user_id: &str,
    resume_id: &str
) -> Result<Option<ResumeData>> {
    let user_uuid = Uuid::parse_str(user_id)
        .map_err(|e| ParserError::Database(sqlx::Error::Protocol(e.to_string())))?;

    let record = sqlx::query!(
        r#"
        SELECT parsed_data
        FROM resume_parses
        WHERE user_id = $1 
        AND resume_id = $2 
        AND status = 'PARSED'
        ORDER BY created_at DESC
        LIMIT 1
        "#,
        user_uuid,
        resume_id
    )
    .fetch_optional(pool)
    .await?;

    match record {
        Some(row) => {
            let resume: ResumeData = serde_json::from_value(row.parsed_data)
                .map_err(|e| ParserError::InvalidData {
                    message: e.to_string(),
                    field: Some("parsed_data".to_string())
                })?;
            Ok(Some(resume))
        }
        None => Ok(None)
    }
}

pub async fn get_parse_errors(
    pool: &PgPool,
    user_id: &str,
    resume_id: &str
) -> Result<Vec<String>> {
    let user_uuid = Uuid::parse_str(user_id)
        .map_err(|e| ParserError::Database(sqlx::Error::Protocol(e.to_string())))?;

    let records = sqlx::query!(
        r#"
        SELECT error_message
        FROM resume_parses
        WHERE user_id = $1 
        AND resume_id = $2 
        AND status = 'FAILED'
        ORDER BY created_at DESC
        "#,
        user_uuid,
        resume_id
    )
    .fetch_all(pool)
    .await?;

    Ok(records
        .into_iter()
        .filter_map(|r| r.error_message)
        .collect())
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::env;

    async fn get_test_database_url() -> String {
        env::var("TEST_DATABASE_URL").unwrap_or_else(|_| {
            if env::var("CI").is_ok() {
                "postgresql://postgres:postgres@db:5432/oomi".to_string()
            } else {
                "postgresql://postgres:postgres@localhost:5433/oomi".to_string()
            }
        })
    }

    #[tokio::test]
    async fn test_database_operations() {
        // Use Docker's internal DNS when running in container, localhost for local testing
        let database_url = get_test_database_url().await;

        println!("Attempting database connection to: {}", database_url);

        let db = Database::new(&database_url)
            .await
            .expect("Failed to create database connection");

        // Create test resume data
        let mut resume = ResumeData::new();
        resume.personal_info.name = Some("Test User".to_string());
        resume.education.push(crate::models::EducationEntry {
            institution: "Test University".to_string(),
            degree: "Test Degree".to_string(),
            field: Some("Test Field".to_string()),
            start_date: Some(NaiveDate::from_ymd_opt(2020, 1, 1).unwrap()),
            end_date: Some(NaiveDate::from_ymd_opt(2024, 1, 1).unwrap()),
            gpa: Some(3.8),
            location: Some("Test City".to_string()),
            achievements: vec!["Test Achievement".to_string()],
        });

        // Test storing resume
        let user_id = "123e4567-e89b-12d3-a456-426614174000"; // Valid UUID string
        let pdf_key = "test-key.pdf";
        let record_id = db.store_resume(user_id, &resume, pdf_key).await.unwrap();

        // Test retrieving resume
        let retrieved = Database::get_resume(&db.pool, record_id, user_id)
            .await
            .unwrap()
            .unwrap();
        assert_eq!(retrieved.personal_info.name, resume.personal_info.name);
        assert_eq!(retrieved.education[0].institution, resume.education[0].institution);

        // Test listing resumes
        let resumes = db.list_user_resumes(user_id).await.unwrap();
        assert!(!resumes.is_empty());
        assert_eq!(resumes[0].1, pdf_key);
    }
} 