'use client'

import { useState, useCallback } from 'react'
import { FileTree } from './FileTree'
import { SearchBar } from './SearchBar'
import { ThemeToggler } from './ThemeToggler'
import { VersionSelector } from './VersionSelector'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ChevronLeft, ChevronRight, Search, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarProps {
  onFileSelect: (path: string) => void
  version: string
  onVersionChange: (version: string) => void
  onSearchResults: (results: any[]) => void
  className?: string
  siteTitle?: string
  isCollapsed: boolean
  onToggleCollapse: () => void
}

export function Sidebar({
  onFileSelect,
  version,
  onVersionChange,
  onSearchResults,
  className,
  siteTitle = 'DocsHub',
  isCollapsed,
  onToggleCollapse
}: SidebarProps) {
  const handleVersionChange = useCallback((newVersion: string) => {
    onVersionChange(newVersion)
  }, [onVersionChange])

  const handleFileSelect = useCallback((path: string) => {
    onFileSelect(path)
  }, [onFileSelect])

  const handleSearch = useCallback((results: any[]) => {
    onSearchResults(results)
  }, [onSearchResults])

  const handleIconClick = useCallback(() => {
    if (isCollapsed) {
      onToggleCollapse()
    }
  }, [isCollapsed, onToggleCollapse])

  const sidebarContent = (
    <>
      <div className="border-b p-4">
        <h1 className="text-2xl font-bold">{siteTitle}</h1>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="space-y-4 p-4">
          <SearchBar onSearchResults={handleSearch} />
          <VersionSelector 
            onVersionChange={handleVersionChange}
            defaultVersion={version}
          />
          <FileTree 
            version={version}
            onFileSelect={handleFileSelect}
          />
        </div>
      </ScrollArea>
      
      <div className="border-t p-4">
        <ThemeToggler />
      </div>
    </>
  )

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 border-r bg-background transition-all duration-300 ease-in-out",
        isCollapsed ? "w-16" : "w-64",
        className
      )}
    >
      <div className="flex h-full flex-col">
        {isCollapsed ? (
          // Collapsed state content
          <div className="flex h-full flex-col py-4">
            <ScrollArea className="flex-1">
              <div className="space-y-4 px-4">
                <Button variant="ghost" size="icon" className="w-full p-0" onClick={handleIconClick}>
                  <Search className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="w-full p-0" onClick={handleIconClick}>
                  <FileText className="h-4 w-4" />
                </Button>
              </div>
            </ScrollArea>
            <div className="px-4 mt-auto">
              <ThemeToggler />
            </div>
          </div>
        ) : (
          sidebarContent
        )}
        <Button
          variant="ghost"
          size="icon"
          className="absolute -right-3 top-4 h-6 w-6 rounded-full border bg-background shadow-sm"
          onClick={onToggleCollapse}
        >
          {isCollapsed ? (
            <ChevronRight className="h-3 w-3" />
          ) : (
            <ChevronLeft className="h-3 w-3" />
          )}
        </Button>
      </div>
    </aside>
  )
}

