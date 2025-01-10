use crate::error::Result;
use crate::models::{ResumeData, ExperienceEntry as WorkExperience, EducationEntry as Education};
use crate::entities::EntityExtractor;
use crate::pdf::extract_text_from_pdf;
use crate::text::TextProcessor;
use chrono::Utc;
use std::path::Path;
use tracing::info;

pub struct ResumeParser;

impl ResumeParser {
    pub async fn parse_file<P: AsRef<Path>>(path: P) -> Result<ResumeData> {
        info!("Starting resume parsing for file: {:?}", path.as_ref());
        
        // Extract text from PDF
        let pdf_doc = extract_text_from_pdf(path).await?;
        let text = pdf_doc.get_text();
        
        // Create base resume data
        let mut resume_data = ResumeData::new()
            .with_metadata("source", "pdf")
            .with_metadata("parsed_date", &Utc::now().to_rfc3339());

        // Process sections using TextProcessor correctly
        let mut processor = TextProcessor::new(text.to_string());
        processor.split_into_sections();

        // Parse each section
        if let Some(skills_text) = processor.get_section("SKILLS") {
            resume_data.skills = Self::extract_skills(skills_text)?;
        }

        if let Some(experience_text) = processor.get_section("EXPERIENCE") {
            resume_data.experience = Self::extract_work_experience(experience_text)?;
        }

        if let Some(education_text) = processor.get_section("EDUCATION") {
            resume_data.education = Self::extract_education(education_text)?;
        }

        Ok(resume_data)
    }

    // Add parse_from_bytes method that queue is expecting
    pub async fn parse_from_bytes(pdf_data: &[u8]) -> Result<ResumeData> {
        // Create a temporary file
        let mut temp_file = tempfile::NamedTempFile::new()?;
        std::io::Write::write_all(&mut temp_file, pdf_data)?;
        
        Self::parse_file(temp_file.path()).await
    }

    fn extract_work_experience(text: &str) -> Result<Vec<WorkExperience>> {
        let mut experiences = Vec::new();
        let mut current_exp: Option<WorkExperience> = None;
        let mut current_achievements = Vec::new();

        for line in text.lines() {
            let line = line.trim();
            if line.is_empty() { continue; }

            if line.starts_with('-') {
                if let Some(_exp) = &mut current_exp {
                    current_achievements.push(line[1..].trim().to_string());
                }
            } else if let Some(title) = EntityExtractor::extract_job_title(line) {
                if let Some(mut exp) = current_exp.take() {
                    exp.achievements = current_achievements.clone();
                    experiences.push(exp);
                    current_achievements.clear();
                }

                current_exp = Some(WorkExperience {
                    company: line.replace(&title, "").trim().to_string(),
                    title,
                    location: None,
                    start_date: None,
                    end_date: None,
                    achievements: Vec::new(),
                    technologies: Vec::new(), // Add missing field
                });
            }
        }

        if let Some(mut exp) = current_exp {
            exp.achievements = current_achievements;
            experiences.push(exp);
        }

        Ok(experiences)
    }

    fn extract_education(_text: &str) -> Result<Vec<Education>> {
        let education = Vec::new();
        Ok(education)
    }

    fn extract_skills(text: &str) -> Result<Vec<String>> {
        let mut skills = Vec::new();
        for line in text.lines() {
            let skill = line.trim().trim_start_matches('-').trim();
            if !skill.is_empty() {
                skills.push(skill.to_string());
            }
        }
        Ok(skills)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;

    #[tokio::test]
    async fn test_parse_file() {
        // Create test directory if it doesn't exist
        let test_dir = Path::new("tests/fixtures");
        fs::create_dir_all(test_dir).unwrap();

        // Create or verify test PDF file
        let pdf_path = test_dir.join("test.pdf");
        if !pdf_path.exists() {
            panic!("Please add a sample PDF file at tests/fixtures/test.pdf");
        }

        let result = ResumeParser::parse_file(pdf_path).await;
        assert!(result.is_ok());

        let resume_data = result.unwrap();
        assert!(resume_data.metadata.contains_key("source"));
        assert!(resume_data.metadata.contains_key("parsed_date"));
    }
}
