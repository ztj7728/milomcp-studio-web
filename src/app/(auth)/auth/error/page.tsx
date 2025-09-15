'use client'

import Link from 'next/link'

// Disable all static generation for this page
export const dynamic = 'force-dynamic'

export default function AuthErrorPage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center space-y-4 max-w-md">
        <h1 className="text-2xl font-bold text-red-600">
          Authentication Error
        </h1>
        <p className="text-muted-foreground">
          An error occurred during authentication. Please try again.
        </p>
        <div className="space-x-4">
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          >
            Try Again
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  )
}
