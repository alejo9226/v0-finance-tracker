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

export default function SignupPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  })
  const [debugInfo, setDebugInfo] = useState<string | null>(null)
  const [useServerRoute, setUseServerRoute] = useState(true)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setDebugInfo(null)

    if (useServerRoute) {
      // Use server-side route for signup
      try {
        const response = await fetch("/api/auth/signup", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        })

        const data = await response.json()

        if (!response.ok) {
          setDebugInfo(`Server error: ${data.error}`)
          toast({
            title: "Signup failed",
            description: data.error,
            variant: "destructive",
          })
          return
        }

        toast({
          title: "Account created",
          description: "You can now sign in with your credentials",
        })

        router.push("/login")
      } catch (error: any) {
        console.error("Signup error:", error)
        setDebugInfo(`Exception: ${error.message}`)
        toast({
          title: "Error",
          description: error.message || "Something went wrong",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    } else {
      // Use client-side Supabase signup
      try {
        const supabase = getSupabaseBrowserClient()

        console.log("Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL)
        console.log("Supabase client initialized:", !!supabase)

        // Attempt to sign up
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              name: formData.name,
            },
          },
        })

        console.log("Signup response:", { data, error })

        if (error) {
          setDebugInfo(`Error: ${error.message}`)
          toast({
            title: "Signup failed",
            description: error.message,
            variant: "destructive",
          })
          return
        }

        if (data.user) {
          // Create profile entry
          const { error: profileError } = await supabase
            .from("profiles")
            .insert([{ id: data.user.id, name: formData.name, is_onboarded: false }])
            .select()

          if (profileError) {
            setDebugInfo(`Profile creation error: ${profileError.message}`)
            console.error("Profile creation error:", profileError)
          }

          toast({
            title: "Account created",
            description: "You can now sign in with your credentials",
          })

          router.push("/login")
        } else {
          setDebugInfo("No user returned from signup. Check email confirmation requirements.")
          toast({
            title: "Check your email",
            description: "We've sent you a confirmation link to complete your signup",
          })
        }
      } catch (error: any) {
        console.error("Signup error:", error)
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
          <CardTitle className="text-2xl">Create an account</CardTitle>
          <CardDescription>Enter your information to create your account</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="John Doe"
                required
                value={formData.name}
                onChange={handleChange}
              />
            </div>
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
                minLength={6}
                value={formData.password}
                onChange={handleChange}
              />
              <p className="text-xs text-muted-foreground">Password must be at least 6 characters</p>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="use-server-route"
                checked={useServerRoute}
                onChange={() => setUseServerRoute(!useServerRoute)}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <Label htmlFor="use-server-route" className="text-sm font-normal">
                Use server-side signup (recommended)
              </Label>
            </div>

            {debugInfo && (
              <div className="rounded-md bg-amber-50 p-3 text-sm text-amber-900">
                <p className="font-medium">Debug Info:</p>
                <p className="font-mono text-xs">{debugInfo}</p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Creating account..." : "Create account"}
            </Button>
            <div className="text-center text-sm">
              Already have an account?{" "}
              <Link href="/login" className="underline">
                Sign in
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
