import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FcGoogle } from 'react-icons/fc'
import { FaXTwitter } from 'react-icons/fa6'
import { FaLinkedin } from 'react-icons/fa'

export default function SignUp() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const navigate = useNavigate()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement signup logic
    console.log('Sign up:', { email, password })
  }

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Sign Up for OOMI
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
              />
            </div>

            <div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-md border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-seafoam-500 focus:ring-seafoam-500"
                placeholder="Password"
              />
            </div>

            <div>
              <input
                id="confirm-password"
                name="confirm-password"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="block w-full rounded-md border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-seafoam-500 focus:ring-seafoam-500"
                placeholder="Confirm Password"
              />
            </div>

            <div>
              <button
                type="submit"
                className="w-full rounded-md bg-seafoam-500 py-3 px-4 font-medium text-white hover:bg-seafoam-400 focus:outline-none focus:ring-2 focus:ring-seafoam-500 focus:ring-offset-2"
              >
                Sign Up
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
              >
                <FcGoogle className="h-5 w-5" />
                <span className="sr-only">Sign up with Google</span>
              </button>

              <button
                type="button"
                className="inline-flex w-full justify-center rounded-md bg-white px-4 py-2 text-gray-500 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0"
              >
                <FaLinkedin className="h-5 w-5 text-[#0A66C2]" />
                <span className="sr-only">Sign up with LinkedIn</span>
              </button>

              <button
                type="button"
                className="inline-flex w-full justify-center rounded-md bg-white px-4 py-2 text-gray-500 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0"
              >
                <FaXTwitter className="h-5 w-5" />
                <span className="sr-only">Sign up with X</span>
              </button>
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-seafoam-500 hover:text-seafoam-400">
              Log In
            </Link>
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 flex justify-center space-x-4 text-sm text-gray-500">
        <button onClick={() => navigate('/privacy')} className="hover:text-gray-700">
          Privacy Policy
        </button>
        <button onClick={() => navigate('/terms')} className="hover:text-gray-700">
          Terms of Service
        </button>
      </div>
    </div>
  )
} 