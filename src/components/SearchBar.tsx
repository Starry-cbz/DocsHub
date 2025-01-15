'use client'

import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useState, useCallback } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface SearchResult {
  path: string
  title: string
  excerpt: string
}

interface SearchBarProps {
  onSearchResults?: (results: SearchResult[]) => void
  className?: string
}

export function SearchBar({ onSearchResults, className }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!query.trim()) {
      onSearchResults?.([])
      return
    }
    
    try {
      setIsSearching(true)
      setError(null)
      
      const response = await fetch(`/api/docs/search?q=${encodeURIComponent(query)}`)
      if (!response.ok) throw new Error('Search failed')
      
      const results = await response.json()
      if (results.error) throw new Error(results.error)
      
      onSearchResults?.(results)
    } catch (error) {
      console.error('Search error:', error)
      setError(error instanceof Error ? error.message : 'Search failed')
    } finally {
      setIsSearching(false)
    }
  }, [query, onSearchResults])

  return (
    <div className={cn("space-y-2", className)}>
      <form onSubmit={handleSearch} className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search documentation..."
          className="pl-8"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={isSearching}
        />
      </form>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isSearching && (
        <div className="space-y-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      )}
    </div>
  )
}

