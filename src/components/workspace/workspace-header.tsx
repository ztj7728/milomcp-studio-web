'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { useUploadFiles, useCreateFolder } from '@/hooks/use-api'
import {
  FolderPlus,
  FileUp,
  Search,
  MoreVertical,
  Home,
  Upload,
  FolderOpen,
  Loader2,
} from 'lucide-react'

interface WorkspaceHeaderProps {
  currentPath: string
  onPathChange: (path: string) => void
  onSearch?: (query: string) => void
}

export function WorkspaceHeader({
  currentPath,
  onPathChange,
  onSearch,
}: WorkspaceHeaderProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')

  const uploadFilesMutation = useUploadFiles()
  const createFolderMutation = useCreateFolder()

  const pathSegments = currentPath.split('/').filter(Boolean)

  const handleCreateFolder = async () => {
    if (newFolderName.trim()) {
      try {
        await createFolderMutation.mutateAsync({
          folderPath: currentPath,
          name: newFolderName.trim(),
        })
        setNewFolderName('')
        setShowNewFolderDialog(false)
      } catch (error) {
        console.error('Failed to create folder:', error)
      }
    }
  }

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files
    if (files && files.length > 0) {
      try {
        await uploadFilesMutation.mutateAsync({ files })
        // Reset the input so the same files can be uploaded again if needed
        event.target.value = ''
      } catch (error) {
        console.error('Failed to upload files:', error)
      }
    }
  }

  return (
    <div className="border-b bg-background">
      <div className="flex items-center justify-between p-4">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center space-x-4 flex-1">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink
                  href="#"
                  onClick={() => onPathChange('/')}
                  className="flex items-center gap-2"
                >
                  <Home className="h-4 w-4" />
                  Workspace
                </BreadcrumbLink>
              </BreadcrumbItem>
              {pathSegments.map((segment, index) => {
                const path = '/' + pathSegments.slice(0, index + 1).join('/')
                const isLast = index === pathSegments.length - 1

                return (
                  <div key={segment} className="flex items-center">
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      {isLast ? (
                        <BreadcrumbPage>{segment}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink
                          href="#"
                          onClick={() => onPathChange(path)}
                        >
                          {segment}
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                  </div>
                )
              })}
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Search Bar */}
        <div className="flex items-center space-x-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search files and folders..."
              value={searchQuery}
              onChange={(e) => {
                const query = e.target.value
                setSearchQuery(query)
                onSearch?.(query)
              }}
              className="pl-10"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          {/* Upload File */}
          <label htmlFor="file-upload">
            <Button
              variant="outline"
              size="sm"
              disabled={uploadFilesMutation.isPending}
              asChild
            >
              <span>
                {uploadFilesMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <FileUp className="h-4 w-4 mr-2" />
                )}
                {uploadFilesMutation.isPending ? 'Uploading...' : 'Upload'}
              </span>
            </Button>
          </label>
          <input
            id="file-upload"
            type="file"
            multiple
            className="hidden"
            onChange={handleFileUpload}
          />

          {/* New Folder */}
          <Dialog
            open={showNewFolderDialog}
            onOpenChange={setShowNewFolderDialog}
          >
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <FolderPlus className="h-4 w-4 mr-2" />
                New Folder
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Folder</DialogTitle>
                <DialogDescription>
                  Enter a name for the new folder in {currentPath}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="folder-name">Folder Name</Label>
                  <Input
                    id="folder-name"
                    placeholder="Enter folder name..."
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowNewFolderDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateFolder}
                  disabled={
                    !newFolderName.trim() || createFolderMutation.isPending
                  }
                >
                  {createFolderMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Folder'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* More Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Upload className="h-4 w-4 mr-2" />
                Upload Folder
              </DropdownMenuItem>
              <DropdownMenuItem>
                <FolderOpen className="h-4 w-4 mr-2" />
                Import Project
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}
