# oomi


TODO List:
1. Auth Logic 1/2 Done
    - Sign up X
    - Login X
    - Profile creation X
    - Email Confirmation (Do Later)
    - Attributes editting FN, LN, Email, Password, etc. (Change pass with email, Do Later)
    - Delete Account (Delete Account with Email, Do Later)
2. Document upload
    - Upload Resume(s) PDF X
    - Upload Cover Letter(s) PDF (We generate these so this should be easier).
3. Resume Processing
    - Parse multiple resumes as PDF -> to ATS format
    - Produce LaTeX version of Resume
    - Fill matching fields in Resume DB
    - Version control Resume versions
4. Personal Story upload
    - Have user upload text for their personal story and save to DB
    - version control for stories (this honestly applies to all updated fields)
5. Job Description Upload
    - Handle pasted job description text, save JD
    - Handle web-scraping a URL provided, if not scrapable return error and require pasted text
    - Consider adding Web Extension to make the whole process a lot easier.
6. Return Generated Cover Letter
    - Generate a Cover letter for the job description based on the Story, Resume, and JD
    using Claude API
7. Return Generated Resume
    - After user signs-up offer generated Resumes (free tier is maybe 1 or 2)
8. Spruce up frontend now connected with backend logic
    - Add more analytics everywhere
    - Add testing for everything
9. DevOps
    - Make sure oomi dot ai url is attached
    - Make sure devops is all configured properlly
10. Set up Payment Processing
    - Use Stripe set up payment processing
    - Test everything again

That should be it for MVP

For V1.
    - 3rd Party integrations (LinkedIn, X, GitHub, LeetCode?)
    - Chrome Extension
    - Interview Prep? JD requires X skills, build a project and grind these LeetCode Questions
For V1.5
    - Email
    - Job App Analytics, improved Dashboard
    - Project Prompting? Like JD require X
For V2
    - Focus on building skills as a whole, similar to 42's holy graph
    - Connect directly with job posters, have AI sort, vet, and do long running interview processes,
    imagine working with an assistant that helps you along your whole career journey; applying, studying, interviewing,
    and staying professionally up to date.

## Helper Commands
To create a migration without applying it immediately (so you can preserve data), use:
`docker-compose exec backend sh -c "cd packages/backend && npx prisma migrate dev --create-only"`
Apply it:
`docker-compose exec backend sh -c "cd packages/backend && npx prisma migrate deploy"`
Restart
`docker-compose restart backend`

TODO: will likely want to create seperate bucket folders
users/profile-pictures/userid
users/resumes/uploaded/userid
users/resumes/parsed/userid