import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'

interface JwtPayload {
  userId: string
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string
      }
    }
  }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ error: 'No token provided' })
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload
    req.user = {
      id: decoded.userId
    }
    next()
  } catch (error) {
    console.error('JWT Verification Error:', error)
    return res.status(403).json({ error: 'Invalid token' })
  }
} 