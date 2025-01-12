import { Request, Response } from 'express'
import { prisma } from '../lib/prisma.js'
import { mongodb } from '../lib/mongodb.js'

export const createJobApplication = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { 
      resumeId, 
      jobTitle, 
      company, 
      jobUrl, 
      jobDescription 
    } = req.body

    // Validate required fields
    if (!resumeId || !jobTitle || !company || !jobDescription) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['resumeId', 'jobTitle', 'company', 'jobDescription']
      })
    }

    // Verify resume ownership
    const resume = await prisma.resume.findFirst({
      where: {
        id: resumeId,
        userId
      }
    })

    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' })
    }

    // Get parsed resume data from MongoDB
    const parsedResume = await mongodb.collection('parsedResumes').findOne({
      resumeId
    })

    if (!parsedResume) {
      return res.status(404).json({ error: 'Parsed resume data not found' })
    }

    // Create job application
    const jobApplication = await prisma.jobApplication.create({
      data: {
        userId,
        resumeId,
        jobTitle,
        company,
        jobUrl,
        jobDescription,
        status: 'APPLIED'
      },
      include: {
        resume: {
          select: {
            fileName: true
          }
        }
      }
    })

    res.json({
      success: true,
      data: jobApplication
    })

  } catch (error) {
    console.error('Error creating job application:', error)
    res.status(500).json({ error: 'Failed to create job application' })
  }
}

export const getJobApplications = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const jobApplications = await prisma.jobApplication.findMany({
      where: {
        userId
      },
      include: {
        resume: {
          select: {
            fileName: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    res.json({
      success: true,
      data: jobApplications
    })

  } catch (error) {
    console.error('Error fetching job applications:', error)
    res.status(500).json({ error: 'Failed to fetch job applications' })
  }
}

export const updateApplicationStatus = async (req: Request, res: Response) => {
  try {
    const { jobApplicationId } = req.params
    const { status } = req.body
    const userId = req.user?.id

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const updatedApplication = await prisma.jobApplication.updateMany({
      where: {
        id: jobApplicationId,
        userId // Ensure user owns this application
      },
      data: {
        status
      }
    })

    res.json({ success: true })
  } catch (error) {
    console.error('Error updating application status:', error)
    res.status(500).json({ error: 'Failed to update status' })
  }
} 