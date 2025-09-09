'use client'

import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Search,
  Eye,
  RefreshCw,
  Calendar,
  Clock,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
  Filter,
} from 'lucide-react'

interface ExecutionLog {
  id: string
  toolName: string
  status: 'success' | 'error' | 'warning' | 'running'
  startTime: string
  endTime?: string
  duration?: number
  user: string
  parameters: Record<string, any>
  result?: any
  error?: string
}

// Mock data - in real app this would come from your API
const mockLogs: ExecutionLog[] = [
  {
    id: '1',
    toolName: 'file_read',
    status: 'success',
    startTime: '2024-01-15T10:30:00Z',
    endTime: '2024-01-15T10:30:02Z',
    duration: 2000,
    user: 'john.doe',
    parameters: { path: '/config/settings.json' },
    result: { content: '{"app": "milomcp", "version": "1.0.0"}' },
  },
  {
    id: '2',
    toolName: 'database_query',
    status: 'error',
    startTime: '2024-01-15T10:25:00Z',
    endTime: '2024-01-15T10:25:05Z',
    duration: 5000,
    user: 'jane.smith',
    parameters: { query: 'SELECT * FROM invalid_table' },
    error: 'Table "invalid_table" does not exist',
  },
  {
    id: '3',
    toolName: 'api_call',
    status: 'success',
    startTime: '2024-01-15T10:20:00Z',
    endTime: '2024-01-15T10:20:01Z',
    duration: 1200,
    user: 'bob.wilson',
    parameters: { url: 'https://api.example.com/data', method: 'GET' },
    result: { status: 200, data: [{ id: 1, name: 'test' }] },
  },
  {
    id: '4',
    toolName: 'file_write',
    status: 'warning',
    startTime: '2024-01-15T10:15:00Z',
    endTime: '2024-01-15T10:15:03Z',
    duration: 3000,
    user: 'alice.brown',
    parameters: { path: '/tmp/test.txt', content: 'Hello World' },
    result: {
      bytesWritten: 11,
      warning: 'File already existed and was overwritten',
    },
  },
  {
    id: '5',
    toolName: 'system_command',
    status: 'running',
    startTime: '2024-01-15T10:35:00Z',
    user: 'charlie.davis',
    parameters: { command: 'npm install', workdir: '/project' },
  },
]

interface ExecutionLogsViewerProps {
  toolName?: string
}

export function ExecutionLogsViewer({ toolName }: ExecutionLogsViewerProps) {
  const [logs, setLogs] = useState<ExecutionLog[]>(mockLogs)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [selectedLog, setSelectedLog] = useState<ExecutionLog | null>(null)

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.toolName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      JSON.stringify(log.parameters)
        .toLowerCase()
        .includes(searchQuery.toLowerCase())

    const matchesStatus = !statusFilter || log.status === statusFilter
    const matchesTool = !toolName || log.toolName === toolName

    return matchesSearch && matchesStatus && matchesTool
  })

  const getStatusIcon = (status: ExecutionLog['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case 'running':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: ExecutionLog['status']) => {
    switch (status) {
      case 'success':
        return 'default'
      case 'error':
        return 'destructive'
      case 'warning':
        return 'secondary'
      case 'running':
        return 'outline'
      default:
        return 'secondary'
    }
  }

  const formatDuration = (duration?: number) => {
    if (!duration) return '-'
    if (duration < 1000) return `${duration}ms`
    return `${(duration / 1000).toFixed(1)}s`
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString()
  }

  const refreshLogs = () => {
    // In real app, refetch from API
    console.log('Refreshing logs...')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">
            {toolName ? `${toolName} Execution Logs` : 'Tool Execution Logs'}
          </h3>
          <p className="text-sm text-muted-foreground">
            {filteredLogs.length} of {logs.length} executions
          </p>
        </div>
        <Button onClick={refreshLogs} variant="outline" size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search logs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-input bg-background rounded-md"
        >
          <option value="">All statuses</option>
          <option value="success">Success</option>
          <option value="error">Error</option>
          <option value="warning">Warning</option>
          <option value="running">Running</option>
        </select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tool</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Started</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-medium">{log.toolName}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(log.status)}
                      <Badge variant={getStatusColor(log.status)}>
                        {log.status}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>{log.user}</TableCell>
                  <TableCell>{formatTimestamp(log.startTime)}</TableCell>
                  <TableCell>{formatDuration(log.duration)}</TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedLog(log)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[80vh]">
                        <DialogHeader>
                          <DialogTitle>Execution Details</DialogTitle>
                          <DialogDescription>
                            {log.toolName} execution by {log.user}
                          </DialogDescription>
                        </DialogHeader>
                        <ScrollArea className="max-h-[60vh]">
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-sm font-medium">
                                  Tool Name
                                </label>
                                <p className="text-sm text-muted-foreground">
                                  {log.toolName}
                                </p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">
                                  Status
                                </label>
                                <div className="flex items-center gap-2 mt-1">
                                  {getStatusIcon(log.status)}
                                  <Badge variant={getStatusColor(log.status)}>
                                    {log.status}
                                  </Badge>
                                </div>
                              </div>
                              <div>
                                <label className="text-sm font-medium">
                                  User
                                </label>
                                <p className="text-sm text-muted-foreground">
                                  {log.user}
                                </p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">
                                  Duration
                                </label>
                                <p className="text-sm text-muted-foreground">
                                  {formatDuration(log.duration)}
                                </p>
                              </div>
                            </div>

                            <div>
                              <label className="text-sm font-medium">
                                Parameters
                              </label>
                              <pre className="mt-1 text-xs bg-muted p-3 rounded overflow-x-auto">
                                {JSON.stringify(log.parameters, null, 2)}
                              </pre>
                            </div>

                            {log.result && (
                              <div>
                                <label className="text-sm font-medium">
                                  Result
                                </label>
                                <pre className="mt-1 text-xs bg-muted p-3 rounded overflow-x-auto">
                                  {JSON.stringify(log.result, null, 2)}
                                </pre>
                              </div>
                            )}

                            {log.error && (
                              <div>
                                <label className="text-sm font-medium">
                                  Error
                                </label>
                                <pre className="mt-1 text-xs bg-red-50 dark:bg-red-950 text-red-900 dark:text-red-100 p-3 rounded">
                                  {log.error}
                                </pre>
                              </div>
                            )}
                          </div>
                        </ScrollArea>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredLogs.length === 0 && (
            <div className="flex items-center justify-center py-16">
              <div className="text-center text-muted-foreground">
                <Clock className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>No execution logs found</p>
                <p className="text-sm">
                  {searchQuery || statusFilter
                    ? 'Try adjusting your filters.'
                    : 'Execute some tools to see logs here.'}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
