import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApi } from '../lib/api'
import { toast } from 'react-hot-toast'
import { ClipboardIcon } from '@heroicons/react/24/outline'

export default function Try() {
  const [step, setStep] = useState(1)
  const [file, setFile] = useState<File | null>(null)
  const [bio, setBio] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [jobUrl, setJobUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [coverLetter, setCoverLetter] = useState<string | null>(null)
  const [company, setCompany] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const navigate = useNavigate()
  const { fetchWithAuth } = useApi()

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0]
    if (uploadedFile) {
      setFile(uploadedFile)
    }
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    const droppedFile = event.dataTransfer.files[0]
    if (droppedFile) {
      setFile(droppedFile)
    }
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      // Start trial session
      const trialResponse = await fetchWithAuth('/trial/start', {
        method: 'POST'
      })

      // Upload resume
      const formData = new FormData()
      if (file) {
        formData.append('file', file)
      }
      const uploadResponse = await fetchWithAuth('/trial/resume', {
        method: 'POST',
        body: formData,
      })

      // Wait for resume parsing to complete (poll every 2 seconds for up to 30 seconds)
      const maxAttempts = 15
      let attempts = 0
      let parseComplete = false
      
      while (attempts < maxAttempts && !parseComplete) {
        try {
          // Check if parsing is complete
          const checkResponse = await fetchWithAuth('/trial/check-parse-status', {
            method: 'GET'
          })
          if (checkResponse.status === 'completed') {
            parseComplete = true // Set flag to break the loop
            break // Exit the loop immediately
          }
        } catch (error) {
          console.log('Waiting for parse completion...')
        }
        if (!parseComplete) { // Only wait if we haven't completed
          await new Promise(resolve => setTimeout(resolve, 2000))
          attempts++
        }
      }

      if (!parseComplete) {
        throw new Error('Resume parsing timed out')
      }

      // Generate cover letter
      const generateResponse = await fetchWithAuth('/trial/generate', {
        method: 'POST',
        body: JSON.stringify({
          bio,
          jobTitle,
          company,
          jobDescription
        })
      })

      if (!generateResponse?.coverLetter) {
        throw new Error('No cover letter generated')
      }

      setCoverLetter(generateResponse.coverLetter)
      setStep(4)
    } catch (error) {
      console.error('Error:', error)
      
      // Handle trial limit error
      if (error.status === 429) {
        const data = await error.json()
        toast.error(
          <div>
            <p>{data.error}</p>
            <button 
              onClick={() => navigate('/sign-up')}
              className="mt-2 text-seafoam-500 hover:text-seafoam-400 font-medium"
            >
              Create Account →
            </button>
          </div>,
          { duration: 5000 }
        )
      } else {
        toast.error('Something went wrong. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleNext = () => {
    if (step === 1 && file) {
      setStep(2)
    } else if (step === 2 && bio.trim()) {
      setStep(3)
    } else if (step === 3 && company.trim() && jobTitle.trim() && jobDescription.trim()) {
      handleSubmit()
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success('Copied to clipboard!')
    } catch (err) {
      toast.error('Failed to copy to clipboard')
    }
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-bold mb-2">Upload Your Resume</h1>
            <p className="text-gray-600 mb-8">
              Follow the steps to upload your resume and get started with OOMI's
              personalized job seeker tools.
            </p>

            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-12 mb-6 text-center"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              {file ? (
                <div className="text-seafoam-500">
                  <p className="font-medium">{file.name}</p>
                  <button 
                    onClick={() => setFile(null)}
                    className="text-sm text-gray-500 hover:text-gray-700 mt-2"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-gray-600 mb-4">Drag and drop your resume here</p>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="resume-upload"
                  />
                  <label
                    htmlFor="resume-upload"
                    className="inline-block bg-seafoam-500 text-white px-6 py-3 rounded-md cursor-pointer hover:bg-seafoam-400 transition-colors"
                  >
                    Upload Resume
                  </label>
                </>
              )}
            </div>

            <div className="space-y-4">
              <button
                onClick={handleNext}
                disabled={!file}
                className={`w-full py-3 rounded-md text-white font-medium transition-colors
                  ${file 
                    ? 'bg-seafoam-500 hover:bg-seafoam-400' 
                    : 'bg-gray-300 cursor-not-allowed'}`}
              >
                Next
              </button>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-bold mb-2">A Little About Yourself</h1>
            <p className="text-gray-600 mb-8">
              Introduce yourself, your career goals, and what you are looking for in a job.
            </p>

            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full h-48 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-seafoam-500 focus:border-transparent resize-none mb-6"
              placeholder="Write your introduction here..."
            />

            <div className="space-y-4">
              <button
                onClick={handleBack}
                className="w-full py-3 rounded-md text-gray-600 font-medium bg-gray-300 hover:bg-gray-400 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleNext}
                disabled={!bio.trim()}
                className={`w-full py-3 rounded-md text-white font-medium transition-colors
                  ${bio.trim() 
                    ? 'bg-seafoam-500 hover:bg-seafoam-400' 
                    : 'bg-gray-300 cursor-not-allowed'}`}
              >
                Next
              </button>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-bold mb-2">Job Details</h1>
            <p className="text-gray-600 mb-8">
              Please provide the job details to generate your cover letter.
            </p>

            <div className="space-y-6">
              <div>
                <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name
                </label>
                <input
                  id="company"
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-seafoam-500 focus:border-transparent"
                  placeholder="Enter company name"
                />
              </div>

              <div>
                <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700 mb-2">
                  Job Title
                </label>
                <input
                  id="jobTitle"
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-seafoam-500 focus:border-transparent"
                  placeholder="Enter job title"
                />
              </div>

              <div>
                <label htmlFor="jobDescription" className="block text-sm font-medium text-gray-700 mb-2">
                  Job Description
                </label>
                <textarea
                  id="jobDescription"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="w-full h-48 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-seafoam-500 focus:border-transparent resize-none"
                  placeholder="Paste the job description here..."
                />
              </div>
            </div>

            <div className="space-y-4 mt-6">
              <button
                onClick={handleBack}
                className="w-full py-3 rounded-md text-gray-600 font-medium bg-gray-300 hover:bg-gray-400 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleNext}
                disabled={!company.trim() || !jobTitle.trim() || !jobDescription.trim()}
                className={`w-full py-3 rounded-md text-white font-medium transition-colors
                  ${(company.trim() && jobTitle.trim() && jobDescription.trim())
                    ? 'bg-seafoam-500 hover:bg-seafoam-400' 
                    : 'bg-gray-300 cursor-not-allowed'}`}
              >
                Generate Cover Letter
              </button>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-bold mb-2">Your Cover Letter</h1>
            <p className="text-gray-600 mb-8">
              Here's your AI-generated cover letter. Feel free to copy and customize it!
            </p>

            <div className="relative">
              <pre className="whitespace-pre-wrap bg-gray-50 p-6 rounded-lg text-gray-800 font-sans text-sm leading-relaxed border border-gray-200">
                {coverLetter}
              </pre>
              
              <button
                onClick={() => copyToClipboard(coverLetter || '')}
                className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-700 bg-white rounded-md border border-gray-200 shadow-sm hover:shadow transition-all"
                title="Copy to clipboard"
              >
                <ClipboardIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-8 space-y-4">
              <button
                onClick={() => {
                  setStep(1)
                  setFile(null)
                  setBio('')
                  setJobDescription('')
                  setCompany('')
                  setJobTitle('')
                  setCoverLetter(null)
                }}
                className="w-full py-3 rounded-md text-gray-600 font-medium bg-gray-300 hover:bg-gray-400 transition-colors"
              >
                Generate Another
              </button>
              
              <button
                onClick={() => navigate('/sign-up')}
                className="w-full py-3 rounded-md text-white font-medium bg-seafoam-500 hover:bg-seafoam-400 transition-colors"
              >
                Create Account
              </button>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {renderStep()}
      
      {/* Progress indicator */}
      <div className="mt-8 flex justify-between text-sm text-gray-500">
        <span>Step {step} of 4</span>
        <div className="space-x-4">
          <button onClick={() => navigate('/privacy')} className="hover:text-gray-700">
            Privacy Policy
          </button>
          <button onClick={() => navigate('/terms')} className="hover:text-gray-700">
            Terms of Service
          </button>
        </div>
      </div>
    </div>
  )
} 