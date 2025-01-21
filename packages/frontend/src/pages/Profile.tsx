import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useApi } from '../lib/api'
import { toast } from 'react-hot-toast'
import { PencilIcon, CameraIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline'
import { validateName, validateBio, ValidationError } from '../utils/validation'
import { useFileUpload } from '../hooks/useFileUpload'
import ResumeList from '../components/ResumeList'
import { classNames } from '../utils/classNames'

const getBioStatus = (bioLength: number) => {
  if (bioLength < 1000) {
    return {
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      message: `${bioLength}/2500 characters - Please add more details about yourself`
    }
  } else if (bioLength < 2500) {
    return {
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      message: `${bioLength}/2500 characters - Getting closer! Add more context about your journey`
    }
  } else if (bioLength >= 7500) {
    return {
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      message: `${bioLength}/10000 characters - 🏆 Legendary Story!`
    }
  } else if (bioLength >= 5000) {
    return {
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      message: `${bioLength}/10000 characters - ⭐ Epic Story!`
    }
  }
  return {
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    message: `${bioLength}/10000 characters - Great job telling your story!`
  }
}

export default function Profile() {
  const { user, login, getSignedUrl } = useAuth()
  const { fetchWithAuth } = useApi()
  const [isEditingBio, setIsEditingBio] = useState(false)
  const [isEditingName, setIsEditingName] = useState(false)
  const [bio, setBio] = useState(user?.bio || '')
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || ''
  })
  const [errors, setErrors] = useState<ValidationError[]>([])
  const { uploadFile, isUploading } = useFileUpload({
    maxSize: 5 * 1024 * 1024,
    allowedTypes: ['image/*'],
    fieldName: 'avatar'
  })
  const [avatarUrl, setAvatarUrl] = useState<string>('')
  const [showFullBio, setShowFullBio] = useState(false)

  useEffect(() => {
    const loadAvatarUrl = async () => {
      if (user?.avatarUrl) {
        try {
          // Only get signed URL if it's a storage URL
          if (user.avatarUrl.includes('fly.storage')) {
            const signedUrl = await getSignedUrl(user.avatarUrl)
            setAvatarUrl(signedUrl)
          } else {
            setAvatarUrl(user.avatarUrl)
          }
        } catch (error) {
          console.error('Failed to load avatar URL:', error)
        }
      }
    }

    loadAvatarUrl()
  }, [user?.avatarUrl, getSignedUrl])

  const validateForm = (data: typeof formData): ValidationError[] => {
    const errors: ValidationError[] = []
    
    const firstNameError = validateName(data.firstName, 'firstName')
    const lastNameError = validateName(data.lastName, 'lastName')
    
    if (firstNameError) errors.push(firstNameError)
    if (lastNameError) errors.push(lastNameError)
    
    return errors
  }

  const handleNameUpdate = async () => {
    const validationErrors = validateForm(formData)
    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      validationErrors.forEach(error => toast.error(error.message))
      return
    }

    try {
      const updatedUser = await fetchWithAuth(`/users/${user!.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          bio: user?.bio
        }),
      })

      await login(user!.token, { ...updatedUser, token: user!.token })
      setIsEditingName(false)
      setErrors([])
      toast.success('Name updated successfully!')
    } catch (error) {
      toast.error('Failed to update name')
    }
  }

  const handleBioUpdate = async () => {
    const bioError = validateBio(bio)
    if (bioError) {
      setErrors([bioError])
      toast.error(bioError.message)
      return
    }

    try {
      const updatedUser = await fetchWithAuth(`/users/${user!.id}`, {
        method: 'PUT',
        body: JSON.stringify({ bio }),
      })

      await login(user!.token, { ...updatedUser, token: user!.token })
      setIsEditingBio(false)
      setErrors([])
      toast.success('Bio updated successfully!')
    } catch (error) {
      toast.error('Failed to update bio')
    }
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const signedUrl = await uploadFile(file, `/users/${user!.id}/avatar`)
      setAvatarUrl(signedUrl)

      // Update user context with new avatar URL
      if (user) {
        await login(user.token, { 
          ...user, 
          avatarUrl: signedUrl 
        })
      }
      
      toast.success('Profile picture updated successfully!')
    } catch (error) {
      toast.error('Failed to update profile picture')
    }
  }

  // Helper function to truncate text
  const truncateBio = (text: string) => {
    const words = text.split(' ')
    const truncated = words.slice(0, 100).join(' ') // Show first 100 words
    return words.length > 100 ? `${truncated}...` : text
  }

  return (
    <div className="space-y-6">
      {/* Profile Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-6">Profile</h2>
        <div className="flex items-center space-x-4">
          <div className="relative group">
            <div className="w-16 h-16 rounded-full bg-sigma-100 flex items-center justify-center overflow-hidden">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Profile"
                  className="w-full h-full object-cover"
                  onError={() => setAvatarUrl('')}
                />
              ) : (
                <img
                  src="/shark-avatar.svg"
                  alt="Default Avatar"
                  className="w-12 h-12"
                />
              )}
              <label className="absolute inset-0 bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                <CameraIcon className="w-6 h-6 text-white" />
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  disabled={isUploading}
                />
              </label>
            </div>
            {isUploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 rounded-full">
                <div className="w-5 h-5 border-2 border-sigma-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-sigma-500 rounded-full border-2 border-white flex items-center justify-center">
              <span className="text-white text-xs">🌊</span>
            </div>
          </div>
          <div className="flex-grow">
            <div className="flex items-center space-x-2">
              {isEditingName ? (
                <div className="flex items-center space-x-2">
                  <div className="space-y-1">
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                      className={`w-full px-2 py-1 text-sm border rounded-md focus:ring-1 ${
                        errors.some(e => e.field === 'firstName')
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                          : 'border-gray-300 focus:border-sigma-500 focus:ring-sigma-500'
                      }`}
                      placeholder="First Name"
                    />
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                      className={`w-full px-2 py-1 text-sm border rounded-md focus:ring-1 ${
                        errors.some(e => e.field === 'lastName')
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                          : 'border-gray-300 focus:border-sigma-500 focus:ring-sigma-500'
                      }`}
                      placeholder="Last Name"
                    />
                  </div>
                  <div className="flex space-x-1">
                    <button
                      className="p-1 text-gray-400 hover:text-gray-600"
                      onClick={() => {
                        setFormData({
                          firstName: user?.firstName || '',
                          lastName: user?.lastName || ''
                        })
                        setIsEditingName(false)
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      className="p-1 text-sigma-500 hover:text-sigma-400"
                      onClick={handleNameUpdate}
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h3 className="text-xl font-semibold">
                    {user?.firstName} {user?.lastName}
                  </h3>
                  <button 
                    className="p-1 text-gray-400 hover:text-sigma-500 transition-colors"
                    onClick={() => setIsEditingName(true)}
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
            <p className="text-gray-500">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Resume Section - Moved up */}
      <div className="bg-white rounded-lg shadow p-6">
        <ResumeList />
      </div>

      {/* Bio Section - Moved down */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold">Bio</h2>
          {!isEditingBio && (
            <button
              className="p-1.5 text-gray-400 hover:text-sigma-500 transition-colors"
              onClick={() => setIsEditingBio(true)}
            >
              <PencilIcon className="w-4 h-4" />
            </button>
          )}
        </div>
        
        <p className="text-gray-600 mb-4 text-sm">
          This section showcases your writing style and personal journey. Share what you're proud of, 
          your interests, and how you got here. Please write <span className="font-bold">at least 2,500 characters</span> to 
          tell your story effectively.
        </p>

        <div className="bg-gray-50 rounded-lg p-4">
          {isEditingBio ? (
            <div className="space-y-4">
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full min-h-[200px] p-2 border border-gray-300 rounded-md focus:border-sigma-500 focus:ring-1 focus:ring-sigma-500"
                placeholder="Tell us your story..."
                maxLength={10000}
              />
              <div className="flex flex-col space-y-2">
                <div className={classNames(
                  "text-sm px-3 py-2 rounded-md",
                  getBioStatus(bio.length).bgColor,
                  getBioStatus(bio.length).color
                )}>
                  {getBioStatus(bio.length).message}
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800"
                    onClick={() => {
                      setBio(user?.bio || '')
                      setIsEditingBio(false)
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-3 py-1.5 text-sm text-white bg-sigma-500 rounded-md hover:bg-sigma-400"
                    onClick={handleBioUpdate}
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div className="whitespace-pre-wrap text-gray-700">
                {user?.bio ? (
                  <>
                    <p>{showFullBio ? user.bio : truncateBio(user.bio)}</p>
                    {user.bio.split(' ').length > 100 && (
                      <button
                        onClick={() => setShowFullBio(!showFullBio)}
                        className="mt-2 flex items-center text-sigma-500 hover:text-sigma-600 transition-colors"
                      >
                        {showFullBio ? (
                          <>
                            Show Less
                            <ChevronUpIcon className="ml-1 h-4 w-4" />
                          </>
                        ) : (
                          <>
                            Show More
                            <ChevronDownIcon className="ml-1 h-4 w-4" />
                          </>
                        )}
                      </button>
                    )}
                  </>
                ) : (
                  <span className="text-gray-500 italic">
                    No bio yet. Tell us your story!
                  </span>
                )}
              </div>
              {user?.bio && (
                <div className={classNames(
                  "mt-4 text-sm px-3 py-2 rounded-md",
                  getBioStatus(user.bio.length).bgColor,
                  getBioStatus(user.bio.length).color
                )}>
                  {getBioStatus(user.bio.length).message}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 