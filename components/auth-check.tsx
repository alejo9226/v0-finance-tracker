'use client'

import { useRouter } from 'next/navigation'
import type React from 'react'
import { useEffect } from 'react'

import { useAuth } from '@/contexts/auth-context'

export function AuthCheck({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Loading...</h2>
          <p className="text-muted-foreground">Please wait while we load your data</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return <>{children}</>
}
