import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { toast } from 'react-hot-toast'
import { useApi } from '../lib/api'

interface Step {
  title: string
  description: string
  isRequired: boolean
  component: React.ReactNode
}

export default function Onboarding() {
  const { user, login, isInitialized } = useAuth()
  const { fetchWithAuth } = useApi()
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    bio: ''
  })

  useEffect(() => {
    if (isInitialized && user?.firstName && user?.lastName) {
      navigate('/profile', { replace: true })
    }
  }, [isInitialized, user, navigate])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const steps: Step[] = [
    {
      title: "Welcome to Oomi! 👋",
      description: "Let's get to know you better. First, tell us your name.",
      isRequired: true,
      component: (
        <div className="space-y-6">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
              First Name *
            </label>
            <input
              type="text"
              id="firstName"
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-4 py-3 focus:border-seafoam-500 focus:ring-seafoam-500"
              required
              placeholder="Enter your first name"
            />
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
              Last Name *
            </label>
            <input
              type="text"
              id="lastName"
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-4 py-3 focus:border-seafoam-500 focus:ring-seafoam-500"
              required
              placeholder="Enter your last name"
            />
          </div>
        </div>
      )
    },
    {
      title: "Tell us about yourself",
      description: "Help others get to know you better by sharing a brief bio.",
      isRequired: false,
      component: (
        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
            Professional Bio
          </label>
          <textarea
            id="bio"
            value={formData.bio}
            onChange={(e) => handleInputChange('bio', e.target.value)}
            rows={6}
            className="mt-1 block w-full rounded-md border border-gray-300 px-4 py-3 focus:border-seafoam-500 focus:ring-seafoam-500"
            placeholder="Share your professional background, interests, and goals..."
          />
          <p className="mt-2 text-sm text-gray-500">
            You can always update this later in your profile settings.
          </p>
        </div>
      )
    }
  ]

  const handleSubmit = async () => {
    try {
      if (!formData.firstName || !formData.lastName) {
        toast.error('Please fill in all required fields')
        return
      }

      const updatedUser = await fetchWithAuth(`/users/${user!.id}`, {
        method: 'PUT',
        body: JSON.stringify(formData),
      })

      // Wait for auth context to update
      await new Promise<void>((resolve) => {
        login(user!.token, { ...updatedUser, token: user!.token })
        // Give the context time to update
        setTimeout(resolve, 100)
      })
      
      // Now that we're sure the context is updated, navigate
      navigate('/profile', { replace: true })
      toast.success('Profile updated successfully!')
    } catch (error) {
      console.error('Profile update error:', error)
      toast.error(error instanceof ApiError ? error.message : 'Failed to update profile')
    }
  }

  const handleNext = () => {
    if (currentStep === steps.length - 1) {
      handleSubmit()
    } else {
      if (steps[currentStep].isRequired) {
        if (currentStep === 0 && (!formData.firstName || !formData.lastName)) {
          toast.error('Please fill in all required fields')
          return
        }
      }
      setCurrentStep(prev => prev + 1)
    }
  }

  const handleBack = () => {
    setCurrentStep(prev => prev - 1)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Progress bar */}
          <div className="mb-8">
            <div className="h-2 bg-gray-200 rounded-full">
              <div 
                className="h-2 bg-seafoam-500 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              />
            </div>
            <div className="flex justify-between mt-2 text-sm text-gray-500">
              <span>Getting Started</span>
              <span>{currentStep + 1} of {steps.length}</span>
            </div>
          </div>

          {/* Step content */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {steps[currentStep].title}
            </h1>
            <p className="text-gray-600 mb-6">
              {steps[currentStep].description}
            </p>
            {steps[currentStep].component}
          </div>

          {/* Navigation buttons */}
          <div className="flex justify-between">
            <button
              onClick={handleBack}
              disabled={currentStep === 0}
              className="px-6 py-3 text-base font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Back
            </button>
            <button
              onClick={handleNext}
              className="px-6 py-3 text-base font-medium text-white bg-seafoam-500 rounded-lg hover:bg-seafoam-400"
            >
              {currentStep === steps.length - 1 ? 'Complete Setup' : 'Continue'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 