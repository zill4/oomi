export interface ParseJob {
  resumeId: string;
  userId: string;
  pdf_key: string;
  retries: number;
}

export interface ParseResult {
  resume_id: string
  user_id: string
  pdf_key: string
  status: string
  result_key?: string
  error?: string
  timestamp: string
} 