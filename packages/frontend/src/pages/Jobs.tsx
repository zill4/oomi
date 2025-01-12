import { useState, useEffect } from 'react'
import { ChevronDownIcon, ChevronRightIcon, DocumentArrowDownIcon, DocumentDuplicateIcon } from '@heroicons/react/20/solid'
import { NewJobApplication } from '../components/JobApplication/NewJobApplication'
import { useApi } from '../lib/api'
import { toast } from 'react-hot-toast'

interface JobApplication {
  id: string
  jobTitle: string
  company: string
  jobUrl: string
  status: string
  createdAt: string
  updatedAt: string
  coverLetter: string | null
  generatedResume: string | null
  resume: {
    fileName: string
  }
}

// Add status type
type ApplicationStatus = 'APPLIED' | 'INTERVIEWING' | 'REJECTED' | 'ACCEPTED'

export default function Jobs() {
  const [jobApplications, setJobApplications] = useState<JobApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState<string | null>(null)
  const { fetchWithAuth } = useApi()

  const loadJobApplications = async () => {
    try {
      const response = await fetchWithAuth('/job-applications')
      setJobApplications(response.data)
    } catch (error) {
      console.error('Error loading job applications:', error)
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => {
    loadJobApplications()
  }, [])

  const toggleExpand = (id: string) => {
    setJobApplications(jobApplications.map(job => 
      job.id === id ? { ...job, expanded: !job.expanded } : job
    ))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACCEPTED':
        return 'bg-green-100 text-green-800'
      case 'REJECTED':
        return 'bg-red-100 text-red-800'
      case 'INTERVIEWING':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-blue-100 text-blue-800'
    }
  }

  const handleStatusChange = async (applicationId: string, newStatus: string) => {
    try {
      await fetchWithAuth(`/job-applications/${applicationId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus })
      })
      await loadJobApplications()
      toast.success('Status updated successfully')
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Failed to update status')
    }
  }

  const handleGenerateCoverLetter = async (applicationId: string) => {
    setGenerating(applicationId)
    try {
      const response = await fetchWithAuth(`/job-applications/${applicationId}/generate-cover-letter`, {
        method: 'POST'
      })
      
      // Refresh the job applications to get the updated cover letter
      await loadJobApplications()
      toast.success('Cover letter generated successfully!')
    } catch (error) {
      console.error('Error generating cover letter:', error)
      toast.error('Failed to generate cover letter')
    } finally {
      setGenerating(null)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success('Copied to clipboard!')
    } catch (error) {
      console.error('Failed to copy:', error)
      toast.error('Failed to copy to clipboard')
    }
  }

  // Update table headers to remove Generated Resume
  const tableHeaders = [
    { label: 'Company', key: 'company' },
    { label: 'Title', key: 'title' },
    { label: 'Date Applied', key: 'dateApplied' },
    { label: 'Generated Cover Letter', key: 'coverLetter' },
    { label: 'Status', key: 'status' }
  ]

  const renderStatusDropdown = (application: JobApplication) => (
    <div className="relative">
      <select
        value={application.status}
        onChange={(e) => handleStatusChange(application.id, e.target.value as ApplicationStatus)}
        className={`px-2 py-1 rounded-full text-xs font-semibold
          ${application.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' : 
            application.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
            application.status === 'INTERVIEWING' ? 'bg-yellow-100 text-yellow-800' :
            'bg-blue-100 text-blue-800'}`}
      >
        <option value="APPLIED">Applied</option>
        <option value="INTERVIEWING">Interviewing</option>
        <option value="REJECTED">Rejected</option>
        <option value="ACCEPTED">Accepted</option>
      </select>
    </div>
  )

  const renderExpandedContent = (application: JobApplication) => {
    return (
      <div className="p-4 bg-gray-50">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold">Cover Letter Preview</h3>
              {application.coverLetter && (
                <button 
                  className="text-blue-600 hover:text-blue-800"
                  onClick={() => copyToClipboard(application.coverLetter || '')}
                >
                  <DocumentDuplicateIcon className="h-5 w-5" />
                </button>
              )}
            </div>
            <div className="bg-white p-4 rounded-lg min-h-[200px]">
              {application.coverLetter ? (
                <pre className="whitespace-pre-wrap font-sans text-gray-700">
                  {application.coverLetter}
                </pre>
              ) : (
                <p className="text-gray-500 text-center">
                  No cover letter generated yet
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Job Applications</h1>
        <NewJobApplication onApplicationCreated={() => loadJobApplications()} />
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <p className="text-center p-4">Loading...</p>
        ) : jobApplications.length === 0 ? (
          <p className="text-center p-4">No job applications yet. Start applying!</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="w-8 py-3 pl-4"></th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date Applied
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Generated Cover Letter
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {jobApplications.map((application) => (
                <>
                  <tr key={application.id} className="hover:bg-gray-50">
                    <td className="py-4 pl-4">
                      <button onClick={() => toggleExpand(application.id)}>
                        {application.expanded ? (
                          <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                        ) : (
                          <ChevronRightIcon className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {application.company}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {application.jobTitle}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {application.createdAt}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {application.coverLetter ? (
                        <button
                          className="text-blue-600 hover:text-blue-800"
                          onClick={() => {/* Add download logic later */}}
                        >
                          Download Cover Letter
                        </button>
                      ) : (
                        <button
                          className="text-green-600 hover:text-green-800 disabled:opacity-50"
                          onClick={() => handleGenerateCoverLetter(application.id)}
                          disabled={generating === application.id}
                        >
                          {generating === application.id ? (
                            <span className="flex items-center">
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Generating...
                            </span>
                          ) : (
                            'Generate Cover Letter'
                          )}
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={application.status}
                        onChange={(e) => handleStatusChange(application.id, e.target.value)}
                        className={`px-2 py-1 rounded-full text-xs font-semibold cursor-pointer ${getStatusColor(application.status)}`}
                      >
                        <option value="APPLIED">Applied</option>
                        <option value="INTERVIEWING">Interviewing</option>
                        <option value="REJECTED">Rejected</option>
                        <option value="ACCEPTED">Accepted</option>
                      </select>
                    </td>
                  </tr>
                  {application.expanded && (
                    <tr>
                      <td colSpan={7} className="px-6 py-4 bg-gray-50">
                        {renderExpandedContent(application)}
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
} 