// /src/lib/runtime-config.ts

// Define a type for our public environment variables.
type PublicEnv = {
  [key: string]: string | undefined
}

// A placeholder object that will be used during the build process.
// The keys here should match the NEXT_PUBLIC_ variables you need.
const buildTimeEnv: PublicEnv = {
  NEXT_PUBLIC_API_URL: 'RUNTIME_PLACEHOLDER__NEXT_PUBLIC_API_URL',
  NEXT_PUBLIC_WS_URL: 'RUNTIME_PLACEHOLDER__NEXT_PUBLIC_WS_URL',
  NEXT_PUBLIC_API_URL_DISPLAY:
    'RUNTIME_PLACEHOLDER__NEXT_PUBLIC_API_URL_DISPLAY',
}

// In the browser, the `__RUNTIME_CONFIG__` object will be injected by our script.
// We check if `window` is defined to ensure this code only runs on the client-side.
const runtimeEnv: PublicEnv =
  typeof window !== 'undefined' ? (window as any).__RUNTIME_CONFIG__ || {} : {}

// The main config object.
// It merges the runtime environment variables over the build-time placeholders.
// This means if a variable is injected at runtime, it will be used.
// Otherwise, the placeholder will be used (and can be caught during development).
const config: PublicEnv = {
  ...buildTimeEnv,
  ...runtimeEnv,
}

export const runtimeConfig = {
  // We provide specific getters for each variable for type safety and clarity.
  getApiUrl: () => config.NEXT_PUBLIC_API_URL,
  getWsUrl: () => config.NEXT_PUBLIC_WS_URL,
  getApiUrlDisplay: () => config.NEXT_PUBLIC_API_URL_DISPLAY,
}
