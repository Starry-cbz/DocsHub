import { readdir } from 'fs/promises'
import { join } from 'path'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const docsPath = join(process.cwd(), 'public', 'docs')
    const items = await readdir(docsPath)
    
    // Filter out non-directory items and hidden files
    const versions = (await Promise.all(
      items.map(async (item) => {
        const path = join(docsPath, item)
        const stats = await readdir(path)
        return { name: item, isDirectory: stats.length > 0 }
      })
    )).filter(item => item.isDirectory)
      .map(item => item.name)
      .sort((a, b) => b.localeCompare(a)) // Sort versions in descending order
    
    return NextResponse.json(versions)
  } catch (error) {
    console.error('Error reading versions:', error)
    return NextResponse.json(
      { error: 'Failed to read versions' },
      { status: 500 }
    )
  }
}

