import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useApi } from '../lib/api'
import { toast } from 'react-hot-toast'
import { PencilIcon, CameraIcon } from '@heroicons/react/24/outline'
import { validateName, validateBio, ValidationError } from '../utils/validation'
import { useFileUpload } from '../hooks/useFileUpload'
import ResumeList from '../components/ResumeList'

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

  return (
    <div className="space-y-6">
      {/* Profile Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-6">Profile</h2>
        <div className="flex items-center space-x-4">
          <div className="relative group">
            <div className="w-16 h-16 rounded-full bg-seafoam-100 flex items-center justify-center overflow-hidden">
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
                <div className="w-5 h-5 border-2 border-seafoam-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-seafoam-500 rounded-full border-2 border-white flex items-center justify-center">
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
                          : 'border-gray-300 focus:border-seafoam-500 focus:ring-seafoam-500'
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
                          : 'border-gray-300 focus:border-seafoam-500 focus:ring-seafoam-500'
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
                      className="p-1 text-seafoam-500 hover:text-seafoam-400"
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
                    className="p-1 text-gray-400 hover:text-seafoam-500 transition-colors"
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

      {/* Bio Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Bio</h2>
          {!isEditingBio && (
            <button
              className="p-1.5 text-gray-400 hover:text-seafoam-500 transition-colors"
              onClick={() => setIsEditingBio(true)}
            >
              <PencilIcon className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          {isEditingBio ? (
            <div className="space-y-4">
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full min-h-[100px] p-2 border border-gray-300 rounded-md focus:border-seafoam-500 focus:ring-1 focus:ring-seafoam-500"
                placeholder="Tell us about yourself..."
              />
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
                  className="px-3 py-1.5 text-sm text-white bg-seafoam-500 rounded-md hover:bg-seafoam-400"
                  onClick={handleBioUpdate}
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <p className="whitespace-pre-wrap text-gray-700">
              {user?.bio || (
                <span className="text-gray-500 italic">
                  No bio yet. Tell us about yourself!
                </span>
              )}
            </p>
          )}
        </div>
      </div>

      {/* Resume Section - using only the ResumeList component */}
      <div className="bg-white rounded-lg shadow p-6">
        <ResumeList />
      </div>
    </div>
  )
} 