"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function TestSupabasePage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")
  const [details, setDetails] = useState<Record<string, any>>({})

  useEffect(() => {
    async function testConnection() {
      try {
        const supabase = getSupabaseBrowserClient()

        // Test environment variables
        setDetails({
          supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || "Not set",
          supabaseAnonKeyLength: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
            ? `${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length} chars`
            : "Not set",
        })

        // Test a simple query
        // TODO: Add wrapper to get profiles
        const { data, error } = await supabase.from("profiles").select("count").limit(1)

        if (error) {
          setStatus("error")
          setMessage(`Connection failed: ${error.message}`)
          setDetails((prev) => ({ ...prev, error: error.message }))
          return
        }

        setStatus("success")
        setMessage("Supabase connection successful!")
        setDetails((prev) => ({ ...prev, data }))
      } catch (error: any) {
        setStatus("error")
        setMessage(`Connection error: ${error.message}`)
        setDetails((prev) => ({ ...prev, error: error.message }))
      }
    }

    testConnection()
  }, [])

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Link
        href="/"
        className="absolute left-4 top-4 md:left-8 md:top-8 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to home
      </Link>
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Supabase Connection Test</CardTitle>
          <CardDescription>Testing connection to your Supabase project</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            className={`p-4 rounded-md ${
              status === "loading"
                ? "bg-blue-50 text-blue-700"
                : status === "success"
                  ? "bg-green-50 text-green-700"
                  : "bg-red-50 text-red-700"
            }`}
          >
            <p className="font-medium">
              {status === "loading"
                ? "Testing connection..."
                : status === "success"
                  ? "Connection successful!"
                  : "Connection failed"}
            </p>
            <p className="text-sm mt-1">{message}</p>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium">Connection Details:</h3>
            <pre className="bg-gray-100 p-3 rounded-md text-xs overflow-auto">{JSON.stringify(details, null, 2)}</pre>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={() => window.location.reload()} className="w-full">
            Test Again
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
