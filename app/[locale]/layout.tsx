import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"

import "../../app/globals.css"
import { AuthProvider } from "@/contexts/auth-context"
import { ThemeProvider } from "@/components/theme-provider"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/next"
import { I18nProviderClient } from "@/locales/client"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "FinanceTrack - Personal Finance Management",
  description: "Track your assets, liabilities, and equity with FinanceTrack",
  generator: 'v0.dev'
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode
  params: Promise<{ locale: string }>
}>) {
  const { locale } = await params

  return (
    <html lang={locale}>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <AuthProvider>
            <I18nProviderClient locale={locale}>
              {children}
            </I18nProviderClient>
          </AuthProvider>
        </ThemeProvider>

        {/* Vercel Speed Insights */}
        <SpeedInsights />

        {/* Vercel Analytics */}
        <Analytics />
      </body>
    </html>
  )
}
