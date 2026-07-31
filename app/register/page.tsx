'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, type FormEvent } from 'react'
import { AuthShell } from '@/components/qllose/auth-shell'
import { Field } from '@/components/qllose/field'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    const form = new FormData(e.currentTarget)
    const email = form.get('email') as string
    const password = form.get('password') as string
    const confirm = form.get('confirm') as string
    const username = form.get('username') as string

    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username },
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    router.push('/welcome')
  }

  return (
    <AuthShell title="Create your account" subtitle="Join Qllose and find your universe.">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field id="username" name="username" label="Username" placeholder="nova" required autoComplete="username" />
        <Field id="email" name="email" label="Email" type="email" placeholder="you@qllose.space" required autoComplete="email" />
        <Field id="password" name="password" label="Password" type="password" placeholder="••••••••" required autoComplete="new-password" />
        <Field
          id="confirm"
          name="confirm"
          label="Confirm Password"
          type="password"
          placeholder="••••••••"
          required
          autoComplete="new-password"
        />

        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        <Button type="submit" className="mt-2 h-11 w-full rounded-xl text-sm" disabled={loading}>
          {loading ? 'Creating account…' : 'Register'}
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
