export const locales = ['en', 'zh-CN'] as const
export const defaultLocale = 'en' as const

export type Locale = (typeof locales)[number]