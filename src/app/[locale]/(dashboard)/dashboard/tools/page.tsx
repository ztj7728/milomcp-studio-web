'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useTools } from '@/hooks/use-api'
import { ToolExecutionDialog } from '@/components/tools/tool-execution-dialog'
import { ToolDetailView } from '@/components/tools/tool-detail-view'
import { Wrench, Play, Info, Search, ArrowLeft } from 'lucide-react'

export default function ToolsPage() {
  const [selectedTool, setSelectedTool] = useState<any>(null)
  const [executionDialog, setExecutionDialog] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'detail'>('grid')
  const { data: tools, isLoading, error } = useTools()
  const t = useTranslations('tools')

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{t('title')}</h2>
          <p className="text-muted-foreground">{t('subtitle')}</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-16 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{t('title')}</h2>
          <p className="text-muted-foreground">{t('subtitle')}</p>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center py-16">
            <div className="text-center">
              <Wrench className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">
                {t('failedToLoad')}
              </h3>
              <p className="text-muted-foreground">
                {t('checkConnectionRetry')}
              </p>
              <Button className="mt-4" onClick={() => window.location.reload()}>
                {t('retry')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const toolsData = Array.isArray((tools as any)?.data)
    ? (tools as any).data
    : []

  const filteredTools = toolsData.filter(
    (tool: any) =>
      tool.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleToolSelect = (tool: any) => {
    setSelectedTool(tool)
    setViewMode('detail')
  }

  const handleBackToGrid = () => {
    setSelectedTool(null)
    setViewMode('grid')
  }

  const handleExecuteTool = (tool: any) => {
    setExecutionDialog(tool)
  }

  if (viewMode === 'detail' && selectedTool) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={handleBackToGrid}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('backToTools')}
          </Button>
        </div>
        <ToolDetailView
          tool={selectedTool}
          onExecute={() => handleExecuteTool(selectedTool)}
        />
        {executionDialog && (
          <ToolExecutionDialog
            tool={executionDialog}
            open={!!executionDialog}
            onOpenChange={(open) => !open && setExecutionDialog(null)}
          />
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{t('title')}</h2>
          <p className="text-muted-foreground">
            {t('availableTools', {
              filtered: filteredTools.length,
              total: toolsData.length,
            })}
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {filteredTools.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center py-16">
            <div className="text-center">
              <Wrench className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">
                {searchQuery ? t('noMatchingTools') : t('noToolsAvailable')}
              </h3>
              <p className="text-muted-foreground">
                {searchQuery ? t('tryAdjustingSearch') : t('noToolsConfigured')}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTools.map((tool: any, index: number) => (
            <Card
              key={tool.name || index}
              className="hover:shadow-md transition-shadow"
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Wrench className="h-5 w-5" />
                    {tool.name || t('toolNumber', { number: index + 1 })}
                  </CardTitle>
                  <Badge variant="secondary">{tool.type || t('tool')}</Badge>
                </div>
                <CardDescription>
                  {tool.description || t('noDescriptionAvailable')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {tool.schema && (
                    <div className="text-sm">
                      <span className="font-medium">{t('parameters')}</span>
                      <div className="mt-1 text-muted-foreground">
                        {t('parametersCount', {
                          count: Object.keys(tool.schema.properties || {})
                            .length,
                        })}
                      </div>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => handleExecuteTool(tool)}
                    >
                      <Play className="mr-2 h-4 w-4" />
                      {t('execute')}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToolSelect(tool)}
                    >
                      <Info className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {executionDialog && (
        <ToolExecutionDialog
          tool={executionDialog}
          open={!!executionDialog}
          onOpenChange={(open) => !open && setExecutionDialog(null)}
        />
      )}
    </div>
  )
}
