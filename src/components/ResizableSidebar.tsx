'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { GripVertical } from 'lucide-react'

interface ResizableSidebarProps {
  children: React.ReactNode
  defaultWidth?: number
  minWidth?: number
  maxWidth?: number
  onWidthChange?: (width: number) => void
  className?: string
}

export function ResizableSidebar({
  children,
  defaultWidth = 280,
  minWidth = 220,
  maxWidth = 480,
  onWidthChange,
  className
}: ResizableSidebarProps) {
  const [isResizing, setIsResizing] = useState(false)
  const [sidebarWidth, setSidebarWidth] = useState(defaultWidth)
  const sidebarRef = useRef<HTMLDivElement>(null)

  const startResizing = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)
  }, [])

  const stopResizing = useCallback(() => {
    setIsResizing(false)
  }, [])

  const resize = useCallback((e: MouseEvent) => {
    if (!isResizing || !sidebarRef.current) return

    const newWidth = e.clientX

    if (newWidth >= minWidth && newWidth <= maxWidth) {
      setSidebarWidth(newWidth)
      onWidthChange?.(newWidth)
    }
  }, [isResizing, maxWidth, minWidth, onWidthChange])

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', resize)
      window.addEventListener('mouseup', stopResizing)
    }

    return () => {
      window.removeEventListener('mousemove', resize)
      window.removeEventListener('mouseup', stopResizing)
    }
  }, [isResizing, resize, stopResizing])

  return (
    <aside
      ref={sidebarRef}
      className={cn(
        "relative flex h-screen flex-none flex-col overflow-hidden border-r border-border bg-background",
        isResizing && "select-none",
        className
      )}
      style={{ width: sidebarWidth }}
    >
      {children}
      <div
        className={cn(
          "absolute right-0 top-0 h-full w-1 cursor-col-resize",
          "hover:bg-accent/50 active:bg-accent",
          isResizing && "bg-accent"
        )}
        onMouseDown={startResizing}
      >
        <div className="absolute right-0 top-1/2 -translate-y-1/2">
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
    </aside>
  )
}

