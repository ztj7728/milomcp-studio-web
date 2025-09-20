'use client'

import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, Suspense } from 'react'
import { useTranslations } from 'next-intl'
import { SignupForm } from '@/components/auth/signup-form'
import Link from 'next/link'
import { useParams } from 'next/navigation'

// Disable static generation for this page
export const dynamic = 'force-dynamic'

function SignupPageContent() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const params = useParams()
  const locale = params.locale as string
  const t = useTranslations('auth.signup')
  const callbackUrl = searchParams.get('callbackUrl') || `/${locale}/dashboard`

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
      <SignupForm />
      <div className="text-center text-sm text-muted-foreground">
        {t('hasAccount')}{' '}
        <Link
          href={`/${locale}/login`}
          className="font-medium text-primary hover:underline"
        >
          {t('signIn')}
        </Link>
      </div>
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      }
    >
      <SignupPageContent />
    </Suspense>
  )
}
