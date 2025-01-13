import { z } from 'zod'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '../../')

// Only try to load .env file if we're not in production
if (process.env.NODE_ENV !== 'production') {
  const envFile = '.env'
  const envPath = path.resolve(rootDir, envFile)
  
  console.log('Loading environment from file:', envPath)
  const result = dotenv.config({ path: envPath })
  
  if (result.error) {
    console.warn('Warning: Error loading .env file:', result.error)
  }
}

// Log all environment variables (safely)
console.log('Environment variables loaded:', {
  NODE_ENV: process.env.NODE_ENV,
  DATABASE_URL: process.env.DATABASE_URL ? '[REDACTED]' : undefined,
  BUCKET_NAME: process.env.BUCKET_NAME || 'NOT_SET',
  AWS_REGION: process.env.AWS_REGION || 'NOT_SET',
  AWS_ENDPOINT_URL_S3: process.env.AWS_ENDPOINT_URL_S3 ? '[SET]' : 'NOT_SET',
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID ? '[SET]' : 'NOT_SET',
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY ? '[SET]' : 'NOT_SET',
})

// Define the environment schema
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(1),
  PORT: z.coerce.number().default(8080),
  
  // S3 Configuration
  BUCKET_NAME: z.string().min(1),
  AWS_ENDPOINT_URL_S3: z.string().url(),
  AWS_ACCESS_KEY_ID: z.string().min(1),
  AWS_SECRET_ACCESS_KEY: z.string().min(1),
  AWS_REGION: z.string().min(1),
  
  // MongoDB Configuration
  MONGODB_URI: z.string().url(),
  
  // RabbitMQ Configuration
  RABBITMQ_URL: z.string().url(),
})

// Export the schema type for use in other parts of the application
export type Env = z.infer<typeof envSchema>

// Validate environment variables
let env: z.infer<typeof envSchema>
try {
  env = envSchema.parse(process.env)
  console.log('Environment validation successful')
} catch (error) {
  console.error('Environment validation failed:', error)
  throw error
}

export { env } 