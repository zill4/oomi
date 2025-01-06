import { Request, Response } from 'express'
import { prisma } from '../lib/prisma.js'
import { storageService } from '../services/storageService.js'

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
  try {
    const { id } = req.params
    const userId = req.user!.id

    // Get resume from database
    const resume = await prisma.resume.findFirst({
      where: { id, userId }
    })

    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' })
    }

    // Send parse request to resume-parser service
    const response = await fetch('http://resume-parser:3001/parse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        resumeId: id,
        userId,
        pdfKey: resume.fileUrl
      })
    })

    if (!response.ok) {
      throw new Error('Failed to submit parse request')
    }

    // Update resume status
    await prisma.resume.update({
      where: { id },
      data: { status: 'PARSING' }
    })

    res.json({ message: 'Parse request submitted' })
  } catch (error) {
    console.error('Parse request error:', error)
    res.status(500).json({ error: 'Failed to submit parse request' })
  }
} 