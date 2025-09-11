'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

/**
 * Hook that monitors authentication state and redirects to login
 * when refresh token expires or authentication fails
 */
export function useAuthRedirect() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    // Don't redirect while loading
    if (status === 'loading') return

    // If session is null/undefined after loading, user needs to login
    if (status === 'unauthenticated' || !session) {
      console.log('No valid session, redirecting to login...')
      router.push('/login')
      return
    }

    // Check for refresh token errors
    if (session.error === 'RefreshAccessTokenError') {
      console.log('Refresh token expired, redirecting to login...')
      // Force sign out to clear the session
      router.push('/login')
      return
    }

    // Check if we have valid tokens
    if (!session.accessToken) {
      console.log('No access token available, redirecting to login...')
      router.push('/login')
      return
    }
  }, [session, status, router])

  return {
    session,
    status,
    isAuthenticated:
      status === 'authenticated' &&
      session &&
      session.accessToken &&
      session.error !== 'RefreshAccessTokenError',
  }
}
