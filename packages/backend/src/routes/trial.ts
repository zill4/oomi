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
router.post('/resume/:trialId', trialLimiter, uploadResume.single('file'), uploadTrialResume)
router.post('/generate', trialLimiter, generateTrialCoverLetter)
router.get('/check-parse-status/:trialId', checkParseStatus)

export default router 