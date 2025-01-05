use std::collections::HashMap;
use tracing::debug;

pub struct TextProcessor {
    content: String,
    sections: HashMap<String, String>,
}

impl TextProcessor {
    pub fn new(content: String) -> Self {
        Self {
            content,
            sections: HashMap::new(),
        }
    }

    /// Split text into sections based on common resume headings
    pub fn split_into_sections(&mut self) -> &HashMap<String, String> {
        let common_headers = [
            "EDUCATION",
            "EXPERIENCE",
            "SKILLS",
            "WORK EXPERIENCE",
            "PROFESSIONAL EXPERIENCE",
            "PROJECTS",
            "CERTIFICATIONS",
            "LANGUAGES",
            "SUMMARY",
            "OBJECTIVE",
        ];

        let content = self.content.to_uppercase();
        let mut current_section = String::from("UNKNOWN");
        let mut section_content = String::new();

        for line in content.lines() {
            let line = line.trim();
            
            // Check if line matches a header exactly or contains it at the start
            let is_header = common_headers.iter().any(|&header| {
                line == header || line.starts_with(&format!("{} ", header))
            });

            if is_header {
                // Save previous section if it exists
                if !section_content.is_empty() {
                    debug!("Found section: {}", current_section);
                    self.sections.insert(current_section.clone(), section_content.trim().to_string());
                }
                
                // Start new section - use the matching header
                current_section = common_headers
                    .iter()
                    .find(|&&header| line.starts_with(header))
                    .unwrap()
                    .to_string();
                section_content = String::new();
            } else if !line.is_empty() {
                section_content.push_str(line);
                section_content.push('\n');
            }
        }

        // Save the last section
        if !section_content.is_empty() {
            debug!("Found section: {}", current_section);
            self.sections.insert(current_section, section_content.trim().to_string());
        }

        &self.sections
    }

    /// Get the content of a specific section
    pub fn get_section(&self, section: &str) -> Option<&String> {
        self.sections.get(&section.to_uppercase())
    }

    /// Get the raw content
    pub fn get_raw_content(&self) -> &str {
        &self.content
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_split_into_sections() {
        let content = r#"
EDUCATION
Bachelor of Science in Computer Science
University of Example, 2018-2022

EXPERIENCE
Software Engineer
Example Corp, 2022-Present
- Developed features
- Fixed bugs

SKILLS
- Rust
- Python
- Docker
"#;

        let mut processor = TextProcessor::new(content.to_string());
        let sections = processor.split_into_sections();

        assert!(sections.contains_key("EDUCATION"));
        assert!(sections.contains_key("EXPERIENCE"));
        assert!(sections.contains_key("SKILLS"));
    }

    #[test]
    fn test_get_section() {
        let content = "SUMMARY\nExperienced developer\n\nSKILLS\nRust, Python";
        let mut processor = TextProcessor::new(content.to_string());
        processor.split_into_sections();

        assert!(processor.get_section("SUMMARY").is_some());
        assert!(processor.get_section("SKILLS").is_some());
        assert!(processor.get_section("NONEXISTENT").is_none());

        // Test case insensitivity
        assert!(processor.get_section("summary").is_some());
        assert!(processor.get_section("Skills").is_some());
    }
} 