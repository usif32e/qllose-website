'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { FormEvent } from 'react'
import { AuthShell } from '@/components/qllose/auth-shell'
import { Field } from '@/components/qllose/field'
import { Button } from '@/components/ui/button'

export default function LoginPage() {
  const router = useRouter()

  // Frontend-only: no auth logic. Wire to a real backend later.
  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    router.push('/welcome')
  }

  return (
    <AuthShell title="Welcome back" subtitle="Log in to return to your universe.">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field id="email" label="Email" type="email" placeholder="you@qllose.space" required autoComplete="email" />
        <div className="flex flex-col gap-1.5">
          <Field id="password" label="Password" type="password" placeholder="••••••••" required autoComplete="current-password" />
          <span className="cursor-pointer self-end text-xs text-primary transition-colors hover:text-primary/80">
            Forgot password?
          </span>
        </div>

        <Button type="submit" className="mt-2 h-11 w-full rounded-xl text-sm">
          Login
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        {"Don't have an account? "}
        <Link href="/register" className="font-medium text-primary hover:underline">
          Create Account
        </Link>
      </p>
    </AuthShell>
  )
}
