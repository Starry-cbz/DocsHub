'use client'

import { useState, useEffect } from 'react'
import { ChevronRight, ChevronDown, File, Folder } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { cn } from '@/lib/utils'

interface FileMetadata {
  title?: string
  order?: number
}

interface FileTreeItem {
  name: string
  type: 'file' | 'folder'
  children?: FileTreeItem[]
  path?: string
  metadata?: FileMetadata
}

interface FileTreeProps {
  version: string
  onFileSelect: (path: string) => void
}

interface FileTreeNodeProps {
  item: FileTreeItem
  level?: number
  onFileSelect: (path: string) => void
  version: string
}

function FileTreeNode({ item, level = 0, onFileSelect, version }: FileTreeNodeProps) {
  const [isOpen, setIsOpen] = useState(false)
  const isFolder = item.type === 'folder'
  const displayName = item.metadata?.title || item.name.replace(/\.md$/, '')

  if (!item || typeof item !== 'object') {
    console.error('Invalid tree item:', item)
    return null
  }

  const handleClick = () => {
    if (isFolder) {
      setIsOpen(!isOpen)
    } else if (item.path) {
      onFileSelect(item.path)
    }
  }

  return (
    <div>
      <Button
        variant="ghost"
        className={cn(
          "w-full justify-start gap-2 px-2 py-1.5 h-auto",
          level > 0 && "ml-4"
        )}
        onClick={handleClick}
      >
        {isFolder ? (
          isOpen ? (
            <ChevronDown className="h-4 w-4 shrink-0" />
          ) : (
            <ChevronRight className="h-4 w-4 shrink-0" />
          )
        ) : (
          <File className="h-4 w-4 shrink-0" />
        )}
        {isFolder && <Folder className="h-4 w-4 shrink-0" />}
        <span className="truncate">{displayName}</span>
      </Button>
      
      {isFolder && isOpen && item.children && (
        <div className="ml-4">
          {[...item.children]
            .sort((a, b) => {
              // First sort by type (folders first)
              if (a.type === 'folder' && b.type === 'file') return -1
              if (a.type === 'file' && b.type === 'folder') return 1
              
              // Then sort by order if available
              const orderA = a.metadata?.order ?? Infinity
              const orderB = b.metadata?.order ?? Infinity
              if (orderA !== orderB) return orderA - orderB
              
              // Finally sort by display name
              const nameA = a.metadata?.title || a.name
              const nameB = b.metadata?.title || b.name
              return nameA.localeCompare(nameB)
            })
            .map((child, index) => (
              <FileTreeNode
                key={`${child.name}-${index}`}
                item={child}
                level={level + 1}
                onFileSelect={onFileSelect}
                version={version}
              />
            ))
          }
        </div>
      )}
    </div>
  )
}

export function FileTree({ version, onFileSelect }: FileTreeProps) {
  const [items, setItems] = useState<FileTreeItem[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchStructure() {
      try {
        setIsLoading(true)
        setError(null)
        const response = await fetch(`/api/docs/structure?version=${encodeURIComponent(version)}`)
        
        if (!response.ok) {
          throw new Error(`Failed to fetch directory structure: ${response.statusText}`)
        }
        
        const data = await response.json()
        
        if (!Array.isArray(data)) {
          throw new Error('Invalid structure format: expected an array')
        }
        
        setItems(data)
      } catch (error) {
        console.error('Error fetching directory structure:', error)
        setError(error instanceof Error ? error.message : 'Failed to load structure')
      } finally {
        setIsLoading(false)
      }
    }

    fetchStructure()
  }, [version])

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <ScrollArea className="h-[calc(100vh-200px)]">
      <div className="space-y-1 p-2">
        {Array.isArray(items) ? items.map((item, index) => (
          <FileTreeNode
            key={`root-${item.name}-${index}`}
            item={item}
            level={0}
            onFileSelect={onFileSelect}
            version={version}
          />
        )) : null}
      </div>
    </ScrollArea>
  )
}

