import { createContext, useContext, useState, useCallback } from 'react'
import { useApi } from '../lib/api'
import { urlService } from '../services/urlService'

interface User {
  id: string
  email: string
  firstName?: string
  lastName?: string
  bio?: string
  avatarUrl?: string
  token?: string
  createdAt?: string
  updatedAt?: string
}

interface AuthContextType {
  user: (User & { token: string }) | null
  token: string | null
  login: (token: string, user: User) => void
  logout: () => void
  getSignedUrl: (path: string) => Promise<string>
  isInitialized: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<(User & { token: string }) | null>(() => {
    const savedUser = localStorage.getItem('user')
    const savedToken = localStorage.getItem('authToken')
    if (savedUser && savedToken) {
      const parsedUser = JSON.parse(savedUser)
      return { ...parsedUser, token: savedToken }
    }
    return null
  })

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('authToken')
  })
  
  const [isInitialized] = useState(true)
  const { fetchWithAuth } = useApi()

  const login = useCallback((newToken: string, userData: User) => {
    const userWithToken = { ...userData, token: newToken }
    localStorage.setItem('authToken', newToken)
    localStorage.setItem('user', JSON.stringify(userData))
    setToken(newToken)
    setUser(userWithToken)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
  }, [])

  const getSignedUrl = useCallback(async (path: string) => {
    return urlService.getUrl(path, async () => {
      const response = await fetchWithAuth('/storage/sign', {
        method: 'POST',
        body: JSON.stringify({ path })
      })
      return response.url
    })
  }, [fetchWithAuth])

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      login, 
      logout, 
      getSignedUrl, 
      isInitialized 
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export { AuthProvider, useAuth } 