import { Request, Response } from 'express'
import { prisma } from '../lib/prisma.js'
import { v4 as uuidv4 } from 'uuid'
import { storageService } from '../services/storageService.js'
import { Anthropic } from '@anthropic-ai/sdk'
import { collections } from '../lib/mongodb.js'
import amqp from 'amqplib'
import { env } from '../config/env.js'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

export const startTrial = async (req: Request, res: Response) => {
  try {
    // Create a temporary session if one doesn't exist
    if (!req.session.trialId) {
      req.session.trialId = uuidv4()
      req.session.trialStarted = Date.now()
    }

    // Create temporary storage for the trial
    const trialData = await prisma.trialSession.create({
      data: {
        id: req.session.trialId,
        ipAddress: req.ip,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      }
    })

    res.json({ 
      success: true, 
      trialId: trialData.id,
      stepsRemaining: ['resume', 'bio', 'job']
    })
  } catch (error) {
    console.error('Error starting trial:', error)
    res.status(500).json({ error: 'Failed to start trial' })
  }
}

export const uploadTrialResume = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' })
    }

    const trialId = req.session.trialId
    if (!trialId) {
      return res.status(400).json({ error: 'Trial session not found' })
    }

    // Upload file to S3 - pass the buffer and filename separately
    const fileName = `trial/${trialId}/${Date.now()}-${req.file.originalname}`
    const fileUrl = await storageService.uploadFile(req.file, fileName)

    // Create or update trial session with resume info
    await prisma.trialSession.upsert({
      where: { id: trialId },
      create: {
        id: trialId,
        ipAddress: req.ip,
        resumeId: fileName,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
      update: {
        resumeId: fileName,
        updatedAt: new Date()
      }
    })

    // Submit parse job to queue
    const connection = await amqp.connect(env.RABBITMQ_URL)
    const channel = await connection.createChannel()
    
    const parseJob = {
      resumeId: fileName,
      userId: trialId, // Use trialId as userId for trial sessions
      pdf_key: fileName,
      callback_url: `${process.env.API_URL}/api/notifications/parse-complete`, 
      attempt: 0
    }

    await channel.assertQueue('resume_parsing')
    await channel.sendToQueue(
      'resume_parsing',
      Buffer.from(JSON.stringify(parseJob)),
      { persistent: true }
    )

    await channel.close()
    await connection.close()

    res.json({
      success: true,
      fileUrl,
      fileName
    })

  } catch (error) {
    console.error('Error uploading trial resume:', error)
    res.status(500).json({ error: 'Failed to upload resume' })
  }
}

export const generateTrialCoverLetter = async (req: Request, res: Response) => {
  try {
    const trialId = req.session.trialId
    if (!trialId) {
      return res.status(400).json({ error: 'Trial session not found' })
    }

    const { bio, jobTitle, company, jobDescription } = req.body

    if (!bio || !jobTitle || !company || !jobDescription) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['bio', 'jobTitle', 'company', 'jobDescription']
      })
    }

    // Get trial session with resume
    const trialSession = await prisma.trialSession.findUnique({
      where: { id: trialId }
    })

    if (!trialSession?.resumeId) {
      return res.status(400).json({ error: 'Resume not found for trial' })
    }

    // Get parsed resume data from MongoDB using your collections
    const parsedResume = await collections.parsedResumes.findOne({
      resumeId: trialSession.resumeId
    })

    if (!parsedResume) {
      return res.status(404).json({ error: 'Parsed resume data not found' })
    }

    // Generate cover letter using Claude
    const prompt = `Please create a cover letter for ${company}, position ${jobTitle} with job description: "${jobDescription}" for a candidate with bio: "${bio}" and resume: "${parsedResume.parsedData.raw_text}" please keep the cover letter under 2000 letters and have it address the job description provided with references to the provided resume and bio.`

    const response = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: prompt
      }],
      temperature: 0.7
    })

    const coverLetter = response.content[0].type === 'text' 
      ? response.content[0].text
      : ''

    if (!coverLetter) {
      throw new Error('Failed to generate cover letter content')
    }

    res.json({
      success: true,
      coverLetter
    })

  } catch (error) {
    console.error('Error generating trial cover letter:', error)
    res.status(500).json({ error: 'Failed to generate cover letter' })
  }
}

export const checkParseStatus = async (req: Request, res: Response) => {
  try {
    const trialId = req.session.trialId
    if (!trialId) {
      return res.status(400).json({ error: 'Trial session not found' })
    }

    const trialSession = await prisma.trialSession.findUnique({
      where: { id: trialId }
    })

    if (!trialSession?.resumeId) {
      return res.status(404).json({ error: 'Resume not found for trial' })
    }

    // Check if resume has been parsed
    const parsedResume = await collections.parsedResumes.findOne({
      resumeId: trialSession.resumeId
    })

    if (!parsedResume) {
      return res.json({ status: 'pending' })
    }

    return res.json({ status: 'completed' })

  } catch (error) {
    console.error('Error checking parse status:', error)
    res.status(500).json({ error: 'Failed to check parse status' })
  }
} 