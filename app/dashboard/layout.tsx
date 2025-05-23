"use client"

import type React from "react"

import { AppHeader } from "@/components/app-header"
import { AuthCheck } from "@/components/auth-check"
import { useAuth } from "@/contexts/auth-context"

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const { user } = useAuth()

  return (
    <AuthCheck>
      <div className="w-screen min-h-screen bg-background">
        <div className="sticky top-0 z-50 bg-background/80 backdrop-blur border-b">
          <div className="container mx-auto">
            <AppHeader user={user} />
          </div>
        </div>
        <main className="container mx-auto px-4 md:px-6">
          {children}
        </main>
      </div>
    </AuthCheck>
  )
} 