'use client'

import { useEffect, useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"

interface VersionSelectorProps {
  onVersionChange: (version: string) => void
  defaultVersion?: string
  className?: string
}

export function VersionSelector({ 
  onVersionChange, 
  defaultVersion,
  className 
}: VersionSelectorProps) {
  const [versions, setVersions] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedVersion, setSelectedVersion] = useState<string>(defaultVersion || '')

  useEffect(() => {
    async function fetchVersions() {
      try {
        setIsLoading(true)
        setError(null)
        
        const response = await fetch('/api/docs/versions')
        if (!response.ok) throw new Error('Failed to fetch versions')
        
        const data = await response.json()
        if (!Array.isArray(data)) throw new Error('Invalid versions format')
        
        setVersions(data)
        
        // Set initial version if we have versions and no default was provided
        if (data.length > 0 && !defaultVersion) {
          setSelectedVersion(data[0])
          onVersionChange(data[0])
        }
      } catch (error) {
        console.error('Error fetching versions:', error)
        setError(error instanceof Error ? error.message : 'Failed to load versions')
      } finally {
        setIsLoading(false)
      }
    }

    fetchVersions()
  }, [defaultVersion, onVersionChange])

  const handleVersionChange = (version: string) => {
    setSelectedVersion(version)
    onVersionChange(version)
  }

  if (error) {
    return (
      <Alert variant="destructive" className="my-4">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (isLoading) {
    return <Skeleton className="h-10 w-[180px]" />
  }

  if (versions.length === 0) {
    return (
      <Alert className="my-4">
        <AlertDescription>No versions available</AlertDescription>
      </Alert>
    )
  }

  return (
    <Select value={selectedVersion} onValueChange={handleVersionChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select version" />
      </SelectTrigger>
      <SelectContent>
        {versions.map((version) => (
          <SelectItem key={version} value={version}>
            {version}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

