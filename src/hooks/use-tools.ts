'use client'

import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'

interface Tool {
  name: string
  description: string
  parameters: Record<string, any>
  required: string[]
}

interface ApiResponse<T> {
  status: string
  data: T
}

// Get available tools
export function useTools() {
  return useQuery({
    queryKey: ['tools'],
    queryFn: async (): Promise<Tool[]> => {
      const response = await apiClient.get<ApiResponse<Tool[]>>('/api/tools')
      return response.data
    },
  })
}
