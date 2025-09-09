'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Activity,
  Clock,
  User,
  FileText,
  Wrench,
  CheckCircle,
  AlertCircle,
  XCircle,
  RefreshCw,
} from 'lucide-react'

interface ActivityItem {
  id: string
  type: 'tool_execution' | 'file_operation' | 'user_action' | 'system_event'
  title: string
  description: string
  timestamp: string
  status: 'success' | 'warning' | 'error' | 'pending'
  user?: string
  details?: any
}

// Mock data - in real app this would come from your API
const mockActivity: ActivityItem[] = [
  {
    id: '1',
    type: 'tool_execution',
    title: 'File Read Tool Executed',
    description: 'Read contents of config.json',
    timestamp: '2 minutes ago',
    status: 'success',
    user: 'John Doe',
  },
  {
    id: '2',
    type: 'file_operation',
    title: 'File Upload',
    description: 'Uploaded document.pdf to workspace',
    timestamp: '15 minutes ago',
    status: 'success',
    user: 'Jane Smith',
  },
  {
    id: '3',
    type: 'user_action',
    title: 'User Login',
    description: 'User successfully logged in',
    timestamp: '1 hour ago',
    status: 'success',
    user: 'Bob Wilson',
  },
  {
    id: '4',
    type: 'tool_execution',
    title: 'API Call Failed',
    description: 'Failed to execute external API tool',
    timestamp: '2 hours ago',
    status: 'error',
    user: 'John Doe',
  },
  {
    id: '5',
    type: 'system_event',
    title: 'System Backup',
    description: 'Automated system backup completed',
    timestamp: '3 hours ago',
    status: 'success',
  },
  {
    id: '6',
    type: 'tool_execution',
    title: 'Database Query',
    description: 'Long running query detected',
    timestamp: '4 hours ago',
    status: 'warning',
    user: 'Jane Smith',
  },
]

export default function ActivityPage() {
  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'tool_execution':
        return <Wrench className="h-4 w-4" />
      case 'file_operation':
        return <FileText className="h-4 w-4" />
      case 'user_action':
        return <User className="h-4 w-4" />
      case 'system_event':
        return <Activity className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  const getStatusIcon = (status: ActivityItem['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'pending':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: ActivityItem['status']) => {
    switch (status) {
      case 'success':
        return 'default'
      case 'warning':
        return 'secondary'
      case 'error':
        return 'destructive'
      case 'pending':
        return 'outline'
      default:
        return 'secondary'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Activity</h2>
          <p className="text-muted-foreground">
            Recent activity in your workspace
          </p>
        </div>
        <Button variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4">
        {mockActivity.map((activity) => (
          <Card key={activity.id} className="hover:shadow-sm transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                    {getActivityIcon(activity.type)}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-semibold text-foreground">
                      {activity.title}
                    </h4>
                    <Badge variant={getStatusColor(activity.status)}>
                      {activity.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {activity.description}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {activity.timestamp}
                    </div>
                    {activity.user && (
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {activity.user}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex-shrink-0">
                  {getStatusIcon(activity.status)}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Activity Summary</CardTitle>
          <CardDescription>
            Activity statistics for the last 24 hours
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">12</div>
              <p className="text-xs text-muted-foreground">
                Successful operations
              </p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">3</div>
              <p className="text-xs text-muted-foreground">Warnings</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">1</div>
              <p className="text-xs text-muted-foreground">Errors</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">8</div>
              <p className="text-xs text-muted-foreground">Tools executed</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
