import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../globals.css'
import { NextAuthSessionProvider } from '@/components/providers/session-provider'
import { QueryProvider } from '@/components/providers/query-provider'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, getTranslations } from 'next-intl/server'
import { locales } from '@/i18n/config'
import { notFound } from 'next/navigation'

const inter = Inter({ 
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
})

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'site' })
  
  return {
    title: t('title'),
    description: t('description'),
  }
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  
  // Validate that the incoming locale is valid
  if (!locales.includes(locale as any)) {
    notFound()
  }

  // Get messages with explicit locale
  const messages = await getMessages({ locale })

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={inter.className}>
        <script
          dangerouslySetInnerHTML={{
            __html: `window.__RUNTIME_CONFIG__ = "__RUNTIME_CONFIG_PLACEHOLDER__"`,
          }}
        ></script>
        <NextIntlClientProvider messages={messages} locale={locale}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <NextAuthSessionProvider>
              <QueryProvider>{children}</QueryProvider>
            </NextAuthSessionProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}