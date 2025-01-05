export interface Resume {
  id: string
  userId: string
  fileName: string
  fileUrl: string
  parsedData?: Partial<ResumeData>
  status: 'UPLOADED' | 'PARSED' | 'VERIFIED'
  confidence?: number
  version: number
  createdAt: Date
  updatedAt: Date
}

export interface ResumeData {
  personalInfo: {
    firstName: string
    lastName: string
    email: string
    phone: {
      countryCode: string
      number: string
      extension?: string
    }
    address?: {
      line1: string
      city: string
      state: string
      postalCode: string
      country: string
    }
  }
  workExperience: Array<{
    id: string
    jobTitle: string
    company: string
    location: string
    isCurrent: boolean
    startDate: {
      month: number
      year: number
    }
    endDate?: {
      month: number
      year: number
    }
    description: string
    highlights: string[]
  }>
  education: Array<{
    id: string
    school: string
    degree?: string
    fieldOfStudy?: string
    startDate?: {
      month: number
      year: number
    }
    endDate?: {
      month: number
      year: number
    }
    description?: string
  }>
  skills?: Array<{
    category: string
    items: string[]
  }>
} 