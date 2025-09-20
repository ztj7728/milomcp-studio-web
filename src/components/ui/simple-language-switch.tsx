'use client'

import { usePathname } from 'next/navigation'
import { startTransition } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  getLocaleFromPathname,
  createLocalizedPath,
  languages,
} from '@/lib/i18n-utils'

export function SimpleLanguageSwitch() {
  const pathname = usePathname()

  const currentLocale = getLocaleFromPathname(pathname)
  const currentLanguage =
    languages.find((lang) => lang.code === currentLocale) || languages[0]

  const handleLanguageChange = (newLocale: string) => {
    if (newLocale === currentLocale) return

    // Set a cookie to remember the user's manual language preference
    document.cookie = `user-language-preference=${newLocale}; path=/; max-age=${60 * 60 * 24 * 365}` // 1 year

    startTransition(() => {
      const newPath = createLocalizedPath(pathname, currentLocale, newLocale)

      // Force a hard navigation to bypass middleware issues
      window.location.href = newPath
    })
  }

  return (
    <div className="rounded">
      <div className="text-xs mb-1 text-muted-foreground">Language</div>
      <Select value={currentLocale} onValueChange={handleLanguageChange}>
        <SelectTrigger className="w-32 border-0">
          <SelectValue>{currentLanguage.name}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {languages.map((lang) => (
            <SelectItem key={lang.code} value={lang.code}>
              {lang.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
