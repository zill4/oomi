import { useMutation, useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'react-hot-toast'
import api from '../api'

export function ResumeParser() {
  const [selectedResumeId, setSelectedResumeId] = useState<string>('')

  // Fetch user's resumes
  const { data: resumes, isLoading } = useQuery({
    queryKey: ['resumes'],
    queryFn: () => api.get('/api/resumes').then(res => res.data)
  })

  // Mutation for parsing resume
  const { mutate: parseResume } = useMutation({
    mutationFn: (resumeId: string) => 
      api.post(`/api/resumes/${resumeId}/parse`),
    onSuccess: () => {
      toast.success('Resume parsing started')
    },
    onError: (error) => {
      toast.error('Failed to parse resume')
      console.error('Parse error:', error)
    }
  })

  if (isLoading) return <div>Loading resumes...</div>

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Parse Resume</h2>
      
      <select 
        value={selectedResumeId}
        onChange={(e) => setSelectedResumeId(e.target.value)}
        className="border rounded p-2 mb-4"
      >
        <option value="">Select a resume</option>
        {resumes?.map(resume => (
          <option key={resume.id} value={resume.id}>
            {resume.fileName}
          </option>
        ))}
      </select>

      <button
        onClick={() => parseResume(selectedResumeId)}
        disabled={!selectedResumeId}
        className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        Parse Selected Resume
      </button>
    </div>
  )
} 