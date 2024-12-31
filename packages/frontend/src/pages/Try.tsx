import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Try() {
  const [step, setStep] = useState(1)
  const [file, setFile] = useState<File | null>(null)
  const [bio, setBio] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [jobUrl, setJobUrl] = useState('')
  const navigate = useNavigate()

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

  const handleNext = () => {
    if (step === 1 && file) {
      setStep(2)
    } else if (step === 2 && bio.trim()) {
      setStep(3)
    } else if (step === 3 && (jobDescription.trim() || jobUrl.trim())) {
      // TODO: Handle final submission
      console.log('Submitting:', { file, bio, jobDescription, jobUrl })
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
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
            <h1 className="text-3xl font-bold mb-2">Paste Job Description</h1>
            <p className="text-gray-600 mb-8">
              Paste in Job Description
            </p>

            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="w-full h-48 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-seafoam-500 focus:border-transparent resize-none mb-6"
              placeholder="Paste the job description here..."
            />

            <p className="text-gray-600 mb-4">Or provide companies Job Posting URL</p>
            <input
              type="url"
              value={jobUrl}
              onChange={(e) => setJobUrl(e.target.value)}
              className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-seafoam-500 focus:border-transparent mb-6"
              placeholder="https://company.com/job-posting"
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
                disabled={!jobDescription.trim() && !jobUrl.trim()}
                className={`w-full py-3 rounded-md text-white font-medium transition-colors
                  ${(jobDescription.trim() || jobUrl.trim())
                    ? 'bg-seafoam-500 hover:bg-seafoam-400' 
                    : 'bg-gray-300 cursor-not-allowed'}`}
              >
                Generate CV
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
        <span>Step {step} of 3</span>
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