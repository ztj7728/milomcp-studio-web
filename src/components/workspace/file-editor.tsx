'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Separator } from '@/components/ui/separator'
import { useFileContent, useSaveFile } from '@/hooks/use-api'
import { FileItem } from './workspace-manager'
import {
  Save,
  X,
  MoreVertical,
  FileText,
  Download,
  Copy,
  Undo,
  Redo,
  Search,
  Loader2,
  CheckCircle,
  AlertCircle,
} from 'lucide-react'
import dynamic from 'next/dynamic'

// Dynamically import Monaco Editor to avoid SSR issues
const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => (
    <div className="h-full flex items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin" />
    </div>
  ),
})

interface FileEditorProps {
  file: FileItem
  onClose: () => void
}

export function FileEditor({ file, onClose }: FileEditorProps) {
  const [content, setContent] = useState<string>('')
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const editorRef = useRef<any>(null)

  const { data: fileContentData, isLoading, error } = useFileContent(file.path)
  const saveFileMutation = useSaveFile()

  const getFileExtension = () => {
    return file.name.split('.').pop()?.toLowerCase() || ''
  }

  const getLanguage = () => {
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
      xml: 'xml',
      yaml: 'yaml',
      yml: 'yaml',
      md: 'markdown',
      txt: 'plaintext',
    }
    return languageMap[extension] || 'plaintext'
  }

  const saveFile = async () => {
    try {
      await saveFileMutation.mutateAsync({
        filename: file.name,
        content: content,
      })

      setHasUnsavedChanges(false)
    } catch (err) {
      console.error('Failed to save file:', err)
    }
  }

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setContent(value)
      const originalContent = (fileContentData as any)?.data?.content || ''
      setHasUnsavedChanges(value !== originalContent)
    }
  }

  const handleEditorMount = (editor: any) => {
    editorRef.current = editor

    // Add keyboard shortcuts
    editor.addCommand('Cmd+S', saveFile)
    editor.addCommand('Ctrl+S', saveFile)
  }

  const formatDocument = () => {
    if (editorRef.current) {
      editorRef.current.getAction('editor.action.formatDocument').run()
    }
  }

  const handleCopyPath = () => {
    navigator.clipboard.writeText(file.path)
  }

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = file.name
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleClose = () => {
    if (hasUnsavedChanges) {
      const confirmed = window.confirm(
        'You have unsaved changes. Are you sure you want to close?'
      )
      if (!confirmed) return
    }
    onClose()
  }

  useEffect(() => {
    if ((fileContentData as any)?.data?.content) {
      setContent((fileContentData as any).data.content)
      setHasUnsavedChanges(false)
    }
  }, [fileContentData])

  useEffect(() => {
    // Add beforeunload listener to prevent accidental navigation
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault()
        e.returnValue = ''
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasUnsavedChanges])

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size'
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`
  }

  return (
    <div className="h-full flex flex-col">
      {/* Editor Header */}
      <div className="border-b p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5" />
            <div className="flex items-center gap-2">
              <span className="font-medium">{file.name}</span>
              {hasUnsavedChanges && (
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-orange-500 rounded-full" />
                  <span className="text-sm text-muted-foreground">Unsaved</span>
                </div>
              )}
            </div>
            <Badge variant="secondary">
              {getFileExtension().toUpperCase() || 'TEXT'}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={saveFile}
              disabled={!hasUnsavedChanges || saveFileMutation.isPending}
              size="sm"
            >
              {saveFileMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={formatDocument}>
                  Format Document
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDownload}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleCopyPath}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Path
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="outline" size="sm" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* File Info */}
        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
          <span>{file.path}</span>
          <Separator orientation="vertical" className="h-4" />
          <span>{formatFileSize(file.size)}</span>
          <Separator orientation="vertical" className="h-4" />
          <span>{getLanguage()}</span>
        </div>

        {(error || saveFileMutation.error) && (
          <div className="mt-2 p-2 bg-destructive/10 text-destructive text-sm rounded-md flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {(error instanceof Error ? error.message : error) ||
              saveFileMutation.error?.message}
          </div>
        )}
      </div>

      {/* Editor Content */}
      <div className="flex-1">
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading file content...</p>
            </div>
          </div>
        ) : (
          <MonacoEditor
            height="100%"
            language={getLanguage()}
            value={content}
            onChange={handleEditorChange}
            onMount={handleEditorMount}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              fontSize: 14,
              fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
              lineNumbers: 'on',
              renderWhitespace: 'selection',
              tabSize: 2,
              insertSpaces: true,
              wordWrap: 'on',
              automaticLayout: true,
              formatOnPaste: true,
              formatOnType: true,
              bracketPairColorization: {
                enabled: true,
              },
            }}
          />
        )}
      </div>
    </div>
  )
}
