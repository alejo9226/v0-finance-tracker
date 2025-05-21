import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import Header from "./components/Header"
import { getI18n } from "@/locales/server"
import { getScopedI18n } from "@/locales/server"

export default async function Home() {
  const t = await getI18n()
  
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <Header />
        <main className="flex-1">
          <section className="py-24 md:py-32 lg:py-40">
            <div className="container px-4 md:px-6">
              <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
                <div className="flex flex-col justify-center space-y-4">
                  <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                      {t('marketing.hero.title')}
                    </h1>
                    <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                      {t('marketing.hero.subtitle')}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 min-[400px]:flex-row">
                    <Link href="/signup">
                      <Button size="lg" className="gap-1.5">
                        Get Started
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
                <div className="flex items-center justify-center">
                  <div className="relative h-[350px] w-full max-w-[500px] rounded-lg bg-gradient-to-br from-green-100 to-green-50 p-6 shadow-lg">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <h3 className="text-xl font-bold">Financial Overview</h3>
                        <div className="h-2 w-24 rounded-full bg-green-200" />
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="text-sm font-medium">Assets</div>
                            <div className="font-semibold">$120,000</div>
                          </div>
                          <div className="h-2 w-full rounded-full bg-gray-100">
                            <div className="h-2 w-[80%] rounded-full bg-green-500" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="text-sm font-medium">Liabilities</div>
                            <div className="font-semibold">$40,000</div>
                          </div>
                          <div className="h-2 w-full rounded-full bg-gray-100">
                            <div className="h-2 w-[30%] rounded-full bg-amber-500" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="text-sm font-medium">Equity</div>
                            <div className="font-semibold">$80,000</div>
                          </div>
                          <div className="h-2 w-full rounded-full bg-gray-100">
                            <div className="h-2 w-[50%] rounded-full bg-blue-500" />
                          </div>
                        </div>
                      </div>
                      <div className="rounded-lg bg-white p-4 shadow">
                        <div className="text-sm font-medium">Net Worth</div>
                        <div className="text-2xl font-bold text-green-600">$80,000</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          <section className="bg-gray-50 py-16">
            <div className="container px-4 md:px-6">
              <div className="grid gap-10 md:grid-cols-3">
                <div className="rounded-lg border bg-white p-6 shadow-sm">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600 mb-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-6 w-6"
                    >
                      <path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold">Track Assets</h3>
                  <p className="text-gray-500 mt-2">
                    Keep track of all your assets including bank accounts, investments, and property.
                  </p>
                </div>
                <div className="rounded-lg border bg-white p-6 shadow-sm">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600 mb-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-6 w-6"
                    >
                      <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
                      <path d="M13 5v2" />
                      <path d="M13 17v2" />
                      <path d="M13 11v2" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold">Manage Liabilities</h3>
                  <p className="text-gray-500 mt-2">
                    Monitor your debts and liabilities to understand your financial obligations.
                  </p>
                </div>
                <div className="rounded-lg border bg-white p-6 shadow-sm">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 mb-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-6 w-6"
                    >
                      <path d="M12 2v20" />
                      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold">Calculate Equity</h3>
                  <p className="text-gray-500 mt-2">
                    Understand your net worth by calculating the difference between your assets and liabilities.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </main>
        <footer className="border-t py-6">
          <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-sm text-gray-500">© 2025 FinanceTrack. All rights reserved.</p>
            <div className="flex gap-4">
              <Link href="#" className="text-sm text-gray-500 hover:underline">
                Terms
              </Link>
              <Link href="#" className="text-sm text-gray-500 hover:underline">
                Privacy
              </Link>
              <Link href="#" className="text-sm text-gray-500 hover:underline">
                Contact
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
