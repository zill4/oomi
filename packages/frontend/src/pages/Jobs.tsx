import { useState } from 'react'
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/20/solid'
import { DocumentArrowDownIcon } from '@heroicons/react/24/outline'

interface Job {
  id: string
  company: string
  title: string
  dateApplied: string
  status: 'Pending' | 'In Review' | 'Rejected' | 'Accepted'
  expanded: boolean
}

export default function Jobs() {
  const [jobs, setJobs] = useState<Job[]>([
    {
      id: '1',
      company: 'Tech Corp',
      title: 'Software Developer',
      dateApplied: 'Oct 12, 2023',
      status: 'Pending',
      expanded: false
    },
    {
      id: '2',
      company: 'Innovatech',
      title: 'Product Manager',
      dateApplied: 'Oct 10, 2023',
      status: 'In Review',
      expanded: false
    },
    {
      id: '3',
      company: 'Creative Solutions',
      title: 'Graphic Designer',
      dateApplied: 'Oct 8, 2023',
      status: 'Rejected',
      expanded: false
    },
    {
      id: '4',
      company: 'Global Systems',
      title: 'Frontend Developer',
      dateApplied: 'Oct 5, 2023',
      status: 'Pending',
      expanded: false
    },
    {
      id: '5',
      company: 'DataFlow Inc',
      title: 'Data Scientist',
      dateApplied: 'Oct 3, 2023',
      status: 'In Review',
      expanded: false
    }
  ])

  const toggleExpand = (id: string) => {
    setJobs(jobs.map(job => 
      job.id === id ? { ...job, expanded: !job.expanded } : job
    ))
  }

  const getStatusColor = (status: Job['status']) => {
    switch (status) {
      case 'Pending': return 'text-seafoam-500'
      case 'In Review': return 'text-yellow-500'
      case 'Rejected': return 'text-red-500'
      case 'Accepted': return 'text-blue-500'
      default: return 'text-gray-500'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Job Applications</h1>
        <button
          className="px-4 py-2 bg-seafoam-500 text-white rounded-md hover:bg-seafoam-400 transition-colors"
          onClick={() => console.log('Generate new application')}
        >
          Generate New Application
        </button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="w-8 py-3 pl-4"></th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Company
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date Applied
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Generated Resume
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Generated Cover Letter
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {jobs.map((job) => (
              <>
                <tr key={job.id} className="hover:bg-gray-50">
                  <td className="py-4 pl-4">
                    <button onClick={() => toggleExpand(job.id)}>
                      {job.expanded ? (
                        <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronRightIcon className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {job.company}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {job.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {job.dateApplied}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-500">
                    <button className="hover:underline">View</button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-500">
                    <button className="hover:underline">View</button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`${getStatusColor(job.status)}`}>
                      {job.status}
                    </span>
                  </td>
                </tr>
                {job.expanded && (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 bg-gray-50">
                      <div className="grid grid-cols-2 gap-6">
                        {/* Resume Preview */}
                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="font-medium">Resume Preview</h3>
                            <button className="text-blue-500 hover:text-blue-600">
                              <DocumentArrowDownIcon className="h-5 w-5" />
                            </button>
                          </div>
                          <div className="h-32 bg-gray-100 rounded flex items-center justify-center">
                            Resume Preview Content
                          </div>
                        </div>

                        {/* Cover Letter Preview */}
                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="font-medium">Cover Letter Preview</h3>
                            <button className="text-blue-500 hover:text-blue-600">
                              <DocumentArrowDownIcon className="h-5 w-5" />
                            </button>
                          </div>
                          <div className="h-32 bg-gray-100 rounded flex items-center justify-center">
                            Cover Letter Preview Content
                          </div>
                        </div>

                        {/* Status Selector */}
                        <div className="col-span-2 mt-4">
                          <label className="block text-sm font-medium text-gray-700">
                            Update Status
                          </label>
                          <select
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-seafoam-500 focus:border-seafoam-500 sm:text-sm rounded-md"
                            value={job.status}
                            onChange={(e) => {
                              setJobs(jobs.map(j => 
                                j.id === job.id 
                                  ? { ...j, status: e.target.value as Job['status'] } 
                                  : j
                              ))
                            }}
                          >
                            <option value="Pending">Pending</option>
                            <option value="In Review">In Review</option>
                            <option value="Rejected">Rejected</option>
                            <option value="Accepted">Accepted</option>
                          </select>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
} 