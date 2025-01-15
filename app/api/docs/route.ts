import { readFile } from 'fs/promises'
import { join } from 'path'
import { NextResponse } from 'next/server'

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

    const content = await readFile(safePath, 'utf-8')
    return NextResponse.json({ content })
  } catch (error) {
    console.error('Error reading markdown file:', error)
    return NextResponse.json(
      { error: 'Failed to read markdown file' },
      { status: 500 }
    )
  }
}

