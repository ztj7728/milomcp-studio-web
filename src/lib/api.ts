// API Client that routes all requests through Next.js proxy
// This avoids CORS issues and keeps backend URLs secure

class ApiClient {
  // All requests go through the Next.js proxy - no direct backend calls
  private readonly proxyBaseUrl = '/api/proxy'

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.proxyBaseUrl}${endpoint}`

    // Create headers object
    const headers: Record<string, string> = {}

    // Check if Content-Type is already set
    let hasCustomContentType = false
    if (options.headers) {
      if (Array.isArray(options.headers)) {
        // Handle Headers array format
        for (const [key, value] of options.headers) {
          if (key.toLowerCase() === 'content-type') {
            hasCustomContentType = true
          }
          headers[key] = value
        }
      } else if (options.headers instanceof Headers) {
        // Handle Headers object
        options.headers.forEach((value, key) => {
          if (key.toLowerCase() === 'content-type') {
            hasCustomContentType = true
          }
          headers[key] = value
        })
      } else {
        // Handle plain object
        Object.entries(options.headers).forEach(([key, value]) => {
          if (key.toLowerCase() === 'content-type') {
            hasCustomContentType = true
          }
          if (typeof value === 'string') {
            headers[key] = value
          }
        })
      }
    }

    // Default to JSON content type if not already set and body is not FormData
    if (!hasCustomContentType && !(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json'
    }

    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (!response.ok) {
      if (response.status === 401) {
        // Redirect to login for authentication issues
        console.log('API returned 401, redirecting to login...')
        window.location.href = '/login'
        throw new Error('Authentication required')
      }

      if (response.status === 403) {
        // Forbidden - likely refresh token expired
        console.log('API returned 403, redirecting to login...')
        window.location.href = '/login'
        throw new Error('Session expired')
      }

      const error = await response.text()
      throw new Error(error || `HTTP ${response.status}`)
    }

    // Handle different response types
    const contentType = response.headers.get('content-type')
    if (contentType?.includes('application/json')) {
      return response.json()
    } else {
      return response.text() as T
    }
  }

  // Convenience methods
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T>(
    endpoint: string,
    data?: unknown,
    options?: RequestInit
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body:
        typeof data === 'string'
          ? data
          : data
            ? JSON.stringify(data)
            : undefined,
      ...options,
    })
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }
}

export const apiClient = new ApiClient()
