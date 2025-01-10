export interface ParseJob {
  resumeId: string;
  userId: string;
  pdf_key: string;
  callback_url: string;
  retries: number | null;
}

export interface ParseResult {
  resumeId: string
  userId: string
  status: 'completed' | 'error' | string
  parsed_data: {
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
  confidence?: number
  error?: string
  timestamp: string
} 