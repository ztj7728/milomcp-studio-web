'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useFileContent, useDownloadFile } from '@/hooks/use-api'
import { FileItem } from './workspace-manager'
import {
  Edit,
  Download,
  Copy,
  FileText,
  FileCode,
  FileImage,
  File as FileIcon,
  Eye,
  Loader2,
  AlertCircle,
} from 'lucide-react'

interface FilePreviewProps {
  file: FileItem
  onEdit: () => void
}

export function FilePreview({ file, onEdit }: FilePreviewProps) {
  const {
    data: fileContentData,
    isLoading,
    error,
    refetch,
  } = useFileContent(file.path)
  const downloadFileMutation = useDownloadFile()

  const content = (fileContentData as any)?.data?.content || ''

  const getFileExtension = () => {
    return file.name.split('.').pop()?.toLowerCase() || ''
  }

  const isTextFile = () => {
    const textExtensions = [
      'txt',
      'md',
      'json',
      'js',
      'ts',
      'tsx',
      'jsx',
      'html',
      'css',
      'scss',
      'py',
      'java',
      'cpp',
      'c',
      'yaml',
      'yml',
      'xml',
    ]
    return textExtensions.includes(getFileExtension())
  }

  const isImageFile = () => {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp']
    return imageExtensions.includes(getFileExtension())
  }

  const isCodeFile = () => {
    const codeExtensions = [
      'js',
      'ts',
      'tsx',
      'jsx',
      'py',
      'java',
      'cpp',
      'c',
      'css',
      'scss',
      'html',
      'json',
    ]
    return codeExtensions.includes(getFileExtension())
  }

  const getLanguageForSyntaxHighlighting = () => {
    const extension = getFileExtension()
    const languageMap: Record<string, string> = {
      js: 'javascript',
      ts: 'typescript',
      tsx: 'typescript',
      jsx: 'javascript',
      py: 'python',
      java: 'java',
      cpp: 'cpp',
      c: 'c',
      css: 'css',
      scss: 'scss',
      html: 'html',
      json: 'json',
    }
    return languageMap[extension] || 'text'
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size'
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`
  }

  const formatDate = (date?: Date) => {
    if (!date) return 'Unknown date'
    return (
      date.toLocaleDateString() +
      ' at ' +
      date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    )
  }

  // Remove the old loading logic since we're using the API hook now

  const handleCopyPath = () => {
    navigator.clipboard.writeText(file.path)
  }

  const handleDownload = async () => {
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

  const getFileIcon = () => {
    if (isImageFile()) return FileImage
    if (isCodeFile()) return FileCode
    if (isTextFile()) return FileText
    return FileIcon
  }

  const FileIconComponent = getFileIcon()

  return (
    <div className="h-full flex flex-col">
      {/* File Header */}
      <div className="border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileIconComponent className="h-6 w-6" />
            <div>
              <h2 className="text-lg font-semibold">{file.name}</h2>
              <p className="text-sm text-muted-foreground">{file.path}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isTextFile() && (
              <Button onClick={onEdit} size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              disabled={downloadFileMutation.isPending}
            >
              {downloadFileMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              {downloadFileMutation.isPending ? 'Downloading...' : 'Download'}
            </Button>
            <Button variant="outline" size="sm" onClick={handleCopyPath}>
              <Copy className="h-4 w-4 mr-2" />
              Copy Path
            </Button>
          </div>
        </div>

        {/* File Info */}
        <div className="flex items-center gap-4 mt-3">
          <Badge variant="secondary">
            {getFileExtension().toUpperCase() || 'FILE'}
          </Badge>
          <span className="text-sm text-muted-foreground">
            {formatFileSize(file.size)}
          </span>
          <span className="text-sm text-muted-foreground">
            Modified {formatDate(file.modified)}
          </span>
        </div>
      </div>

      {/* File Content */}
      <div className="flex-1 p-4">
        {isImageFile() ? (
          <div className="h-full flex items-center justify-center">
            <Card className="max-w-4xl max-h-full">
              <CardContent className="p-4">
                <img
                  src={`/api/workspace/files/content?path=${encodeURIComponent(file.path)}`}
                  alt={file.name}
                  className="max-w-full max-h-full object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                    target.parentElement!.innerHTML = `
                      <div class="flex items-center justify-center p-12 text-muted-foreground">
                        <div class="text-center">
                          <AlertCircle class="h-12 w-12 mx-auto mb-4" />
                          <p>Unable to load image</p>
                        </div>
                      </div>
                    `
                  }}
                />
              </CardContent>
            </Card>
          </div>
        ) : isTextFile() ? (
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="h-full pb-4">
              <ScrollArea className="h-full">
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : error ? (
                  <div className="flex items-center justify-center py-12 text-destructive">
                    <div className="text-center">
                      <AlertCircle className="h-12 w-12 mx-auto mb-4" />
                      <p>
                        {error instanceof Error ? error.message : String(error)}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-4"
                        onClick={() => refetch()}
                      >
                        Try Again
                      </Button>
                    </div>
                  </div>
                ) : (
                  <pre className="text-sm font-mono bg-muted p-4 rounded-md overflow-x-auto whitespace-pre-wrap">
                    {content}
                  </pre>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        ) : (
          <div className="h-full flex items-center justify-center">
            <Card>
              <CardContent className="p-12">
                <div className="text-center">
                  <FileIconComponent className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">
                    Preview not available
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Cannot preview {getFileExtension().toUpperCase()} files
                  </p>
                  <div className="flex gap-2 justify-center">
                    <Button variant="outline" onClick={handleDownload}>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
