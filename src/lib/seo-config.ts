export interface SeoConfig {
  title: string
  description: string
  keywords: string[]
  author: string
  ogImage: string
  twitterHandle: string
}

export async function getSeoConfig(): Promise<SeoConfig> {
  try {
    const response = await fetch('/api/seo')
    if (!response.ok) {
      throw new Error('Failed to fetch SEO configuration')
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching SEO config:', error)
    return {
      title: 'DocsHub',
      description: 'Documentation Hub',
      keywords: ['docs', 'documentation'],
      author: 'DocsHub Team',
      ogImage: '/og-image.png',
      twitterHandle: '@docshub'
    }
  }
}

