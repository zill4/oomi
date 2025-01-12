import { Router } from 'express'
import { signup, login } from '../controllers/authController.js'

const router = Router()

router.post('/sign-up', signup)
router.post('/login', login)

export default router 