db = db.getSiblingDB('oomi');

// Create collections with schema validation
db.createCollection('parsed_resumes', {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["resumeId", "userId", "parsedData"],
      properties: {
        resumeId: {
          bsonType: "string",
          description: "must be a string and is required"
        },
        userId: {
          bsonType: "string",
          description: "must be a string and is required"
        },
        parsedData: {
          bsonType: "object",
          required: ["personalInfo", "experience", "education", "skills"],
          properties: {
            personalInfo: {
              bsonType: "object",
              properties: {
                name: { bsonType: "string" },
                email: { bsonType: "string" },
                phone: { bsonType: "string" },
                location: { bsonType: "string" },
                linkedin: { bsonType: "string" },
                github: { bsonType: "string" },
                website: { bsonType: "string" }
              }
            },
            experience: {
              bsonType: "array",
              items: {
                bsonType: "object",
                required: ["company", "title"],
                properties: {
                  company: { bsonType: "string" },
                  title: { bsonType: "string" },
                  location: { bsonType: "string" },
                  startDate: { bsonType: "string" },
                  endDate: { bsonType: "string" },
                  achievements: { 
                    bsonType: "array",
                    items: { bsonType: "string" }
                  }
                }
              }
            },
            education: {
              bsonType: "array",
              items: {
                bsonType: "object",
                properties: {
                  institution: { bsonType: "string" },
                  degree: { bsonType: "string" },
                  field: { bsonType: "string" },
                  graduationDate: { bsonType: "string" }
                }
              }
            },
            skills: {
              bsonType: "array",
              items: { bsonType: "string" }
            }
          }
        },
        confidence: { bsonType: "number" },
        version: { bsonType: "number" },
        createdAt: { bsonType: "date" },
        updatedAt: { bsonType: "date" }
      }
    }
  }
});

// Create indexes
db.parsed_resumes.createIndex({ "resumeId": 1 }, { unique: true });
db.parsed_resumes.createIndex({ "userId": 1 }); 