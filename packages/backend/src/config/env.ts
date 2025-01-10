import { z } from 'zod'
import dotenv from 'dotenv'

dotenv.config()

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
  MONGODB_URI: z.string().url().default('mongodb://root:example@mongodb:27017/oomi?authSource=admin'),
  
  // RabbitMQ Configuration
  RABBITMQ_URL: z.string().url().default('amqp://guest:guest@rabbitmq:5672'),
})

// Parse and validate environment variables
export const env = envSchema.parse(process.env)

// Export the schema type for use in other parts of the application
export type Env = z.infer<typeof envSchema> 