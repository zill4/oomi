import { Request, Response } from 'express'
import { prisma } from '../lib/prisma.js'
import { io } from '../lib/socket.js'
import { ParseResult } from '../types/queue.js'
import { collections } from '../lib/mongodb.js'

export const handleParseCompletion = async (req: Request, res: Response) => {
  try {
    const result: ParseResult = req.body
    console.log('Received parse completion:', result)

    // Update resume status first (most critical)
    await prisma.resume.update({
      where: { id: result.resumeId },
      data: {
        status: result.status === 'completed' ? 'PARSED' : 'PARSE_ERROR',
        updatedAt: new Date(result.timestamp)
      }
    })

    // Then try to store in MongoDB
    try {
      await collections.parsedResumes.updateOne(
        { resumeId: result.resumeId },
        { 
          $set: {
            userId: result.userId,
            parsedData: result.parsed_data,
            confidence: result.confidence ?? 0,
            version: 1,
            updatedAt: new Date()
          }
        },
        { upsert: true }
      )
    } catch (mongoError) {
      console.error('MongoDB storage failed:', mongoError)
      // Don't fail the whole request, just log the error
    }

    // Finally try websocket notification
    try {
      io.emit('resumeParseComplete', {
        resumeId: result.resumeId,
        status: result.status,
        error: result.error
      })
    } catch (socketError) {
      console.error('WebSocket notification failed:', socketError)
      // Don't fail the whole request, just log the error
    }

    res.json({ success: true })
  } catch (error) {
    console.error('Error handling parse completion:', error)
    res.status(500).json({ error: 'Failed to handle parse completion' })
  }
} 