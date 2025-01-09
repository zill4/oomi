import express from 'express'
import { handleParseCompletion } from '../controllers/notificationController.js'

const router = express.Router()

router.post('/parse-completion', handleParseCompletion)

export default router 