import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { locales, defaultLocale } from '@/i18n/config'

function detectBrowserLanguage(): string {
  const headersList = headers()
  const acceptLanguage = headersList.get('accept-language')

  if (!acceptLanguage) {
    return defaultLocale
  }

  // Parse Accept-Language header
  const languages = acceptLanguage
    .split(',')
    .map((lang) => {
      const [code, quality] = lang.trim().split(';q=')
      return {
        code: code.trim(),
        quality: quality ? parseFloat(quality) : 1.0,
      }
    })
    .sort((a, b) => b.quality - a.quality)

  // Find the best matching locale
  for (const lang of languages) {
    // Direct match
    if (locales.includes(lang.code as any)) {
      return lang.code
    }

    // Match language prefix (e.g., 'zh' matches 'zh-CN')
    const langPrefix = lang.code.split('-')[0]
    const matchingLocale = locales.find((locale) =>
      locale.startsWith(langPrefix)
    )
    if (matchingLocale) {
      return matchingLocale
    }
  }

  return defaultLocale
}

export default function RootPage() {
  const detectedLocale = detectBrowserLanguage()
  redirect(`/${detectedLocale}`)
}
