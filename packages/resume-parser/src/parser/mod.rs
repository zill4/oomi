use tracing::{debug, info};
use crate::models::{ResumeData, PersonalInfo, EducationEntry, ExperienceEntry};
use std::collections::HashMap;
use regex::Regex;
use lazy_static::lazy_static;

pub struct ResumeParser;

impl ResumeParser {
    pub async fn parse_from_bytes(pdf_data: &[u8]) -> crate::error::Result<ResumeData> {
        let text = String::from_utf8_lossy(pdf_data);
        Ok(parse_resume(&text))
    }

    pub async fn parse_file<P: AsRef<std::path::Path>>(path: P) -> crate::error::Result<ResumeData> {
        debug!("Parsing resume from file: {:?}", path.as_ref());
        let pdf_doc = crate::pdf::extract_text_from_pdf(path).await?;
        let text = pdf_doc.get_text();
        Ok(parse_resume(&text))
    }
}

lazy_static! {
    static ref SECTION_HEADERS: Vec<(&'static str, Regex)> = vec![
        ("EDUCATION", Regex::new(r"(?i)^\s*EDUCATION\s*$").unwrap()),
        ("EXPERIENCE", Regex::new(r"(?i)^\s*(WORK\s+)?EXPERIENCE\s*$").unwrap()),
        ("SKILLS", Regex::new(r"(?i)^\s*(TECHNICAL\s+)?SKILLS\s*$").unwrap()),
    ];
}

pub fn parse_resume(text: &str) -> ResumeData {
    debug!("Starting resume parsing with text length: {}", text.len());
    
    // Print first few lines to verify text extraction
    let preview: String = text.lines().take(10).collect::<Vec<_>>().join("\n");
    debug!("First 10 lines of text:\n{}", preview);
    
    let sections = identify_sections(text);
    debug!("Identified sections: {:?}", sections.keys());
    
    // Extract email using regex
    let email_re = Regex::new(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}").unwrap();
    let email = email_re.find(text).map(|m| m.as_str().to_string());
    
    let personal_info = PersonalInfo {
        name: None,
        email,
        phone: None,
        location: None,
        linkedin: None,
        github: None,
        website: None,
    };

    let education = extract_education(&sections);
    let experience = extract_experience(&sections);
    let skills = extract_skills(&sections);

    // Store metadata
    let metadata = HashMap::new();
    
    ResumeData {
        personal_info,
        education,
        experience,
        skills,
        metadata,
        raw_text: text.to_string()
    }
}

fn identify_sections(text: &str) -> HashMap<String, String> {
    debug!("Starting section identification");
    let mut sections = HashMap::new();
    let mut current_section: Option<&str> = None;
    let mut current_content = Vec::new();
    
    // Simple markers that should exist somewhere in the section header
    let section_markers = [
        ("EXPERIENCE", "EXPERIENCE"),
        ("EDUCATION", "EDUCATION"),
        ("SKILLS", "SKILLS"),
        ("ACHIEVEMENTS", "ACHIEVEMENTS"),
    ];
    
    for line in text.lines() {
        let line = line.trim();
        if line.is_empty() { continue; }
        
        // Normalize the line for comparison (remove spaces, uppercase)
        let normalized_line = line.replace(" ", "").to_uppercase();
        debug!("Processing line: '{}'", normalized_line);
        
        // Check if this line contains any of our section markers (also normalized)
        let found_section = section_markers.iter()
            .find(|&&(_, marker)| {
                let normalized_marker = marker.replace(" ", "").to_uppercase();
                normalized_line.contains(&normalized_marker)
            });
        
        if let Some((section_name, _)) = found_section {
            debug!("Found section header: {} in line: {}", section_name, line);
            if let Some(section) = current_section {
                sections.insert(section.to_string(), current_content.join("\n"));
                current_content.clear();
            }
            current_section = Some(section_name);
            continue;
        }
        
        if let Some(section) = current_section {
            debug!("Adding line to {}: {}", section, line);
            current_content.push(line);
        }
    }
    
    // Add the last section
    if let Some(section) = current_section {
        sections.insert(section.to_string(), current_content.join("\n"));
    }

    info!("Found {} sections: {:?}", sections.len(), sections.keys());
    
    // Debug print the content of each section
    for (section, content) in &sections {
        debug!("\nSection '{}' content:\n{}", section, content);
    }
    
    sections
}

fn extract_personal_info(text: &str) -> PersonalInfo {
    let mut info = PersonalInfo::default();
    
    // Extract email
    if let Some(email) = find_email(text) {
        info.email = Some(email);
    }

    // Extract phone
    if let Some(phone) = find_phone(text) {
        info.phone = Some(phone);
    }

    // Extract name (usually first line or after name pattern)
    if let Some(name) = find_name(text) {
        info.name = Some(name);
    }

    info
}

fn extract_education(sections: &HashMap<String, String>) -> Vec<EducationEntry> {
    let mut education = Vec::new();
    
    if let Some(education_text) = sections.get("EDUCATION") {
        let mut current_institution = String::new();
        let mut current_field = String::new();
        let mut current_date = String::new();
        
        for line in education_text.lines() {
            let line = line.trim();
            if line.is_empty() { continue; }
            
            if line.contains("–") {
                // New education entry
                if !current_institution.is_empty() {
                    education.push(EducationEntry {
                        institution: current_institution.clone(),
                        degree: None,
                        field: Some(current_field.clone()),
                        graduation_date: Some(current_date.clone()),
                    });
                }
                
                let parts: Vec<&str> = line.split("–").collect();
                current_institution = parts[0].trim().to_string();
                current_date = parts[1].trim().to_string();
            } else if !line.starts_with("•") {
                current_field = line.to_string();
            }
        }
        
        // Add the last education entry
        if !current_institution.is_empty() {
            education.push(EducationEntry {
                institution: current_institution,
                degree: None,
                field: Some(current_field),
                graduation_date: Some(current_date),
            });
        }
    }
    
    education
}

fn extract_experience(sections: &HashMap<String, String>) -> Vec<ExperienceEntry> {
    let mut experiences = Vec::new();
    
    if let Some(experience_text) = sections.get("EXPERIENCE") {
        let mut current_company = String::new();
        let mut current_title = String::new();
        let mut current_date = String::new();
        let mut current_achievements = Vec::new();
        
        for line in experience_text.lines() {
            let line = line.trim();
            if line.is_empty() { continue; }
            
            // Company and date are on the same line
            if line.contains("–") && !line.starts_with("•") {
                // Save previous experience if exists
                if !current_company.is_empty() {
                    experiences.push(ExperienceEntry {
                        company: current_company.clone(),
                        title: current_title.clone(),
                        location: None, // TODO: Extract location
                        start_date: Some(current_date.split("–").next().unwrap_or("").trim().to_string()),
                        end_date: Some(current_date.split("–").nth(1).unwrap_or("").trim().to_string()),
                        achievements: current_achievements.clone(),
                        technologies: Vec::new(), // TODO: Extract technologies
                    });
                }
                
                let parts: Vec<&str> = line.split("–").collect();
                current_company = parts[0].trim().to_string();
                current_date = parts[1].trim().to_string();
                current_achievements = Vec::new();
            } else if !line.starts_with("•") && !current_company.is_empty() {
                current_title = line.to_string();
            } else if line.starts_with("•") {
                current_achievements.push(line[1..].trim().to_string());
            }
        }
        
        // Don't forget to add the last experience
        if !current_company.is_empty() {
            experiences.push(ExperienceEntry {
                company: current_company,
                title: current_title,
                location: None,
                start_date: Some(current_date.split("–").next().unwrap_or("").trim().to_string()),
                end_date: Some(current_date.split("–").nth(1).unwrap_or("").trim().to_string()),
                achievements: current_achievements,
                technologies: Vec::new(),
            });
        }
    }
    
    experiences
}

fn extract_skills(sections: &HashMap<String, String>) -> Vec<String> {
    let mut skills = Vec::new();
    
    if let Some(skills_text) = sections.get("ACHIEVEMENTS, SKILLS & INTERESTS") {
        // Extract the skills line (last line in the screenshot)
        if let Some(skills_line) = skills_text.lines()
            .find(|line| line.contains("Skills:")) {
            skills = skills_line
                .split("Skills:")
                .nth(1)
                .unwrap_or("")
                .split(",")
                .map(|s| s.trim().to_string())
                .filter(|s| !s.is_empty())
                .collect();
        }
    }
    
    skills
}

// Helper functions for extraction
fn find_email(text: &str) -> Option<String> {
    lazy_static! {
        static ref EMAIL_RE: Regex = Regex::new(
            r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}"
        ).unwrap();
    }
    
    EMAIL_RE.find(text)
        .map(|m| m.as_str().to_string())
}

fn find_phone(text: &str) -> Option<String> {
    lazy_static! {
        static ref PHONE_RE: Regex = Regex::new(
            r"(?:(?:\+?1\s*(?:[.-]\s*)?)?(?:\(\s*([0-9]{3})\s*\)|([0-9]{3}))(?:[.-]\s*)?([0-9]{3})(?:[.-]\s*)?([0-9]{4}))"
        ).unwrap();
    }
    
    PHONE_RE.find(text)
        .map(|m| m.as_str().to_string())
}

fn find_name(text: &str) -> Option<String> {
    // Simple heuristic: first line that's not an email or phone
    text.lines()
        .find(|line| {
            !line.contains('@') && 
            !line.chars().any(|c| c.is_ascii_digit())
        })
        .map(|s| s.trim().to_string())
}
