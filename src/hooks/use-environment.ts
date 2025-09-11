'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'

interface EnvironmentVariable {
  key: string
  value: string
}

interface SetEnvironmentData {
  key: string
  value: string
}

interface ApiResponse<T> {
  status: string
  data: T
}

// Get environment variables
export function useEnvironmentVariables() {
  return useQuery({
    queryKey: ['environment'],
    queryFn: async (): Promise<Record<string, string>> => {
      const response =
        await apiClient.get<ApiResponse<Record<string, string>>>(
          '/api/environment'
        )
      return response.data
    },
  })
}

// Set environment variable
export function useSetEnvironmentVariable() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (envData: SetEnvironmentData): Promise<void> => {
      await apiClient.post('/api/environment', envData)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['environment'] })
    },
  })
}

// Delete environment variable
export function useDeleteEnvironmentVariable() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (key: string): Promise<void> => {
      await apiClient.delete(`/api/environment/${encodeURIComponent(key)}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['environment'] })
    },
  })
}
