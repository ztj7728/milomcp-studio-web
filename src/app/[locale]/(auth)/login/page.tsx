'use client'

import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, Suspense } from 'react'
import { useTranslations } from 'next-intl'
import { LoginForm } from '@/components/auth/login-form'
import Link from 'next/link'
import { useParams } from 'next/navigation'

// Disable static generation for this page
export const dynamic = 'force-dynamic'

function LoginPageContent() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const params = useParams()
  const locale = params.locale as string
  const t = useTranslations('auth.login')
  const callbackUrl = searchParams.get('callbackUrl') || `/${locale}/dashboard`
  const message = searchParams.get('message')

  useEffect(() => {
    if (status === 'authenticated') {
      router.push(callbackUrl)
    }
  }, [status, router, callbackUrl])

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (status === 'authenticated') {
    return null
  }

  return (
    <div className="space-y-6">
      {message && (
        <div className="text-sm text-green-600 bg-green-50 border border-green-200 p-3 rounded-md text-center">
          {message}
        </div>
      )}
      <LoginForm callbackUrl={callbackUrl} />
      <div className="text-center text-sm text-muted-foreground">
        {t('noAccount')}{' '}
        <Link
          href={`/${locale}/signup`}
          className="font-medium text-primary hover:underline"
        >
          {t('signUp')}
        </Link>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      }
    >
      <LoginPageContent />
    </Suspense>
  )
}
