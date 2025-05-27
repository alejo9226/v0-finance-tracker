'use client'

import { User } from '@supabase/supabase-js'
import { Menu as MenuIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { MainNav } from '@/components/main-nav'
import { Button } from '@/components/ui/button'
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { signOutWrapper } from '@/lib/supabase/data-services/auth'

type AppHeaderProps = {
  user: User
}

export function AppHeader({ user }: AppHeaderProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  const handleSignOut = async () => {
    await signOutWrapper()
    router.push('/login')
  }

  return (
    <header className="bg-white border-b px-4">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo and title */}
        <div
          className="flex items-center gap-2 font-bold text-xl"
          onClick={() => router.push('/dashboard')}
        >
          <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center text-white">
            F
          </div>
          FinanceTrack
        </div>
        {/* Desktop nav */}
        <div className="hidden md:flex flex-1 items-center">
          <MainNav />
        </div>
        <div className="hidden md:flex items-center gap-4 ml-auto">
          <span className="text-sm text-muted-foreground">
            Welcome, {user?.user_metadata?.name || 'User'}
          </span>
          <Button variant="outline" size="sm" onClick={handleSignOut}>
            Logout
          </Button>
        </div>
        {/* Mobile hamburger and drawer */}
        <div className="md:hidden flex items-center">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <MenuIcon className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64 flex flex-col">
              <SheetHeader className="p-6 pb-2">
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <div className="flex-1 overflow-y-auto flex flex-col gap-6 p-6 pt-2">
                <MainNav onNavigate={() => setOpen(false)} />
                <span className="text-sm text-muted-foreground">
                  Welcome, {user?.user_metadata?.name || 'User'}
                </span>
                <Button variant="outline" size="sm" onClick={handleSignOut}>
                  Logout
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
