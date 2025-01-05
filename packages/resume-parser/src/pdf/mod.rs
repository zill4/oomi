use std::path::Path;
use crate::error::{ParserError, Result};
use tracing::{info, warn};

pub struct PdfDocument {
    content: String,
}

impl PdfDocument {
    pub fn new(content: String) -> Self {
        Self { content }
    }

    pub fn get_text(&self) -> &str {
        &self.content
    }
}

pub async fn extract_text_from_pdf<P: AsRef<Path>>(path: P) -> Result<PdfDocument> {
    info!("Extracting text from PDF: {:?}", path.as_ref());
    
    match pdf_extract::extract_text(path.as_ref()) {
        Ok(content) => {
            info!("Successfully extracted text from PDF");
            Ok(PdfDocument::new(content))
        }
        Err(e) => {
            warn!("Failed to extract text from PDF: {}", e);
            Err(ParserError::PdfExtraction(e.to_string()))
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;

    #[tokio::test]
    async fn test_extract_text_from_pdf() {
        // Create a test directory if it doesn't exist
        let test_dir = Path::new("tests/fixtures");
        fs::create_dir_all(test_dir).unwrap();

        // Create a sample PDF file for testing
        let pdf_path = test_dir.join("test.pdf");
        if !pdf_path.exists() {
            // You'll need to add a sample PDF file to run tests
            panic!("Please add a sample PDF file at tests/fixtures/test.pdf");
        }

        let result = extract_text_from_pdf(pdf_path).await;
        assert!(result.is_ok());

        let doc = result.unwrap();
        assert!(!doc.get_text().is_empty());
    }
} 