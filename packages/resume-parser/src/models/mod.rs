use chrono::NaiveDate;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Serialize, Deserialize)]
pub struct PersonalInfo {
    pub name: Option<String>,
    pub email: Option<String>,
    pub phone: Option<String>,
    pub location: Option<String>,
    pub linkedin: Option<String>,
    pub github: Option<String>,
    pub website: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct EducationEntry {
    pub institution: String,
    pub degree: String,
    pub field: Option<String>,
    pub start_date: Option<NaiveDate>,
    pub end_date: Option<NaiveDate>,
    pub gpa: Option<f32>,
    pub location: Option<String>,
    pub achievements: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ExperienceEntry {
    pub company: String,
    pub title: String,
    pub location: Option<String>,
    pub start_date: Option<NaiveDate>,
    pub end_date: Option<NaiveDate>,
    pub achievements: Vec<String>,
    pub technologies: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ProjectEntry {
    pub name: String,
    pub description: Option<String>,
    pub url: Option<String>,
    pub technologies: Vec<String>,
    pub achievements: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SkillCategory {
    pub category: String,
    pub skills: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ResumeData {
    pub personal_info: PersonalInfo,
    pub summary: Option<String>,
    pub education: Vec<EducationEntry>,
    pub experience: Vec<ExperienceEntry>,
    pub projects: Vec<ProjectEntry>,
    pub skills: Vec<SkillCategory>,
    pub certifications: Vec<String>,
    pub languages: Vec<String>,
    pub metadata: HashMap<String, String>,
}

impl ResumeData {
    pub fn new() -> Self {
        Self {
            personal_info: PersonalInfo {
                name: None,
                email: None,
                phone: None,
                location: None,
                linkedin: None,
                github: None,
                website: None,
            },
            summary: None,
            education: Vec::new(),
            experience: Vec::new(),
            projects: Vec::new(),
            skills: Vec::new(),
            certifications: Vec::new(),
            languages: Vec::new(),
            metadata: HashMap::new(),
        }
    }

    pub fn with_metadata(mut self, key: &str, value: &str) -> Self {
        self.metadata.insert(key.to_string(), value.to_string());
        self
    }
}

#[derive(Debug, sqlx::FromRow)]
pub struct StoredResume {
    pub id: i32,
    pub user_id: uuid::Uuid,
    pub pdf_key: String,
    pub data: serde_json::Value,
    pub created_at: chrono::DateTime<chrono::Utc>,
    pub updated_at: chrono::DateTime<chrono::Utc>,
}

impl StoredResume {
    pub fn get_resume_data(&self) -> Result<ResumeData, serde_json::Error> {
        serde_json::from_value(self.data.clone())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_resume_data_creation() {
        let resume = ResumeData::new()
            .with_metadata("source", "pdf")
            .with_metadata("parsed_date", "2024-01-15");

        assert!(resume.metadata.contains_key("source"));
        assert!(resume.metadata.contains_key("parsed_date"));
        assert!(resume.education.is_empty());
        assert!(resume.experience.is_empty());
    }

    #[test]
    fn test_serialization() {
        let mut resume = ResumeData::new();
        resume.personal_info.name = Some("John Doe".to_string());
        resume.education.push(EducationEntry {
            institution: "University of Example".to_string(),
            degree: "Bachelor of Science".to_string(),
            field: Some("Computer Science".to_string()),
            start_date: None,
            end_date: None,
            gpa: Some(3.8),
            location: Some("Example City".to_string()),
            achievements: vec!["Dean's List".to_string()],
        });

        let serialized = serde_json::to_string(&resume).unwrap();
        let deserialized: ResumeData = serde_json::from_str(&serialized).unwrap();

        assert_eq!(deserialized.personal_info.name, Some("John Doe".to_string()));
        assert_eq!(deserialized.education[0].institution, "University of Example");
    }
}
