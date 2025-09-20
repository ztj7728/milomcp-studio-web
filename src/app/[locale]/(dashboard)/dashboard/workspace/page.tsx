'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import {
  useFiles,
  useFileContent,
  useCreateFolder,
  useDeleteFile,
  useUploadFiles,
  useSaveFile,
} from '@/hooks/use-api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CodeEditor } from '@/components/ui/code-editor'

interface FileItem {
  name: string
  type: 'file' | 'directory'
  size?: number
  modified?: string
  path: string
}

export default function FilesPage() {
  const [currentPath, setCurrentPath] = useState('/')
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null)
  const [newFileName, setNewFileName] = useState('')
  const [isCreatingFile, setIsCreatingFile] = useState(false)
  const t = useTranslations('workspace')

  const {
    data: files,
    isLoading: filesLoading,
    error: filesError,
    refetch: refetchFiles,
  } = useFiles(currentPath)
  const { data: fileContent, isLoading: contentLoading } = useFileContent(
    selectedFile?.name || ''
  )
  const createFolderMutation = useCreateFolder()
  const deleteFileMutation = useDeleteFile()
  const uploadFilesMutation = useUploadFiles()
  const saveFileMutation = useSaveFile()

  const handleNavigateToPath = (path: string) => {
    setCurrentPath(path)
    setSelectedFile(null)
  }

  const handleFileSelect = (file: FileItem) => {
    if (file.type === 'directory') {
      handleNavigateToPath(file.path)
    } else {
      setSelectedFile(file)
    }
  }

  const handleCreateFile = async () => {
    if (!newFileName.trim()) return

    try {
      await saveFileMutation.mutateAsync({
        filename: newFileName,
        content: '// New file\n',
      })
      setNewFileName('')
      setIsCreatingFile(false)
      refetchFiles()
    } catch (error) {
      console.error('Failed to create file:', error)
    }
  }

  const handleDeleteFile = async (file: FileItem) => {
    if (!confirm(t('confirmDelete', { filename: file.name }))) return

    try {
      await deleteFileMutation.mutateAsync(file.name)
      refetchFiles()
      if (selectedFile?.path === file.path) {
        setSelectedFile(null)
      }
    } catch (error) {
      console.error('Failed to delete file:', error)
    }
  }

  const handleUploadFiles = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    // Validate files before uploading
    const jsFiles = Array.from(files).filter((file) =>
      file.name.endsWith('.js')
    )
    if (jsFiles.length === 0) {
      alert(t('selectJsFiles'))
      return
    }

    if (jsFiles.length > 10) {
      alert(t('maxFilesLimit'))
      return
    }

    for (const file of jsFiles) {
      if (file.size > 10 * 1024 * 1024) {
        // 10MB limit
        alert(t('fileTooLarge', { filename: file.name }))
        return
      }
    }

    try {
      const result = await uploadFilesMutation.mutateAsync({ files })

      // Handle upload results based on API response
      if (
        result &&
        typeof result === 'object' &&
        'data' in result &&
        result.data &&
        typeof result.data === 'object' &&
        'summary' in result.data
      ) {
        const summary = (result.data as any).summary
        if (summary && typeof summary === 'object') {
          const { successful, failed, total } = summary
          if (successful === total) {
            alert(t('uploadSuccess', { count: successful }))
          } else if (successful > 0) {
            alert(t('uploadPartialSuccess', { successful, total, failed }))
          } else {
            alert(t('uploadAllFailed'))
          }
        }
      } else {
        alert(t('uploadSuccessGeneric'))
      }

      refetchFiles()
      // Clear the input
      event.target.value = ''
    } catch (error) {
      console.error('Failed to upload files:', error)
      alert(t('uploadFailed'))
      event.target.value = ''
    }
  }

  const getFileIcon = (file: FileItem) => {
    if (file.type === 'directory') return '📁'
    const ext = file.name.split('.').pop()?.toLowerCase()
    switch (ext) {
      case 'js':
      case 'ts':
      case 'jsx':
      case 'tsx':
        return '📄'
      case 'json':
        return '⚙️'
      case 'md':
        return '📝'
      case 'py':
        return '🐍'
      default:
        return '📄'
    }
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return ''
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return `${Math.round((bytes / Math.pow(1024, i)) * 100) / 100} ${sizes[i]}`
  }

  const handleSaveFile = async (content: string) => {
    if (!selectedFile) return

    try {
      await saveFileMutation.mutateAsync({
        filename: selectedFile.name,
        content,
      })
    } catch (error) {
      console.error('Failed to save file:', error)
    }
  }

  if (filesError) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded p-4">
          <p className="text-red-800 font-medium">{t('failedToLoadFiles')}</p>
          <p className="text-red-600 text-sm mt-1">
            {t('checkConnectionRetry')}
          </p>
          <Button onClick={() => refetchFiles()} className="mt-2">
            {t('retry')}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-gray-900">
      {/* Top Toolbar */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {t('title')}
          </h1>
          {/* Breadcrumb Navigation */}
          <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleNavigateToPath('/')}
              className="px-2 py-1 h-auto text-xs"
            >
              🏠
            </Button>
            {currentPath !== '/' && (
              <>
                {currentPath
                  .split('/')
                  .filter(Boolean)
                  .map((segment, index, array) => {
                    const path = '/' + array.slice(0, index + 1).join('/')
                    return (
                      <span key={path} className="flex items-center">
                        <span className="mx-1 text-gray-400">/</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleNavigateToPath(path)}
                          className="px-2 py-1 h-auto text-xs"
                        >
                          {segment}
                        </Button>
                      </span>
                    )
                  })}
              </>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={() => setIsCreatingFile(true)}
            variant="outline"
            size="sm"
          >
            {t('newFile')}
          </Button>
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              disabled={uploadFilesMutation.isPending}
              onClick={() =>
                document.getElementById('file-upload-input')?.click()
              }
            >
              {uploadFilesMutation.isPending ? t('uploading') : t('upload')}
            </Button>
            <Input
              id="file-upload-input"
              type="file"
              multiple
              accept=".js"
              onChange={handleUploadFiles}
              className="hidden"
              disabled={uploadFilesMutation.isPending}
            />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* File Explorer Sidebar */}
        <div className="w-80 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex flex-col">
          <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <h2 className="font-medium text-sm text-gray-900 dark:text-gray-100">
              {t('files')}
            </h2>
          </div>

          <div className="flex-1 overflow-auto">
            {filesLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto mb-2"></div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t('loading')}
                </p>
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {(files as any)?.data?.map((file: FileItem) => (
                  <div
                    key={file.path}
                    className={`group flex items-center justify-between p-2 rounded cursor-pointer hover:bg-white dark:hover:bg-gray-700 transition-colors ${
                      selectedFile?.path === file.path
                        ? 'bg-blue-100 dark:bg-blue-900 border border-blue-200 dark:border-blue-700'
                        : 'hover:shadow-sm'
                    }`}
                    onClick={() => handleFileSelect(file)}
                  >
                    <div className="flex items-center space-x-2 flex-1 min-w-0">
                      <span className="text-sm">{getFileIcon(file)}</span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate text-gray-900 dark:text-gray-100">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {file.type === 'directory'
                            ? t('folder')
                            : formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteFile(file)
                      }}
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 p-1 h-auto text-red-500 hover:text-red-700 transition-opacity"
                    >
                      🗑️
                    </Button>
                  </div>
                ))}

                {(!(files as any)?.data ||
                  (files as any).data.length === 0) && (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <div className="text-2xl mb-2">📁</div>
                    <p className="text-sm">{t('noFilesFound')}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Editor Area */}
        <div className="flex-1 flex flex-col">
          {selectedFile ? (
            contentLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                  <p className="text-sm text-gray-500">
                    {t('loadingFile', { filename: selectedFile.name })}
                  </p>
                </div>
              </div>
            ) : fileContent !== null ? (
              <div className="flex-1 flex flex-col">
                {/* Editor - Full height without file tab since filename is shown in sidebar */}
                <div className="flex-1 relative">
                  {saveFileMutation.isPending && (
                    <div className="absolute top-4 right-4 z-10 flex items-center gap-2 bg-white dark:bg-gray-800 px-3 py-1 rounded-full shadow-md border">
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500"></div>
                      <span className="text-xs text-gray-600 dark:text-gray-300">
                        {t('saving')}
                      </span>
                    </div>
                  )}
                  <CodeEditor
                    value={
                      typeof fileContent === 'string'
                        ? fileContent
                        : JSON.stringify(fileContent, null, 2)
                    }
                    fileName={selectedFile.name}
                    onSave={handleSaveFile}
                    className="h-full"
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <p className="text-gray-500 mb-2">{t('unableToLoadFile')}</p>
                  <Button
                    onClick={() => refetchFiles()}
                    variant="outline"
                    size="sm"
                  >
                    {t('retry')}
                  </Button>
                </div>
              </div>
            )
          ) : (
            <div className="flex items-center justify-center h-full bg-gray-900">
              <div className="text-center">
                <div className="text-6xl mb-4">📝</div>
                <h2 className="text-xl font-medium text-gray-100 mb-2">
                  {t('welcomeToWorkspace')}
                </h2>
                <p className="text-gray-300 mb-4">{t('selectFileToStart')}</p>
                <div className="text-sm text-gray-500">
                  <p>{t('ctrlSToSave')}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create File Dialog */}
      {isCreatingFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <Card className="w-96">
            <CardHeader>
              <CardTitle>{t('createNewFile')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="file-name">{t('fileName')}</Label>
                <Input
                  id="file-name"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  placeholder={t('enterFileName')}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') handleCreateFile()
                  }}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCreatingFile(false)
                    setNewFileName('')
                  }}
                >
                  {t('cancel')}
                </Button>
                <Button
                  onClick={handleCreateFile}
                  disabled={!newFileName.trim() || saveFileMutation.isPending}
                >
                  {saveFileMutation.isPending ? t('creating') : t('create')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
