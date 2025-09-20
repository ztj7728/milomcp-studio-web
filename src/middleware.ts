import { withAuth } from 'next-auth/middleware'
import createIntlMiddleware from 'next-intl/middleware'
import { NextRequest, NextResponse } from 'next/server'
import { locales, defaultLocale } from './i18n/config'
import { getLocaleFromPathname } from './lib/i18n-utils'

// Create the internationalization middleware
const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
  localeDetection: false, // Disable automatic detection - we'll handle it manually
})

function stripLocaleFromPathname(pathname: string): string {
  const locale = getLocaleFromPathname(pathname)
  if (locale === defaultLocale && !pathname.startsWith(`/${defaultLocale}`)) {
    return pathname
  }
  return pathname.replace(`/${locale}`, '') || '/'
}

function addLocaleToPath(path: string, locale: string): string {
  if (locale === defaultLocale) {
    return path
  }
  return `/${locale}${path}`
}

export default withAuth(
  async function middleware(req) {
    const { pathname } = req.nextUrl
    const token = req.nextauth.token

    console.log('Middleware processing:', { pathname, hasToken: !!token })

    // Get the current locale from pathname
    const currentLocale = getLocaleFromPathname(pathname)

    // Handle manual locale preference detection only for root path
    if (pathname === '/') {
      // Check for user's manual language preference in cookie
      const userLangPreference = req.cookies.get(
        'user-language-preference'
      )?.value

      if (userLangPreference && locales.includes(userLangPreference as any)) {
        // User has manually selected a language, respect it
        const redirectPath =
          userLangPreference === defaultLocale ? '/' : `/${userLangPreference}`
        if (redirectPath !== '/') {
          console.log('Redirecting to user preferred language:', redirectPath)
          return NextResponse.redirect(new URL(redirectPath, req.url))
        }
      } else {
        // No manual preference, use browser language detection
        const acceptLanguage = req.headers.get('accept-language') || ''
        const browserLocale = acceptLanguage.includes('zh') ? 'zh-CN' : 'en'

        if (browserLocale !== defaultLocale) {
          console.log(
            'Redirecting to browser detected language:',
            `/${browserLocale}`
          )
          return NextResponse.redirect(new URL(`/${browserLocale}`, req.url))
        }
      }
    }

    // Handle old routes without locale prefix BEFORE intl middleware (but let intl handle root)
    if (
      !pathname.startsWith('/en') &&
      !pathname.startsWith('/zh-CN') &&
      pathname !== '/' &&
      !pathname.startsWith('/_next') &&
      !pathname.startsWith('/api') &&
      !pathname.startsWith('/favicon')
    ) {
      const redirectPath = `/en${pathname}` // Always redirect to English for old routes
      console.log('Redirecting old route to locale-aware:', redirectPath)
      return NextResponse.redirect(new URL(redirectPath, req.url))
    }

    // Handle internationalization
    const intlResponse = intlMiddleware(req as NextRequest)

    // If intl middleware returns a response (redirect), use it
    if (intlResponse && intlResponse.status !== 200) {
      console.log(
        'Intl middleware redirect:',
        intlResponse.headers.get('location')
      )
      return intlResponse
    }

    // Get pathname without locale for auth checks
    const pathWithoutLocale = stripLocaleFromPathname(pathname)

    console.log('Path analysis:', {
      original: pathname,
      withoutLocale: pathWithoutLocale,
      locale: currentLocale,
    })

    // IMPORTANT: Allow homepage access without authentication
    if (pathWithoutLocale === '/' || pathWithoutLocale === '') {
      console.log('Allowing homepage access')
      return intlResponse || NextResponse.next()
    }

    // Redirect authenticated users away from auth pages
    if (
      token &&
      (pathWithoutLocale.startsWith('/login') ||
        pathWithoutLocale.startsWith('/signup'))
    ) {
      const redirectPath = addLocaleToPath('/dashboard', currentLocale)
      console.log('Redirecting authenticated user to dashboard:', redirectPath)
      return NextResponse.redirect(new URL(redirectPath, req.url))
    }

    // Admin-only routes
    if (pathWithoutLocale.startsWith('/admin') && token?.role !== 'admin') {
      const redirectPath = addLocaleToPath('/dashboard', currentLocale)
      console.log('Redirecting non-admin from admin route:', redirectPath)
      return NextResponse.redirect(new URL(redirectPath, req.url))
    }

    // Admin-only dashboard routes
    if (
      pathWithoutLocale.startsWith('/dashboard/users') &&
      token?.role !== 'admin'
    ) {
      const redirectPath = addLocaleToPath('/dashboard', currentLocale)
      return NextResponse.redirect(new URL(redirectPath, req.url))
    }

    if (
      pathWithoutLocale.startsWith('/dashboard/settings') &&
      token?.role !== 'admin'
    ) {
      const redirectPath = addLocaleToPath('/dashboard', currentLocale)
      return NextResponse.redirect(new URL(redirectPath, req.url))
    }

    // Create a response that preserves the locale
    const response = intlResponse || NextResponse.next()

    // Set a header with the detected locale for debugging
    if (response) {
      response.headers.set('x-detected-locale', currentLocale)
    }

    return response
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl
        const pathWithoutLocale = stripLocaleFromPathname(pathname)

        console.log('Auth check:', {
          pathname,
          pathWithoutLocale,
          hasToken: !!token,
        })

        // IMPORTANT: Homepage should be public
        if (pathWithoutLocale === '/' || pathWithoutLocale === '') {
          console.log('Homepage authorized without token')
          return true
        }

        // Public routes (auth pages)
        if (
          pathWithoutLocale.startsWith('/login') ||
          pathWithoutLocale.startsWith('/signup')
        ) {
          console.log('Auth page authorized')
          return true
        }

        // Protected routes require authentication
        const isAuthorized = !!token
        console.log('Protected route authorization:', isAuthorized)
        return isAuthorized
      },
    },
  }
)

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
