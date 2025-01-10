import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { env } from '../config/env.js'

class StorageService {
  private s3Client: S3Client

  constructor() {
    this.s3Client = new S3Client({
      endpoint: env.AWS_ENDPOINT_URL_S3,
      region: env.AWS_REGION,
      credentials: {
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY
      }
    })
  }

  async getObject(key: string): Promise<Buffer> {
    const command = new GetObjectCommand({
      Bucket: env.BUCKET_NAME,
      Key: key
    })
    const response = await this.s3Client.send(command)
    return Buffer.concat([await response.Body!.transformToByteArray()])
  }

  async uploadFile(file: Express.Multer.File, path: string) {
    const uploadCommand = new PutObjectCommand({
      Bucket: env.BUCKET_NAME,
      Key: path,
      Body: file.buffer,
      ContentType: file.mimetype,
    })

    await this.s3Client.send(uploadCommand)

    // Generate a signed URL that's valid for 1 hour
    const getCommand = new GetObjectCommand({
      Bucket: env.BUCKET_NAME,
      Key: path,
    })
    
    const url = await getSignedUrl(this.s3Client, getCommand, { expiresIn: 3600 })
    return url
  }

  async deleteFile(path: string) {
    const command = new DeleteObjectCommand({
      Bucket: env.BUCKET_NAME,
      Key: path,
    })

    await this.s3Client.send(command)
  }
}

export const storageService = new StorageService() 