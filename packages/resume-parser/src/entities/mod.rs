use chrono::NaiveDate;
use regex::Regex;
use lazy_static::lazy_static;
use tracing::debug;

lazy_static! {
    static ref DATE_PATTERNS: Vec<Regex> = vec![
        Regex::new(r"(?i)(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{4}").unwrap(),
        Regex::new(r"\d{2}/\d{2}/\d{4}").unwrap(),
        Regex::new(r"\d{4}-\d{2}-\d{2}").unwrap(),
    ];

    static ref JOB_TITLES: Vec<&'static str> = vec![
        "Software Engineer",
        "Senior Software Engineer",
        "Software Developer",
        "Full Stack Developer",
        "Backend Developer",
        "Frontend Developer",
        "DevOps Engineer",
        "Data Scientist",
        "Product Manager",
        "Project Manager",
    ];

    static ref DEGREE_PATTERNS: Vec<Regex> = vec![
        Regex::new(r"(?i)B\.?S\.?|Bachelor of Science").unwrap(),
        Regex::new(r"(?i)B\.?A\.?|Bachelor of Arts").unwrap(),
        Regex::new(r"(?i)M\.?S\.?|Master of Science").unwrap(),
        Regex::new(r"(?i)M\.?B\.?A\.?|Master of Business Administration").unwrap(),
        Regex::new(r"(?i)Ph\.?D\.?|Doctor of Philosophy").unwrap(),
    ];
}

pub struct EntityExtractor;

impl EntityExtractor {
    pub fn extract_dates(text: &str) -> Vec<String> {
        debug!("Extracting dates from text");
        let mut dates = Vec::new();
        
        for pattern in DATE_PATTERNS.iter() {
            for cap in pattern.find_iter(text) {
                dates.push(cap.as_str().to_string());
            }
        }
        
        dates.sort();
        dates.dedup();
        dates
    }

    pub fn extract_job_title(text: &str) -> Option<String> {
        debug!("Extracting job title from text");
        for title in JOB_TITLES.iter() {
            if text.contains(title) {
                return Some(title.to_string());
            }
        }
        None
    }

    pub fn extract_degree(text: &str) -> Option<String> {
        debug!("Extracting degree from text");
        for pattern in DEGREE_PATTERNS.iter() {
            if let Some(cap) = pattern.find(text) {
                return Some(cap.as_str().to_string());
            }
        }
        None
    }

    pub fn parse_date(date_str: &str) -> Option<NaiveDate> {
        debug!("Parsing date string: {}", date_str);
        
        let normalized = date_str.replace("January", "01")
            .replace("February", "02")
            .replace("March", "03")
            .replace("April", "04")
            .replace("May", "05")
            .replace("June", "06")
            .replace("July", "07")
            .replace("August", "08")
            .replace("September", "09")
            .replace("October", "10")
            .replace("November", "11")
            .replace("December", "12");

        if normalized.contains('/') {
            return NaiveDate::parse_from_str(&normalized, "%m/%d/%Y").ok();
        } else if normalized.contains('-') {
            return NaiveDate::parse_from_str(&normalized, "%Y-%m-%d").ok();
        } else {
            let parts: Vec<&str> = normalized.split_whitespace().collect();
            if parts.len() == 2 {
                if let (Ok(month), Ok(year)) = (parts[0].parse::<u32>(), parts[1].parse::<i32>()) {
                    return NaiveDate::from_ymd_opt(year, month, 1);
                }
            }
        }

        None
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_extract_dates() {
        let text = "I worked at Company from January 2020 to March 2023";
        let dates = EntityExtractor::extract_dates(text);
        assert_eq!(dates.len(), 2);
        assert!(dates.contains(&"January 2020".to_string()));
        assert!(dates.contains(&"March 2023".to_string()));
    }

    #[test]
    fn test_extract_job_title() {
        let text = "Worked as a Software Engineer at Company";
        let title = EntityExtractor::extract_job_title(text);
        assert_eq!(title, Some("Software Engineer".to_string()));
    }

    #[test]
    fn test_extract_degree() {
        let text = "Bachelor of Science in Computer Science";
        let degree = EntityExtractor::extract_degree(text);
        assert_eq!(degree, Some("Bachelor of Science".to_string()));
    }

    #[test]
    fn test_parse_date() {
        let test_cases = vec![
            ("January 2020", "2020-01-01"),
            ("01/15/2020", "2020-01-15"),
            ("2020-01-15", "2020-01-15"),
        ];

        for (input, expected) in test_cases {
            let date = EntityExtractor::parse_date(input);
            assert!(date.is_some(), "Failed to parse date: {}", input);
            assert_eq!(
                date.unwrap().format("%Y-%m-%d").to_string(),
                expected,
                "Incorrect parsing for: {}", input
            );
        }
    }
} 