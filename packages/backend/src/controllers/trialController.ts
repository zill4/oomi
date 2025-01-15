import { Request, Response } from 'express'
import { prisma } from '../lib/prisma.js'
import { v4 as uuidv4 } from 'uuid'
import { storageService } from '../services/storageService.js'
import { Anthropic } from '@anthropic-ai/sdk'
import { collections } from '../lib/mongodb.js'
import amqp from 'amqplib'
import { env } from '../config/env.js'
import { ParseJob } from '../types/queue.js'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

export const startTrial = async (req: Request, res: Response) => {
  try {
    const trialId = uuidv4()
    
    // Create temporary storage for the trial
    const trialData = await prisma.trialSession.create({
      data: {
        id: trialId,
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
    const { trialId } = req.params
    
    if (!trialId) {
      console.error('Trial ID missing from params');
      return res.status(400).json({ error: 'Trial ID is required' });
    }

    console.log(`Processing resume for trial ${trialId}`);

    // Verify trial exists and hasn't expired
    const trial = await prisma.trialSession.findUnique({
      where: { id: trialId }
    })

    if (!trial) {
      console.error(`Trial ${trialId} not found`);
      return res.status(404).json({ error: 'Trial session not found' });
    }

    if (trial.expiresAt < new Date()) {
      console.error(`Trial ${trialId} expired at ${trial.expiresAt}`);
      return res.status(400).json({ error: 'Trial session expired' });
    }

    // Upload file using storageService
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const path = `trials/${trialId}/resume.pdf`
    console.log(`Uploading resume to S3: ${path}`);
    
    const fileUrl = await storageService.uploadFile(req.file, path)
    
    // Use existing ParseJob structure
    const connection = await amqp.connect(process.env.RABBITMQ_URL!)
    const channel = await connection.createChannel()
    
    const message: ParseJob = {
      resumeId: trialId,
      userId: trialId,
      pdf_key: path,
      callback_url: `${process.env.API_URL}/api/notifications/parse-complete`,
      retries: 0
    }

    console.log('Sending parse job to queue:', message);
    await channel.assertQueue('resume_parsing', {
      durable: true,
      autoDelete: false
    })
    await channel.sendToQueue('resume_parsing', Buffer.from(JSON.stringify(message)))
    
    await channel.close()
    await connection.close()

    await prisma.trialSession.update({
      where: { id: trialId },
      data: { resumeId: path }
    })

    res.json({ success: true })
  } catch (error) {
    console.error('Error processing trial resume:', error)
    res.status(500).json({ error: 'Failed to process resume' })
  }
}

export const generateTrialCoverLetter = async (req: Request, res: Response) => {
  try {
    const { trialId } = req.query
    if (!trialId || typeof trialId !== 'string') {
      return res.status(400).json({ error: 'Trial ID is required' })
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

    if (!trialSession) {
      return res.status(400).json({ error: 'Trial session not found' })
    }

    // Get parsed resume data from MongoDB using resumeId
    const parsedResume = await collections.parsedResumes.findOne({
      resumeId: trialId
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
    const { trialId } = req.params
    
    if (!trialId) {
      return res.status(400).json({ error: 'Trial ID is required' })
    }

    // Check MongoDB for parsed data
    const parsedResume = await collections.parsedResumes.findOne({ resumeId: trialId })
    
    if (parsedResume) {
      return res.json({ status: 'completed' })
    }

    // If not found, it's still processing
    return res.json({ status: 'processing' })
  } catch (error) {
    console.error('Error checking parse status:', error)
    res.status(500).json({ error: 'Failed to check parse status' })
  }
} 