'use client'

import { runtimeConfig } from '@/lib/runtime-config'
import { useState } from 'react'
import { useSession } from 'next-auth/react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useTools, useFiles } from '@/hooks/use-api'
import { useTokens } from '@/hooks/use-tokens'
import {
  Activity,
  FileText,
  Wrench,
  Clock,
  Database,
  Wifi,
  Server,
  Copy,
  Settings,
} from 'lucide-react'

export default function DashboardPage() {
  const [selectedTokenId, setSelectedTokenId] = useState<string>('')
  const [copied, setCopied] = useState(false)
  const { data: session } = useSession()
  const { data: tools, isLoading: toolsLoading, error: toolsError } = useTools()
  const { data: files, isLoading: filesLoading, error: filesError } = useFiles()
  const { data: tokens, isLoading: tokensLoading } = useTokens()

  const toolCount = Array.isArray((tools as any)?.data)
    ? (tools as any).data.length
    : 0
  const fileCount = Array.isArray((files as any)?.data)
    ? (files as any).data.length
    : 0

  const selectedToken = tokens?.find((token) => token.token === selectedTokenId)

  const generateMcpConfig = () => {
    if (!selectedToken) return ''

    const baseUrl =
      runtimeConfig.getApiUrlDisplay() ||
      runtimeConfig.getApiUrl() ||
      'http://localhost:3000'
    const apiUrl = `${baseUrl}/sse`

    return JSON.stringify(
      {
        mcpServers: {
          'MiloMCP Studio': {
            type: 'sse',
            url: apiUrl,
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${selectedToken.token}`,
            },
          },
        },
      },
      null,
      2
    )
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          Welcome back, {session?.user?.name}!
        </h2>
        <p className="text-muted-foreground">
          Here&apos;s what&apos;s happening with your MiloMCP workspace.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Sessions
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground">
              Current active session
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Available Tools
            </CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {toolsLoading ? '...' : toolsError ? '!' : toolCount}
            </div>
            <p className="text-xs text-muted-foreground">
              {toolsError ? 'Error loading tools' : 'Tools ready for use'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Files in Workspace
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filesLoading ? '...' : filesError ? '!' : fileCount}
            </div>
            <p className="text-xs text-muted-foreground">
              {filesError ? 'Error loading files' : 'Total workspace files'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Activity</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2h</div>
            <p className="text-xs text-muted-foreground">2 hours ago</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              MCP Server Configuration
            </CardTitle>
            <CardDescription>
              Generate configuration for MCP clients like Claude Desktop
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select API Token:</label>
              {tokensLoading ? (
                <div className="h-10 bg-muted rounded animate-pulse" />
              ) : !tokens || tokens.length === 0 ? (
                <div className="text-sm text-muted-foreground p-3 border rounded bg-muted/50">
                  No API tokens available. Create one in the{' '}
                  <a
                    href="/dashboard/tokens"
                    className="text-primary hover:underline"
                  >
                    Tokens page
                  </a>{' '}
                  first.
                </div>
              ) : (
                <Select
                  value={selectedTokenId}
                  onValueChange={setSelectedTokenId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an API token..." />
                  </SelectTrigger>
                  <SelectContent>
                    {tokens.map((token) => (
                      <SelectItem key={token.token} value={token.token}>
                        {token.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {selectedToken && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Configuration:</label>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(generateMcpConfig())}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    {copied ? 'Copied!' : 'Copy'}
                  </Button>
                </div>
                <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
                  <code>{generateMcpConfig()}</code>
                </pre>
                <p className="text-xs text-muted-foreground">
                  Add this configuration to your Claude Desktop settings at{' '}
                  <code className="bg-muted px-1 py-0.5 rounded text-xs">
                    ~/Library/Application
                    Support/Claude/claude_desktop_config.json
                  </code>{' '}
                  (macOS) or{' '}
                  <code className="bg-muted px-1 py-0.5 rounded text-xs">
                    %APPDATA%\Claude\claude_desktop_config.json
                  </code>{' '}
                  (Windows)
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Your latest actions in the workspace
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <div>
                  <p className="text-sm font-medium">Executed file_read tool</p>
                  <p className="text-xs text-muted-foreground">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <div>
                  <p className="text-sm font-medium">Created new workspace</p>
                  <p className="text-xs text-muted-foreground">5 hours ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-orange-500 rounded-full" />
                <div>
                  <p className="text-sm font-medium">Updated API token</p>
                  <p className="text-xs text-muted-foreground">1 day ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>
              Current status of MiloMCP services
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Server className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">API Server</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-sm text-muted-foreground">Online</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Wifi className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">WebSocket</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-sm text-muted-foreground">
                    Connected
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Database className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Database</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-sm text-muted-foreground">Healthy</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
