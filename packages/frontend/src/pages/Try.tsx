import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApi } from '../lib/api'
import { toast } from 'react-hot-toast'
import { ClipboardIcon } from '@heroicons/react/24/outline'
import { trialManager } from '../lib/trialManager'

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
    if (!file) {
      toast.error('Please select a resume file');
      return;
    }

    if (!trialManager.hasTrialsRemaining()) {
      toast.error('Trial limit reached. Please create an account to continue.');
      return;
    }

    if (loading) {
      return; // Prevent multiple submissions
    }

    setLoading(true);
    try {
      // Start trial session and get ID
      const trialResponse = await fetchWithAuth('/trial/start', {
        method: 'POST'
      })
      
      console.log('Trial response:', trialResponse);  // Debug log
      const { trialId } = trialResponse;
      
      if (!trialId) {
        console.error('No trialId received from /trial/start');  // Debug log
        throw new Error('No trial ID received');
      }

      // Upload resume with trial ID
      const formData = new FormData()
      formData.append('file', file)
      
      const uploadUrl = `/trial/resume/${trialId}`;
      console.log('Attempting upload to:', uploadUrl);  // Debug log
      
      const uploadResponse = await fetchWithAuth(uploadUrl, {
        method: 'POST',
        body: formData,
      })

      // Wait for resume parsing to complete
      const maxAttempts = 15
      let attempts = 0
      let parseComplete = false
      
      while (attempts < maxAttempts && !parseComplete) {
        try {
          const checkResponse = await fetchWithAuth(`/trial/check-parse-status/${trialId}`, {
            method: 'GET'
          })
          if (checkResponse.status === 'completed') {
            parseComplete = true
            break
          }
        } catch (error) {
          console.log('Waiting for parse completion...')
        }
        if (!parseComplete) {
          await new Promise(resolve => setTimeout(resolve, 2000))
          attempts++
        }
      }

      if (!parseComplete) {
        throw new Error('Resume parsing timed out')
      }

      if (parseComplete) {
        console.log('Generating cover letter with:', { jobTitle, company, jobDescription });
        const coverLetterResponse = await fetchWithAuth(`/trial/generate?trialId=${trialId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            jobTitle,
            company,
            jobDescription,
            bio
          })
        })

        if (coverLetterResponse.success) {
          setCoverLetter(coverLetterResponse.coverLetter)
          trialManager.incrementTrial(); // Move this inside success condition
          setStep(4); // Transition to final step
        } else {
          toast.error('Failed to generate cover letter')
        }
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Something went wrong')
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
                <div className="text-sigma-500">
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
                    className="inline-block bg-sigma-500 text-white px-6 py-3 rounded-md cursor-pointer hover:bg-sigma-400 transition-colors"
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
                    ? 'bg-sigma-500 hover:bg-sigma-400' 
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
              className="w-full h-48 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sigma-500 focus:border-transparent resize-none mb-6"
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
                    ? 'bg-sigma-500 hover:bg-sigma-400' 
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
                  className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sigma-500 focus:border-transparent"
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
                  className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sigma-500 focus:border-transparent"
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
                  className="w-full h-48 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sigma-500 focus:border-transparent resize-none"
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
                disabled={!company.trim() || !jobTitle.trim() || !jobDescription.trim() || loading}
                className={`w-full py-3 rounded-md text-white font-medium transition-colors
                  ${(company.trim() && jobTitle.trim() && jobDescription.trim() && !loading)
                    ? 'bg-sigma-500 hover:bg-sigma-400' 
                    : 'bg-gray-300 cursor-not-allowed'}`}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Generating...
                  </div>
                ) : (
                  'Generate Cover Letter'
                )}
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
                className="w-full py-3 rounded-md text-white font-medium bg-sigma-500 hover:bg-sigma-400 transition-colors"
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