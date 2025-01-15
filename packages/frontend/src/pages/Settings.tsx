import { useState } from 'react'
import { Switch } from '@headlessui/react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { Dialog } from '@headlessui/react'
import { toast } from 'react-hot-toast'

export default function Settings() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [notifications, setNotifications] = useState({
    news: false,
    jobs: false,
    messages: false,
    networking: false
  })
  const [message, setMessage] = useState('')

  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const handleDeleteAccount = async () => {
    try {
      const response = await fetch('/api/auth/delete-account', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to delete account')
      }

      logout()
      toast.success('Account deleted successfully')
      navigate('/')
    } catch (error) {
      console.error('Delete account error:', error)
      toast.error('Failed to delete account')
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* News & Updates */}
      {/* <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium text-gray-900">News & Updates</h2>
            <p className="text-sm text-gray-500">
              Stay informed about the latest news and updates from CareerCraft.
            </p>
          </div>
          <Switch
            checked={notifications.news}
            onChange={() => handleNotificationChange('news')}
            className={`${
              notifications.news ? 'bg-seafoam-500' : 'bg-gray-200'
            } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none`}
          >
            <span className={`${
              notifications.news ? 'translate-x-6' : 'translate-x-1'
            } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
          </Switch>
        </div>
      </div> */}

      {/* Job Notifications */}
      {/* <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium text-gray-900">Job</h2>
            <p className="text-sm text-gray-500">
              Receive notifications for new job postings that match your profile.
            </p>
          </div>
          <Switch
            checked={notifications.jobs}
            onChange={() => handleNotificationChange('jobs')}
            className={`${
              notifications.jobs ? 'bg-seafoam-500' : 'bg-gray-200'
            } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none`}
          >
            <span className={`${
              notifications.jobs ? 'translate-x-6' : 'translate-x-1'
            } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
          </Switch>
        </div>
      </div> */}

      {/* Message Notifications */}
      {/* <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium text-gray-900">Message</h2>
            <p className="text-sm text-gray-500">
              Receive notifications for new messages from recruiters and connections.
            </p>
          </div>
          <Switch
            checked={notifications.messages}
            onChange={() => handleNotificationChange('messages')}
            className={`${
              notifications.messages ? 'bg-seafoam-500' : 'bg-gray-200'
            } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none`}
          >
            <span className={`${
              notifications.messages ? 'translate-x-6' : 'translate-x-1'
            } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
          </Switch>
        </div>
      </div> */}

      {/* Networking Notifications */}
      {/* <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium text-gray-900">Networking</h2>
            <p className="text-sm text-gray-500">
              Get notified about new networking requests from industry professionals.
            </p>
          </div>
          <Switch
            checked={notifications.networking}
            onChange={() => handleNotificationChange('networking')}
            className={`${
              notifications.networking ? 'bg-seafoam-500' : 'bg-gray-200'
            } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none`}
          >
            <span className={`${
              notifications.networking ? 'translate-x-6' : 'translate-x-1'
            } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
          </Switch>
        </div>
      </div> */}

      {/* Subscription */}
      {/* <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium text-gray-900">Subscription</h2>
            <p className="text-sm text-gray-500">
              Update billing and address information.
            </p>
          </div>
          <button
            className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
          >
            Update
          </button>
        </div>
      </div> */}

      {/* Account Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Account Actions</h2>
        <div className="flex space-x-4">
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
          >
            Log Out
          </button>
          <button
            onClick={() => setIsDeleteModalOpen(true)}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            Delete Account
          </button>
        </div>
      </div>

      {/* Delete Account Modal */}
      <Dialog
        open={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-sm rounded-lg bg-white p-6">
            <Dialog.Title className="text-lg font-medium text-gray-900">
              Delete Account
            </Dialog.Title>
            <Dialog.Description className="mt-2 text-sm text-gray-500">
              Are you sure you want to delete your account? This action cannot be undone.
            </Dialog.Description>

            <div className="mt-4 flex space-x-4">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors"
              >
                Yes, Delete Account
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Contact */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Contact</h2>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message here.."
          className="w-full h-32 p-3 border border-gray-300 rounded-md focus:ring-seafoam-500 focus:border-seafoam-500"
        />
        <button
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          Send
        </button>
      </div>
    </div>
  )
} 