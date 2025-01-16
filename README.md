# Oomi - AI-Powered Career Development Platform

## Project Status
Currently implementing core features for MVP (Minimum Viable Product).

## MVP Roadmap

### 1. Authentication & User Management ✅
- [x] Sign up functionality
- [x] Login system
- [x] Basic profile management
- [ ] Email confirmation
- [ ] Password reset
- [ ] Account deletion

### 2. Document Management 🚀
- [x] Resume PDF upload
- [x] Resume parsing service
- [X] Cover letter generation
- [ ] Document version control

### 3. Resume Processing (In Progress)
- [x] PDF parsing infrastructure
- [x] Queue-based processing
- [x] S3 storage integration
- [ ] ATS format conversion
- [ ] LaTeX generation
- [ ] Version control

### 4. Profile Enhancement
- [ ] Personal story management
- [ ] Skills assessment
- [ ] Experience categorization
- [ ] Version control for all content

### 5. Job Application Features
- [ ] Job description parsing
- [ ] URL scraping for job posts
- [ ] Matching algorithm
- [ ] Application tracking

### 6. AI Integration
- [X] Cover letter generation
- [ ] Resume optimization
- [ ] Skills gap analysis
- [ ] Interview preparation

### 7. Frontend Enhancement
- [ ] Dashboard analytics
- [X] Progress tracking
- [ ] Interactive resume builder
- [X] Real-time status updates

### 8. DevOps & Infrastructure
- [x] Docker configuration
- [x] Basic CI/CD
- [ ] Monitoring and logging
- [ ] Performance optimization
- [X] Domain configuration

### 9. Payment Processing
- [ ] Stripe integration
- [ ] Subscription management
- [ ] Usage tracking

## Future Versions

### V1.0
- Third-party integrations (LinkedIn, GitHub)
- Chrome extension
- Advanced interview prep

### V1.5
- Email notification system
- Enhanced job analytics
- Project recommendation system

### V2.0
- Career progression tracking
- AI-powered mentorship
- Automated skill development paths

## Development Commands

### Database Management

Create migration (preserve data)
`docker-compose exec backend sh -c "cd packages/backend && npx prisma migrate dev --create-only"`
Apply migration
`docker-compose exec backend sh -c "cd packages/backend && npx prisma migrate deploy"`
Restart backend
`docker-compose restart backend`
users/
├── profile-pictures/
│ └── {userid}/
├── resumes/
│ ├── uploaded/
│ │ └── {userid}/
│ └── parsed/
│ └── {userid}/
└── cover-letters/
└── {userid}/
## Testing
To test the resume parser:
1. Upload a resume through the frontend interface
2. Monitor the parsing status in the UI
3. Verify parsed data in the database
4. Check S3 for stored files

### TODO
1. Branding update - There are a lot of similarties to dating and finding a job. Interviewing is kind of like dating, and getting a job is like soft-marriage.
Lot of risk/reward, wasted time and money, and hard feelings on both sides.
2. fix issue with password regex
3. copy/paste doesn't work on mac it seems (cover letter)
4. Simplify the flow when a user creates an account
5. Add resume builder using LaTeX? (maybe)
6. Optimize consideration of using users
7. Chrome extension
  oomi
