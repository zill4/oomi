import { useState } from 'react'
import { Dialog } from '@headlessui/react'
import { toast } from 'react-hot-toast'
import { useApi } from '../../lib/api'

interface Resume {
  id: string
  fileName: string
  status: string
  updatedAt: string
}

interface User {
  id: string
  bio: string | null
  email: string
  firstName: string
  lastName: string
}

interface NewJobApplicationProps {
  onApplicationCreated: () => void;
}

export function NewJobApplication({ onApplicationCreated }: NewJobApplicationProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [resumes, setResumes] = useState<Resume[]>([])
  const [loading, setLoading] = useState(false)
  const { fetchWithAuth } = useApi()
  
  const [formData, setFormData] = useState({
    jobTitle: '',
    company: '',
    jobUrl: '',
    jobDescription: '',
    selectedResumeId: ''
  })
  const [userBio, setUserBio] = useState('')

  // Fetch parsed resumes and user bio when modal opens
  const loadInitialData = async () => {
    try {
      const [resumesResponse, userResponse] = await Promise.all([
        fetchWithAuth('/resumes?status=PARSED'),
        fetchWithAuth('/users/me')
      ])
      // Sort resumes by updatedAt to get the latest one first
      const sortedResumes = resumesResponse.sort((a: Resume, b: Resume) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )
      
      setResumes(sortedResumes)
      
      // Automatically select the latest resume
      if (sortedResumes.length > 0) {
        setFormData(prev => ({
          ...prev,
          selectedResumeId: sortedResumes[0].id
        }))
      }
      
      setUserBio(userResponse?.bio || '')
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Failed to load required data')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.selectedResumeId) {
      toast.error('Please select a resume')
      return
    }

    if (!userBio || userBio.length < 2000) {
      toast.error('Please complete your bio (minimum 2000 characters)')
      return
    }

    setLoading(true)
    try {
      await fetchWithAuth('/job-applications', {
        method: 'POST',
        body: JSON.stringify({
          ...formData,
          resumeId: formData.selectedResumeId
        })
      })

      toast.success('Job application created!')
      setIsOpen(false)
      onApplicationCreated()
    } catch (error) {
      console.error('Error creating application:', error)
      toast.error('Failed to create job application')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => {
          loadInitialData()
          setIsOpen(true)
        }}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Generate New Application
      </button>

      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-2xl w-full bg-white rounded-xl p-6">
            <Dialog.Title className="text-xl font-bold mb-4">
              New Job Application
            </Dialog.Title>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Resume Selection */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Select Resume
                </label>
                <select
                  value={formData.selectedResumeId}
                  onChange={(e) => setFormData({
                    ...formData,
                    selectedResumeId: e.target.value
                  })}
                  className="w-full border rounded p-2"
                  required
                >
                  <option value="">Select a resume</option>
                  {resumes.map(resume => (
                    <option 
                      key={resume.id} 
                      value={resume.id}
                    >
                      {resume.fileName} ({new Date(resume.updatedAt).toLocaleDateString()})
                    </option>
                  ))}
                </select>
              </div>

              {/* Bio Warning */}
              {(!userBio || userBio.length < 2000) && (
                <div className="text-red-500 text-sm">
                  Please complete your bio (minimum 2000 characters) in your profile before creating an application
                </div>
              )}

              {/* Job Details */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Job Title
                </label>
                <input
                  type="text"
                  value={formData.jobTitle}
                  onChange={(e) => setFormData({
                    ...formData,
                    jobTitle: e.target.value
                  })}
                  className="w-full border rounded p-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Company
                </label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({
                    ...formData,
                    company: e.target.value
                  })}
                  className="w-full border rounded p-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Job URL (optional)
                </label>
                <input
                  type="url"
                  value={formData.jobUrl}
                  onChange={(e) => setFormData({
                    ...formData,
                    jobUrl: e.target.value
                  })}
                  className="w-full border rounded p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Job Description
                </label>
                <textarea
                  value={formData.jobDescription}
                  onChange={(e) => setFormData({
                    ...formData,
                    jobDescription: e.target.value
                  })}
                  className="w-full border rounded p-2 h-40"
                  required
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 border rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !userBio || userBio.length < 2000}
                  className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Application'}
                </button>
              </div>
            </form>
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  )
} 