export interface UserInput {
  email: string
  password: string
  firstName?: string
  lastName?: string
}

export interface AuthResponse {
  token: string
  user: {
    id: string
    email: string
    firstName?: string
    lastName?: string
  }
} 