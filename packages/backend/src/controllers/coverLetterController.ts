import { Request, Response } from 'express'
import { prisma } from '../lib/prisma.js'
import { collections } from '../lib/mongodb.js'
import { Anthropic } from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

export const generateCoverLetter = async (req: Request, res: Response) => {
  try {
    const { jobApplicationId } = req.params
    const userId = req.user?.id

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    // Get job application data
    const jobApplication = await prisma.jobApplication.findFirst({
      where: {
        id: jobApplicationId,
        userId // Ensure user owns this application
      },
      include: {
        user: {
          select: {
            firstName: true,
            bio: true
          }
        }
      }
    })

    if (!jobApplication) {
      return res.status(404).json({ error: 'Job application not found' })
    }

    // Get parsed resume data from MongoDB
    const parsedResume = await collections.parsedResumes.findOne({
      resumeId: jobApplication.resumeId
    })

    if (!parsedResume) {
      return res.status(404).json({ error: 'Parsed resume not found' })
    }

    // Prepare the prompt for Claude
    const prompt = `Please create a cover letter for ${jobApplication.company}, position ${jobApplication.jobTitle} with job description: "${jobApplication.jobDescription}" for ${jobApplication.user.firstName}, given their resume: "${parsedResume.parsedData.raw_text}" and using a professional but similar style of writing in their bio: "${jobApplication.user.bio}" please keep the cover letter under 2000 letters and have it address the job description provided with references to the provided resume and bio.`

    // Call Claude API
    const response = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: prompt
      }],
      temperature: 0.7
    })

    // Extract the cover letter from the response
    const coverLetter = response.content[0].type === 'text' 
      ? response.content[0].text
      : ''

    if (!coverLetter) {
      throw new Error('Failed to generate cover letter content')
    }

    // Save the generated cover letter
    const updatedJobApplication = await prisma.jobApplication.update({
      where: {
        id: jobApplicationId
      },
      data: {
        coverLetter
      }
    })

    res.json({
      success: true,
      data: {
        coverLetter,
        jobApplicationId
      }
    })

  } catch (error) {
    console.error('Error generating cover letter:', error)
    res.status(500).json({ error: 'Failed to generate cover letter' })
  }
} 