import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { File } from 'lucide-react'

interface SearchResult {
  path: string
  title: string
  excerpt: string
}

interface SearchResultsProps {
  results: SearchResult[]
  onResultClick: (path: string) => void
}

export function SearchResults({ results, onResultClick }: SearchResultsProps) {
  const handleResultClick = (result: SearchResult) => {
    // Ensure the path includes .md extension
    const path = result.path.endsWith('.md') ? result.path : `${result.path}.md`
    onResultClick(path)
  }

  return (
    <ScrollArea className="h-[calc(100vh-200px)] rounded-md border">
      <div className="p-4 space-y-4">
        {results.length === 0 ? (
          <p className="text-center text-muted-foreground">No results found</p>
        ) : (
          results.map((result, index) => (
            <Button
              key={index}
              variant="ghost"
              className="w-full justify-start text-left space-x-2"
              onClick={() => handleResultClick(result)}
            >
              <File className="h-4 w-4 shrink-0" />
              <div>
                <h3 className="font-medium">{result.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {result.excerpt}
                </p>
              </div>
            </Button>
          ))
        )}
      </div>
    </ScrollArea>
  )
}

