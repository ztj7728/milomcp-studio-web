export const config = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3030',
  wsUrl: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3030/ws',
  nextAuthUrl: process.env.NEXTAUTH_URL || 'http://localhost:3000',
  nextAuthSecret:
    process.env.NEXTAUTH_SECRET || 'fallback-secret-for-build-only',
  jwtSecret: process.env.JWT_SECRET || 'fallback-jwt-secret-for-build-only',
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
} as const
