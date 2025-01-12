import { Router } from 'express'
import { authenticateToken } from '../middleware/auth.js'
import { 
  createJobApplication, 
  getJobApplications,
  updateApplicationStatus
} from '../controllers/jobApplicationController.js'
import { generateCoverLetter } from '../controllers/coverLetterController.js'

const router = Router()

router.post('/', authenticateToken, createJobApplication)
router.get('/', authenticateToken, getJobApplications)
router.post('/:jobApplicationId/generate-cover-letter', authenticateToken, generateCoverLetter)
router.patch('/:jobApplicationId/status', authenticateToken, updateApplicationStatus)


export default router 