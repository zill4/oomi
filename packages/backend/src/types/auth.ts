export interface RegisterInput {
  email: string
  password: string
}

export interface LoginInput {
  email: string
  password: string
}

export interface AuthResponse {
  message: string
  token: string
  user: {
    id: string
    email: string
  }
} 