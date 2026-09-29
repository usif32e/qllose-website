'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function VerifyEmailPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/register')
  }, [router])

  return (
    <main className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <div className="mx-auto mb-4 size-8 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />

        <p className="text-sm text-muted-foreground">
          Redirecting…
        </p>
      </div>
    </main>
  )
}