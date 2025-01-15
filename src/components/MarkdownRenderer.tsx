'use client'

import { useEffect, useState } from 'react'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import remarkEmoji from 'remark-emoji'
import remarkToc from 'remark-toc'
import remarkBreaks from 'remark-breaks'
import { remarkImageDimensions } from '@/lib/plugins/remark-image-dimensions'
import { remarkMarkedText } from '@/lib/plugins/remark-marked-text'
import { remarkSubSuper } from '@/lib/plugins/remark-sub-super'
import remarkRehype from 'remark-rehype'
import rehypeRaw from 'rehype-raw'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypePrism from 'rehype-prism-plus'
import rehypeKatex from 'rehype-katex'
import rehypeStringify from 'rehype-stringify'
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { cn } from "@/lib/utils"
import { logError } from '@/utils/errorLogger'
import { CopyButton } from '@/components/CopyButton'
import { createRoot } from 'react-dom/client'

interface MarkdownRendererProps {
  content?: string
  className?: string
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  const [html, setHtml] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function processMarkdown() {
      if (!content) {
        setHtml('')
        setError(null)
        return
      }

      try {
        setIsLoading(true)
        setError(null)

        const processor = unified()
          .use(remarkParse)
          .use(remarkGfm)
          .use(remarkMath)
          .use(remarkEmoji)
          .use(remarkBreaks)
          .use(remarkImageDimensions)
          .use(remarkMarkedText)
          .use(remarkSubSuper)
          .use(remarkToc, {
            heading: 'Table of Contents',
            tight: true,
            ordered: true,
            maxDepth: 6,
            prefix: 'toc-',
          })
          .use(remarkRehype, { allowDangerousHtml: true })
          .use(rehypeRaw)
          .use(rehypeSlug)
          .use(rehypeAutolinkHeadings, {
            behavior: 'append',
            properties: { className: ['anchor'] },
            content: {
              type: 'element',
              tagName: 'span',
              properties: { className: ['anchor-icon'] },
              children: [{ type: 'text', value: ' #' }]
            }
          })
          .use(rehypePrism, {
            ignoreMissing: true,
            showLineNumbers: true,
          })
          .use(rehypeKatex, {
            throwOnError: false,
            strict: false,
            output: 'htmlAndMathml',
          })
          .use(rehypeStringify)

        const result = await processor.process(content)
        setHtml(result.toString())
      } catch (error) {
        const errorMessage = logError(error, 'Error processing markdown')
        setError(`Failed to process markdown content: ${errorMessage}. Please try again.`)
      } finally {
        setIsLoading(false)
      }
    }

    processMarkdown()
  }, [content])

  useEffect(() => {
    if (html) {
      const codeBlocks = document.querySelectorAll('pre')
      codeBlocks.forEach((block) => {
        const code = block.querySelector('code')
        if (code) {
          const copyButton = document.createElement('div')
          copyButton.className = 'copy-button'
          block.appendChild(copyButton)
        
          const root = createRoot(copyButton)
          root.render(<CopyButton text={code.textContent || ''} />)
        }
      })
    }
  }, [html])

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-[250px]" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-[90%]" />
        <Skeleton className="h-4 w-[85%]" />
      </div>
    )
  }

  if (!content) {
    return (
      <div className="flex h-[50vh] items-center justify-center text-muted-foreground">
        <p>Select a document to view</p>
      </div>
    )
  }

  return (
    <article 
      className={cn(
        "prose prose-sm md:prose-base lg:prose-lg dark:prose-invert max-w-none",
        "prose-headings:scroll-mt-28 prose-headings:font-bold prose-headings:tracking-tight",
        "prose-a:text-primary prose-a:no-underline hover:prose-a:underline",
        "prose-code:before:content-none prose-code:after:content-none",
        "prose-pre:max-h-[650px] prose-pre:overflow-auto prose-pre:relative",
        "prose-img:rounded-lg prose-img:shadow-md",
        "prose-math:mt-4",
        className
      )}
      dangerouslySetInnerHTML={{ __html: html }} 
    />
  )
}

