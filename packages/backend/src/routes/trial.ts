import { Router } from 'express'
import { trialLimiter } from '../middleware/trialLimiter.js'
import { uploadResume } from '../middleware/upload.js'
import { 
  startTrial, 
  uploadTrialResume, 
  generateTrialCoverLetter,
  checkParseStatus
} from '../controllers/trialController.js'

const router = Router()

router.post('/start', trialLimiter, startTrial)
router.post('/resume', trialLimiter, uploadResume.single('file'), uploadTrialResume)
router.post('/generate', trialLimiter, generateTrialCoverLetter)
router.get('/check-parse-status', checkParseStatus)

export default router 