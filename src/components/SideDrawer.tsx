'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Menu } from 'lucide-react'
import { SidebarMenu } from './SidebarMenu'
import { SearchBar } from './SearchBar'
import { VersionSelector } from './VersionSelector'
import { cn } from '@/lib/utils'

interface SideDrawerProps {
  onFileSelect: (path: string) => void
  version: string
  onVersionChange: (version: string) => void
  onSearchResults: (results: any[]) => void
}

export function SideDrawer({
  onFileSelect,
  version,
  onVersionChange,
  onSearchResults,
}: SideDrawerProps) {
  const [open, setOpen] = useState(false)

  const handleFileSelect = (path: string) => {
    onFileSelect(path)
    setOpen(false)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className={cn(
            "md:hidden",
            "hover:bg-accent hover:text-accent-foreground"
          )}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent 
        side="left" 
        className={cn(
          "w-[300px] sm:w-[350px] p-0",
          "flex flex-col"
        )}
      >
        <SheetHeader className="p-4 border-b">
          <SheetTitle>Navigation</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-hidden">
          <div className="p-4 space-y-4">
            <SearchBar onSearchResults={onSearchResults} />
            <VersionSelector onVersionChange={onVersionChange} />
            <SidebarMenu 
              onFileSelect={handleFileSelect}
              version={version}
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

