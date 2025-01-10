import express from 'express'
import { handleParseCompletion } from '../controllers/notificationController.js'

const router = express.Router()

router.post('/parse-complete', handleParseCompletion)

export default router 