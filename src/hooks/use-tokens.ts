'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'

interface ApiToken {
  token: string // The actual token string (used for deletion)
  name: string
  permissions: string // JSON string that needs to be parsed
  createdAt: string
  lastUsedAt?: string | null
}

interface CreateTokenData {
  name: string
  permissions?: string[]
}

interface CreateTokenResponse {
  id: string
  name: string
  token: string
  permissions: string[]
  createdAt: string
}

interface ApiResponse<T> {
  status: string
  data: T
}

// Get API tokens
export function useTokens() {
  return useQuery({
    queryKey: ['tokens'],
    queryFn: async (): Promise<ApiToken[]> => {
      const response =
        await apiClient.get<ApiResponse<ApiToken[]>>('/api/tokens')
      return Array.isArray(response.data) ? response.data : []
    },
  })
}

// Create API token
export function useCreateToken() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (
      tokenData: CreateTokenData
    ): Promise<CreateTokenResponse> => {
      const response = await apiClient.post<ApiResponse<CreateTokenResponse>>(
        '/api/tokens',
        tokenData
      )
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tokens'] })
    },
  })
}

// Delete API token
export function useDeleteToken() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (tokenString: string): Promise<void> => {
      await apiClient.delete(`/api/tokens/${tokenString}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tokens'] })
    },
  })
}
