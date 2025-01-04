import { Router } from 'express'
import { signUrl } from '../controllers/storageController.js'
import { authenticateToken } from '../middleware/auth.js'

const router = Router()

router.post('/sign', authenticateToken, signUrl)

export default router 