'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ExecutionLogsViewer } from './execution-logs-viewer'
import {
  Play,
  Info,
  FileText,
  CheckCircle,
  XCircle,
  History,
} from 'lucide-react'

interface ToolDetailViewProps {
  tool: any
  onExecute: () => void
}

export function ToolDetailView({ tool, onExecute }: ToolDetailViewProps) {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'string':
        return 'default'
      case 'number':
      case 'integer':
        return 'secondary'
      case 'boolean':
        return 'outline'
      case 'array':
        return 'secondary'
      case 'object':
        return 'default'
      default:
        return 'secondary'
    }
  }

  const formatType = (property: any) => {
    let typeStr = property.type || 'any'

    if (property.enum) {
      typeStr += ` (${property.enum.join(' | ')})`
    }

    if (property.type === 'array' && property.items) {
      typeStr += `<${property.items.type || 'any'}>`
    }

    return typeStr
  }

  return (
    <div className="space-y-6">
      {/* Tool Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{tool.name}</h1>
            <Badge variant="outline">{tool.type || 'tool'}</Badge>
          </div>
          <p className="text-muted-foreground max-w-2xl">
            {tool.description || 'No description available for this tool.'}
          </p>
        </div>
        <Button onClick={onExecute} className="shrink-0">
          <Play className="mr-2 h-4 w-4" />
          Execute Tool
        </Button>
      </div>

      <Separator />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Schema Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Parameters Schema
            </CardTitle>
            <CardDescription>
              Input parameters and their requirements
            </CardDescription>
          </CardHeader>
          <CardContent>
            {tool.schema?.properties &&
            Object.keys(tool.schema.properties).length > 0 ? (
              <ScrollArea className="h-[400px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Required</TableHead>
                      <TableHead>Description</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(tool.schema.properties).map(
                      ([key, property]: [string, any]) => (
                        <TableRow key={key}>
                          <TableCell className="font-medium">{key}</TableCell>
                          <TableCell>
                            <Badge variant={getTypeColor(property.type)}>
                              {formatType(property)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {tool.schema?.required?.includes(key) ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <XCircle className="h-4 w-4 text-gray-400" />
                            )}
                          </TableCell>
                          <TableCell className="max-w-xs">
                            <div className="space-y-1">
                              <p className="text-sm">
                                {property.description || '-'}
                              </p>
                              {property.default !== undefined && (
                                <Badge variant="outline" className="text-xs">
                                  Default: {String(property.default)}
                                </Badge>
                              )}
                              {property.minimum !== undefined && (
                                <Badge variant="outline" className="text-xs">
                                  Min: {property.minimum}
                                </Badge>
                              )}
                              {property.maximum !== undefined && (
                                <Badge variant="outline" className="text-xs">
                                  Max: {property.maximum}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            ) : (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                <div className="text-center">
                  <Info className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>This tool requires no parameters</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tool Metadata */}
        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Tool Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Name:</span>
                  <span className="text-sm text-muted-foreground">
                    {tool.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Type:</span>
                  <Badge variant="outline">{tool.type || 'tool'}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Parameters:</span>
                  <span className="text-sm text-muted-foreground">
                    {tool.schema?.properties
                      ? Object.keys(tool.schema.properties).length
                      : 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Required:</span>
                  <span className="text-sm text-muted-foreground">
                    {tool.schema?.required?.length || 0}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* JSON Schema */}
          <Card>
            <CardHeader>
              <CardTitle>Raw Schema</CardTitle>
              <CardDescription>Complete JSON schema definition</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[250px]">
                <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
                  {JSON.stringify(tool.schema || {}, null, 2)}
                </pre>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>

      <Separator />

      {/* Execution History */}
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <History className="h-5 w-5" />
          Execution History
        </h2>
        <ExecutionLogsViewer toolName={tool.name} />
      </div>
    </div>
  )
}
