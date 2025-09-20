'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
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
  const t = useTranslations('tokens')

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

    if (!confirm(t('confirmDelete'))) {
      return
    }

    try {
      await deleteTokenMutation.mutateAsync(tokenString)
    } catch (error) {
      console.error('Failed to delete token:', error)
      alert(
        t('deleteTokenFailed', {
          error: error instanceof Error ? error.message : 'Unknown error',
        })
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
          <p className="text-sm text-gray-500">{t('loadingTokens')}</p>
        </div>
      </div>
    )
  }

  if (tokensError) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-red-500">{t('failedToLoad')}</p>
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
            {t('title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">{t('subtitle')}</p>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {t('createToken')}
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {createdToken ? t('tokenCreatedSuccess') : t('createNewToken')}
              </DialogTitle>
              <DialogDescription>
                {createdToken
                  ? t('saveTokenSecurely')
                  : t('createTokenDescription')}
              </DialogDescription>
            </DialogHeader>

            {createdToken ? (
              <div className="space-y-4">
                <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <p className="text-sm text-green-800 dark:text-green-200 mb-2">
                    {t('yourNewToken')}
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
                  <Button onClick={closeCreateDialog}>{t('done')}</Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="token-name">{t('tokenName')}</Label>
                  <Input
                    id="token-name"
                    value={newTokenName}
                    onChange={(e) => setNewTokenName(e.target.value)}
                    placeholder={t('enterTokenName')}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>{t('permissions')}</Label>
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
                        {t('allTools')}
                      </Label>
                    </div>

                    {!allPermissions && (
                      <div className="max-h-32 overflow-y-auto space-y-2 pl-6">
                        {toolsLoading ? (
                          <div className="text-sm text-gray-500">
                            {t('loadingTools')}
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
                            {t('noToolsAvailable')}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={closeCreateDialog}>
                    {t('cancel')}
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
                      ? t('creating')
                      : t('createTokenButton')}
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
            {t('yourApiTokens')}
          </CardTitle>
          <CardDescription>
            {tokens?.length === 0
              ? t('noTokensCreated')
              : t('tokenCount', { count: tokens?.length || 0 })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {tokens?.length === 0 ? (
            <div className="text-center py-8">
              <Key className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">{t('noApiTokensFound')}</p>
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                {t('createFirstToken')}
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('name')}</TableHead>
                  <TableHead>{t('permissions')}</TableHead>
                  <TableHead>{t('created')}</TableHead>
                  <TableHead>{t('lastUsed')}</TableHead>
                  <TableHead className="w-[100px]">{t('actions')}</TableHead>
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
                            <Badge variant="secondary">
                              {t('allToolsPermission')}
                            </Badge>
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
                                  {t('morePermissions', {
                                    count: parsedPermissions.length - 3,
                                  })}
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
                            <span className="text-sm text-gray-500">
                              {t('never')}
                            </span>
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
                              <DropdownMenuLabel>
                                {t('actions')}
                              </DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() =>
                                  token.token && handleDeleteToken(token.token)
                                }
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                {t('deleteToken')}
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
                          ? t('loadingTokens')
                          : t('noTokensFound')}
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
