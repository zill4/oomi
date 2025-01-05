use sqlx::{postgres::PgPoolOptions, Pool, Postgres};
use tracing::{info, error};

use crate::error::{ParserError, Result};
use crate::models::ResumeData;

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
                message: e.to_string()
            }
        })?;

        let record_id = sqlx::query!(
            r#"
            INSERT INTO resumes (user_id, pdf_key, data, created_at, updated_at)
            VALUES ($1, $2, $3, NOW(), NOW())
            RETURNING id
            "#,
            user_id,
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

    pub async fn get_resume(&self, id: i32) -> Result<Option<ResumeData>> {
        let record = sqlx::query!(
            r#"
            SELECT data
            FROM resumes
            WHERE id = $1
            "#,
            id
        )
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| {
            error!("Failed to fetch resume: {}", e);
            ParserError::Database(e)
        })?;

        match record {
            Some(row) => {
                let resume: ResumeData = serde_json::from_value(row.data).map_err(|e| {
                    error!("Failed to deserialize resume data: {}", e);
                    ParserError::InvalidData {
                        message: e.to_string()
                    }
                })?;
                Ok(Some(resume))
            }
            None => Ok(None),
        }
    }

    pub async fn list_user_resumes(&self, user_id: &str) -> Result<Vec<(i32, String)>> {
        let records = sqlx::query!(
            r#"
            SELECT id, pdf_key
            FROM resumes
            WHERE user_id = $1
            ORDER BY created_at DESC
            "#,
            user_id
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

#[cfg(test)]
mod tests {
    use super::*;
    use chrono::NaiveDate;
    use std::env;

    #[tokio::test]
    async fn test_database_operations() {
        let database_url = env::var("DATABASE_URL")
            .expect("DATABASE_URL must be set for tests");

        let db = Database::new(&database_url).await.unwrap();

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
        let user_id = "test-user";
        let pdf_key = "test-key.pdf";
        let record_id = db.store_resume(user_id, &resume, pdf_key).await.unwrap();

        // Test retrieving resume
        let retrieved = db.get_resume(record_id).await.unwrap().unwrap();
        assert_eq!(retrieved.personal_info.name, resume.personal_info.name);
        assert_eq!(retrieved.education[0].institution, resume.education[0].institution);

        // Test listing resumes
        let resumes = db.list_user_resumes(user_id).await.unwrap();
        assert!(!resumes.is_empty());
        assert_eq!(resumes[0].1, pdf_key);
    }
} 