'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

import { supabase } from '@/lib/supabase'

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    let mounted = true

    async function handleCallback() {
      const code = searchParams.get('code')

      if (!code) {
        router.replace('/login')
        return
      }

      const { error } =
        await supabase.auth.exchangeCodeForSession(code)

      if (!mounted) return

      if (error) {
        console.error('Auth callback error:', error)
        router.replace('/login')
        return
      }

      // Newly verified users should create their profile first.
      router.replace('/create-profile')
    }

    handleCallback()

    return () => {
      mounted = false
    }
  }, [router, searchParams])

  return (
    <main className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <div className="mx-auto mb-4 size-8 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />

        <p className="text-sm text-muted-foreground">
          Confirming your email…
        </p>
      </div>
    </main>
  )
}