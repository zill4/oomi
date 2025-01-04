import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useFileUpload } from '../hooks/useFileUpload'
import { useApi } from '../lib/api'
import { toast } from 'react-hot-toast'
import { format } from 'date-fns'
import { DocumentIcon, TrashIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline'

interface Resume {
  id: string
  fileName: string
  fileUrl: string
  version: number
  createdAt: string
}

export default function ResumeList() {
  const [resumes, setResumes] = useState<Resume[]>([])
  const { fetchWithAuth } = useApi()
  const { getSignedUrl } = useAuth()
  const { uploadFile, isUploading } = useFileUpload({
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['application/pdf'],
    fieldName: 'resume'
  })

  const loadResumes = async () => {
    try {
      const data = await fetchWithAuth('/resumes')
      setResumes(data)
    } catch (error) {
      // Only show error if it's not a 404
      if (error.status !== 404) {
        toast.error('Failed to load resumes')
      }
    }
  }

  useEffect(() => {
    loadResumes()
  }, [])

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (file.type !== 'application/pdf') {
      toast.error('Only PDF files are allowed')
      return
    }

    try {
      await uploadFile(file, '/resumes')
      toast.success('Resume uploaded successfully')
      await loadResumes() // Refresh the list
      
      // Reset the file input
      event.target.value = ''
    } catch (error) {
      toast.error('Failed to upload resume')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await fetchWithAuth(`/resumes/${id}`, {
        method: 'DELETE'
      })
      toast.success('Resume deleted successfully')
      setResumes(resumes.filter(resume => resume.id !== id))
    } catch (error) {
      toast.error('Failed to delete resume')
    }
  }

  const downloadResume = async (resume: Resume) => {
    try {
      const signedUrl = await getSignedUrl(resume.fileUrl)
      window.open(signedUrl, '_blank')
    } catch (error) {
      toast.error('Failed to download resume')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Resume</h2>
        <label className="inline-flex items-center px-4 py-2 bg-seafoam-500 text-white rounded-md hover:bg-seafoam-600 cursor-pointer transition-colors">
          <span className="mr-2">Upload New Resume</span>
          <input
            type="file"
            className="hidden"
            accept=".pdf,application/pdf"
            onChange={handleUpload}
            disabled={isUploading || resumes.length >= 5}
          />
        </label>
      </div>

      {resumes.length >= 5 && (
        <div className="mb-4 p-3 bg-yellow-50 text-yellow-800 rounded-md">
          Maximum number of resumes (5) reached. Please delete older versions to upload new ones.
        </div>
      )}

      {isUploading && (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-seafoam-500 border-t-transparent"></div>
        </div>
      )}

      {resumes.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-500">
          <p>No resume uploaded yet</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {resumes.map((resume) => (
            <li 
              key={resume.id} 
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center">
                <DocumentIcon className="h-6 w-6 text-gray-400 mr-3" />
                <div>
                  <h4 className="font-medium text-gray-900">{resume.fileName}</h4>
                  <p className="text-sm text-gray-500">
                    Version {resume.version} • {format(new Date(resume.createdAt), 'MMM d, yyyy')}
                  </p>
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => downloadResume(resume)}
                  className="text-seafoam-500 hover:text-seafoam-600 p-2"
                  title="Download"
                >
                  <ArrowDownTrayIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleDelete(resume.id)}
                  className="text-red-500 hover:text-red-600 p-2"
                  title="Delete"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
} 