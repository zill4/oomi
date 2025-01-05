import multer from 'multer'

export type AllowedFileType = 'image' | 'pdf' | 'document' 

interface UploadOptions {
  maxSize?: number
  fileTypes?: AllowedFileType[]
}

const MIME_TYPES: Record<AllowedFileType, string[]> = {
  image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  pdf: ['application/pdf'],
  document: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.oasis.opendocument.text'
  ]
}

const FILE_SIZE_LIMITS: Record<AllowedFileType, number> = {
  image: 5 * 1024 * 1024, // 5MB
  pdf: 10 * 1024 * 1024,  // 10MB
  document: 10 * 1024 * 1024 // 10MB
}

export const createUploadMiddleware = (options: UploadOptions = {}) => {
  const {
    fileTypes = ['image'],
    maxSize
  } = options

  const allowedMimeTypes = fileTypes.flatMap(type => MIME_TYPES[type])
  const defaultMaxSize = Math.max(...fileTypes.map(type => FILE_SIZE_LIMITS[type]))

  const storage = multer.memoryStorage()

  return multer({
    storage,
    limits: {
      fileSize: maxSize || defaultMaxSize,
    },
    fileFilter: (_req, file, cb) => {
      if (!allowedMimeTypes.includes(file.mimetype)) {
        cb(new Error(`Only ${fileTypes.join(', ')} files are allowed`))
        return
      }
      cb(null, true)
    },
  })
}

// Create specific upload middlewares
export const uploadImage = createUploadMiddleware({ 
  fileTypes: ['image'] 
})

export const uploadResume = createUploadMiddleware({ 
  fileTypes: ['pdf'] 
})

export const uploadDocument = createUploadMiddleware({ 
  fileTypes: ['document'] 
})

// Default export for backward compatibility
export default createUploadMiddleware() 