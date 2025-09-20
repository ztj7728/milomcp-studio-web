// /src/lib/runtime-config.ts

// Define a type for our public environment variables.
type PublicEnv = {
  [key: string]: string | undefined
}

// Get build-time environment variables (available in both dev and production)
const buildTimeEnv: PublicEnv = {
  NEXT_PUBLIC_API_URL:
    process.env.NEXT_PUBLIC_API_URL ||
    'RUNTIME_PLACEHOLDER__NEXT_PUBLIC_API_URL',
  NEXT_PUBLIC_WS_URL:
    process.env.NEXT_PUBLIC_WS_URL || 'RUNTIME_PLACEHOLDER__NEXT_PUBLIC_WS_URL',
  NEXT_PUBLIC_API_URL_DISPLAY:
    process.env.NEXT_PUBLIC_API_URL_DISPLAY ||
    'RUNTIME_PLACEHOLDER__NEXT_PUBLIC_API_URL_DISPLAY',
}

// In the browser, the `__RUNTIME_CONFIG__` object will be injected by our script (Docker only).
// We check if `window` is defined to ensure this code only runs on the client-side.
const runtimeEnv: PublicEnv =
  typeof window !== 'undefined' ? (window as any).__RUNTIME_CONFIG__ || {} : {}

// The main config object.
// In development: uses build-time env vars directly
// In production (Docker): runtime injection overrides build-time placeholders
const config: PublicEnv = {
  ...buildTimeEnv,
  ...runtimeEnv,
}

export const runtimeConfig = {
  // We provide specific getters for each variable for type safety and clarity.
  getApiUrl: () => {
    // Check if we still have placeholder, use fallback
    const value = config.NEXT_PUBLIC_API_URL
    return value?.includes('RUNTIME_PLACEHOLDER')
      ? 'http://localhost:3030'
      : value || 'http://localhost:3030'
  },
  getWsUrl: () => {
    // Check if we still have placeholder, use fallback
    const value = config.NEXT_PUBLIC_WS_URL
    return value?.includes('RUNTIME_PLACEHOLDER')
      ? 'ws://localhost:3030/ws'
      : value || 'ws://localhost:3030/ws'
  },
  getApiUrlDisplay: () => {
    // Check if we still have placeholder, use fallback
    const displayValue = config.NEXT_PUBLIC_API_URL_DISPLAY
    const apiValue = config.NEXT_PUBLIC_API_URL

    if (displayValue && !displayValue.includes('RUNTIME_PLACEHOLDER')) {
      return displayValue
    }
    if (apiValue && !apiValue.includes('RUNTIME_PLACEHOLDER')) {
      return apiValue
    }
    return 'http://localhost:3030'
  },
}
