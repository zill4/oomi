use crate::entities::EntityExtractor;
use crate::error::{ParserError, Result};
use crate::models::ResumeData;
use crate::pdf::extract_text_from_pdf;
use crate::text::TextProcessor;
use chrono::Utc;
use std::path::Path;
use tracing::{debug, info};
use tempfile::NamedTempFile;

pub struct ResumeParser;

impl ResumeParser {
    pub async fn parse_file<P: AsRef<Path>>(path: P) -> Result<ResumeData> {
        info!("Starting resume parsing for file: {:?}", path.as_ref());
        
        // Extract text from PDF
        let pdf_doc = extract_text_from_pdf(path).await?;
        let content = pdf_doc.get_text();

        // Process the text into sections
        let mut text_processor = TextProcessor::new(content.to_string());
        let sections = text_processor.split_into_sections();

        // Create ResumeData instance
        let mut resume_data = ResumeData::new()
            .with_metadata("source", "pdf")
            .with_metadata("parsed_date", &Utc::now().to_rfc3339());

        // Parse each section
        Self::parse_sections(sections, &mut resume_data);

        info!("Resume parsing completed successfully");
        Ok(resume_data)
    }

    pub async fn parse_file_from_bytes(data: &[u8]) -> Result<ResumeData> {
        let temp_file = NamedTempFile::new().map_err(|e| ParserError::Io(e))?;
        let path = temp_file.path().to_owned();
        
        tokio::fs::write(&path, data).await.map_err(|e| ParserError::Io(e))?;
        
        Self::parse_file(&path).await
    }

    fn parse_sections(sections: &std::collections::HashMap<String, String>, resume_data: &mut ResumeData) {
        debug!("Parsing resume sections");

        // Parse summary
        if let Some(summary) = sections.get("SUMMARY") {
            resume_data.summary = Some(summary.trim().to_string());
        }

        // Parse education
        if let Some(education_text) = sections.get("EDUCATION") {
            for entry in education_text.split('\n').filter(|s| !s.trim().is_empty()) {
                if let Some(degree) = EntityExtractor::extract_degree(entry) {
                    let dates = EntityExtractor::extract_dates(entry);
                    let mut edu_entry = crate::models::EducationEntry {
                        institution: entry.replace(&degree, "").trim().to_string(),
                        degree,
                        field: None,
                        start_date: None,
                        end_date: None,
                        gpa: None,
                        location: None,
                        achievements: Vec::new(),
                    };

                    // Parse dates if available
                    if !dates.is_empty() {
                        if let Some(date) = EntityExtractor::parse_date(&dates[0]) {
                            edu_entry.start_date = Some(date);
                        }
                        if dates.len() > 1 {
                            if let Some(date) = EntityExtractor::parse_date(&dates[1]) {
                                edu_entry.end_date = Some(date);
                            }
                        }
                    }

                    resume_data.education.push(edu_entry);
                }
            }
        }

        // Parse experience
        if let Some(experience_text) = sections.get("EXPERIENCE") {
            let mut current_entry: Option<crate::models::ExperienceEntry> = None;
            let mut current_achievements = Vec::new();

            for line in experience_text.lines() {
                let line = line.trim();
                if line.is_empty() {
                    continue;
                }

                if line.starts_with('-') {
                    // This is an achievement/bullet point
                    current_achievements.push(line[1..].trim().to_string());
                } else if let Some(title) = EntityExtractor::extract_job_title(line) {
                    // Save previous entry if it exists
                    if let Some(mut entry) = current_entry.take() {
                        entry.achievements = current_achievements.clone();
                        resume_data.experience.push(entry);
                        current_achievements.clear();
                    }

                    // Start new entry
                    let dates = EntityExtractor::extract_dates(line);
                    current_entry = Some(crate::models::ExperienceEntry {
                        company: line.replace(&title, "").trim().to_string(),
                        title,
                        location: None,
                        start_date: dates.first().and_then(|d| EntityExtractor::parse_date(d)),
                        end_date: dates.get(1).and_then(|d| EntityExtractor::parse_date(d)),
                        achievements: Vec::new(),
                        technologies: Vec::new(),
                    });
                }
            }

            // Don't forget the last entry
            if let Some(mut entry) = current_entry {
                entry.achievements = current_achievements;
                resume_data.experience.push(entry);
            }
        }

        // Parse skills
        if let Some(skills_text) = sections.get("SKILLS") {
            let skills = skills_text
                .lines()
                .filter_map(|line| {
                    let skill = line.trim().trim_start_matches('-').trim();
                    if !skill.is_empty() {
                        Some(skill.to_string())
                    } else {
                        None
                    }
                })
                .collect::<Vec<String>>();

            if !skills.is_empty() {
                resume_data.skills.push(crate::models::SkillCategory {
                    category: "Technical".to_string(),
                    skills,
                });
            }
        }
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
