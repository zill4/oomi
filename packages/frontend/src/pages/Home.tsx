import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center py-16 sm:py-20">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Generate The Perfect CV
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Explore the ocean of opportunities by generated the perfect CV for
            a Job Listing based on your Resume.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              to="/try"
              className="rounded-md bg-seafoam-500 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-seafoam-400"
            >
              Try for Free
            </Link>
            <Link
              to="/sign-up"
              className="rounded-md bg-gray-400 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-gray-300"
            >
              Sign Up
            </Link>
          </div>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 gap-8 py-12 sm:grid-cols-2 lg:gap-12">
          {/* Step 1 */}
          <div className="relative rounded-lg border border-gray-200 p-8">
            <div className="flex justify-center mb-6">
              <img src="/images/resume-upload.svg" alt="Upload Resume" className="h-24 w-24" />
            </div>
            <h2 className="text-xl font-semibold mb-4">1. Provide Resume as PDF</h2>
            <p className="text-gray-600">Upload your existing resume to get started effortlessly.</p>
          </div>

          {/* Step 2 */}
          <div className="relative rounded-lg border border-gray-200 p-8">
            <div className="flex justify-center mb-6">
              <img src="/images/write-bio.svg" alt="Write Bio" className="h-24 w-24" />
            </div>
            <h2 className="text-xl font-semibold mb-4">2. Write a Quick Bio</h2>
            <p className="text-gray-600">Craft a personalized bio that stands out to employers.</p>
          </div>

          {/* Step 3 */}
          <div className="relative rounded-lg border border-gray-200 p-8">
            <div className="flex justify-center mb-6">
              <img src="/images/job-posting.svg" alt="Job Posting" className="h-24 w-24" />
            </div>
            <h2 className="text-xl font-semibold mb-4">3. Provide Job Posting</h2>
            <p className="text-gray-600">Input the job details to tailor your CV precisely.</p>
          </div>

          {/* Step 4 */}
          <div className="relative rounded-lg border border-gray-200 p-8">
            <div className="flex justify-center mb-6">
              <img src="/images/download-cv.svg" alt="Download CV" className="h-24 w-24" />
            </div>
            <h2 className="text-xl font-semibold mb-4">4. Download Curated CV</h2>
            <p className="text-gray-600">Get a professionally curated CV ready for submission.</p>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-8 border-t border-gray-200 py-6">
          <div className="flex justify-between text-sm text-gray-500">
            <p>© 2025 OOMI. All rights reserved.</p>
            <div className="space-x-4">
              <Link to="/privacy" className="hover:text-gray-900">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-gray-900">Terms of Service</Link>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
} 