'use client'

import { useState } from 'react'
import { FileBrowser } from './file-browser'
import { FileEditor } from './file-editor'
import { FilePreview } from './file-preview'
import { WorkspaceHeader } from './workspace-header'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable'

export interface FileItem {
  name: string
  path: string
  type: 'file' | 'directory'
  size?: number
  modified?: Date
  children?: FileItem[]
}

export function WorkspaceManager() {
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null)
  const [editingFile, setEditingFile] = useState<FileItem | null>(null)
  const [currentPath, setCurrentPath] = useState('/')
  const [searchQuery, setSearchQuery] = useState('')

  const handleFileSelect = (file: FileItem) => {
    setSelectedFile(file)
    if (file.type === 'file') {
      // Check if it's an editable file type
      const editableExtensions = [
        '.js',
        '.ts',
        '.tsx',
        '.jsx',
        '.json',
        '.md',
        '.txt',
        '.py',
        '.html',
        '.css',
        '.scss',
        '.yaml',
        '.yml',
      ]
      const isEditable = editableExtensions.some((ext) =>
        file.name.toLowerCase().endsWith(ext)
      )

      if (isEditable) {
        setEditingFile(file)
      } else {
        setEditingFile(null)
      }
    }
  }

  const handleFileEdit = (file: FileItem) => {
    setEditingFile(file)
    setSelectedFile(file)
  }

  return (
    <div className="h-screen flex flex-col">
      <WorkspaceHeader
        currentPath={currentPath}
        onPathChange={setCurrentPath}
        onSearch={setSearchQuery}
      />

      <ResizablePanelGroup direction="horizontal" className="flex-1">
        {/* File Browser */}
        <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
          <FileBrowser
            currentPath={currentPath}
            onPathChange={setCurrentPath}
            selectedFile={selectedFile}
            onFileSelect={handleFileSelect}
            onFileEdit={handleFileEdit}
            searchQuery={searchQuery}
          />
        </ResizablePanel>

        <ResizableHandle />

        {/* Main Content Area */}
        <ResizablePanel defaultSize={75}>
          {editingFile ? (
            <FileEditor
              file={editingFile}
              onClose={() => setEditingFile(null)}
            />
          ) : selectedFile && selectedFile.type === 'file' ? (
            <FilePreview
              file={selectedFile}
              onEdit={() => handleFileEdit(selectedFile)}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <div className="text-6xl mb-4">📁</div>
                <h3 className="text-lg font-medium mb-2">
                  Select a file to get started
                </h3>
                <p>Choose a file from the browser to view or edit it</p>
              </div>
            </div>
          )}
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}
