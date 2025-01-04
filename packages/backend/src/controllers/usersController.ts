import { Request, Response } from 'express'
import { prisma } from '../lib/prisma.js'
import { validateName, validateBio } from '../utils/validation.js'
import { storageService } from '../services/storageService.js'

export const getUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        bio: true,
        createdAt: true,
        updatedAt: true,
        // Add other fields you want to return, excluding password
      },
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json(user)
  } catch (error) {
    console.error('Error fetching user:', error)
    res.status(500).json({ error: 'Error fetching user' })
  }
}

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { firstName, lastName, bio } = req.body

    // Validate input
    const errors = []
    
    if (firstName !== undefined) {
      const firstNameError = validateName(firstName, 'firstName')
      if (firstNameError) errors.push(firstNameError)
    }
    
    if (lastName !== undefined) {
      const lastNameError = validateName(lastName, 'lastName')
      if (lastNameError) errors.push(lastNameError)
    }
    
    if (bio !== undefined) {
      const bioError = validateBio(bio)
      if (bioError) errors.push(bioError)
    }

    if (errors.length > 0) {
      return res.status(400).json({ errors })
    }

    // Verify user is updating their own profile
    if (req.user?.id !== id) {
      return res.status(403).json({ error: 'Not authorized to update this profile' })
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        firstName,
        lastName,
        bio,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        bio: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    res.json(updatedUser)
  } catch (error) {
    console.error('Error updating user:', error)
    res.status(500).json({ error: 'Error updating user' })
  }
}

export const updateAvatar = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    if (req.user?.id !== id) {
      return res.status(403).json({ error: 'Not authorized to update this profile' })
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' })
    }

    const path = `avatars/${id}/${Date.now()}-${req.file.originalname}`
    const imageUrl = await storageService.uploadFile(req.file, path)

    const user = await prisma.user.update({
      where: { id },
      data: { avatarUrl: imageUrl },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        bio: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    res.json(user)
  } catch (error) {
    console.error('Avatar upload error:', error)
    res.status(500).json({ error: 'Failed to update avatar' })
  }
} 