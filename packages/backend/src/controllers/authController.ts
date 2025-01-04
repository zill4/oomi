import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { prisma } from '../lib/prisma.js'
import { validateEmail, validatePassword } from '../utils/validation.js'
import type { RegisterInput, LoginInput, AuthResponse } from '../types/auth.js'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
const JWT_EXPIRES_IN = '7d'

export const signup = async (req: Request, res: Response) => {
  try {
    console.log('Received signup request:', req.body); // Debug log

    const { email, password }: RegisterInput = req.body

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }

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
      return res.status(409).json({ message: 'Email is already registered' })
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
      expiresIn: '24h'
    })

    const response: AuthResponse = {
      message: 'Account created successfully',
      token,
      user: {
        id: user.id,
        email: user.email
      }
    }

    console.log('Sending response:', response); // Debug log
    return res.status(201).json(response);

  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ 
      message: 'An unexpected error occurred during signup',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password }: LoginInput = req.body

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    })
    console.log('email pass', req.body)
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