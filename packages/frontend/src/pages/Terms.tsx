import React from 'react'
import { Link } from 'react-router-dom'

export default function Terms() {
  return (
    <div className="min-h-screen bg-white">
      <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>
        
        <div className="prose prose-slate max-w-none">
          <p className="text-gray-600 mb-6">
            Last updated: January 2025
          </p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p className="mb-4">
              By accessing or using OOMI's services, you agree to be bound by these Terms of Service and our Privacy Policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">2. Description of Service</h2>
            <p className="mb-4">
              OOMI provides an AI-powered cover letter generation service. We use your resume and job posting information to create customized cover letters.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">3. Trial Service</h2>
            <ul className="list-disc pl-6 mb-4">
              <li>Limited to 5 cover letter generations per 24-hour period</li>
              <li>Trial data is automatically deleted after 24 hours</li>
              <li>No account creation required</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">4. User Responsibilities</h2>
            <ul className="list-disc pl-6 mb-4">
              <li>Provide accurate information</li>
              <li>Maintain the confidentiality of your account</li>
              <li>Use the service in compliance with all applicable laws</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">5. Intellectual Property</h2>
            <p className="mb-4">
              You retain all rights to your resume and personal information. The generated cover letters are for your personal use.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">6. Limitation of Liability</h2>
            <p className="mb-4">
              OOMI provides the service "as is" and makes no warranties about the accuracy or reliability of the generated content. Users are responsible for reviewing and editing generated cover letters.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">7. Changes to Terms</h2>
            <p className="mb-4">
              We reserve the right to modify these terms at any time. Continued use of the service constitutes acceptance of updated terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">8. Contact</h2>
            <p className="mb-4">
              For questions about these terms, please contact{' '}
              <a href="mailto:justin@crispcode.io" className="text-sigma-500 hover:text-sigma-600">
                justin@crispcode.io
              </a>
            </p>
          </section>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <Link to="/" className="text-sigma-500 hover:text-sigma-600">
            ← Back to Home
          </Link>
        </div>
      </main>
    </div>
  )
} 