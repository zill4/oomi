import { Request, Response } from 'express'
import { prisma } from '../lib/prisma.js'
import { io } from '../lib/socket.js'
import { ParseResult } from '../types/queue.js'
import { collections } from '../lib/mongodb.js'

export const handleParseCompletion = async (req: Request, res: Response) => {
  try {
    const result: ParseResult = req.body
    console.log('Received parse completion:', result)

    // Store directly in MongoDB (parsed data comes in the notification)
    await collections.parsedResumes.updateOne(
      { resumeId: result.resumeId },
      { 
        $set: {
          userId: result.userId,
          parsedData: result.parsed_data, // Direct from parser
          confidence: result.confidence ?? 0,
          version: 1,
          updatedAt: new Date()
        }
      },
      { upsert: true }
    )

    // Update resume status in PostgreSQL
    await prisma.resume.update({
      where: { id: result.resumeId },
      data: {
        status: result.status === 'completed' ? 'PARSED' : 'PARSE_ERROR',
        updatedAt: new Date(result.timestamp)
      }
    })

    // Emit websocket event
    io.emit('resumeParseComplete', {
      resumeId: result.resumeId,
      status: result.status,
      error: result.error
    })

    res.json({ success: true })
  } catch (error) {
    console.error('Error handling parse completion:', error)
    res.status(500).json({ error: 'Failed to handle parse completion' })
  }
} 