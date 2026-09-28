'use client'

import Link from 'next/link'
import { useEffect, useState, type FormEvent } from 'react'
import {
ArrowLeft,
ArrowRight,
LockKeyhole,
Sparkles,
} from 'lucide-react'

import { AuthShell } from '@/components/qllose/auth-shell'
import { Field } from '@/components/qllose/field'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'

export default function ResetPasswordPage() {
const [loading, setLoading] = useState(false)
const [checking, setChecking] = useState(true)
const [error, setError] = useState<string | null>(null)
const [success, setSuccess] = useState(false)

useEffect(() => {
let mounted = true


async function checkSession() {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!mounted) return

  if (!session) {
    setError(
      'This password reset link is invalid or has expired.',
    )
  }

  setChecking(false)
}

checkSession()

return () => {
  mounted = false
}


}, [])

async function handleSubmit(
e: FormEvent<HTMLFormElement>,
) {
e.preventDefault()

setError(null)

const form = new FormData(e.currentTarget)

const password = form.get('password') as string
const confirm = form.get('confirm') as string

if (password !== confirm) {
  setError('Passwords do not match.')
  return
}

if (password.length < 6) {
  setError(
    'Password must be at least 6 characters.',
  )
  return
}

setLoading(true)

const { error: updateError } =
  await supabase.auth.updateUser({
    password,
  })

if (updateError) {
  setError(updateError.message)
  setLoading(false)
  return
}

setSuccess(true)
setLoading(false)

await supabase.auth.signOut()


}

if (checking) {
return ( <AuthShell
     title="Reset your password"
     subtitle="Checking your reset link..."
   > <div className="flex items-center justify-center py-10"> <span className="size-5 animate-spin rounded-full border-2 border-primary/20 border-t-primary" /> </div> </AuthShell>
)
}

if (success) {
return ( <AuthShell
     title="Password updated"
     subtitle="Your Qllose password has been changed successfully."
   > <div className="animate-fade-up-soft"> <div className="rounded-2xl border border-primary/10 bg-primary/[0.045] p-5"> <div className="mb-3 flex size-10 items-center justify-center rounded-xl border border-primary/10 bg-primary/[0.08]"> <LockKeyhole className="size-5 text-primary" /> </div>


        <h3 className="text-sm font-medium text-foreground">
          You're all set
        </h3>

        <p className="mt-2 text-sm leading-6 text-muted-foreground/75">
          Your password has been changed. You can now
          log in to Qllose using your new password.
        </p>
      </div>

      <Link
        href="/login"
        className="
          mt-6
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
        Go to Login
        <ArrowRight className="size-4" />
      </Link>
    </div>
  </AuthShell>
)


}

return ( <AuthShell
   title="Choose a new password"
   subtitle="Create a new password for your Qllose account."
 > <div className="animate-fade-up-soft mb-6"> <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/10 bg-primary/[0.045] px-3 py-1.5 text-[10px] text-muted-foreground backdrop-blur-xl"> <Sparkles className="size-3.5 text-primary" />


      <span>
        Secure account recovery
      </span>
    </div>

    <p className="max-w-sm text-sm leading-6 text-muted-foreground/75">
      Choose a new password to secure your Qllose
      account.
    </p>
  </div>

  <form
    onSubmit={handleSubmit}
    className="flex flex-col gap-4"
  >
    <div className="animate-fade-up-soft">
      <Field
        id="password"
        name="password"
        label="New Password"
        type="password"
        placeholder="••••••••"
        required
        autoComplete="new-password"
        icon={
          <LockKeyhole className="size-4" />
        }
      />
    </div>

    <div className="animate-fade-up-soft [animation-delay:60ms]">
      <Field
        id="confirm"
        name="confirm"
        label="Confirm New Password"
        type="password"
        placeholder="••••••••"
        required
        autoComplete="new-password"
        icon={
          <LockKeyhole className="size-4" />
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
          Updating password…
        </span>
      ) : (
        <span className="relative flex items-center justify-center gap-2">
          Update Password
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
</AuthShell>


)
}
