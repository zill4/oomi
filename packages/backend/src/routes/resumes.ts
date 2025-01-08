import express from 'express'
import { authenticateToken } from '../middleware/auth.js'
import { uploadResume } from '../middleware/upload.js'
import { 
  getResumes, 
  deleteResume, 
  parseResume,
  getParseStatus,
  uploadResume as uploadResumeController
} from '../controllers/resumeController.js'

const router = express.Router()

router.use(authenticateToken)

router.get('/', getResumes)
router.post('/', uploadResume.single('resume'), uploadResumeController)
router.delete('/:id', deleteResume)
router.post('/:id/parse', parseResume)
router.get('/:id/parse-status', getParseStatus)

export default router 