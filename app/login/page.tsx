"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"

import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [debugInfo, setDebugInfo] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setDebugInfo(null)

    try {
      const supabase = getSupabaseBrowserClient()

      console.log("Login attempt for:", formData.email)

      // TODO: Add wrapper to sign in with password
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })

      console.log("Login response:", { data: !!data, error })

      if (error) {
        setDebugInfo(`Error: ${error.message}`)
        toast({
          title: "Login failed",
          description: error.message,
          variant: "destructive",
        })
        return
      }

      if (data.user) {
        // Check if user is onboarded
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("is_onboarded")
          .eq("id", data.user.id)
          .single()

        if (profileError) {
          setDebugInfo(`Profile fetch error: ${profileError.message}`)
          console.error("Profile fetch error:", profileError)
        }

        if (profile && profile.is_onboarded) {
          router.push("/dashboard")
        } else {
          router.push("/onboarding")
        }
      }
    } catch (error: any) {
      console.error("Login error:", error)
      setDebugInfo(`Exception: ${error.message}`)
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

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
          <CardTitle className="text-2xl">Sign in</CardTitle>
          <CardDescription>Enter your credentials to access your account</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="john@example.com"
                required
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            {debugInfo && (
              <div className="rounded-md bg-amber-50 p-3 text-sm text-amber-900">
                <p className="font-medium">Debug Info:</p>
                <p className="font-mono text-xs">{debugInfo}</p>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="text-sm">
                <Link href="#" className="text-sm underline">
                  Forgot password?
                </Link>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
            <div className="text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="underline">
                Sign up
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
