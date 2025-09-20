import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'MiloMCP Studio',
  description: 'Modern web interface for the MiloMCP multi-user platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
