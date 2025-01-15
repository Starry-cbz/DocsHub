import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import { headers } from 'next/headers'
import { SeoConfig } from '@/lib/seo-config'
import './globals.css'
import 'katex/dist/katex.min.css'

const inter = Inter({ subsets: ['latin'] })

async function getSeoData(): Promise<SeoConfig> {
  const headersList = headers()
  const protocol = headersList.get('x-forwarded-proto') || 'http'
  const host = headersList.get('host') || 'localhost:3000'
  
  try {
    const response = await fetch(`${protocol}://${host}/api/seo`)
    if (!response.ok) throw new Error('Failed to fetch SEO config')
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

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoData()
  
  return {
    title: {
      default: seo.title,
      template: `%s | ${seo.title}`
    },
    description: seo.description,
    keywords: seo.keywords,
    authors: [{ name: seo.author }],
    openGraph: {
      title: seo.title,
      description: seo.description,
      images: [seo.ogImage]
    },
    twitter: {
      card: 'summary_large_image',
      title: seo.title,
      description: seo.description,
      creator: seo.twitterHandle,
      images: [seo.ogImage]
    }
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}

