export function logError(error: unknown, context?: string): string {
  const errorMessage = error instanceof Error ? error.message : String(error)
  const fullMessage = context ? `${context}: ${errorMessage}` : errorMessage
  console.error(fullMessage)
  
  if (error instanceof Error && error.stack) {
    console.error('Stack trace:', error.stack)
  }
  
  return fullMessage
}

