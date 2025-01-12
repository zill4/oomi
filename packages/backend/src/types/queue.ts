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
  confidence?: number
  error?: string
  timestamp: string
} 