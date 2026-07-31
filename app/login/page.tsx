'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, type FormEvent } from 'react'
import { AuthShell } from '@/components/qllose/auth-shell'
import { Field } from '@/components/qllose/field'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    const form = new FormData(e.currentTarget)
    const email = form.get('email') as string
    const password = form.get('password') as string

    setLoading(true)

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      setError(signInError.message)
      setLoading(false)
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', data.user.id)
      .maybeSingle()

    router.push(profile ? '/planets' : '/welcome')
  }

  return (
    <AuthShell title="Welcome back" subtitle="Log in to return to your universe.">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field id="email" name="email" label="Email" type="email" placeholder="you@qllose.space" required autoComplete="email" />
        <div className="flex flex-col gap-1.5">
          <Field id="password" name="password" label="Password" type="password" placeholder="••••••••" required autoComplete="current-password" />
          <span className="cursor-pointer self-end text-xs text-primary transition-colors hover:text-primary/80">
            Forgot password?
          </span>
        </div>

        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        <Button type="submit" className="mt-2 h-11 w-full rounded-xl text-sm" disabled={loading}>
          {loading ? 'Logging in…' : 'Login'}
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
