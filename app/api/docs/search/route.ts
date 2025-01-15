import { readFile, readdir } from 'fs/promises'
import { join } from 'path'
import { NextResponse } from 'next/server'
import matter from 'gray-matter'

async function searchInFile(filePath: string, searchQuery: string) {
  try {
    const content = await readFile(filePath, 'utf-8')
    const { data, content: markdownContent } = matter(content)
    
    const title = data.title || filePath.split('/').pop()?.replace('.md', '') || ''
    const lowerContent = markdownContent.toLowerCase()
    const lowerQuery = searchQuery.toLowerCase()
    
    if (title.toLowerCase().includes(lowerQuery) || lowerContent.includes(lowerQuery)) {
      // Find the context around the search term
      let excerpt = ''
      const index = lowerContent.indexOf(lowerQuery)
      
      if (index !== -1) {
        const start = Math.max(0, index - 100)
        const end = Math.min(markdownContent.length, index + 100)
        excerpt = markdownContent.slice(start, end).trim() + '...'
      } else {
        // If query matches title but not content, use first 200 chars as excerpt
        excerpt = markdownContent.slice(0, 200).trim() + '...'
      }
      
      // Ensure the path is relative to the docs directory and includes .md extension
      const relativePath = filePath.split('public/docs/')[1]
      
      return {
        path: relativePath,
        title,
        excerpt
      }
    }
    
    return null
  } catch (error) {
    console.error(`Error searching in file ${filePath}:`, error)
    return null
  }
}

async function searchInDirectory(dir: string, searchQuery: string): Promise<any[]> {
  try {
    const items = await readdir(dir, { withFileTypes: true })
    const results = await Promise.all(
      items.map(async (item) => {
        const path = join(dir, item.name)
        
        if (item.isDirectory()) {
          return searchInDirectory(path, searchQuery)
        }
        
        if (item.name.endsWith('.md')) {
          return searchInFile(path, searchQuery)
        }
        
        return null
      })
    )
    
    return results
      .flat()
      .filter((result): result is NonNullable<typeof result> => result !== null)
  } catch (error) {
    console.error('Error searching directory:', error)
    return []
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    
    if (!query) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      )
    }
    
    const docsPath = join(process.cwd(), 'public', 'docs')
    const results = await searchInDirectory(docsPath, query)
    
    return NextResponse.json(results)
  } catch (error) {
    console.error('Error performing search:', error)
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    )
  }
}

