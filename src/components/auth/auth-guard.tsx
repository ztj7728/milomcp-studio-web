'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, ReactNode, useRef } from 'react'

interface AuthGuardProps {
  children: ReactNode
  requireAuth?: boolean
}

/**
 * Auth Guard component that protects routes and handles automatic logout
 * when refresh tokens expire
 */
export function AuthGuard({ children, requireAuth = true }: AuthGuardProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const locale = params.locale as string
  const isSigningOut = useRef(false)

  useEffect(() => {
    if (!requireAuth) return

    // Don't redirect while loading
    if (status === 'loading') return

    // If session is null/undefined after loading, user needs to login
    if (status === 'unauthenticated' || !session) {
      console.log('No valid session, redirecting to login...')
      router.push(`/${locale}/login`)
      return
    }

    // Check for refresh token errors - sign out properly instead of just redirecting
    if (session.error === 'RefreshAccessTokenError') {
      if (!isSigningOut.current) {
        console.log('Refresh token expired, signing out user...')
        isSigningOut.current = true
        signOut({
          callbackUrl: `/${locale}/login`,
          redirect: true,
        })
          .then(() => {
            isSigningOut.current = false
          })
          .catch((error) => {
            console.error('Error during signout:', error)
            isSigningOut.current = false
            // Fallback: redirect manually
            router.push(`/${locale}/login`)
          })
      }
      return
    }

    // Check if we have valid tokens
    if (!session.accessToken) {
      console.log('No access token available, redirecting to login...')
      router.push(`/${locale}/login`)
      return
    }
  }, [session, status, router, requireAuth])

  // Show loading while checking auth
  if (requireAuth && status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p className="text-sm text-gray-500">Checking authentication...</p>
        </div>
      </div>
    )
  }

  // Show loading if we're signing out or redirecting
  if (
    requireAuth &&
    (status === 'unauthenticated' ||
      !session ||
      session.error === 'RefreshAccessTokenError' ||
      !session.accessToken ||
      isSigningOut.current)
  ) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p className="text-sm text-gray-500">
            {isSigningOut.current ||
            session?.error === 'RefreshAccessTokenError'
              ? 'Signing out...'
              : 'Redirecting to login...'}
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
