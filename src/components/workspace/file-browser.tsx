'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import {
  useFiles,
  useDeleteFile,
  useRenameFile,
  useDownloadFile,
  useSearchFiles,
} from '@/hooks/use-api'
import { FileItem } from './workspace-manager'
import {
  Folder,
  FolderOpen,
  File as FileIcon,
  FileText,
  FileCode,
  FileImage,
  FileVideo,
  FileArchive,
  ChevronRight,
  ChevronDown,
  Loader2,
  AlertCircle,
  Plus,
  Trash,
  Edit,
  Copy,
  Download,
  FileEdit,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface FileBrowserProps {
  currentPath: string
  onPathChange: (path: string) => void
  selectedFile: FileItem | null
  onFileSelect: (file: FileItem) => void
  onFileEdit: (file: FileItem) => void
  searchQuery?: string
}

export function FileBrowser({
  currentPath,
  onPathChange,
  selectedFile,
  onFileSelect,
  onFileEdit,
  searchQuery,
}: FileBrowserProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set(['/'])
  )
  const { data: filesData, isLoading, error, refetch } = useFiles(currentPath)
  const {
    data: searchData,
    isLoading: isSearching,
    error: searchError,
  } = useSearchFiles(searchQuery || '')
  const deleteFileMutation = useDeleteFile()
  const renameFileMutation = useRenameFile()
  const downloadFileMutation = useDownloadFile()

  // Use search results if searching, otherwise use regular files
  const isSearchMode = searchQuery && searchQuery.length > 2
  const files = isSearchMode
    ? (searchData as any)?.data || []
    : (filesData as any)?.data || []
  const currentIsLoading = isSearchMode ? isSearching : isLoading
  const currentError = isSearchMode ? searchError : error

  // Convert API response to FileItem format
  const convertToFileItem = (apiFile: any): FileItem => ({
    name: apiFile.name,
    path: apiFile.path,
    type: apiFile.type === 'directory' ? 'directory' : 'file',
    size: apiFile.size,
    modified: apiFile.modified ? new Date(apiFile.modified) : undefined,
    children: apiFile.children?.map(convertToFileItem),
  })

  const fileItems: FileItem[] = files.map(convertToFileItem)

  const getFileIcon = (file: FileItem) => {
    if (file.type === 'directory') {
      return expandedFolders.has(file.path) ? FolderOpen : Folder
    }

    const extension = file.name.split('.').pop()?.toLowerCase()

    switch (extension) {
      case 'js':
      case 'ts':
      case 'jsx':
      case 'tsx':
      case 'py':
      case 'java':
      case 'cpp':
      case 'c':
      case 'css':
      case 'scss':
      case 'html':
      case 'json':
        return FileCode
      case 'txt':
      case 'md':
      case 'readme':
        return FileText
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'svg':
      case 'webp':
        return FileImage
      case 'mp4':
      case 'avi':
      case 'mov':
      case 'webm':
        return FileVideo
      case 'zip':
      case 'rar':
      case 'tar':
      case 'gz':
        return FileArchive
      default:
        return FileIcon
    }
  }

  const toggleFolder = (folderPath: string) => {
    setExpandedFolders((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(folderPath)) {
        newSet.delete(folderPath)
      } else {
        newSet.add(folderPath)
      }
      return newSet
    })
  }

  const handleFileClick = (file: FileItem) => {
    if (file.type === 'directory') {
      toggleFolder(file.path)
      onPathChange(file.path)
    } else {
      onFileSelect(file)
    }
  }

  const handleContextMenuAction = async (action: string, file: FileItem) => {
    switch (action) {
      case 'edit':
        if (file.type === 'file') {
          onFileEdit(file)
        }
        break
      case 'copy':
        navigator.clipboard.writeText(file.path)
        break
      case 'delete':
        const confirmed = window.confirm(
          `Are you sure you want to delete ${file.name}?`
        )
        if (confirmed) {
          try {
            await deleteFileMutation.mutateAsync(file.path)
          } catch (error) {
            console.error('Failed to delete file:', error)
          }
        }
        break
      case 'download':
        if (file.type === 'file') {
          try {
            const blob = await downloadFileMutation.mutateAsync(file.path)
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = file.name
            a.click()
            URL.revokeObjectURL(url)
          } catch (error) {
            console.error('Failed to download file:', error)
          }
        }
        break
      case 'rename':
        const newName = prompt(`Rename ${file.name} to:`, file.name)
        if (newName && newName !== file.name) {
          const newPath = file.path.replace(/[^/]+$/, newName)
          try {
            await renameFileMutation.mutateAsync({
              oldPath: file.path,
              newPath: newPath,
            })
          } catch (error) {
            console.error('Failed to rename file:', error)
          }
        }
        break
    }
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return ''
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`
  }

  const formatDate = (date?: Date) => {
    if (!date) return ''
    return (
      date.toLocaleDateString() +
      ' ' +
      date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    )
  }

  const renderFileTree = (items: FileItem[], depth = 0) => {
    return items.map((item) => {
      const Icon = getFileIcon(item)
      const isSelected = selectedFile?.path === item.path
      const isExpanded = expandedFolders.has(item.path)

      return (
        <div key={item.path}>
          <ContextMenu>
            <ContextMenuTrigger>
              <div
                className={cn(
                  'flex items-center gap-2 px-2 py-1 text-sm cursor-pointer hover:bg-accent rounded-md',
                  isSelected && 'bg-accent',
                  'group'
                )}
                style={{ paddingLeft: `${depth * 16 + 8}px` }}
                onClick={() => handleFileClick(item)}
              >
                {item.type === 'directory' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-0 h-4 w-4"
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleFolder(item.path)
                    }}
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-3 w-3" />
                    ) : (
                      <ChevronRight className="h-3 w-3" />
                    )}
                  </Button>
                )}
                <Icon className="h-4 w-4 flex-shrink-0" />
                <span className="flex-1 truncate">{item.name}</span>
                {item.type === 'file' && item.size && (
                  <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100">
                    {formatFileSize(item.size)}
                  </span>
                )}
              </div>
            </ContextMenuTrigger>
            <ContextMenuContent>
              {item.type === 'file' && (
                <>
                  <ContextMenuItem
                    onClick={() => handleContextMenuAction('edit', item)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </ContextMenuItem>
                  <ContextMenuItem
                    onClick={() => handleContextMenuAction('download', item)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </ContextMenuItem>
                  <ContextMenuSeparator />
                </>
              )}
              {item.type === 'directory' && (
                <>
                  <ContextMenuItem
                    onClick={() => handleContextMenuAction('newFolder', item)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    New Folder
                  </ContextMenuItem>
                  <ContextMenuSeparator />
                </>
              )}
              <ContextMenuItem
                onClick={() => handleContextMenuAction('copy', item)}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Path
              </ContextMenuItem>
              <ContextMenuItem
                onClick={() => handleContextMenuAction('rename', item)}
              >
                <FileEdit className="h-4 w-4 mr-2" />
                Rename
              </ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuItem
                onClick={() => handleContextMenuAction('delete', item)}
                className="text-destructive"
              >
                <Trash className="h-4 w-4 mr-2" />
                Delete
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>

          {/* Render children if directory is expanded */}
          {item.type === 'directory' && isExpanded && item.children && (
            <div>{renderFileTree(item.children, depth + 1)}</div>
          )}
        </div>
      )
    })
  }

  if (currentError) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">
            {isSearchMode ? 'Search failed' : 'Failed to load files'}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {currentError.message ||
              'An error occurred while loading the file list'}
          </p>
          <details className="text-xs text-muted-foreground mb-4">
            <summary>Error Details</summary>
            <pre className="mt-2 p-2 bg-muted rounded text-xs">
              {JSON.stringify(currentError, null, 2)}
            </pre>
          </details>
          <Button onClick={() => refetch()}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col border-r">
      <div className="p-3 border-b">
        <h2 className="text-sm font-semibold">
          {isSearchMode ? `Search Results (${fileItems.length})` : 'Files'}
        </h2>
        {isSearchMode && (
          <p className="text-xs text-muted-foreground mt-1">
            Searching for &ldquo;{searchQuery}&rdquo;
          </p>
        )}
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2">
          {currentIsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : fileItems.length === 0 ? (
            <div className="text-center py-8">
              <Folder className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">
                {isSearchMode ? 'No files match your search' : 'No files found'}
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {isSearchMode
                ? // For search results, show flat list with full paths
                  fileItems.map((item) => (
                    <div key={item.path}>
                      <div
                        className={cn(
                          'flex items-center gap-2 px-2 py-1 text-sm cursor-pointer hover:bg-accent rounded-md',
                          selectedFile?.path === item.path && 'bg-accent',
                          'group'
                        )}
                        onClick={() => handleFileClick(item)}
                      >
                        {(() => {
                          const Icon = getFileIcon(item)
                          return <Icon className="h-4 w-4 flex-shrink-0" />
                        })()}
                        <div className="flex-1 min-w-0">
                          <div className="truncate">{item.name}</div>
                          <div className="text-xs text-muted-foreground truncate">
                            {item.path}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                : // For regular view, show tree structure
                  renderFileTree(fileItems)}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
