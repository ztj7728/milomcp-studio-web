'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useExecuteTool } from '@/hooks/use-api'
import { useTokens } from '@/hooks/use-tokens'
import {
  Play,
  Loader2,
  CheckCircle,
  AlertCircle,
  Copy,
  Key,
  ExternalLink,
} from 'lucide-react'

interface ToolExecutionDialogProps {
  tool: any
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface ExecutionResult {
  success: boolean
  result?: any
  error?: string
  executionTime?: number
}

export function ToolExecutionDialog({
  tool,
  open,
  onOpenChange,
}: ToolExecutionDialogProps) {
  const [executionResult, setExecutionResult] =
    useState<ExecutionResult | null>(null)
  const [isExecuting, setIsExecuting] = useState(false)
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [selectedTokenId, setSelectedTokenId] = useState<string>('')

  const executeTool = useExecuteTool()
  const { data: tokens, isLoading: tokensLoading } = useTokens()

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open) {
      setFormData({})
      setExecutionResult(null)
      setSelectedTokenId('')
    }
  }, [open])

  // Don't render if no tool is provided
  if (!tool) {
    return null
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedTokenId) {
      setExecutionResult({
        success: false,
        error: 'Please select an API token to execute the tool',
        executionTime: 0,
      })
      return
    }

    setIsExecuting(true)
    setExecutionResult(null)
    const startTime = Date.now()

    try {
      const result = await executeTool.mutateAsync({
        toolName: tool.name,
        parameters: formData,
        apiToken: selectedTokenId,
      })

      setExecutionResult({
        success: true,
        result: result,
        executionTime: Date.now() - startTime,
      })
    } catch (error: any) {
      setExecutionResult({
        success: false,
        error: error.message || 'Tool execution failed',
        executionTime: Date.now() - startTime,
      })
    } finally {
      setIsExecuting(false)
    }
  }

  const renderFormField = (key: string, property: any) => {
    const isRequired = tool.schema?.required?.includes(key)
    const value = formData[key] || ''

    const handleChange = (newValue: any) => {
      setFormData((prev) => ({ ...prev, [key]: newValue }))
    }

    return (
      <div key={key} className="space-y-2">
        <Label className="flex items-center gap-2">
          {key}
          {isRequired && (
            <Badge variant="destructive" className="text-xs">
              Required
            </Badge>
          )}
        </Label>

        {property.type === 'string' && property.enum ? (
          <Select onValueChange={handleChange} defaultValue={value}>
            <SelectTrigger>
              <SelectValue placeholder={`Select ${key}`} />
            </SelectTrigger>
            <SelectContent>
              {property.enum.map((option: string) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : property.type === 'boolean' ? (
          <div className="flex items-center space-x-2">
            <Checkbox checked={value} onCheckedChange={handleChange} />
            <span className="text-sm">Enable {key}</span>
          </div>
        ) : property.type === 'string' &&
          (property.minLength > 100 || property.maxLength > 100) ? (
          <Textarea
            placeholder={property.description || `Enter ${key}`}
            value={value}
            onChange={(e) => handleChange(e.target.value)}
          />
        ) : (
          <Input
            type={
              property.type === 'number' || property.type === 'integer'
                ? 'number'
                : 'text'
            }
            placeholder={property.description || `Enter ${key}`}
            value={value}
            onChange={(e) =>
              handleChange(
                property.type === 'number' || property.type === 'integer'
                  ? parseFloat(e.target.value) || 0
                  : e.target.value
              )
            }
          />
        )}

        {property.description && (
          <p className="text-sm text-muted-foreground">
            {property.description}
          </p>
        )}
      </div>
    )
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Execute Tool: {tool.name}
          </DialogTitle>
          <DialogDescription>
            {tool.description || 'Configure parameters and execute this tool.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* API Token Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Key className="h-4 w-4" />
                API Token Selection
              </CardTitle>
              <CardDescription>
                Choose an API token to authenticate your tool execution request
              </CardDescription>
            </CardHeader>
            <CardContent>
              {tokensLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Loading tokens...</span>
                </div>
              ) : !tokens || tokens.length === 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">No API tokens available</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    You need to create at least one API token to execute tools.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => window.open('/dashboard/tokens', '_blank')}
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Create API Token
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <Label htmlFor="token-select">Select API Token</Label>
                  <Select
                    value={selectedTokenId}
                    onValueChange={setSelectedTokenId}
                  >
                    <SelectTrigger id="token-select">
                      <SelectValue placeholder="Choose an API token..." />
                    </SelectTrigger>
                    <SelectContent>
                      {tokens.map((token) => {
                        let parsedPermissions: string[] = []
                        try {
                          parsedPermissions = JSON.parse(
                            token.permissions || '[]'
                          )
                        } catch (e) {
                          parsedPermissions = []
                        }

                        return (
                          <SelectItem key={token.token} value={token.token}>
                            <div className="flex items-center justify-between w-full">
                              <span>{token.name}</span>
                              <Badge variant="outline" className="ml-2">
                                {parsedPermissions.includes('*')
                                  ? 'All Tools'
                                  : `${parsedPermissions.length} tools`}
                              </Badge>
                            </div>
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                  {!selectedTokenId && (
                    <p className="text-sm text-muted-foreground">
                      Please select a token to enable tool execution
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Show parameters form only if token is selected or there are no tokens but we want to show the disabled state */}
          {(selectedTokenId || (tokens && tokens.length === 0)) && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Parameters Form */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Parameters</h3>

                {tool.schema?.properties &&
                Object.keys(tool.schema.properties).length > 0 ? (
                  <form onSubmit={onSubmit} className="space-y-4">
                    {Object.entries(tool.schema.properties).map(
                      ([key, property]: [string, any]) =>
                        renderFormField(key, property)
                    )}

                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={isExecuting || !selectedTokenId}
                      >
                        {isExecuting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Executing...
                          </>
                        ) : (
                          <>
                            <Play className="mr-2 h-4 w-4" />
                            Execute Tool
                          </>
                        )}
                      </Button>
                    </DialogFooter>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <p className="text-muted-foreground">
                      This tool requires no parameters.
                    </p>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={onSubmit}
                        disabled={isExecuting || !selectedTokenId}
                      >
                        {isExecuting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Executing...
                          </>
                        ) : (
                          <>
                            <Play className="mr-2 h-4 w-4" />
                            Execute Tool
                          </>
                        )}
                      </Button>
                    </DialogFooter>
                  </div>
                )}
              </div>

              {/* Execution Result */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Result</h3>

                {executionResult ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        {executionResult.success ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-red-500" />
                        )}
                        {executionResult.success ? 'Success' : 'Error'}
                      </CardTitle>
                      <CardDescription>
                        Executed in {executionResult.executionTime}ms
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Output:</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              copyToClipboard(
                                executionResult.success
                                  ? JSON.stringify(
                                      executionResult.result,
                                      null,
                                      2
                                    )
                                  : executionResult.error || ''
                              )
                            }
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                        <pre className="bg-muted p-3 rounded-md text-sm overflow-x-auto max-h-60">
                          {executionResult.success
                            ? JSON.stringify(executionResult.result, null, 2)
                            : executionResult.error}
                        </pre>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="border-dashed">
                    <CardContent className="flex items-center justify-center py-12">
                      <div className="text-center text-muted-foreground">
                        <Play className="mx-auto h-12 w-12 mb-4 opacity-50" />
                        <p>Execute the tool to see results here</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
