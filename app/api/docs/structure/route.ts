import { readdir, stat, readFile } from 'fs/promises'
import { join } from 'path'
import { NextRequest, NextResponse } from 'next/server'
import matter from 'gray-matter'

export const dynamic = 'force-dynamic'

async function getFileMetadata(filePath: string) {
  try {
    if (!filePath.endsWith('.md')) {
      return null
    }

    const content = await readFile(filePath, 'utf-8')
    const { data } = matter(content)
    return {
      title: data.title,
      order: typeof data.order === 'number' ? data.order : undefined
    }
  } catch (error) {
    console.error(`Error reading metadata from ${filePath}:`, error)
    return null
  }
}

async function getDirectoryStructure(dir: string): Promise<any[]> {
  try {
    const items = await readdir(dir)
    const itemsWithStats = await Promise.all(
      items.map(async (item) => {
        const path = join(dir, item)
        const stats = await stat(path)
        
        if (stats.isDirectory()) {
          const children = await getDirectoryStructure(path)
          return {
            name: item,
            type: 'folder',
            children
          }
        }
        
        const metadata = await getFileMetadata(path)
        return {
          name: item,
          type: 'file',
          path: path.split('public/docs/')[1],
          metadata
        }
      })
    )
    
    return itemsWithStats.sort((a, b) => {
      // Folders first
      if (a.type === 'folder' && b.type === 'file') return -1
      if (a.type === 'file' && b.type === 'folder') return 1
      
      // Then by order
      const orderA = a.metadata?.order ?? Infinity
      const orderB = b.metadata?.order ?? Infinity
      if (orderA !== orderB) return orderA - orderB
      
      // Finally by name
      return a.name.localeCompare(b.name)
    })
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error)
    return []
  }
}

export async function GET(request: NextRequest) {
  try {
    const version = request.nextUrl.searchParams.get('version')

    if (!version) {
      return NextResponse.json(
        { error: 'Version parameter is required' },
        { status: 400 }
      )
    }

    const docsPath = join(process.cwd(), 'public', 'docs', version)
    const structure = await getDirectoryStructure(docsPath)
    return NextResponse.json(structure)
  } catch (error) {
    console.error('Error reading directory structure:', error)
    return NextResponse.json(
      { error: 'Failed to read directory structure' },
      { status: 500 }
    )
  }
}

