import { Suspense } from 'react'
import { ThemeProvider } from 'next-themes'
import { ResponsiveLayout } from '@/components/ResponsiveLayout'

export default function Home() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <main className="prose dark:prose-invert max-w-none">
        <Suspense fallback={<div>Loading...</div>}>
          <ResponsiveLayout />
        </Suspense>
      </main>
    </ThemeProvider>
  )
}

