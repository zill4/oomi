use resume_parser::{
    error::Result,
    parser::ResumeParser,
};
use std::{path::PathBuf, fs};
use tracing::{info, debug};

#[tokio::test]
async fn test_pdf_parsing() -> Result<()> {
    // Initialize tracing for better debug output
    tracing_subscriber::fmt::init();
    
    let test_pdf_path = PathBuf::from("tests/fixtures/test.pdf");
    
    info!("Starting PDF parsing test");
    println!("\n=== Starting PDF Parse Test ===");
    
    if !test_pdf_path.exists() {
        panic!("Test PDF file not found at: {:?}", test_pdf_path);
    }

    let result = ResumeParser::parse_file(&test_pdf_path).await?;

    // Print the extracted sections
    println!("\n=== Extracted Sections ===");
    println!("Found sections in PDF: {:?}", result.metadata.get("sections"));

    // Print detailed parsing results
    println!("\n=== Parsed Data ===");
    println!("Personal Info:");
    println!("  Name: {:?}", result.personal_info.name);
    println!("  Email: {:?}", result.personal_info.email);
    println!("  Phone: {:?}", result.personal_info.phone);

    println!("\nExperience Entries:");
    for (i, exp) in result.experience.iter().enumerate() {
        println!("\n  Experience #{}", i + 1);
        println!("    Company: {}", exp.company);
        println!("    Title: {}", exp.title);
        println!("    Date: {} - {}", 
            exp.start_date.as_deref().unwrap_or("N/A"),
            exp.end_date.as_deref().unwrap_or("N/A")
        );
        println!("    Achievements:");
        for achievement in &exp.achievements {
            println!("      • {}", achievement);
        }
    }

    println!("\nEducation Entries:");
    for (i, edu) in result.education.iter().enumerate() {
        println!("\n  Education #{}", i + 1);
        println!("    Institution: {}", edu.institution);
        println!("    Field: {}", edu.field.as_deref().unwrap_or("N/A"));
        println!("    Graduation: {}", edu.graduation_date.as_deref().unwrap_or("N/A"));
    }

    println!("\nSkills:");
    for skill in &result.skills {
        println!("  • {}", skill);
    }

    // Save the parsed data as JSON with pretty printing
    let json = serde_json::to_string_pretty(&result)?;
    fs::create_dir_all("tests/output")?;
    fs::write("tests/output/parsed_resume.json", &json)?;
    
    println!("\n=== Output ===");
    println!("Full JSON output saved to: tests/output/parsed_resume.json");
    println!("JSON Preview:");
    println!("{}", json);

    Ok(())
} 