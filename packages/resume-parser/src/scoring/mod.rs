use crate::models::{EducationEntry, ExperienceEntry, PersonalInfo, ResumeData};
use std::collections::HashMap;
use tracing::debug;
use serde::Serialize;

#[derive(Debug, Serialize)]
pub struct ConfidenceScore {
    pub score: f32,
    pub reasons: Vec<String>,
}

impl ConfidenceScore {
    pub fn new(score: f32, reason: &str) -> Self {
        Self {
            score,
            reasons: vec![reason.to_string()],
        }
    }

    pub fn add_reason(&mut self, score_adjustment: f32, reason: &str) {
        self.score = (self.score + score_adjustment).clamp(0.0, 1.0);
        self.reasons.push(reason.to_string());
    }
}

pub struct ResumeScorer;

impl ResumeScorer {
    pub fn score_resume(resume: &ResumeData) -> HashMap<String, ConfidenceScore> {
        debug!("Calculating confidence scores for resume");
        let mut scores = HashMap::new();

        // Score personal information
        scores.insert(
            "personal_info".to_string(),
            Self::score_personal_info(&resume.personal_info),
        );

        // Score education entries
        for (index, entry) in resume.education.iter().enumerate() {
            scores.insert(
                format!("education_{}", index),
                Self::score_education(entry),
            );
        }

        // Score experience entries
        for (index, entry) in resume.experience.iter().enumerate() {
            scores.insert(
                format!("experience_{}", index),
                Self::score_experience(entry),
            );
        }

        // Score skills
        scores.insert(
            "skills".to_string(),
            Self::score_skills(&resume.skills),
        );

        scores
    }

    fn score_personal_info(info: &PersonalInfo) -> ConfidenceScore {
        let mut score = ConfidenceScore::new(0.5, "Base personal info score");

        if info.email.is_some() {
            score.add_reason(0.2, "Email present");
        }
        if info.phone.is_some() {
            score.add_reason(0.1, "Phone number present");
        }
        if info.name.is_some() {
            score.add_reason(0.2, "Name present");
        }

        score
    }

    fn score_education(entry: &EducationEntry) -> ConfidenceScore {
        let mut score = ConfidenceScore::new(0.4, "Base education entry score");

        if !entry.institution.is_empty() {
            score.add_reason(0.2, "Institution name present");
        }
        if let Some(ref degree) = entry.degree {
            if !degree.is_empty() {
                score.add_reason(0.2, "Degree present");
            }
        }
        if entry.graduation_date.is_some() {
            score.add_reason(0.1, "Graduation date present");
        }

        score
    }

    fn score_experience(entry: &ExperienceEntry) -> ConfidenceScore {
        let mut score = ConfidenceScore::new(0.4, "Base experience entry score");

        if !entry.company.is_empty() {
            score.add_reason(0.2, "Company name present");
        }
        if !entry.title.is_empty() {
            score.add_reason(0.2, "Job title present");
        }
        if !entry.achievements.is_empty() {
            score.add_reason(0.1, "Achievements present");
        }
        if !entry.technologies.is_empty() {
            score.add_reason(0.1, "Technologies present");
        }

        score
    }

    fn score_skills(skills: &[String]) -> ConfidenceScore {
        let score = if !skills.is_empty() { 1.0 } else { 0.0 };
        ConfidenceScore::new(score, "Skills section evaluation")
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use chrono::NaiveDate;

    #[test]
    fn test_education_scoring() {
        let entry = EducationEntry {
            institution: "University of Example".to_string(),
            degree: "Bachelor of Science".to_string(),
            field: Some("Computer Science".to_string()),
            start_date: Some(NaiveDate::from_ymd_opt(2020, 1, 1).unwrap()),
            end_date: Some(NaiveDate::from_ymd_opt(2024, 1, 1).unwrap()),
            gpa: Some(3.8),
            location: Some("Example City".to_string()),
            achievements: vec!["Dean's List".to_string()],
        };

        let score = ResumeScorer::score_education(&entry);
        assert!(score.score > 0.8, "Expected high confidence score for complete education entry");
    }

    #[test]
    fn test_experience_scoring() {
        let entry = ExperienceEntry {
            company: "Example Corp".to_string(),
            title: "Software Engineer".to_string(),
            location: Some("Example City".to_string()),
            start_date: Some(NaiveDate::from_ymd_opt(2020, 1, 1).unwrap()),
            end_date: None,
            achievements: vec!["Built scalable systems".to_string()],
            technologies: vec!["Rust".to_string(), "Docker".to_string()],
        };

        let score = ResumeScorer::score_experience(&entry);
        assert!(score.score > 0.7, "Expected high confidence score for complete experience entry");
    }
} 