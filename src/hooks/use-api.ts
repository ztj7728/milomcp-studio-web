import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import { executeToolViaJsonRpc } from '@/lib/jsonrpc'

// Query keys
export const queryKeys = {
  user: ['user'] as const,
  users: ['users'] as const,
  tools: ['tools'] as const,
  workspace: ['workspace'] as const,
  files: (path?: string) => ['files', path] as const,
  executionLogs: (toolName?: string) => ['execution-logs', toolName] as const,
  tokens: ['tokens'] as const,
}

// User profile query
export function useUser() {
  return useQuery({
    queryKey: queryKeys.user,
    queryFn: () => apiClient.get('/api/me'),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Users list query (admin only)
export function useUsers() {
  return useQuery({
    queryKey: queryKeys.users,
    queryFn: () => apiClient.get('/api/users'),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

// Tools list query
export function useTools() {
  return useQuery({
    queryKey: queryKeys.tools,
    queryFn: () => apiClient.get('/api/tools'),
    staleTime: 10 * 60 * 1000, // 10 minutes (tools don't change often)
  })
}

// Workspace files query
export function useFiles(path?: string) {
  return useQuery({
    queryKey: queryKeys.files(path),
    queryFn: () =>
      apiClient.get(
        `/api/workspace/files${path ? `?path=${encodeURIComponent(path)}` : ''}`
      ),
    staleTime: 30 * 1000, // 30 seconds
  })
}

// Mutations
export function useExecuteTool() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      toolName,
      parameters,
      apiToken,
    }: {
      toolName: string
      parameters: Record<string, any>
      apiToken: string
    }) => {
      if (!apiToken) {
        throw new Error(
          'No API token provided. Please select an API token first.'
        )
      }

      const result = await executeToolViaJsonRpc(toolName, parameters, apiToken)

      if (!result.success) {
        throw new Error(result.error || 'Tool execution failed')
      }

      return result.result
    },
    onSuccess: () => {
      // Invalidate and refetch any relevant queries
      queryClient.invalidateQueries({ queryKey: queryKeys.workspace })
    },
  })
}

export function useCreateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userData: {
      username: string
      email: string
      password: string
      isAdmin?: boolean
    }) => apiClient.post('/api/users', userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users })
    },
  })
}

export function useDeleteUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userId: string) => apiClient.delete(`/api/users/${userId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users })
    },
  })
}

// Execution logs query
export function useExecutionLogs(toolName?: string) {
  return useQuery({
    queryKey: queryKeys.executionLogs(toolName),
    queryFn: () =>
      apiClient.get(
        `/api/execution-logs${toolName ? `?tool=${encodeURIComponent(toolName)}` : ''}`
      ),
    staleTime: 30 * 1000, // 30 seconds
  })
}

// API Tokens management
export function useApiTokens() {
  return useQuery({
    queryKey: queryKeys.tokens,
    queryFn: () => apiClient.get('/api/tokens'),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useCreateApiToken() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (tokenData: { name: string; permissions?: string[] }) =>
      apiClient.post('/api/tokens', tokenData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tokens })
    },
  })
}

// Workspace file operations
export function useFileContent(filename: string) {
  return useQuery({
    queryKey: ['file-content', filename],
    queryFn: () =>
      apiClient.get(`/api/workspace/files/${encodeURIComponent(filename)}`),
    enabled: !!filename,
    staleTime: 30 * 1000, // 30 seconds
  })
}

export function useSaveFile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      filename,
      content,
    }: {
      filename: string
      content: string
    }) =>
      apiClient.put(
        `/api/workspace/files/${encodeURIComponent(filename)}`,
        content,
        {
          headers: {
            'Content-Type': 'text/plain',
          },
        }
      ),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['file-content', variables.filename],
      })
      queryClient.invalidateQueries({ queryKey: queryKeys.files() })
    },
  })
}

export function useUploadFiles() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ files }: { files: FileList }) => {
      const formData = new FormData()
      Array.from(files).forEach((file) => {
        formData.append('files', file)
      })

      return apiClient.request('/api/workspace/files/upload', {
        method: 'POST',
        body: formData,
        // Don't set any headers for FormData, let browser set Content-Type with boundary
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.files() })
    },
  })
}

export function useDownloadFile() {
  return useMutation({
    mutationFn: async (filePath: string) => {
      const response = await fetch(
        `/api/workspace/files/download?path=${encodeURIComponent(filePath)}`
      )
      if (!response.ok) {
        throw new Error('Failed to download file')
      }
      return response.blob()
    },
  })
}

export function useCreateFolder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ folderPath, name }: { folderPath: string; name: string }) =>
      apiClient.post('/api/workspace/folders', { path: folderPath, name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.files() })
    },
  })
}

export function useDeleteFile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (filename: string) =>
      apiClient.delete(`/api/workspace/files/${encodeURIComponent(filename)}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.files() })
    },
  })
}

export function useRenameFile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ oldPath, newPath }: { oldPath: string; newPath: string }) =>
      apiClient.put('/api/workspace/files/rename', { oldPath, newPath }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.files() })
    },
  })
}

export function useSearchFiles(query: string) {
  return useQuery({
    queryKey: ['search-files', query],
    queryFn: () =>
      apiClient.get(`/api/workspace/search?q=${encodeURIComponent(query)}`),
    enabled: query.length > 2, // Only search if query is at least 3 characters
    staleTime: 30 * 1000, // 30 seconds
  })
}
