import { Request, Response } from 'express'
import { prisma } from '../lib/prisma.js'
import { storageService } from '../services/storageService.js'
import * as amqp from 'amqplib'
import { ParseJob } from '../types/queue.js'
import { collections, mongodb } from '../lib/mongodb.js'

const MAX_RESUMES = 5

export const uploadResume = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' })
    }

    const userId = req.user!.id

    // Get current resume count
    const resumeCount = await prisma.resume.count({
      where: { userId }
    })

    if (resumeCount >= MAX_RESUMES) {
      return res.status(400).json({ 
        error: `Maximum number of stored resumes (${MAX_RESUMES}) reached. Please delete older versions first.` 
      })
    }

    // Get next version number
    const latestVersion = await prisma.resume.findFirst({
      where: { userId },
      orderBy: { version: 'desc' },
      select: { version: true }
    })
    const nextVersion = (latestVersion?.version ?? 0) + 1

    // Upload file
    const path = `resumes/${userId}/${Date.now()}-${req.file.originalname}`
    const fileUrl = await storageService.uploadFile(req.file, path)

    // Create resume record
    const resume = await prisma.resume.create({
      data: {
        userId,
        fileName: req.file.originalname,
        fileUrl,
        version: nextVersion,
        status: 'UPLOADED'
      }
    })

    res.status(201).json(resume)
  } catch (error) {
    console.error('Resume upload error:', error)
    res.status(500).json({ error: 'Failed to upload resume' })
  }
}

export const getResumes = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id
    const resumes = await prisma.resume.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    })
    res.json(resumes)
  } catch (error) {
    console.error('Error fetching resumes:', error)
    res.status(500).json({ error: 'Failed to fetch resumes' })
  }
}

export const deleteResume = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const userId = req.user!.id

    const resume = await prisma.resume.findFirst({
      where: { id, userId }
    })

    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' })
    }

    await storageService.deleteFile(new URL(resume.fileUrl).pathname)
    await prisma.resume.delete({ where: { id } })

    res.json({ message: 'Resume deleted successfully' })
  } catch (error) {
    console.error('Error deleting resume:', error)
    res.status(500).json({ error: 'Failed to delete resume' })
  }
}

export const parseResume = async (req: Request, res: Response) => {
  let connection: amqp.Connection | undefined;
  let channel: amqp.Channel | undefined;
  
  try {
    const { id } = req.params
    const userId = req.user!.id

    const resume = await prisma.resume.findFirst({
      where: { id, userId }
    })

    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' })
    }

    // Log the parse request
    console.log(`Starting parse for resume: ${id}`);
    
    await prisma.resume.update({
      where: { id },
      data: { 
        status: 'PARSING',
        updatedAt: new Date()
      }
    });

    // Connect to RabbitMQ
    connection = await amqp.connect('amqp://guest:guest@rabbitmq:5672')
    channel = await connection.createChannel()
    
    // Add error handlers with proper types
    channel.on('error', (err: Error) => {
      console.error('Channel error:', err)
    })

    connection.on('error', (err: Error) => {
      console.error('Connection error:', err)
    })

    // Create queue with proper settings
    await channel.assertQueue('resume_parsing', {
      durable: true,
      autoDelete: false
    })

    // Get the pdf_key without leading slash
    const pdf_key = new URL(resume.fileUrl).pathname.replace(/^\//, '')

    // Send message to queue with correct structure
    const message: ParseJob = {
      resumeId: id,
      userId: userId,
      pdf_key,
      callback_url: `${process.env.API_URL}/api/notifications/parse-complete`,
      retries: 0
    }

    console.log('Sending to queue:', message);

    const success = channel.sendToQueue(
      'resume_parsing',
      Buffer.from(JSON.stringify(message)),
      { persistent: false }
    )

    if (!success) {
      throw new Error('Failed to send message to queue')
    }

    res.json({ 
      message: 'Parse request submitted',
      status: 'PARSING',
      resumeId: id 
    })

  } catch (error) {
    console.error('Parse request error:', error)
    if (req.params.id) {
      await prisma.resume.update({
        where: { id: req.params.id },
        data: { status: 'PARSE_ERROR' }
      })
    }
    res.status(500).json({ error: 'Failed to submit parse request' })
  } finally {
    try {
      // Clean up connections
      if (channel) await channel.close()
      if (connection) await connection.close()
    } catch (err) {
      console.error('Error closing connections:', err)
    }
  }
}

// Add a new endpoint to get parsing status
export const getParseStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const userId = req.user!.id

    const resume = await prisma.resume.findFirst({
      where: { id, userId },
      include: {
        parsedResumes: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    })

    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' })
    }

    res.json({
      status: resume.status,
      parsedData: resume.parsedResumes[0]?.parsedData || null,
      error: resume.parsedResumes[0]?.errorMessage || null
    })

  } catch (error) {
    console.error('Error fetching parse status:', error)
    res.status(500).json({ error: 'Failed to fetch parse status' })
  }
}

export const getParsedResumeData = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    
    if (!req.user?.id) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
    
    const userId = req.user.id

    // Verify resume ownership
    const resume = await prisma.resume.findFirst({
      where: {
        id,
        userId
      }
    })

    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' })
    }

    // Get parsed data from MongoDB
    const parsedResume = await collections.parsedResumes.findOne({
      resumeId: id
    })

    if (!parsedResume) {
      return res.status(404).json({ error: 'Parsed data not found' })
    }

    res.json(parsedResume)
  } catch (error) {
    console.error('Error fetching parsed resume data:', error)
    res.status(500).json({ error: 'Failed to fetch parsed resume data' })
  }
}

export const getParsedResume = async (req: Request, res: Response) => {
  try {
    const { resumeId } = req.params
    const userId = req.user?.id

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
    console.log('checking for resume', resumeId, userId);
    // First verify ownership using Prisma
    const resume = await prisma.resume.findFirst({
      where: {
        id: resumeId,
        userId
      }
    })

    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' })
    }

    // Then get parsed data from MongoDB
    const parsedResume = await collections.parsedResumes.findOne({ resumeId })
    console.log('Found parsed resume:', parsedResume)

    if (!parsedResume) {
      return res.status(404).json({ 
        error: 'Parsed resume data not found',
        resumeId 
      })
    }

    res.json({ 
      success: true, 
      data: parsedResume.parsedData 
    })
  } catch (error) {
    console.error('Error fetching parsed resume:', error)
    res.status(500).json({ error: 'Failed to fetch parsed resume' })
  }
}