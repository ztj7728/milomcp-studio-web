import { getRequestConfig } from 'next-intl/server'
import { locales } from './config'

export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming locale is valid
  if (!locale || !locales.includes(locale as any)) {
    locale = 'en'
  }

  return {
    locale,
    messages: {
      ...(await import(`./locales/${locale}/common.json`)).default,
      auth: (await import(`./locales/${locale}/auth.json`)).default,
      workspace: (await import(`./locales/${locale}/workspace.json`)).default,
    },
  }
})
