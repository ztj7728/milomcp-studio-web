'use client'

import { runtimeConfig } from '@/lib/runtime-config'
import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
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
  const params = useParams()
  const locale = params.locale as string
  const { data: session } = useSession()
  const { data: tools, isLoading: toolsLoading, error: toolsError } = useTools()
  const { data: files, isLoading: filesLoading, error: filesError } = useFiles()
  const { data: tokens, isLoading: tokensLoading } = useTokens()
  const t = useTranslations('dashboard')

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
          {t('welcome', { name: session?.user?.name || 'User' })}
        </h2>
        <p className="text-muted-foreground">{t('subtitle')}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('activeSessions')}
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground">
              {t('currentActiveSession')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('availableTools')}
            </CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {toolsLoading ? '...' : toolsError ? '!' : toolCount}
            </div>
            <p className="text-xs text-muted-foreground">
              {toolsError ? t('errorLoadingTools') : t('toolsReadyForUse')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('filesInWorkspace')}
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filesLoading ? '...' : filesError ? '!' : fileCount}
            </div>
            <p className="text-xs text-muted-foreground">
              {filesError ? t('errorLoadingFiles') : t('totalWorkspaceFiles')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('lastActivity')}
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2h</div>
            <p className="text-xs text-muted-foreground">2 {t('hoursAgo')}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              {t('mcpServerConfig')}
            </CardTitle>
            <CardDescription>{t('mcpServerDescription')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t('selectApiToken')}
              </label>
              {tokensLoading ? (
                <div className="h-10 bg-muted rounded animate-pulse" />
              ) : !tokens || tokens.length === 0 ? (
                <div className="text-sm text-muted-foreground p-3 border rounded bg-muted/50">
                  {t('noApiTokens')}{' '}
                  <a
                    href={`/${locale}/dashboard/tokens`}
                    className="text-primary hover:underline"
                  >
                    {t('tokensPage')}
                  </a>{' '}
                  {t('createOne')}
                </div>
              ) : (
                <Select
                  value={selectedTokenId}
                  onValueChange={setSelectedTokenId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('chooseApiToken')} />
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
                  <label className="text-sm font-medium">
                    {t('configuration')}
                  </label>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(generateMcpConfig())}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    {copied ? t('copied') : t('copy')}
                  </Button>
                </div>
                <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
                  <code>{generateMcpConfig()}</code>
                </pre>
                <p className="text-xs text-muted-foreground">
                  {t('claudeDesktopInstructions')}{' '}
                  <code className="bg-muted px-1 py-0.5 rounded text-xs">
                    ~/Library/Application
                    Support/Claude/claude_desktop_config.json
                  </code>{' '}
                  {t('macOSPath')} {t('or')}{' '}
                  <code className="bg-muted px-1 py-0.5 rounded text-xs">
                    %APPDATA%\Claude\claude_desktop_config.json
                  </code>{' '}
                  {t('windowsPath')}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('recentActivity')}</CardTitle>
            <CardDescription>{t('latestActions')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <div>
                  <p className="text-sm font-medium">{t('executedFileRead')}</p>
                  <p className="text-xs text-muted-foreground">
                    2 {t('hoursAgo')}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <div>
                  <p className="text-sm font-medium">
                    {t('createdNewWorkspace')}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    5 {t('hoursAgo')}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-orange-500 rounded-full" />
                <div>
                  <p className="text-sm font-medium">{t('updatedApiToken')}</p>
                  <p className="text-xs text-muted-foreground">
                    1 {t('dayAgo')}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('systemStatus')}</CardTitle>
            <CardDescription>{t('mcpServicesStatus')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Server className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{t('apiServer')}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-sm text-muted-foreground">
                    {t('online')}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Wifi className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{t('webSocket')}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-sm text-muted-foreground">
                    {t('connected')}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Database className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{t('database')}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-sm text-muted-foreground">
                    {t('healthy')}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
