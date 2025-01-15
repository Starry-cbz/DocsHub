'use client'

import { Suspense, useState, useCallback, useEffect } from 'react'
import { Sidebar } from './Sidebar'
import { MarkdownRenderer } from './MarkdownRenderer'
import { ErrorBoundary } from './ErrorBoundary'
import { getSeoConfig, type SeoConfig } from '@/lib/seo-config'
import { SearchResults } from './SearchResults'
import { cn } from "@/lib/utils"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useRouter, useSearchParams } from 'next/navigation'

interface SearchResult {
  path: string
  title: string
  excerpt: string
}

function ResponsiveLayoutContent() {
  const [currentPath, setCurrentPath] = useState<string>('')
  const [currentContent, setCurrentContent] = useState<string>('')
  const [currentVersion, setCurrentVersion] = useState<string>('')
  const [seoConfig, setSeoConfig] = useState<SeoConfig | null>(null)
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true)

  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const loadSeoConfig = async () => {
      try {
        const config = await getSeoConfig()
        setSeoConfig(config)
      } catch (error) {
        console.error('Error loading SEO config:', error)
      }
    }
    loadSeoConfig()
  }, [])

  useEffect(() => {
    const version = searchParams.get('version')
    const path = searchParams.get('path')

    if (version) {
      setCurrentVersion(version)
      if (path) {
        handleFileSelect(`${version}/${path}`)
      }
    }
  }, [searchParams])

  const handleVersionChange = useCallback((version: string) => {
    setCurrentVersion(version)
    setCurrentContent('')
    setCurrentPath('')
    setShowSearchResults(false)
    setError(null)
    
    const newParams = new URLSearchParams(searchParams.toString())
    newParams.set('version', version)
    router.push(`/?${newParams.toString()}`)
  }, [router, searchParams])

  const handleFileSelect = useCallback(async (path: string) => {
    try {
      setCurrentPath(path)
      setShowSearchResults(false)
      setError(null)
      setCurrentContent('')
      
      const response = await fetch(`/api/docs/content?path=${encodeURIComponent(path)}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      if (data.error) {
        throw new Error(data.error)
      }
      
      setCurrentContent(data.content)

      const newParams = new URLSearchParams(searchParams.toString())
      const [version, ...pathParts] = path.split('/')
      newParams.set('version', version)
      newParams.set('path', pathParts.join('/'))
      router.push(`/?${newParams.toString()}`)

      if (seoConfig) {
        document.title = `${pathParts[pathParts.length - 1]} | ${seoConfig.title}`
      }
    } catch (error) {
      console.error('Error fetching document:', error)
      setError('Failed to load document content. Please try again.')
    }
  }, [router, searchParams, seoConfig])

  const handleSearchResults = useCallback((results: SearchResult[]) => {
    setSearchResults(results)
    setShowSearchResults(true)
    setError(null)
  }, [])

  const handleSearchResultClick = useCallback((path: string) => {
    handleFileSelect(path)
  }, [handleFileSelect])

  const toggleSidebar = useCallback(() => {
    setIsSidebarCollapsed(prev => !prev)
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        version={currentVersion}
        onVersionChange={handleVersionChange}
        onFileSelect={handleFileSelect}
        onSearchResults={handleSearchResults}
        siteTitle={seoConfig?.title || 'DocsHub'}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={toggleSidebar}
      />

      <main 
        className={cn(
          "min-h-screen transition-all duration-300 ease-in-out",
          isSidebarCollapsed ? "ml-16" : "ml-64"
        )}
      >
        <div className="container mx-auto px-4 py-8">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {showSearchResults ? (
            <SearchResults 
              results={searchResults} 
              onResultClick={handleSearchResultClick}
            />
          ) : (
            <MarkdownRenderer 
              content={currentContent}
              className="mx-auto max-w-4xl"
            />
          )}
        </div>
      </main>
    </div>
  )
}

export function ResponsiveLayout() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<div>Loading...</div>}>
        <ResponsiveLayoutContent />
      </Suspense>
    </ErrorBoundary>
  )
}

