import dotenv from 'dotenv';
import { z } from 'zod'
dotenv.config();

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:postgres@db:5432/oomi',
  JWT_SECRET: process.env.JWT_SECRET || 'dev-secret-key',
  PORT: parseInt(process.env.PORT || '8080', 10),
  BUCKET_NAME: process.env.BUCKET_NAME || '',
  AWS_ENDPOINT_URL_S3: process.env.AWS_ENDPOINT_URL_S3 || '',
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || '',
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || ''
} as const;

// Basic validation
if (!env.DATABASE_URL) {
  console.error('❌ DATABASE_URL is required');
  process.exit(1);
} 

export const envSchema = z.object({
  NODE_ENV: z.string(),
  DATABASE_URL: z.string(),
  JWT_SECRET: z.string(),
  PORT: z.number(),
  BUCKET_NAME: z.string(),
  AWS_ENDPOINT_URL_S3: z.string(),
  AWS_ACCESS_KEY_ID: z.string(),
  AWS_SECRET_ACCESS_KEY: z.string()
}) 