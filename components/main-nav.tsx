'use client'

import { LayoutDashboard, CreditCard, PieChart } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { cn } from '@/lib/utils'
import { useI18n } from '@/locales/client'

const navItems = (t: any) => [
  {
    name: t('dashboard.navigation.dashboard'),
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: t('dashboard.navigation.transactions'),
    href: '/dashboard/transactions',
    icon: CreditCard,
  },
  {
    name: t('dashboard.navigation.categories'),
    href: '/dashboard/categories',
    icon: PieChart,
  },
]

type MainNavProps = {
  onNavigate?: () => void
}

export function MainNav({ onNavigate }: MainNavProps) {
  const pathname = usePathname()
  const t = useI18n()
  return (
    <nav className="flex flex-col lg:flex-row items-start lg:items-center gap-2 lg:gap-6">
      {navItems(t).map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            'flex items-center text-sm font-medium transition-colors hover:text-primary',
            pathname === item.href ? 'text-primary' : 'text-muted-foreground',
          )}
          onClick={onNavigate}
        >
          <item.icon className="mr-2 h-4 w-4" />
          {item.name}
        </Link>
      ))}
    </nav>
  )
}
