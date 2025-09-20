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
import { Textarea } from '@/components/ui/textarea'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Settings,
  Eye,
  EyeOff,
} from 'lucide-react'
import {
  useEnvironmentVariables,
  useSetEnvironmentVariable,
  useDeleteEnvironmentVariable,
} from '@/hooks/use-environment'

export default function EnvironmentPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingVariable, setEditingVariable] = useState<{
    key: string
    value: string
  } | null>(null)
  const [newKey, setNewKey] = useState('')
  const [newValue, setNewValue] = useState('')
  const [visibleValues, setVisibleValues] = useState<Set<string>>(new Set())

  const { data: environment, isLoading, error } = useEnvironmentVariables()
  const setEnvironmentMutation = useSetEnvironmentVariable()
  const deleteEnvironmentMutation = useDeleteEnvironmentVariable()

  const environmentArray = environment ? Object.entries(environment) : []

  const handleCreateOrUpdate = async () => {
    if (!newKey.trim() || !newValue.trim()) return

    try {
      await setEnvironmentMutation.mutateAsync({
        key: newKey.trim(),
        value: newValue.trim(),
      })

      // Reset form
      setNewKey('')
      setNewValue('')
      setIsCreateOpen(false)
      setEditingVariable(null)
    } catch (error) {
      console.error('Failed to set environment variable:', error)
    }
  }

  const handleDeleteVariable = async (key: string) => {
    if (
      !confirm(
        `Are you sure you want to delete the environment variable "${key}"?`
      )
    ) {
      return
    }

    try {
      await deleteEnvironmentMutation.mutateAsync(key)
    } catch (error) {
      console.error('Failed to delete environment variable:', error)
    }
  }

  const startEditing = (key: string, value: string) => {
    setEditingVariable({ key, value })
    setNewKey(key)
    setNewValue(value)
    setIsCreateOpen(true)
  }

  const toggleValueVisibility = (key: string) => {
    const newVisible = new Set(visibleValues)
    if (newVisible.has(key)) {
      newVisible.delete(key)
    } else {
      newVisible.add(key)
    }
    setVisibleValues(newVisible)
  }

  const maskValue = (value: string) => {
    if (value.length <= 8) return '•'.repeat(value.length)
    return (
      value.substring(0, 4) +
      '•'.repeat(Math.max(4, value.length - 8)) +
      value.substring(value.length - 4)
    )
  }

  const closeDialog = () => {
    setIsCreateOpen(false)
    setEditingVariable(null)
    setNewKey('')
    setNewValue('')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p className="text-sm text-gray-500">
            Loading environment variables...
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-red-500">Failed to load environment variables</p>
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
            Environment Variables
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage environment variables for your tools
          </p>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Variable
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingVariable
                  ? 'Edit Environment Variable'
                  : 'Add Environment Variable'}
              </DialogTitle>
              <DialogDescription>
                {editingVariable
                  ? 'Update the environment variable value.'
                  : 'Add a new environment variable for your tools.'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="var-key">Variable Name</Label>
                <Input
                  id="var-key"
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  placeholder="VARIABLE_NAME"
                  disabled={!!editingVariable}
                  className="mt-1 font-mono"
                />
              </div>

              <div>
                <Label htmlFor="var-value">Value</Label>
                <Textarea
                  id="var-value"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  placeholder="Enter variable value..."
                  className="mt-1 font-mono"
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={closeDialog}>
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateOrUpdate}
                  disabled={
                    !newKey.trim() ||
                    !newValue.trim() ||
                    setEnvironmentMutation.isPending
                  }
                >
                  {setEnvironmentMutation.isPending
                    ? editingVariable
                      ? 'Updating...'
                      : 'Adding...'
                    : editingVariable
                      ? 'Update'
                      : 'Add Variable'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Environment Variables Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Your Environment Variables
          </CardTitle>
          <CardDescription>
            {environmentArray.length === 0
              ? "You haven't set any environment variables yet."
              : `You have ${environmentArray.length} environment variable(s).`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {environmentArray.length === 0 ? (
            <div className="text-center py-8">
              <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">
                No environment variables found
              </p>
              <p className="text-sm text-gray-400 mb-4">
                Environment variables are used to store configuration values for
                your tools, such as API keys and other sensitive data.
              </p>
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Variable
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Variable Name</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {environmentArray.map(([key, value]) => (
                  <TableRow key={key}>
                    <TableCell>
                      <code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-sm font-mono">
                        {key}
                      </code>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <code className="flex-1 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-sm font-mono">
                          {visibleValues.has(key) ? value : maskValue(value)}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleValueVisibility(key)}
                        >
                          {visibleValues.has(key) ? (
                            <EyeOff className="h-3 w-3" />
                          ) : (
                            <Eye className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
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
                            onClick={() => startEditing(key, value)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Variable
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDeleteVariable(key)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Variable
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">About Environment Variables</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Environment variables are key-value pairs that provide configuration
            data to your tools. They&apos;re commonly used for:
          </p>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 ml-4">
            <li>• API keys and authentication tokens</li>
            <li>• Database connection strings</li>
            <li>• Service endpoints and URLs</li>
            <li>• Feature flags and configuration options</li>
          </ul>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            These variables are securely stored and only accessible to your
            tools during execution.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
