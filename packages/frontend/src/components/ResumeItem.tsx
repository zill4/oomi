import { useState } from 'react'
import { useApi } from '../hooks/useApi'
import { toast } from 'react-hot-toast'

export const ResumeItem = ({ resume }) => {
  const [parseStatus, setParseStatus] = useState(resume.status)
  const [isLoading, setIsLoading] = useState(false)
  const [isRetrying, setIsRetrying] = useState(false)
  const api = useApi()

  const handleParse = async (isRetry = false) => {
    try {
      setIsLoading(true)
      if (isRetry) setIsRetrying(true)
      
      const response = await api.post(`/resumes/${resume.id}/parse`)
      setParseStatus('PARSING')
      
      // Poll for status updates
      const intervalId = setInterval(async () => {
        const statusResponse = await api.get(`/resumes/${resume.id}/parse-status`)
        setParseStatus(statusResponse.data.status)
        
        if (statusResponse.data.status === 'PARSED' || 
            statusResponse.data.status === 'ERROR') {
          clearInterval(intervalId)
          setIsLoading(false)
          setIsRetrying(false)
          
          if (statusResponse.data.status === 'ERROR') {
            toast.error('Failed to parse resume')
          } else {
            toast.success('Resume parsed successfully')
          }
        }
      }, 2000)
    } catch (error) {
      setIsLoading(false)
      setIsRetrying(false)
      toast.error('Failed to start parsing')
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
          onClick={() => handleParse(false)}
          disabled={isLoading || parseStatus === 'PARSING'}
          className="px-4 py-2 bg-blue-500 text-white rounded-md disabled:opacity-50"
        >
          {isLoading ? 'Processing...' : 'Parse Resume'}
        </button>
        
        {(parseStatus === 'ERROR' || parseStatus === 'PARSED') && (
          <button
            onClick={() => handleParse(true)}
            disabled={isRetrying}
            className="px-4 py-2 bg-gray-500 text-white rounded-md disabled:opacity-50 hover:bg-gray-600"
          >
            {isRetrying ? 'Retrying...' : 'Retry Parse'}
          </button>
        )}
      </div>
    </div>
  )
} 