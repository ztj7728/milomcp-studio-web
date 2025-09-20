'use client'

import Link from 'next/link'
import { usePathname, useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Home,
  Settings,
  Users,
  FileText,
  Wrench,
  Activity,
  User,
  Key,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const params = useParams()
  const locale = params.locale as string
  const [collapsed, setCollapsed] = useState(false)
  const { isAdmin } = useAuth()
  const t = useTranslations()

  const navigationItems = [
    {
      title: t('dashboard.title'),
      href: `/${locale}/dashboard`,
      icon: Home,
    },
    {
      title: t('dashboard.tools'),
      href: `/${locale}/dashboard/tools`,
      icon: Wrench,
    },
    {
      title: t('dashboard.workspace'),
      href: `/${locale}/dashboard/workspace`,
      icon: FileText,
    },
    {
      title: t('dashboard.tokens'),
      href: `/${locale}/dashboard/tokens`,
      icon: Key,
    },
    {
      title: t('dashboard.environment'),
      href: `/${locale}/dashboard/environment`,
      icon: Settings,
    },
    {
      title: t('dashboard.activity'),
      href: `/${locale}/dashboard/activity`,
      icon: Activity,
    },
  ]

  const adminItems = [
    {
      title: t('dashboard.users'),
      href: `/${locale}/dashboard/users`,
      icon: Users,
    },
    {
      title: t('navigation.settings'),
      href: `/${locale}/dashboard/settings`,
      icon: Settings,
    },
  ]

  return (
    <div className={cn('pb-12', className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="flex items-center justify-between">
            <h2
              className={cn(
                'mb-2 px-4 text-lg font-semibold tracking-tight',
                collapsed && 'hidden'
              )}
            >
              {t('site.title')}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCollapsed(!collapsed)}
              className="ml-auto"
            >
              {collapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          </div>
          <div className="space-y-1">
            {navigationItems.map((item) => (
              <Button
                key={item.href}
                variant={pathname === item.href ? 'secondary' : 'ghost'}
                className={cn(
                  'w-full justify-start',
                  collapsed && 'justify-center px-2'
                )}
                asChild
              >
                <Link href={item.href}>
                  <item.icon className="mr-2 h-4 w-4" />
                  {!collapsed && item.title}
                </Link>
              </Button>
            ))}
          </div>
        </div>
        {isAdmin && (
          <>
            <Separator />
            <div className="px-3 py-2">
              <h2
                className={cn(
                  'mb-2 px-4 text-lg font-semibold tracking-tight',
                  collapsed && 'hidden'
                )}
              >
                {t('dashboard.administration')}
              </h2>
              <div className="space-y-1">
                {adminItems.map((item) => (
                  <Button
                    key={item.href}
                    variant={pathname === item.href ? 'secondary' : 'ghost'}
                    className={cn(
                      'w-full justify-start',
                      collapsed && 'justify-center px-2'
                    )}
                    asChild
                  >
                    <Link href={item.href}>
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && item.title}
                    </Link>
                  </Button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
