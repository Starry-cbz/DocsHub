'use client'

import { useState } from 'react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Menu, ChevronRight, ChevronDown, File, Folder } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavItem {
  title: string
  href?: string
  children?: NavItem[]
}

interface SidebarProps {
  items: NavItem[]
}

function NavItems({ items, level = 0 }: { items: NavItem[], level?: number }) {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({})

  const toggleItem = (title: string) => {
    setOpenItems(prev => ({
      ...prev,
      [title]: !prev[title]
    }))
  }

  return (
    <div className="space-y-1">
      {items.map((item) => {
        const isOpen = openItems[item.title]
        const hasChildren = item.children && item.children.length > 0

        return (
          <div key={item.title} className={cn("flex flex-col", level > 0 && "ml-4")}>
            <Button
              variant="ghost"
              className="justify-start gap-2 h-auto py-1.5"
              onClick={() => hasChildren && toggleItem(item.title)}
            >
              {hasChildren ? (
                isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
              ) : (
                <File className="h-4 w-4" />
              )}
              {hasChildren && <Folder className="h-4 w-4" />}
              <span className="truncate">{item.title}</span>
            </Button>
            {hasChildren && isOpen && (
              <NavItems items={item.children} level={level + 1} />
            )}
          </div>
        )
      })}
    </div>
  )
}

export function Sidebar({ items }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Mobile Drawer */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[300px] p-0">
          <ScrollArea className="h-full py-6 px-4">
            <NavItems items={items} />
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex">
        <div className="w-64 border-r bg-background">
          <ScrollArea className="h-[calc(100vh-4rem)] py-6 px-4">
            <NavItems items={items} />
          </ScrollArea>
        </div>
      </div>
    </>
  )
}

