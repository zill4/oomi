# oomi


TODO List:
0. Auth Logic
    - Sign up
    - Login
    - Profile creation
    - Email Confirmation
    - Attributes editting FN, LN, Email, Password, etc.
    - Delete Account
1. Document upload
    - Upload Resume(s) PDF
    - Upload Cover Letter(s) PDF (We generate these so this should be easier).
2. Resume Processing
    - Parse multiple resumes as PDF -> to ATS format
    - Produce LaTeX version of Resume
    - Fill matching fields in Resume DB
    - Version control Resume versions
3. Personal Story upload
    - Have user upload text for their personal story and save to DB
    - version control for stories (this honestly applies to all updated fields)
4. Job Description Upload
    - Handle pasted job description text, save JD
    - Handle web-scraping a URL provided, if not scrapable return error and require pasted text
    - Consider adding Web Extension to make the whole process a lot easier.
5. Return Generated Cover Letter
    - Generate a Cover letter for the job description based on the Story, Resume, and JD
    using Claude API
6. Return Generated Resume
    - After user signs-up offer generated Resumes (free tier is maybe 1 or 2)
7. Spruce up frontend now connected with backend logic
    - Add more analytics everywhere
    - Add testing for everything
8. DevOps
    - Make sure oomi dot ai url is attached
    - Make sure devops is all configured properlly
9. Set up Payment Processing
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

