'use client'

import { useEffect, useState, useRef } from 'react'
import dynamic from 'next/dynamic'
import { useTheme } from 'next-themes'
import { Button } from './button'
import { Card, CardContent, CardHeader, CardTitle } from './card'

// Dynamically import Monaco Editor to avoid SSR issues
const Editor = dynamic(
  () => import('@monaco-editor/react').then((mod) => mod.default),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-96 border rounded">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p className="text-sm text-gray-500">Loading editor...</p>
        </div>
      </div>
    ),
  }
)

interface CodeEditorProps {
  value: string
  onChange?: (value: string) => void
  language?: string
  readOnly?: boolean
  fileName?: string
  onSave?: (value: string) => void
  className?: string
}

export function CodeEditor({
  value,
  onChange,
  language = 'javascript',
  readOnly = false,
  fileName = '',
  onSave,
  className = '',
}: CodeEditorProps) {
  const [editorValue, setEditorValue] = useState(value)
  const [hasChanges, setHasChanges] = useState(false)
  const { theme } = useTheme()

  // Use refs to store current values for the keyboard shortcut
  const editorValueRef = useRef(editorValue)
  const hasChangesRef = useRef(hasChanges)
  const onSaveRef = useRef(onSave)

  useEffect(() => {
    setEditorValue(value)
    setHasChanges(false)
  }, [value])

  // Keep refs updated
  useEffect(() => {
    editorValueRef.current = editorValue
  }, [editorValue])

  useEffect(() => {
    hasChangesRef.current = hasChanges
  }, [hasChanges])

  useEffect(() => {
    onSaveRef.current = onSave
  }, [onSave])

  const handleEditorDidMount = (editor: any, monaco: any) => {
    // Configure editor options
    editor.updateOptions({
      fontSize: 14,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      automaticLayout: true,
      wordWrap: 'on',
      lineNumbers: 'on',
      folding: true,
      renderWhitespace: 'selection',
    })

    // Add save shortcut (Ctrl+S / Cmd+S)
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      if (onSaveRef.current && hasChangesRef.current) {
        onSaveRef.current(editorValueRef.current)
        setHasChanges(false)
      }
    })
  }

  const handleEditorChange = (newValue: string | undefined) => {
    const currentValue = newValue || ''
    setEditorValue(currentValue)
    setHasChanges(currentValue !== value)
    onChange?.(currentValue)
  }

  const handleSave = () => {
    if (onSave && hasChanges) {
      onSave(editorValue)
      setHasChanges(false)
    }
  }

  const detectLanguage = (fileName: string): string => {
    const ext = fileName.split('.').pop()?.toLowerCase()

    const languageMap: Record<string, string> = {
      js: 'javascript',
      jsx: 'javascript',
      ts: 'typescript',
      tsx: 'typescript',
      py: 'python',
      json: 'json',
      md: 'markdown',
      html: 'html',
      css: 'css',
      scss: 'scss',
      less: 'less',
      xml: 'xml',
      yaml: 'yaml',
      yml: 'yaml',
      sql: 'sql',
      php: 'php',
      java: 'java',
      cpp: 'cpp',
      c: 'c',
      cs: 'csharp',
      go: 'go',
      rs: 'rust',
      rb: 'ruby',
      sh: 'shell',
      bash: 'shell',
      dockerfile: 'dockerfile',
      txt: 'plaintext',
    }

    return languageMap[ext || ''] || 'plaintext'
  }

  const editorLanguage = fileName ? detectLanguage(fileName) : language
  const editorTheme = theme === 'dark' ? 'vs-dark' : 'vs-light'

  return (
    <div className={className}>
      <CardContent className="p-0">
        <div className="border border-gray-200 dark:border-gray-700 rounded overflow-hidden">
          <Editor
            height="500px"
            language={editorLanguage}
            value={editorValue}
            onChange={handleEditorChange}
            onMount={handleEditorDidMount}
            theme={editorTheme}
            options={{
              readOnly,
              fontSize: 14,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              automaticLayout: true,
              wordWrap: 'on',
              lineNumbers: 'on',
              folding: true,
              renderWhitespace: 'selection',
              scrollbar: {
                vertical: 'visible',
                horizontal: 'visible',
                useShadows: false,
                verticalScrollbarSize: 8,
                horizontalScrollbarSize: 8,
              },
              padding: {
                top: 16,
                bottom: 16,
              },
            }}
          />
        </div>
      </CardContent>

      {hasChanges && !readOnly && (
        <div className="flex items-center justify-between px-4 py-2 bg-orange-50 dark:bg-orange-900 border-t border-orange-200 dark:border-orange-700">
          <div className="flex items-center text-xs text-orange-700 dark:text-orange-300">
            💡 Press{' '}
            <kbd className="px-1 py-0.5 bg-orange-200 dark:bg-orange-800 rounded text-xs">
              Ctrl+S
            </kbd>{' '}
            to save changes
          </div>
          <Button
            onClick={handleSave}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1"
          >
            💾 Save
          </Button>
        </div>
      )}
    </div>
  )
}
