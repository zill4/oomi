import { Request, Response } from 'express'
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { env } from '../config/env.js'

const s3Client = new S3Client({
  endpoint: env.AWS_ENDPOINT_URL_S3,
  region: 'auto',
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
})

export const signUrl = async (req: Request, res: Response) => {
  try {
    const { path } = req.body

    if (!path) {
      return res.status(400).json({ error: 'Path is required' })
    }

    // Extract just the file path from the full URL if needed
    const cleanPath = path.includes('fly.storage') 
      ? new URL(path).pathname.slice(1) // Remove leading slash
      : path

    const command = new GetObjectCommand({
      Bucket: env.BUCKET_NAME,
      Key: cleanPath,
    })

    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 })
    res.json({ url })
  } catch (error) {
    console.error('URL signing error:', error)
    res.status(500).json({ error: 'Failed to generate signed URL' })
  }
} 