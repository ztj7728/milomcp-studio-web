import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const token = req.nextauth.token

    // Redirect authenticated users away from auth pages
    if (
      token &&
      (pathname.startsWith('/login') || pathname.startsWith('/signup'))
    ) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    // Admin-only routes
    if (pathname.startsWith('/admin') && token?.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    // Admin-only dashboard routes
    if (pathname.startsWith('/dashboard/users') && token?.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    if (pathname.startsWith('/dashboard/settings') && token?.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl

        // Public routes
        if (
          pathname === '/' ||
          pathname.startsWith('/login') ||
          pathname.startsWith('/signup')
        ) {
          return true
        }

        // Protected routes require authentication
        return !!token
      },
    },
  }
)

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
