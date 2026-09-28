'use client'

import Link from 'next/link'
import { useState, type FormEvent } from 'react'
import {
ArrowLeft,
ArrowRight,
Mail,
Sparkles,
} from 'lucide-react'

import { AuthShell } from '@/components/qllose/auth-shell'
import { Field } from '@/components/qllose/field'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'

export default function ForgotPasswordPage() {
const [loading, setLoading] = useState(false)
const [error, setError] = useState<string | null>(null)
const [sent, setSent] = useState(false)

async function handleSubmit(
e: FormEvent<HTMLFormElement>,
) {
e.preventDefault()


setError(null)

const form = new FormData(e.currentTarget)

const email = form.get('email') as string

setLoading(true)

const { error: resetError } =
  await supabase.auth.resetPasswordForEmail(
    email,
    {
      redirectTo: `${window.location.origin}/reset-password`,
    },
  )

if (resetError) {
  setError(resetError.message)
  setLoading(false)
  return
}

setSent(true)
setLoading(false)


}

return ( <AuthShell
   title="Reset your password"
   subtitle="We'll help you get back into your universe."
 >
{!sent ? (
<> <div className="animate-fade-up-soft mb-6"> <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/10 bg-primary/[0.045] px-3 py-1.5 text-[10px] text-muted-foreground backdrop-blur-xl"> <Sparkles className="size-3.5 text-primary" />


          <span>
            Account recovery
          </span>
        </div>

        <p className="max-w-sm text-sm leading-6 text-muted-foreground/75">
          Enter the email connected to your Qllose
          account and we'll send you a secure reset link.
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
              Sending link…
            </span>
          ) : (
            <span className="relative flex items-center justify-center gap-2">
              Send Reset Link

              <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
            </span>
          )}
        </Button>
      </form>

      <div className="animate-fade-up-soft mt-7 border-t border-white/[0.055] pt-5">
        <Link
          href="/login"
          className="
            flex
            items-center
            justify-center
            gap-2
            text-sm
            text-muted-foreground
            transition-colors
            hover:text-primary
          "
        >
          <ArrowLeft className="size-4" />
          Back to Login
        </Link>
      </div>
    </>
  ) : (
    <div className="animate-fade-up-soft">
      <div className="rounded-2xl border border-primary/10 bg-primary/[0.045] p-5">
        <div className="mb-3 flex size-10 items-center justify-center rounded-xl border border-primary/10 bg-primary/[0.08]">
          <Mail className="size-5 text-primary" />
        </div>

        <h3 className="text-sm font-medium text-foreground">
          Check your email
        </h3>

        <p className="mt-2 text-sm leading-6 text-muted-foreground/75">
          If an account exists with that email, we've
          sent you a secure link to reset your password.
        </p>
      </div>

      <div className="mt-6">
        <Link
          href="/login"
          className="
            flex
            items-center
            justify-center
            gap-2
            text-sm
            text-primary/90
            transition-colors
            hover:text-primary
          "
        >
          <ArrowLeft className="size-4" />
          Back to Login
        </Link>
      </div>
    </div>
  )}
</AuthShell>


)
}
