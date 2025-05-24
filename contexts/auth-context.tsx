'use client'

import type React from 'react'

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Session, User } from '@supabase/supabase-js'

import {
  getSessionWrapper,
  onAuthStateChangeWrapper,
  signInWithPasswordWrapper,
  signOutWrapper,
  signUpWrapper,
} from '@/lib/supabase/data-services/auth'

type AuthContextType = {
  user: User | null
  session: Session | null
  isLoading: boolean
  signUp: (email: string, password: string, name: string) => Promise<{ error: any }>
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
        error,
      } = await getSessionWrapper()
      setSession(session)
      setUser(session?.user ?? null)
      setIsLoading(false)
    }

    getSession()

    const {
      data: { subscription },
    } = onAuthStateChangeWrapper((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setIsLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [getSessionWrapper, onAuthStateChangeWrapper])

  const signUp = async (email: string, password: string, name: string) => {
    const { error } = await signUpWrapper(email, password, { data: { name } })

    return { error }
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await signInWithPasswordWrapper(email, password)

    return { error }
  }

  const signOut = async () => {
    await signOutWrapper()
    router.push('/login')
  }

  const value = {
    user,
    session,
    isLoading,
    signUp,
    signIn,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
