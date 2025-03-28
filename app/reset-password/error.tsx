'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6 bg-white p-8 shadow-lg rounded-lg border">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight text-red-600">Something went wrong!</h2>
          <p className="text-sm text-muted-foreground">
            We encountered an error while processing your request. Please try again.
          </p>
          <Button
            onClick={reset}
            className="mt-4"
            variant="outline"
          >
            Try again
          </Button>
        </div>
      </div>
    </div>
  )
}