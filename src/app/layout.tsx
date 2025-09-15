import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { NextAuthSessionProvider } from '@/components/providers/session-provider'
import { QueryProvider } from '@/components/providers/query-provider'
import { ThemeProvider } from '@/components/providers/theme-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'MiloMCP Studio',
  description: 'Modern web interface for the MiloMCP multi-user platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <script
          dangerouslySetInnerHTML={{
            __html: `window.__RUNTIME_CONFIG__ = "__RUNTIME_CONFIG_PLACEHOLDER__"`,
          }}
        ></script>
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
      </body>
    </html>
  )
}
