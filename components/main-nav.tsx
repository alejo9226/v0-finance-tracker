"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, CreditCard, PieChart } from "lucide-react"

import { cn } from "@/lib/utils"

const navItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Transactions",
    href: "/dashboard/transactions",
    icon: CreditCard,
  },
  {
    name: "Categories",
    href: "/dashboard/categories",
    icon: PieChart,
  },
]

type MainNavProps = {
  onNavigate?: () => void
}

export function MainNav({ onNavigate }: MainNavProps) {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col lg:flex-row items-start lg:items-center gap-2 lg:gap-6">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "flex items-center text-sm font-medium transition-colors hover:text-primary",
            pathname === item.href ? "text-primary" : "text-muted-foreground",
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
