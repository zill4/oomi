import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FcGoogle } from 'react-icons/fc'
import { FaXTwitter } from 'react-icons/fa6'
import { FaLinkedin } from 'react-icons/fa'
import { toast } from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      toast.error('Please fill in all fields')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Received non-JSON response from server")
      }

      let data
      try {
        data = await response.json()
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError)
        console.log('Raw Response:', await response.text())
        throw new Error('Failed to parse server response')
      }

      if (!response.ok) {
        throw new Error(data.message || 'Invalid credentials')
      }

      // Use the login function from AuthContext
      login(data.token, data.user)

      toast.success('Logged in successfully!')
      navigate('/profile')
    } catch (error) {
      console.error('Login Error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to log in')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Login
          </h2>
          
          <form className="space-y-6 mt-8" onSubmit={handleSubmit}>
            <div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-md border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-seafoam-500 focus:ring-seafoam-500"
                placeholder="Email"
                disabled={isLoading}
              />
            </div>

            <div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-md border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-seafoam-500 focus:ring-seafoam-500"
                placeholder="Password"
                disabled={isLoading}
              />
            </div>

            <div>
              <button
                type="submit"
                className="w-full rounded-md bg-seafoam-500 py-3 px-4 font-medium text-white hover:bg-seafoam-400 focus:outline-none focus:ring-2 focus:ring-seafoam-500 focus:ring-offset-2"
                disabled={isLoading}
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-gray-500">or</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3">
              <button
                type="button"
                className="inline-flex w-full justify-center rounded-md bg-white px-4 py-2 text-gray-500 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0"
                disabled={isLoading}
              >
                <FcGoogle className="h-5 w-5" />
                <span className="sr-only">Sign in with Google</span>
              </button>

              <button
                type="button"
                className="inline-flex w-full justify-center rounded-md bg-white px-4 py-2 text-gray-500 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0"
                disabled={isLoading}
              >
                <FaLinkedin className="h-5 w-5 text-[#0A66C2]" />
                <span className="sr-only">Sign in with LinkedIn</span>
              </button>

              <button
                type="button"
                className="inline-flex w-full justify-center rounded-md bg-white px-4 py-2 text-gray-500 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0"
                disabled={isLoading}
              >
                <FaXTwitter className="h-5 w-5" />
                <span className="sr-only">Sign in with X</span>
              </button>
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-gray-500">
            Don't have an account?{' '}
            <Link to="/sign-up" className="font-medium text-seafoam-500 hover:text-seafoam-400">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
} 