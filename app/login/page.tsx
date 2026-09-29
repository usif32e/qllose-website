'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState, type FormEvent } from 'react'
import {
  ArrowRight,
  LockKeyhole,
  Mail,
  Sparkles,
} from 'lucide-react'

import { AuthShell } from '@/components/qllose/auth-shell'
import { Field } from '@/components/qllose/field'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    async function checkSession() {
      // Give Capacitor/Supabase a moment to restore
      // the saved authentication session.
      await new Promise((resolve) =>
        setTimeout(resolve, 300),
      )

      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!mounted) return

      if (session?.user) {
        router.replace('/planets')
        return
      }

      setCheckingSession(false)
    }

    void checkSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return

        if (
          session?.user &&
          (event === 'INITIAL_SESSION' ||
            event === 'SIGNED_IN' ||
            event === 'TOKEN_REFRESHED')
        ) {
          router.replace('/planets')
        }
      },
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [router])

  async function handleSubmit(
    e: FormEvent<HTMLFormElement>,
  ) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const form = new FormData(e.currentTarget)

    const email = form.get('email') as string
    const password = form.get('password') as string

    const {
      data,
      error: signInError,
    } = await supabase.auth.signInWithPassword({
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

    router.replace(
      profile
        ? '/planets'
        : '/welcome',
    )
  }

  if (checkingSession) {
    return (
      <AuthShell
        title="Welcome back"
        subtitle="Checking your session..."
      >
        <div className="flex items-center justify-center py-10">
          <span className="size-5 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
        </div>
      </AuthShell>
    )
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Log in to return to your universe."
    >
      <div className="animate-fade-up-soft mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/10 bg-primary/[0.045] px-3 py-1.5 text-[10px] text-muted-foreground backdrop-blur-xl">
          <Sparkles className="size-3.5 text-primary" />

          <span>
            Return to Qllose
          </span>
        </div>

        <p className="max-w-sm text-sm leading-6 text-muted-foreground/75">
          Your planets, conversations, and communities
          are waiting for you.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4"
      >
        <div className="animate-fade-up-soft">
          <Field
            id="email"
            name="email"
            label="Email"
            type="email"
            placeholder="you@qllose.space"
            required
            autoComplete="email"
            icon={
              <Mail className="size-4" />
            }
          />
        </div>

        <div className="animate-fade-up-soft [animation-delay:60ms]">
          <Field
            id="password"
            name="password"
            label="Password"
            type="password"
            placeholder="••••••••"
            required
            autoComplete="current-password"
            icon={
              <LockKeyhole className="size-4" />
            }
          />

          <Link
            href="/forgot-password"
            className="
              mt-2
              block
              w-fit
              ml-auto
              text-xs
              text-primary/75
              transition-colors
              hover:text-primary
            "
          >
            Forgot password?
          </Link>
        </div>

        {error && (
          <div
            className="
              animate-fade-up-soft
              rounded-xl
              border border-destructive/15
              bg-destructive/[0.06]
              px-3.5 py-3
            "
          >
            <p
              className="text-sm leading-5 text-destructive"
              role="alert"
            >
              {error}
            </p>
          </div>
        )}

        <Button
          type="submit"
          disabled={loading}
          className="
            group
            relative
            mt-2
            h-12
            w-full
            overflow-hidden
            rounded-xl
            text-sm
            shadow-[0_12px_35px_-18px_oklch(0.72_0.18_278_/_0.7)]
            transition-all
            duration-300
            hover:-translate-y-0.5
            hover:shadow-[0_16px_40px_-15px_oklch(0.72_0.18_278_/_0.75)]
            active:scale-[0.99]
          "
        >
          <span
            className="
              pointer-events-none
              absolute
              inset-y-0
              -left-[70%]
              w-1/2
              skew-x-[-18deg]
              bg-white/15
              opacity-0
              transition-all
              duration-700
              group-hover:left-[120%]
              group-hover:opacity-100
            "
          />

          {loading ? (
            <span className="relative flex items-center justify-center gap-2">
              <span className="size-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
              Logging in…
            </span>
          ) : (
            <span className="relative flex items-center justify-center gap-2">
              Login

              <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
            </span>
          )}
        </Button>
      </form>

      <div className="animate-fade-up-soft mt-7 border-t border-white/[0.055] pt-5">
        <p className="text-center text-sm text-muted-foreground">
          Don't have an account?{' '}
          <Link
            href="/register"
            className="
              font-medium
              text-primary/90
              transition-colors
              hover:text-primary
            "
          >
            Create Account
          </Link>
        </p>
      </div>
    </AuthShell>
  )
}