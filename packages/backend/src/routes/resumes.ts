import { Router } from 'express'
import { 
  uploadResume, 
  getResumes, 
  deleteResume 
} from '../controllers/resumeController.js'
import { authenticateToken } from '../middleware/auth.js'
import { createUploadMiddleware } from '../middleware/upload.js'

const router = Router()

const uploadFile = createUploadMiddleware({
// TODO: add doc, docx support
  fileTypes: ['pdf'],
  maxSize: 10 * 1024 * 1024 // 10MB
})

router.post('/', authenticateToken, uploadFile.single('resume'), uploadResume)
router.get('/', authenticateToken, getResumes)
router.delete('/:id', authenticateToken, deleteResume)

export default router 