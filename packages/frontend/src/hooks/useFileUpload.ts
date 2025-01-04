import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useApi } from '../lib/api'
import { toast } from 'react-hot-toast'

interface FileUploadOptions {
  maxSize?: number // in bytes
  allowedTypes?: string[]
  fieldName?: string // Add field name option
}

export const useFileUpload = (options: FileUploadOptions = {}) => {
  const { 
    maxSize = 5 * 1024 * 1024, 
    allowedTypes = ['image/*'],
    fieldName = 'avatar' // Default to 'avatar'
  } = options

  const [isUploading, setIsUploading] = useState(false)
  const { fetchWithAuth } = useApi()
  const { getSignedUrl } = useAuth()

  const validateFile = (file: File): boolean => {
    if (file.size > maxSize) {
      toast.error(`File size must be less than ${maxSize / (1024 * 1024)}MB`)
      return false
    }

    const isValidType = allowedTypes.some(type => {
      if (type.endsWith('/*')) {
        const baseType = type.split('/')[0]
        return file.type.startsWith(`${baseType}/`)
      }
      return file.type === type
    })

    if (!isValidType) {
      toast.error(`File type must be one of: ${allowedTypes.join(', ')}`)
      return false
    }

    return true
  }

  const uploadFile = async (file: File, endpoint: string): Promise<string> => {
    if (!validateFile(file)) {
      throw new Error('File validation failed')
    }

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append(fieldName, file) // Use the fieldName parameter

      const response = await fetchWithAuth(endpoint, {
        method: 'POST',
        body: formData,
      })

      if (response.avatarUrl) {
        const signedUrl = await getSignedUrl(response.avatarUrl)
        return signedUrl
      }

      return response.url
    } finally {
      setIsUploading(false)
    }
  }

  return {
    uploadFile,
    isUploading
  }
} 