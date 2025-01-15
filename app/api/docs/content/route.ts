import { readFile } from 'fs/promises'
import { join } from 'path'
import { NextResponse } from 'next/server'
import matter from 'gray-matter'
import { logError } from '@/utils/errorLogger'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const path = searchParams.get('path')

    if (!path) {
      return NextResponse.json(
        { error: 'Path parameter is required' },
        { status: 400 }
      )
    }

    // Ensure we're reading from the docs directory
    const safePath = join(process.cwd(), 'public', 'docs', path)
    const docsDir = join(process.cwd(), 'public', 'docs')
    
    if (!safePath.startsWith(docsDir)) {
      return NextResponse.json(
        { error: 'Invalid path' },
        { status: 400 }
      )
    }

    try {
      const fileContent = await readFile(safePath, 'utf-8')
      const { content, data: frontmatter } = matter(fileContent)

      return NextResponse.json({ 
        content,
        frontmatter
      })
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
        // Try adding .md extension if not present
        if (!path.endsWith('.md')) {
          const pathWithExt = safePath + '.md'
          const fileContent = await readFile(pathWithExt, 'utf-8')
          const { content, data: frontmatter } = matter(fileContent)
          
          return NextResponse.json({ 
            content,
            frontmatter
          })
        }
        return NextResponse.json(
          { error: 'File not found' },
          { status: 404 }
        )
      }
      throw error
    }
  } catch (error) {
    const errorMessage = logError(error, 'Error reading file')
    return NextResponse.json(
      { error: `Failed to read file: ${errorMessage}` },
      { status: 500 }
    )
  }
}

