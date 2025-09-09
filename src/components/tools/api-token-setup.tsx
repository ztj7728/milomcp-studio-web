'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useCreateApiToken, useApiTokens } from '@/hooks/use-api'
import {
  getStoredApiToken,
  setStoredApiToken,
  hasStoredApiToken,
} from '@/lib/token-storage'
import { Key, Plus, CheckCircle, AlertCircle, Copy } from 'lucide-react'

interface ApiTokenSetupProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ApiTokenSetup({ open, onOpenChange }: ApiTokenSetupProps) {
  const [tokenName, setTokenName] = useState('')
  const [createdToken, setCreatedToken] = useState<string>('')
  const [currentToken, setCurrentToken] = useState<string>('')
  const [showTokenForm, setShowTokenForm] = useState(false)

  const { data: tokens, refetch: refetchTokens } = useApiTokens()
  const createTokenMutation = useCreateApiToken()

  useEffect(() => {
    const stored = getStoredApiToken()
    setCurrentToken(stored || '')
  }, [])

  const handleCreateToken = async () => {
    if (!tokenName.trim()) return

    try {
      const result = await createTokenMutation.mutateAsync({
        name: tokenName,
        permissions: ['*'], // Allow all tools for now
      })

      // Store the new token
      const newToken = (result as any).data?.token
      if (newToken) {
        setStoredApiToken(newToken)
        setCreatedToken(newToken)
        setCurrentToken(newToken)
      }

      setTokenName('')
      setShowTokenForm(false)
      refetchTokens()
    } catch (error: any) {
      console.error('Failed to create token:', error)
      // Handle error (you might want to add a toast notification)
    }
  }

  const handleUseExistingToken = () => {
    const token = prompt('Enter your API token:')
    if (token && token.trim()) {
      setStoredApiToken(token.trim())
      setCurrentToken(token.trim())
      onOpenChange(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const tokensList = Array.isArray((tokens as any)?.data)
    ? (tokens as any).data
    : []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            API Token Setup
          </DialogTitle>
          <DialogDescription>
            Set up an API token to execute tools via JSON-RPC
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Token Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Current Status</CardTitle>
            </CardHeader>
            <CardContent>
              {currentToken ? (
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">API token configured</span>
                  <Badge variant="outline" className="text-xs">
                    {currentToken.substring(0, 8)}...
                  </Badge>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm">No API token configured</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Created Token Display */}
          {createdToken && (
            <Card className="border-green-200 bg-green-50 dark:bg-green-950">
              <CardHeader>
                <CardTitle className="text-sm text-green-800 dark:text-green-200">
                  New Token Created
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Save this token safely - you won&apos;t be able to see it
                    again:
                  </p>
                  <div className="flex items-center gap-2 p-2 bg-white dark:bg-green-900 rounded border">
                    <code className="text-sm flex-1 font-mono">
                      {createdToken}
                    </code>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(createdToken)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Existing Tokens */}
          {tokensList.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Your API Tokens</CardTitle>
                <CardDescription>
                  Existing tokens in your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {tokensList.map((token: any) => (
                    <div
                      key={token.id}
                      className="flex items-center justify-between p-2 border rounded"
                    >
                      <div>
                        <div className="text-sm font-medium">{token.name}</div>
                        <div className="text-xs text-muted-foreground">
                          Created:{' '}
                          {new Date(token.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <Badge variant="outline">
                        {Array.isArray(token.permissions) &&
                        token.permissions.includes('*')
                          ? 'All Tools'
                          : 'Limited'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Token Creation Form */}
          {showTokenForm ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Create New Token</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="tokenName">Token Name</Label>
                  <Input
                    id="tokenName"
                    placeholder="e.g., My Tool Execution Token"
                    value={tokenName}
                    onChange={(e) => setTokenName(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleCreateToken}
                    disabled={
                      !tokenName.trim() || createTokenMutation.isPending
                    }
                  >
                    {createTokenMutation.isPending
                      ? 'Creating...'
                      : 'Create Token'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowTokenForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="flex gap-2">
              <Button onClick={() => setShowTokenForm(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create New Token
              </Button>
              <Button variant="outline" onClick={handleUseExistingToken}>
                Use Existing Token
              </Button>
              {currentToken && (
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Continue
                </Button>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
