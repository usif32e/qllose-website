'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { FormEvent } from 'react'
import { AuthShell } from '@/components/qllose/auth-shell'
import { Field } from '@/components/qllose/field'
import { Button } from '@/components/ui/button'

export default function RegisterPage() {
  const router = useRouter()

  // Frontend-only: no account creation logic. Wire to a real backend later.
  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    router.push('/welcome')
  }

  return (
    <AuthShell title="Create your account" subtitle="Join Qllose and find your universe.">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field id="username" label="Username" placeholder="nova" required autoComplete="username" />
        <Field id="email" label="Email" type="email" placeholder="you@qllose.space" required autoComplete="email" />
        <Field id="password" label="Password" type="password" placeholder="••••••••" required autoComplete="new-password" />
        <Field
          id="confirm"
          label="Confirm Password"
          type="password"
          placeholder="••••••••"
          required
          autoComplete="new-password"
        />

        <Button type="submit" className="mt-2 h-11 w-full rounded-xl text-sm">
          Register
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Login
        </Link>
      </p>
    </AuthShell>
  )
}
