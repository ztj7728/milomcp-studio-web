'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { SimpleLanguageSwitch } from '@/components/ui/simple-language-switch'

export default function Home() {
  const t = useTranslations()
  const params = useParams()
  const locale = params.locale as string

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      {/* Language Switcher */}
      <div className="absolute top-4 right-4">
        <SimpleLanguageSwitch />
      </div>

      <div className="max-w-4xl mx-auto text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">
            {t('homepage.title')}
          </h1>
          <p className="text-xl text-muted-foreground">
            {t('homepage.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
          <div className="group p-6 rounded-lg border hover:border-primary/50 transition-colors">
            <h2 className="text-xl font-semibold mb-3">{t('homepage.features.dashboard.title')}</h2>
            <p className="text-muted-foreground mb-4">
              {t('homepage.features.dashboard.description')}
            </p>
            <Button variant="outline" size="sm">
              {t('homepage.features.dashboard.action')}
            </Button>
          </div>

          <div className="group p-6 rounded-lg border hover:border-primary/50 transition-colors">
            <h2 className="text-xl font-semibold mb-3">{t('homepage.features.tools.title')}</h2>
            <p className="text-muted-foreground mb-4">
              {t('homepage.features.tools.description')}
            </p>
            <Button variant="outline" size="sm">
              {t('homepage.features.tools.action')}
            </Button>
          </div>

          <div className="group p-6 rounded-lg border hover:border-primary/50 transition-colors">
            <h2 className="text-xl font-semibold mb-3">{t('homepage.features.workspace.title')}</h2>
            <p className="text-muted-foreground mb-4">
              {t('homepage.features.workspace.description')}
            </p>
            <Button variant="outline" size="sm">
              {t('homepage.features.workspace.action')}
            </Button>
          </div>

          <div className="group p-6 rounded-lg border hover:border-primary/50 transition-colors">
            <h2 className="text-xl font-semibold mb-3">{t('homepage.features.settings.title')}</h2>
            <p className="text-muted-foreground mb-4">
              {t('homepage.features.settings.description')}
            </p>
            <Button variant="outline" size="sm">
              {t('homepage.features.settings.action')}
            </Button>
          </div>
        </div>

        <div className="flex gap-4 justify-center mt-12">
          <Link href={`/${locale}/login`}>
            <Button size="lg">{t('homepage.actions.signIn')}</Button>
          </Link>
          <Button variant="outline" size="lg">
            {t('homepage.actions.learnMore')}
          </Button>
        </div>
      </div>
    </main>
  )
}