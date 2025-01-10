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

// Updated to match ParseResult type
export interface ParsedResume {
  _id?: string
  resumeId: string
  userId: string
  parsedData: {
    personalInfo: {
      name?: string
      email?: string
      phone?: string
      location?: string
      linkedin?: string
      github?: string
      website?: string
    }
    experience: Array<{
      company: string
      title: string
      location?: string
      startDate?: string
      endDate?: string
      achievements: string[]
    }>
    education: Array<{
      institution: string
      degree?: string
      field?: string
      graduationDate?: string
    }>
    skills: string[]
  }
  confidence: number
  version: number
  createdAt: Date
  updatedAt: Date
}

export const collections = {
  parsedResumes: mongodb.collection<ParsedResume>('parsed_resumes')
} 