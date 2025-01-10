interface FetchOptions extends RequestInit {
  requireAuth?: boolean;
  maxRetries?: number;
  retryDelay?: number;
}

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export function useApi() {
  const fetchWithAuth = async (endpoint: string, options: FetchOptions = {}) => {
    const { 
      requireAuth = true, 
      headers = {}, 
      maxRetries = 3,    // Add retry configuration
      retryDelay = 1000, // 1 second delay between retries
      ...rest 
    } = options;

    // Build base headers
    const requestHeaders: HeadersInit = {
      ...headers,
    };

    if (!(options.body instanceof FormData)) {
      requestHeaders['Content-Type'] = 'application/json';
    }

    const token = localStorage.getItem('authToken');
    if (requireAuth && token) {
      requestHeaders.Authorization = `Bearer ${token}`;
    }

    let lastError: Error | null = null;
    
    // Add retry logic
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const response = await fetch(`/api${endpoint}`, {
          headers: requestHeaders,
          ...rest,
        });

        // Handle non-JSON responses
        const contentType = response.headers.get('content-type');
        if (!contentType?.includes('application/json')) {
          if (!response.ok) {
            throw new ApiError(response.status, 'Network response was not ok');
          }
          return response;
        }

        // Parse JSON response
        const data = await response.json();

        // Handle API errors
        if (!response.ok) {
          throw new ApiError(response.status, data.error || 'Something went wrong');
        }

        return data;
      } catch (error) {
        lastError = error as Error;
        
        // If this was the last attempt, throw the error
        if (attempt === maxRetries - 1) {
          throw lastError;
        }
        
        // Wait before retrying
        await sleep(retryDelay * (attempt + 1));
      }
    }
  };

  return { fetchWithAuth };
} 