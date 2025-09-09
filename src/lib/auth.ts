import { NextAuthOptions } from 'next-auth'
import { JWT } from 'next-auth/jwt'
import CredentialsProvider from 'next-auth/providers/credentials'
import { config } from './config'

async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    const url = `${config.apiUrl}/api/refresh`

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refreshToken: token.refreshToken,
      }),
    })

    const refreshedData = await response.json()

    if (!response.ok) {
      throw refreshedData
    }

    if (refreshedData.status === 'success' && refreshedData.data) {
      return {
        ...token,
        accessToken: refreshedData.data.accessToken,
        accessTokenExpires: Date.now() + 15 * 60 * 1000, // 15 minutes
        refreshToken: refreshedData.data.refreshToken ?? token.refreshToken,
      }
    }

    throw new Error('Invalid refresh response')
  } catch (error) {
    console.error('Error refreshing access token:', error)

    return {
      ...token,
      error: 'RefreshAccessTokenError',
    }
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null
        }

        try {
          // Call MiloMCP API for authentication
          const response = await fetch(`${config.apiUrl}/api/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              username: credentials.username,
              password: credentials.password,
            }),
          })

          if (!response.ok) {
            return null
          }

          const response_data = await response.json()

          if (response_data.status === 'success' && response_data.data) {
            const { accessToken, refreshToken, user } = response_data.data
            return {
              id: user.id,
              name: user.name || user.username,
              email: user.email || `${user.username}@example.com`,
              accessToken: accessToken,
              refreshToken: refreshToken,
              role: user.isAdmin ? 'admin' : 'user',
            }
          }

          return null
        } catch (error) {
          console.error('Authentication error:', error)
          return null
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign in
      if (user) {
        token.accessToken = user.accessToken
        token.refreshToken = user.refreshToken
        token.role = user.role
        token.accessTokenExpires = Date.now() + 15 * 60 * 1000 // 15 minutes
        return token
      }

      // Return previous token if the access token has not expired yet
      if (
        token.accessTokenExpires &&
        Date.now() < (token.accessTokenExpires as number)
      ) {
        return token
      }

      // Access token has expired, try to update it
      return refreshAccessToken(token)
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.accessToken = token.accessToken
        session.refreshToken = token.refreshToken
        session.user.role = token.role
        session.error = token.error
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
    error: '/auth/error',
  },
  secret: config.nextAuthSecret,
}
