/**
 * Utility functions for internationalization routing
 */

import { locales, defaultLocale } from '@/i18n/config'

/**
 * Extract the current locale from a pathname
 */
export function getLocaleFromPathname(pathname: string): string {
  // If path starts with /zh-CN, it's Chinese
  if (pathname.startsWith('/zh-CN')) {
    return 'zh-CN'
  }
  // Everything else (including /, /en, /en/...) is English  
  return 'en'
}

/**
 * Create a localized path for language switching
 */
export function createLocalizedPath(pathname: string, currentLocale: string, targetLocale: string): string {
  if (currentLocale === 'en' && targetLocale === 'zh-CN') {
    // Switching from English to Chinese
    // Handle both / and /en cases
    if (pathname === '/' || pathname === '/en') {
      return '/zh-CN'
    } else if (pathname.startsWith('/en/')) {
      return pathname.replace('/en', '/zh-CN')
    } else {
      // Already on root path like /about -> /zh-CN/about
      return `/zh-CN${pathname}`
    }
  } else if (currentLocale === 'zh-CN' && targetLocale === 'en') {
    // Switching from Chinese to English
    if (pathname === '/zh-CN') {
      return '/'
    } else {
      return pathname.replace('/zh-CN', '') || '/'
    }
  } else {
    // Fallback
    return targetLocale === 'en' ? '/' : `/${targetLocale}`
  }
}

/**
 * Available languages configuration
 */
export const languages = [
  { code: 'en', name: 'English' },
  { code: 'zh-CN', name: '中文' }
] as const