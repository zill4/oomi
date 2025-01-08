import { useState } from 'react'
import { useApi } from '../hooks/useApi'

export const ResumeItem = ({ resume }) => {
  const [parseStatus, setParseStatus] = useState(resume.status)
  const [isLoading, setIsLoading] = useState(false)
  const api = useApi()

  const handleParse = async () => {
    try {
      setIsLoading(true)
      const response = await api.post(`/resumes/${resume.id}/parse`)
      setParseStatus('PARSING')
      
      // Poll for status updates
      const intervalId = setInterval(async () => {
        const statusResponse = await api.get(`/resumes/${resume.id}/parse-status`)
        setParseStatus(statusResponse.data.status)
        
        if (statusResponse.data.status === 'PARSED' || 
            statusResponse.data.status === 'PARSE_ERROR') {
          clearInterval(intervalId)
        }
      }, 2000)

    } catch (error) {
      console.error('Parse error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg mb-4">
      <div>
        <h3 className="font-medium">{resume.fileName}</h3>
        <p className="text-sm text-gray-500">Status: {parseStatus}</p>
      </div>
      <div className="flex gap-2">
        <button
          onClick={handleParse}
          disabled={isLoading || parseStatus === 'PARSING'}
          className="px-4 py-2 bg-blue-500 text-white rounded-md disabled:opacity-50"
        >
          {isLoading ? 'Processing...' : 'Parse Resume'}
        </button>
      </div>
    </div>
  )
} 