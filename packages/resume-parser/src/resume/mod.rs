use chrono::NaiveDate;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use tracing::debug;

#[derive(Debug, Serialize, Deserialize)]
pub struct Education {
    pub school: String,
    pub degree: String,
    pub field_of_study: Option<String>,
    pub start_date: Option<NaiveDate>,
    pub end_date: Option<NaiveDate>,
    pub gpa: Option<f32>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Experience {
    pub company: String,
    pub title: String,
    pub location: Option<String>,
    pub start_date: Option<NaiveDate>,
    pub end_date: Option<NaiveDate>,
    pub responsibilities: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Resume {
    pub raw_text: String,
    pub sections: HashMap<String, String>,
    pub education: Vec<Education>,
    pub experience: Vec<Experience>,
    pub skills: Vec<String>,
    pub summary: Option<String>,
}

impl Resume {
    pub fn new(content: String, sections: HashMap<String, String>) -> Self {
        Self {
            raw_text: content,
            sections,
            education: Vec::new(),
            experience: Vec::new(),
            skills: Vec::new(),
            summary: None,
        }
    }

    pub fn parse_sections(&mut self) {
        self.parse_education();
        self.parse_experience();
        self.parse_skills();
        self.parse_summary();
    }

    fn parse_education(&mut self) {
        if let Some(education_text) = self.sections.get("EDUCATION") {
            debug!("Parsing education section");
            let mut current_education = Vec::new();

            for line in education_text.lines() {
                if line.to_uppercase().contains("UNIVERSITY") || line.to_uppercase().contains("COLLEGE") {
                    // Basic parsing - will be enhanced in future
                    let parts: Vec<&str> = line.split(',').collect();
                    if !parts.is_empty() {
                        current_education.push(Education {
                            school: parts[0].trim().to_string(),
                            degree: parts.get(1).map_or("", |s| s.trim()).to_string(),
                            field_of_study: None,
                            start_date: None,
                            end_date: None,
                            gpa: None,
                        });
                    }
                }
            }

            self.education = current_education;
        }
    }

    fn parse_experience(&mut self) {
        if let Some(experience_text) = self.sections.get("EXPERIENCE") {
            debug!("Parsing experience section");
            let mut current_experience = Vec::new();
            let mut current_item: Option<Experience> = None;
            let mut current_responsibilities = Vec::new();

            for line in experience_text.lines() {
                if line.starts_with('-') {
                    // This is a responsibility
                    current_responsibilities.push(line[1..].trim().to_string());
                } else if !line.trim().is_empty() {
                    // If we have a previous item, save it
                    if let Some(mut exp) = current_item.take() {
                        exp.responsibilities = current_responsibilities.clone();
                        current_experience.push(exp);
                        current_responsibilities.clear();
                    }

                    // Start a new experience item
                    current_item = Some(Experience {
                        company: line.trim().to_string(),
                        title: "".to_string(), // Will be enhanced in future
                        location: None,
                        start_date: None,
                        end_date: None,
                        responsibilities: Vec::new(),
                    });
                }
            }

            // Don't forget the last item
            if let Some(mut exp) = current_item {
                exp.responsibilities = current_responsibilities;
                current_experience.push(exp);
            }

            self.experience = current_experience;
        }
    }

    fn parse_skills(&mut self) {
        if let Some(skills_text) = self.sections.get("SKILLS") {
            debug!("Parsing skills section");
            self.skills = skills_text
                .lines()
                .filter_map(|line| {
                    let skill = line.trim().trim_start_matches('-').trim();
                    if !skill.is_empty() {
                        Some(skill.to_string())
                    } else {
                        None
                    }
                })
                .collect();
        }
    }

    fn parse_summary(&mut self) {
        if let Some(summary_text) = self.sections.get("SUMMARY") {
            debug!("Parsing summary section");
            self.summary = Some(summary_text.trim().to_string());
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_education() {
        let mut sections = HashMap::new();
        sections.insert(
            "EDUCATION".to_string(),
            "University of Example, Bachelor of Science\nCollege of Testing, Associate Degree".to_string(),
        );

        let mut resume = Resume::new("".to_string(), sections);
        resume.parse_sections();

        assert_eq!(resume.education.len(), 2);
        assert_eq!(resume.education[0].school, "University of Example");
        assert_eq!(resume.education[0].degree, "Bachelor of Science");
    }

    #[test]
    fn test_parse_experience() {
        let mut sections = HashMap::new();
        sections.insert(
            "EXPERIENCE".to_string(),
            "Example Corp\n- Built things\n- Fixed stuff\nAnother Co\n- Did work".to_string(),
        );

        let mut resume = Resume::new("".to_string(), sections);
        resume.parse_sections();

        assert_eq!(resume.experience.len(), 2);
        assert_eq!(resume.experience[0].company, "Example Corp");
        assert_eq!(resume.experience[0].responsibilities.len(), 2);
    }

    #[test]
    fn test_parse_skills() {
        let mut sections = HashMap::new();
        sections.insert(
            "SKILLS".to_string(),
            "- Rust\n- Python\n- Docker".to_string(),
        );

        let mut resume = Resume::new("".to_string(), sections);
        resume.parse_sections();

        assert_eq!(resume.skills.len(), 3);
        assert!(resume.skills.contains(&"Rust".to_string()));
    }
} 