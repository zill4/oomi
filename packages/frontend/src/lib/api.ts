interface FetchOptions extends RequestInit {
  requireAuth?: boolean
}

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

// Helper function to get token from localStorage
const getAuthToken = () => localStorage.getItem('authToken')

export function useApi() {
  const fetchWithAuth = async (endpoint: string, options: FetchOptions = {}) => {
    const { requireAuth = true, headers = {}, ...rest } = options

    // Build base headers
    const requestHeaders: HeadersInit = {
      ...headers,
    }

    // Only add Content-Type: application/json if we're not sending FormData
    if (!(options.body instanceof FormData)) {
      requestHeaders['Content-Type'] = 'application/json'
    }

    // Get token directly from localStorage
    const token = getAuthToken()

    // Add auth header if required and token exists
    if (requireAuth && token) {
      requestHeaders.Authorization = `Bearer ${token}`
    }

    const response = await fetch(`/api${endpoint}`, {
      headers: requestHeaders,
      ...rest,
    })

    // Handle non-JSON responses
    const contentType = response.headers.get('content-type')
    if (!contentType?.includes('application/json')) {
      if (!response.ok) {
        throw new ApiError(response.status, 'Network response was not ok')
      }
      return response
    }

    // Parse JSON response
    const data = await response.json()

    // Handle API errors
    if (!response.ok) {
      throw new ApiError(response.status, data.error || 'Something went wrong')
    }

    return data
  }

  return { fetchWithAuth }
} 