import { useState } from 'react'

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false)
  const [bio] = useState(`I am writing to express my interest in the Software Developer position listed on CareerCraft. With a solid background in computer science and extensive experience in developing robust applications, I am confident that my skills align well with the requirements of the role.

Over the past five years, I have worked on numerous projects where I successfully designed and implemented software solutions that enhanced functionality and user experience. My proficiency in languages such as JavaScript, Python, and Java, combined with my problem-solving abilities, makes me a perfect fit for your team.

I am particularly drawn to this position at your company because of your commitment to innovation and excellence. I am enthusiastic about the opportunity to contribute to your team and I am keen to further discuss how my background, skills, and certifications can contribute to the success of your organization.`)




  return (
    <div className="space-y-8">
      {/* Profile Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-6">Profile</h2>
        <div className="flex items-center space-x-4">
          <img
            src="/placeholder-avatar.jpg"
            alt="Jessica Pearson"
            className="w-16 h-16 rounded-full"
          />
          <div>
            <h3 className="text-xl font-semibold">Jessica Pearson</h3>
            <p className="text-gray-500">jessica.pearson@example.com</p>
          </div>
          <button
            className="ml-auto px-4 py-2 text-sm font-medium text-white bg-seafoam-500 rounded-md hover:bg-seafoam-400"
            onClick={() => setIsEditing(!isEditing)}
          >
            Edit Profile
          </button>
        </div>
      </div>

      {/* Resume Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Resume</h2>
          <button
            className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-400"
          >
            Upload New Resume
          </button>
        </div>
        <div className="flex items-center space-x-2 text-gray-600">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M7 3C6.44772 3 6 3.44772 6 4V16C6 16.5523 6.44772 17 7 17H13C13.5523 17 14 16.5523 14 16V7.41421C14 7.149 13.8946 6.89464 13.7071 6.70711L10.2929 3.29289C10.1054 3.10536 9.851 3 9.58579 3H7Z" />
          </svg>
          <span>Resume_TechCorp.pdf</span>
          <button className="text-gray-400 hover:text-gray-600">×</button>
        </div>
        <p className="mt-2 text-sm text-gray-500">Last uploaded: October 12, 2023</p>
      </div>

      {/* Bio Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Bio</h2>
          <button
            className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-400"
            onClick={() => setIsEditing(!isEditing)}
          >
            Edit
          </button>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="whitespace-pre-wrap text-gray-700">{bio}</p>
        </div>
      </div>
    </div>
  )
} 