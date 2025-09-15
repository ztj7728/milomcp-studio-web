'use client'

import { ReactNode } from 'react'
import { useAuth } from '@/hooks/useAuth'

interface RoleGuardProps {
  children: ReactNode
  allowedRoles: ('admin' | 'user')[]
  fallback?: ReactNode
  requireAuth?: boolean
}

export function RoleGuard({
  children,
  allowedRoles,
  fallback = null,
  requireAuth = true,
}: RoleGuardProps) {
  const { isAuthenticated, isLoading, user } = useAuth()

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (requireAuth && !isAuthenticated) {
    return fallback
  }

  if (
    isAuthenticated &&
    user?.role &&
    allowedRoles.includes(user.role as 'admin' | 'user')
  ) {
    return <>{children}</>
  }

  return <>{fallback}</>
}

interface AdminOnlyProps {
  children: ReactNode
  fallback?: ReactNode
}

export function AdminOnly({ children, fallback = null }: AdminOnlyProps) {
  return (
    <RoleGuard allowedRoles={['admin']} fallback={fallback}>
      {children}
    </RoleGuard>
  )
}

interface UserOrAdminProps {
  children: ReactNode
  fallback?: ReactNode
}

export function UserOrAdmin({ children, fallback = null }: UserOrAdminProps) {
  return (
    <RoleGuard allowedRoles={['admin', 'user']} fallback={fallback}>
      {children}
    </RoleGuard>
  )
}
