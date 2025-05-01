"use client"

import type React from "react"
import { useAuth } from "@/contexts/auth-context"
import { AppHeader } from "@/components/app-header"
import { AuthCheck } from "@/components/auth-check"

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const { user } = useAuth()

  return (
    <AuthCheck>
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-50 bg-background/80 backdrop-blur border-b">
          <AppHeader user={user} />
        </div>
        <div className="container px-4 md:px-6 mx-auto">
          {children}
        </div>
      </div>
    </AuthCheck>
  )
} 