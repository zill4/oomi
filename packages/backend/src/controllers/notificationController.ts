import { Request, Response } from 'express'
import { prisma } from '../lib/prisma.js'
import { io } from '../lib/socket.js'
import { ParseResult } from '../types/queue.js'
import { collections } from '../lib/mongodb.js'
import { MongoError } from 'mongodb'

export const handleParseCompletion = async (req: Request, res: Response) => {
  try {
    const result: ParseResult = req.body
    console.log('1. Received parse completion with data:', JSON.stringify(result, null, 2))

    // Check if this is a trial resume
    if (result.resumeId.startsWith('trial/')) {
      console.log('2. Processing trial resume:', result.resumeId)
      // Store trial resume data in MongoDB with proper schema
      await collections.parsedResumes.updateOne(
        { resumeId: result.resumeId },
        { 
          $set: {
            resumeId: result.resumeId,
            userId: result.userId,
            parsedData: {
              personal_info: result.parsed_data.personal_info || {
                name: null,
                email: null,
                phone: null,
                location: null,
                linkedin: null,
                github: null,
                website: null
              },
              education: result.parsed_data.education || [],
              experience: result.parsed_data.experience || [],
              skills: result.parsed_data.skills || [],
              metadata: result.parsed_data.metadata || {},
              raw_text: result.parsed_data.raw_text || ''
            },
            confidence: result.confidence ?? 0,
            version: 1,
            updatedAt: new Date()
          }
        },
        { upsert: true }
      )
      return res.json({ success: true })
    }

    // Update resume status first (most critical)
    await prisma.resume.update({
      where: { id: result.resumeId },
      data: {
        status: result.status === 'completed' ? 'PARSED' : 'PARSE_ERROR',
        updatedAt: new Date(result.timestamp)
      }
    })
    console.log('2. Updated Prisma resume status for:', result.resumeId)

    // Then try to store in MongoDB
    try {
      // Prepare the document with all required fields
      const parsedDocument = {
        resumeId: result.resumeId,
        userId: result.userId,
        parsedData: {
          personal_info: result.parsed_data.personal_info || {
            name: null,
            email: null,
            phone: null,
            location: null,
            linkedin: null,
            github: null,
            website: null
          },
          education: result.parsed_data.education || [],
          experience: result.parsed_data.experience || [],
          skills: result.parsed_data.skills || [],
          metadata: result.parsed_data.metadata || {},
          raw_text: result.parsed_data.raw_text || ''
        },
        confidence: result.confidence ?? 0,
        version: 1,
        updatedAt: new Date()
      }
      
      console.log('3. Attempting MongoDB write with document:', JSON.stringify(parsedDocument, null, 2))

      const writeResult = await collections.parsedResumes.updateOne(
        { resumeId: result.resumeId },
        { $set: parsedDocument },
        { upsert: true }
      )

      console.log('4. MongoDB write result:', JSON.stringify(writeResult, null, 2))

    } catch (error) {
      if (error instanceof MongoError) {
        console.error('5. MongoDB storage failed:', error)
        console.error('MongoDB error code:', error.code)
        console.error('MongoDB error message:', error.message)
        if ('errInfo' in error) {
          console.error('MongoDB validation details:', error.errInfo)
        }
      } else {
        console.error('5. Unknown error during MongoDB storage:', error)
      }
    }

    // Finally try websocket notification
    try {
      io.emit('resumeParseComplete', {
        resumeId: result.resumeId,
        status: result.status,
        error: result.error
      })
      console.log('6. WebSocket notification sent')
    } catch (socketError) {
      console.error('7. WebSocket notification failed:', socketError)
    }

    res.json({ success: true })
  } catch (error) {
    console.error('8. Overall error in handleParseCompletion:', error)
    res.status(500).json({ error: 'Failed to handle parse completion' })
  }
} 