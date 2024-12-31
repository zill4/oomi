import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { prisma } from '../server'
import { validateEmail, validatePassword } from '../utils/validation'
import type { RegisterInput, LoginInput, AuthResponse } from '../types/auth'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
const JWT_EXPIRES_IN = '7d'

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password }: RegisterInput = req.body

    // Validate input
    if (!validateEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format' })
    }

    if (!validatePassword(password)) {
      return res.status(400).json({ 
        message: 'Password must be at least 8 characters long and contain at least one number and one letter' 
      })
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' })
    }

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Create new user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      }
    })

    // Generate JWT token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN
    })

    const response: AuthResponse = {
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        email: user.email
      }
    }

    res.status(201).json(response)
  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({ message: 'Error registering user' })
  }
}

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password }: LoginInput = req.body

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN
    })

    const response: AuthResponse = {
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email
      }
    }

    res.json(response)
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ message: 'Error logging in' })
  }
}