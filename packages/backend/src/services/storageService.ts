import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
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

export const storageService = {
  async uploadFile(file: Express.Multer.File, path: string) {
    const uploadCommand = new PutObjectCommand({
      Bucket: env.BUCKET_NAME,
      Key: path,
      Body: file.buffer,
      ContentType: file.mimetype,
    })

    await s3Client.send(uploadCommand)

    // Generate a signed URL that's valid for 1 hour
    const getCommand = new GetObjectCommand({
      Bucket: env.BUCKET_NAME,
      Key: path,
    })
    
    const url = await getSignedUrl(s3Client, getCommand, { expiresIn: 3600 })
    return url
  },

  async deleteFile(path: string) {
    const command = new DeleteObjectCommand({
      Bucket: env.BUCKET_NAME,
      Key: path,
    })

    await s3Client.send(command)
  }
} 