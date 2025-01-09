import { Request, Response } from 'express'
import { prisma } from '../lib/prisma.js'
import { io } from '../lib/socket.js'
import { ParseResult } from '../types/queue.js'

export const handleParseCompletion = async (req: Request, res: Response) => {
  try {
    const result: ParseResult = req.body

    // Update resume status in database
    await prisma.resume.update({
      where: { id: result.resume_id },
      data: {
        status: result.status === 'completed' ? 'PARSED' : 'PARSE_ERROR',
        parsedDataUrl: result.result_key,
        updatedAt: new Date(result.timestamp)
      }
    })

    // Emit websocket event to connected clients
    io.emit('resumeParseComplete', {
      resumeId: result.resume_id,
      status: result.status,
      error: result.error
    })

    res.json({ success: true })
  } catch (error) {
    console.error('Error handling parse completion:', error)
    res.status(500).json({ error: 'Failed to handle parse completion' })
  }
} 