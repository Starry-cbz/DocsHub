import { readFile } from 'fs/promises'
import { join } from 'path'
import { NextResponse } from 'next/server'

export interface SeoConfig {
  title: string
  description: string
  keywords: string[]
  author: string
  ogImage: string
  twitterHandle: string
}

const defaultSeoConfig: SeoConfig = {
  title: 'DocsHub',
  description: 'Documentation Hub',
  keywords: ['docs', 'documentation'],
  author: 'DocsHub Team',
  ogImage: '/og-image.png',
  twitterHandle: '@docshub'
}

export async function GET() {
  try {
    const configPath = join(process.cwd(), 'public', 'set', 'seo.json')
    const configData = await readFile(configPath, 'utf-8')
    return NextResponse.json(JSON.parse(configData))
  } catch (error) {
    console.error('Error reading SEO config:', error)
    return NextResponse.json(defaultSeoConfig)
  }
}

