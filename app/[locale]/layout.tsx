import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import Script from "next/script"

import "../../app/globals.css"
import { AuthProvider } from "@/contexts/auth-context"
import { ThemeProvider } from "@/components/theme-provider"
import MarketingToolsConfig from "@/components/analytics/MarketingToolsConfig"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/next"
import { I18nProviderClient } from "@/locales/client"

const inter = Inter({ subsets: ["latin"] })

const googleSiteVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION

export const metadata: Metadata = {
  title: "FinanceTrack - Personal Finance Management",
  description: "Track your assets, liabilities, and equity with FinanceTrack",
  generator: 'v0.dev',
  icons: {
    icon: '/app-icon.png',
  },
  ...(googleSiteVerification && {
    verification: { google: googleSiteVerification },
  }),
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode
  params: Promise<{ locale: string }>
}>) {
  const { locale } = await params
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID

  return (
    <html lang={locale}>
      <body className={inter.className}>
        {gtmId ? (
          <>
            <Script id="gtm-init" strategy="afterInteractive">
              {`
                (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                })(window,document,'script','dataLayer','${gtmId}');
              `}
            </Script>
            <noscript>
              <iframe
                src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
                height="0"
                width="0"
                style={{ display: "none", visibility: "hidden" }}
              />
            </noscript>
          </>
        ) : null}

        <MarketingToolsConfig />

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
