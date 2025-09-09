import { DefaultSession, DefaultUser } from 'next-auth'
import { JWT, DefaultJWT } from 'next-auth/jwt'

declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string
      role: string
    } & DefaultSession['user']
    accessToken: string
    refreshToken: string
    error?: string
  }

  interface User extends DefaultUser {
    accessToken: string
    refreshToken: string
    role: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    accessToken: string
    refreshToken: string
    role: string
    accessTokenExpires?: number
    error?: string
  }
}

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  user: {
    id: string
    username: string
    email: string
    role: string
  }
  accessToken: string
  refreshToken: string
}

export interface User {
  id: string
  username: string
  email: string
  role: 'admin' | 'user'
  createdAt: string
  lastLoginAt?: string
}
