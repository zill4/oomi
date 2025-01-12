import express from 'express'
import { authenticateToken } from '../middleware/auth.js'
import { 
  getResumes, 
  uploadResume,
  deleteResume, 
  parseResume,
  getParseStatus,
  getParsedResume
} from '../controllers/resumeController.js'
import multer from 'multer'

const router = express.Router()
const upload = multer()

// Apply authentication to all resume routes
router.use(authenticateToken)

router.get('/', getResumes)
router.post('/', upload.single('resume'), uploadResume)
router.delete('/:id', deleteResume)
router.post('/:id/parse', parseResume)
router.get('/:id/parse-status', getParseStatus)
router.get('/:resumeId/parsed', getParsedResume)

export default router 