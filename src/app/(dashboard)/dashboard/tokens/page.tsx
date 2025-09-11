'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Textarea } from '@/components/ui/textarea'
import {
  Plus,
  MoreHorizontal,
  Copy,
  Trash2,
  Key,
  Clock,
  Shield,
} from 'lucide-react'
import { useTokens, useCreateToken, useDeleteToken } from '@/hooks/use-tokens'
import { useTools } from '@/hooks/use-api'

export default function TokensPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [newTokenName, setNewTokenName] = useState('')
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])
  const [allPermissions, setAllPermissions] = useState(false)
  const [createdToken, setCreatedToken] = useState<string | null>(null)

  const {
    data: tokens,
    isLoading: tokensLoading,
    error: tokensError,
  } = useTokens()

  // Tokens loaded successfully
  const { data: tools, isLoading: toolsLoading } = useTools()
  const createTokenMutation = useCreateToken()
  const deleteTokenMutation = useDeleteToken()

  const handleCreateToken = async () => {
    if (!newTokenName.trim()) return

    try {
      const tokenData = {
        name: newTokenName.trim(),
        permissions: allPermissions ? ['*'] : selectedPermissions,
      }

      const response = await createTokenMutation.mutateAsync(tokenData)
      setCreatedToken(response.token)

      // Reset form
      setNewTokenName('')
      setSelectedPermissions([])
      setAllPermissions(false)
    } catch (error) {
      console.error('Failed to create token:', error)
    }
  }

  const handleDeleteToken = async (tokenString: string) => {
    if (!tokenString || tokenString.trim() === '') {
      console.error('Invalid token string:', tokenString)
      return
    }

    if (
      !confirm(
        'Are you sure you want to delete this token? This action cannot be undone.'
      )
    ) {
      return
    }

    try {
      await deleteTokenMutation.mutateAsync(tokenString)
    } catch (error) {
      console.error('Failed to delete token:', error)
      alert(
        `Failed to delete token: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  const copyToken = (token: string) => {
    navigator.clipboard.writeText(token)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const closeCreateDialog = () => {
    setIsCreateOpen(false)
    setCreatedToken(null)
    setNewTokenName('')
    setSelectedPermissions([])
    setAllPermissions(false)
  }

  if (tokensLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p className="text-sm text-gray-500">Loading tokens...</p>
        </div>
      </div>
    )
  }

  if (tokensError) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-red-500">Failed to load tokens</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            API Tokens
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your API tokens for tool execution
          </p>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Token
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {createdToken
                  ? 'Token Created Successfully'
                  : 'Create New API Token'}
              </DialogTitle>
              <DialogDescription>
                {createdToken
                  ? "Save this token securely. You won't be able to see it again."
                  : 'Create a new API token for tool execution.'}
              </DialogDescription>
            </DialogHeader>

            {createdToken ? (
              <div className="space-y-4">
                <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <p className="text-sm text-green-800 dark:text-green-200 mb-2">
                    Your new API token:
                  </p>
                  <div className="flex items-center space-x-2">
                    <code className="flex-1 p-2 bg-white dark:bg-gray-800 border rounded text-sm font-mono break-all">
                      {createdToken}
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToken(createdToken)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={closeCreateDialog}>Done</Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="token-name">Token Name</Label>
                  <Input
                    id="token-name"
                    value={newTokenName}
                    onChange={(e) => setNewTokenName(e.target.value)}
                    placeholder="Enter token name..."
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Permissions</Label>
                  <div className="mt-2 space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="all-permissions"
                        checked={allPermissions}
                        onCheckedChange={(checked) => {
                          setAllPermissions(!!checked)
                          if (checked) {
                            setSelectedPermissions([])
                          }
                        }}
                      />
                      <Label
                        htmlFor="all-permissions"
                        className="text-sm font-medium"
                      >
                        All tools (*)
                      </Label>
                    </div>

                    {!allPermissions && (
                      <div className="max-h-32 overflow-y-auto space-y-2 pl-6">
                        {toolsLoading ? (
                          <div className="text-sm text-gray-500">
                            Loading tools...
                          </div>
                        ) : Array.isArray((tools as any)?.data) &&
                          (tools as any).data.length > 0 ? (
                          (tools as any).data.map((tool: any) => (
                            <div
                              key={tool.name}
                              className="flex items-center space-x-2"
                            >
                              <Checkbox
                                id={`tool-${tool.name}`}
                                checked={selectedPermissions.includes(
                                  tool.name
                                )}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setSelectedPermissions([
                                      ...selectedPermissions,
                                      tool.name,
                                    ])
                                  } else {
                                    setSelectedPermissions(
                                      selectedPermissions.filter(
                                        (p) => p !== tool.name
                                      )
                                    )
                                  }
                                }}
                              />
                              <Label
                                htmlFor={`tool-${tool.name}`}
                                className="text-sm"
                              >
                                {tool.name}
                              </Label>
                            </div>
                          ))
                        ) : (
                          <div className="text-sm text-gray-500">
                            No tools available
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={closeCreateDialog}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateToken}
                    disabled={
                      !newTokenName.trim() ||
                      (!allPermissions && selectedPermissions.length === 0) ||
                      createTokenMutation.isPending
                    }
                  >
                    {createTokenMutation.isPending
                      ? 'Creating...'
                      : 'Create Token'}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Tokens Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Your API Tokens
          </CardTitle>
          <CardDescription>
            {tokens?.length === 0
              ? "You haven't created any API tokens yet."
              : `You have ${tokens?.length} API token(s).`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {tokens?.length === 0 ? (
            <div className="text-center py-8">
              <Key className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No API tokens found</p>
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Token
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Last Used</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tokens && tokens.length > 0 ? (
                  tokens.map((token, index) => {
                    // Parse permissions JSON string
                    let parsedPermissions: string[] = []
                    try {
                      parsedPermissions = JSON.parse(token.permissions || '[]')
                    } catch (e) {
                      console.warn(
                        'Failed to parse permissions for token:',
                        token.name,
                        e
                      )
                      parsedPermissions = []
                    }

                    return (
                      <TableRow
                        key={token.token || token.name || `token-${index}`}
                      >
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4 text-blue-500" />
                            <span className="font-medium">{token.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {parsedPermissions.includes('*') ? (
                            <Badge variant="secondary">All Tools</Badge>
                          ) : (
                            <div className="flex flex-wrap gap-1">
                              {parsedPermissions
                                .slice(0, 3)
                                .map((permission) => (
                                  <Badge
                                    key={permission}
                                    variant="outline"
                                    className="text-xs"
                                  >
                                    {permission}
                                  </Badge>
                                ))}
                              {parsedPermissions.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{parsedPermissions.length - 3} more
                                </Badge>
                              )}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <Clock className="h-3 w-3" />
                            {formatDate(token.createdAt)}
                          </div>
                        </TableCell>
                        <TableCell>
                          {token.lastUsedAt ? (
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                              <Clock className="h-3 w-3" />
                              {formatDate(token.lastUsedAt)}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-500">Never</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() =>
                                  token.token && handleDeleteToken(token.token)
                                }
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Token
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <div className="text-gray-500">
                        {tokensLoading
                          ? 'Loading tokens...'
                          : 'No tokens found or failed to load'}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
