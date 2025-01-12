import rateLimit from 'express-rate-limit'
import { Request, Response, NextFunction } from 'express'

// Limit complete trial flows by IP address and session
export const trialLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 5, // Allow 5 complete trial flows
  skipFailedRequests: true, // Don't count failed requests
  handler: (req: Request, res: Response) => {
    res.status(429).json({ 
      error: 'You have reached your trial limit for today. Create an account to generate unlimited cover letters!',
      shouldCreateAccount: true,
      remainingHours: Math.ceil((req as any).rateLimit.resetTime - Date.now()) / (1000 * 60 * 60),
      maxTrials: 5,
      trialsUsed: (req as any).rateLimit.current
    })
  },
  keyGenerator: (req) => {
    // Only count generate requests towards limit
    if (req.path === '/trial/generate') {
      return req.ip + (req.session?.id || '')
    }
    return req.ip + req.path + (req.session?.id || '') // Different key for other endpoints
  }
}) 