import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { env } from '../config/env.js'

const s3Client = new S3Client({
  endpoint: env.AWS_ENDPOINT_URL_S3, // Tigris endpoint
  region: 'auto',
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
})

export const storageService = {
  async uploadFile(file: Express.Multer.File, path: string) {
    const command = new PutObjectCommand({
      Bucket: env.BUCKET_NAME,
      Key: path,
      Body: file.buffer,
      ContentType: file.mimetype,
    })

    await s3Client.send(command)
    return `${env.AWS_ENDPOINT_URL_S3}/${env.BUCKET_NAME}/${path}`
  },

  async deleteFile(path: string) {
    const command = new DeleteObjectCommand({
      Bucket: env.BUCKET_NAME,
      Key: path,
    })

    await s3Client.send(command)
  }
} 