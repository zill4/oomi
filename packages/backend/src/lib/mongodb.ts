import { MongoClient, ServerApiVersion } from 'mongodb'
import { env } from '../config/env.js'

const uri = env.MONGODB_URI

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
})

export const mongodb = client.db('oomi')

// Updated to match MongoDB schema validation
export interface ParsedResume {
  _id?: string
  resumeId: string
  userId: string
  parsedData: {
    personal_info: {
      name?: string | null
      email?: string | null
      phone?: string | null
      location?: string | null
      linkedin?: string | null
      github?: string | null
      website?: string | null
    }
    education: Array<{
      institution: string
      degree?: string | null
      field?: string | null
      graduation_date?: string | null
    }>
    experience: Array<{
      company: string
      title: string
      location?: string | null
      start_date?: string | null
      end_date?: string | null
      achievements: string[]
      technologies: string[]
    }>
    skills: string[]
    metadata: Record<string, any>
    raw_text: string
  }
  confidence: number
  version: number
  updatedAt: Date
}

export const collections = {
  parsedResumes: mongodb.collection<ParsedResume>('parsedResumes')
} 