'use client'

import { useSession } from 'next-auth/react'

export function useAuth() {
  const { data: session, status } = useSession()

  return {
    user: session?.user,
    session,
    status,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
    isAdmin: session?.user?.role === 'admin',
    isUser: session?.user?.role === 'user',
  }
}
