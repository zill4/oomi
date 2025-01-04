import { Router } from 'express'
import { uploadResume, getResumes, deleteResume } from '../controllers/resumeController.js'
import { authenticateToken } from '../middleware/auth.js'
import { uploadResume as uploadResumeMiddleware } from '../middleware/upload.js'

const router = Router()

router.post('/', authenticateToken, uploadResumeMiddleware.single('resume'), uploadResume)
router.get('/', authenticateToken, getResumes)
router.delete('/:id', authenticateToken, deleteResume)

export default router 