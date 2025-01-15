'use client'

import { ThemeProvider } from 'next-themes'
import { ResponsiveLayout } from './components/ResponsiveLayout'
import { Button } from "@/components/ui/button"

export default function App() {
  return (
    <ThemeProvider attribute="class">
      <ResponsiveLayout />
    </ThemeProvider>
  )
}

