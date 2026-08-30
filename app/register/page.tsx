
'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, type FormEvent } from 'react'
import {
  ArrowRight,
  AtSign,
  LockKeyhole,
  Mail,
  Sparkles,
} from 'lucide-react'

import { AuthShell } from '@/components/qllose/auth-shell'
import { Field } from '@/components/qllose/field'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'

export default function RegisterPage() {
  const router = useRouter()

  const [loading, setLoading] =
    useState(false)

  const [error, setError] =
    useState<string | null>(null)

  async function handleSubmit(
    e: FormEvent<HTMLFormElement>,
  ) {
    e.preventDefault()
    setError(null)

    const form =
      new FormData(
        e.currentTarget,
      )

    const email =
      form.get('email') as string

    const password =
      form.get('password') as string

    const confirm =
      form.get('confirm') as string

    const username =
      form.get('username') as string

    if (password !== confirm) {
      setError(
        'Passwords do not match.',
      )
      return
    }

    setLoading(true)

    const {
      error: signUpError,
    } =
      await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
          },
        },
      })

    if (signUpError) {
      setError(
        signUpError.message,
      )

      setLoading(false)

      return
    }

    router.push('/welcome')
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Join Qllose and find your universe."
    >
      {/* =====================================================
          INTRO
      ===================================================== */}

      <div className="animate-fade-up-soft mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/10 bg-primary/[0.045] px-3 py-1.5 text-[10px] text-muted-foreground backdrop-blur-xl">
          <Sparkles className="size-3.5 text-primary" />

          <span>
            Enter the Qllose universe
          </span>
        </div>

        <p className="max-w-sm text-sm leading-6 text-muted-foreground/75">
          Create your identity, choose your planets,
          and find the communities that feel like home.
        </p>
      </div>

      {/* =====================================================
          FORM
      ===================================================== */}

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4"
      >
        {/* USERNAME */}

        <div className="animate-fade-up-soft">
          <Field
            id="username"
            name="username"
            label="Username"
            placeholder="nova"
            required
            autoComplete="username"
            icon={
              <AtSign className="size-4" />
            }
          />
        </div>

        {/* EMAIL */}

        <div className="animate-fade-up-soft [animation-delay:50ms]">
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

        {/* PASSWORD */}

        <div className="animate-fade-up-soft [animation-delay:100ms]">
          <Field
            id="password"
            name="password"
            label="Password"
            type="password"
            placeholder="••••••••"
            required
            autoComplete="new-password"
            icon={
              <LockKeyhole className="size-4" />
            }
          />
        </div>

        {/* CONFIRM PASSWORD */}

        <div className="animate-fade-up-soft [animation-delay:150ms]">
          <Field
            id="confirm"
            name="confirm"
            label="Confirm Password"
            type="password"
            placeholder="••••••••"
            required
            autoComplete="new-password"
            icon={
              <LockKeyhole className="size-4" />
            }
          />
        </div>

        {/* ERROR */}

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

        {/* SUBMIT */}

        <Button
          type="submit"
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
          disabled={loading}
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
              Creating account…
            </span>
          ) : (
            <span className="relative flex items-center justify-center gap-2">
              Create Account

              <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
            </span>
          )}
        </Button>
      </form>

      {/* =====================================================
          LOGIN
      ===================================================== */}

      <div className="animate-fade-up-soft mt-7 border-t border-white/[0.055] pt-5">
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link
            href="/login"
            className="
              font-medium
              text-primary/90
              transition-colors
              hover:text-primary
            "
          >
            Login
          </Link>
        </p>
      </div>
    </AuthShell>
  )
}

