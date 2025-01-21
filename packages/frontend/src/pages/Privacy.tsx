import React from 'react'
import { Link } from 'react-router-dom'

export default function Privacy() {
  return (
    <div className="min-h-screen bg-white">
      <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
        
        <div className="prose prose-slate max-w-none">
          <p className="text-gray-600 mb-6">
            Last updated: January 2025
          </p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Our Commitment to Privacy</h2>
            <p className="mb-4">
              At OOMI, we take your privacy seriously. We believe in being transparent about how we collect, use, and protect your information.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Information We Collect</h2>
            <h3 className="text-lg font-medium mb-2">For Trial Users:</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>Temporarily stored resume data for parsing purposes only</li>
              <li>Session information required for the trial process</li>
              <li>All trial data is automatically deleted after 24 hours</li>
            </ul>

            <h3 className="text-lg font-medium mb-2">For Registered Users:</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>Email address and account information</li>
              <li>Uploaded resumes and generated cover letters</li>
              <li>Usage data to improve our services</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">How We Use Your Information</h2>
            <ul className="list-disc pl-6 mb-4">
              <li>To provide and improve our cover letter generation service</li>
              <li>To maintain and optimize our platform</li>
              <li>To communicate with you about your account and our services</li>
              <li>To protect our legal rights and comply with the law</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Data Protection</h2>
            <p className="mb-4">
              We implement industry-standard security measures to protect your data. We will never sell your personal information to third parties.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Contact Us</h2>
            <p className="mb-4">
              If you have any questions about our privacy policy, please contact us at{' '}
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