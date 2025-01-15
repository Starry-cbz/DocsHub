'use client'

import { ChevronDown, ChevronRight, File, Folder } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { cn } from '@/lib/utils'

interface MenuItem {
  name: string
  type: 'file' | 'folder'
  children?: MenuItem[]
  path?: string
}

interface MenuItemComponentProps {
  item: MenuItem
  level: number
  onFileSelect: (path: string) => void
  version: string
}

function MenuItemComponent({ item, level, onFileSelect, version }: MenuItemComponentProps) {
  const [isOpen, setIsOpen] = useState(false)

  if (!item || typeof item !== 'object') {
    console.error('Invalid menu item:', item)
    return null
  }

  if (item.type === 'file') {
    return (
      <Button
        variant="ghost"
        className={cn(
          "w-full justify-start gap-2 px-2 py-1.5 h-auto",
          level > 0 && "ml-4"
        )}
        onClick={() => item.path && onFileSelect(`${version}/${item.path}`)}
      >
        <File className="h-4 w-4 shrink-0" />
        <span className="truncate">{item.name}</span>
      </Button>
    )
  }

  if (item.type === 'folder') {
    return (
      <div>
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-2 px-2 py-1.5 h-auto",
            level > 0 && "ml-4"
          )}
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? (
            <ChevronDown className="h-4 w-4 shrink-0" />
          ) : (
            <ChevronRight className="h-4 w-4 shrink-0" />
          )}
          <Folder className="h-4 w-4 shrink-0" />
          <span className="truncate">{item.name}</span>
        </Button>
        {isOpen && item.children && Array.isArray(item.children) && (
          <div className="ml-4">
            {item.children.map((child, index) => (
              <MenuItemComponent
                key={`${level}-${child.name}-${index}`}
                item={child}
                level={level + 1}
                onFileSelect={onFileSelect}
                version={version}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  return null
}

interface SidebarMenuProps {
  onFileSelect: (path: string) => void
  version: string
}

export function SidebarMenu({ onFileSelect, version }: SidebarMenuProps) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
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
        
        setMenuItems(data)
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
      <div className="p-4 text-destructive">
        <p className="text-sm">Error loading structure: {error}</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-8 bg-muted animate-pulse rounded"
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <ScrollArea className="h-[calc(100vh-200px)]">
        <div className="space-y-1 p-2">
          {Array.isArray(menuItems) ? menuItems.map((item, index) => (
            <MenuItemComponent
              key={`root-${item.name}-${index}`}
              item={item}
              level={0}
              onFileSelect={onFileSelect}
              version={version}
            />
          )) : null}
        </div>
      </ScrollArea>
    </ErrorBoundary>
  )
}

