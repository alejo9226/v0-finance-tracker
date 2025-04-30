"use client"

import { useRouter } from "next/navigation"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { MainNav } from "@/components/main-nav"

type AppHeaderProps = {
  user: any
}

export function AppHeader({ user }: AppHeaderProps) {
  const router = useRouter()
  const supabase = getSupabaseBrowserClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  return (
    <header className="bg-white border-b">
      <div className="container flex h-16 items-center">
        <div className="flex items-center gap-2 font-bold text-xl mr-8">
          <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center text-white">F</div>
          FinanceTrack
        </div>
        <MainNav />
        <div className="ml-auto flex items-center gap-4">
          <span className="text-sm text-muted-foreground">Welcome, {user?.user_metadata?.name || "User"}</span>
          <Button variant="outline" size="sm" onClick={handleSignOut}>
            Logout
          </Button>
        </div>
      </div>
    </header>
  )
}
