'use client'

// Simple client-side storage for API tokens
// In production, you might want to use more secure storage

const TOKEN_STORAGE_KEY = 'milomcp_api_token'

export function getStoredApiToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_STORAGE_KEY)
}

export function setStoredApiToken(token: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(TOKEN_STORAGE_KEY, token)
}

export function removeStoredApiToken(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(TOKEN_STORAGE_KEY)
}

export function hasStoredApiToken(): boolean {
  return getStoredApiToken() !== null
}
