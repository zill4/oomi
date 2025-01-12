db = db.getSiblingDB('oomi');

// Create collections with schema validation
db.createCollection('parsedResumes', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['resumeId', 'userId', 'parsedData'],
      properties: {
        resumeId: { bsonType: 'string' },
        userId: { bsonType: 'string' },
        parsedData: {
          bsonType: 'object',
          required: ['personal_info', 'education', 'experience', 'skills', 'metadata', 'raw_text'],
          properties: {
            personal_info: {
              bsonType: 'object',
              properties: {
                name: { bsonType: ['string', 'null'] },
                email: { bsonType: ['string', 'null'] },
                phone: { bsonType: ['string', 'null'] },
                location: { bsonType: ['string', 'null'] },
                linkedin: { bsonType: ['string', 'null'] },
                github: { bsonType: ['string', 'null'] },
                website: { bsonType: ['string', 'null'] }
              }
            },
            education: {
              bsonType: 'array',
              items: {
                bsonType: 'object',
                properties: {
                  institution: { bsonType: 'string' },
                  degree: { bsonType: ['string', 'null'] },
                  field: { bsonType: ['string', 'null'] },
                  graduation_date: { bsonType: ['string', 'null'] }
                }
              }
            },
            experience: {
              bsonType: 'array',
              items: {
                bsonType: 'object',
                properties: {
                  company: { bsonType: 'string' },
                  title: { bsonType: 'string' },
                  location: { bsonType: ['string', 'null'] },
                  start_date: { bsonType: ['string', 'null'] },
                  end_date: { bsonType: ['string', 'null'] },
                  achievements: { bsonType: 'array', items: { bsonType: 'string' } },
                  technologies: { bsonType: 'array', items: { bsonType: 'string' } }
                }
              }
            },
            skills: { bsonType: 'array', items: { bsonType: 'string' } },
            metadata: { bsonType: 'object' },
            raw_text: { bsonType: 'string' }
          }
        },
        confidence: { bsonType: 'double' },
        version: { bsonType: 'int' },
        updatedAt: { bsonType: 'date' }
      }
    }
  }
});

// Create indexes
db.parsed_resumes.createIndex({ "resumeId": 1 }, { unique: true });
db.parsed_resumes.createIndex({ "userId": 1 }); 