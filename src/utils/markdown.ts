import matter from 'gray-matter'
import { remark } from 'remark'
import html from 'remark-html'

export async function parseMarkdown(markdown: string) {
  // Parse front matter
  const { data, content } = matter(markdown)
  
  // Convert markdown to HTML
  const processedContent = await remark()
    .use(html)
    .process(content)
  
  const contentHtml = processedContent.toString()

  return {
    metadata: data,
    content: contentHtml
  }
}

export function generateTableOfContents(markdown: string) {
  const headings = markdown.match(/#{1,6}.+/g) || []
  return headings.map(heading => {
    const level = heading.match(/^#+/)[0].length
    const text = heading.replace(/^#+\s*/, '')
    return { level, text }
  })
}

