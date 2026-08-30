
'use client'

import {
  useEffect,
  useState,
  type ChangeEvent,
} from 'react'

import Link from 'next/link'

import {
  Bell,
  Camera,
  Check,
  ChevronRight,
  Lock,
  LogOut,
  Palette,
  Save,
  Sparkles,
  UserRound,
} from 'lucide-react'

import { AppShell } from '@/components/qllose/app-shell'
import { Field } from '@/components/qllose/field'
import {
  Button,
  buttonVariants,
} from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase'

const upcoming = [
  'AI Assistant',
  'Private Messages',
  'Voice & Video Chat',
  'Notifications',
  'Achievements & Levels',
  'Trending Topics',
]

export default function SettingsPage() {
  const [userId, setUserId] =
    useState('')

  const [email, setEmail] =
    useState('')

  const [profile, setProfile] =
    useState({
      username: '',
      nickname: '',
      age: '',
      location: '',
      bio: '',
      avatar_url: '',
    })

  const [profileImage, setProfileImage] =
    useState('')

  const [loading, setLoading] =
    useState(true)

  const [saving, setSaving] =
    useState(false)

  const [saveSuccess, setSaveSuccess] =
    useState(false)

  const [notifs, setNotifs] =
    useState({
      mentions: true,
      planets: true,
      digest: false,
    })

  useEffect(() => {
    loadProfile()
  }, [])

  async function loadProfile() {
    const {
      data: { user },
    } =
      await supabase.auth.getUser()

    if (!user) {
      setLoading(false)
      return
    }

    setUserId(user.id)

    setEmail(
      user.email || '',
    )

    const {
      data,
      error,
    } =
      await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    if (error) {
      console.log(
        'PROFILE LOAD ERROR:',
        error,
      )

      setLoading(false)
      return
    }

    if (data) {
      setProfile({
        username:
          data.username ||
          '',

        nickname:
          data.nickname ||
          '',

        age:
          data.age?.toString() ||
          '',

        location:
          data.location ||
          '',

        bio:
          data.bio ||
          '',

        avatar_url:
          data.avatar_url ||
          '',
      })

      setProfileImage(
        data.avatar_url ||
          '',
      )
    }

    setLoading(false)
  }

  function handleChange(
    e: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement
    >,
  ) {
    const {
      id,
      value,
    } = e.target

    setSaveSuccess(false)

    setProfile((prev) => ({
      ...prev,
      [id]: value,
    }))
  }

  async function handleImageUpload(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file =
      event.target.files?.[0]

    if (!file || !userId) {
      return
    }

    if (
      !file.type.startsWith(
        'image/',
      )
    ) {
      alert(
        'Please select an image.',
      )

      return
    }

    const fileExt =
      file.name
        .split('.')
        .pop()

    const filePath =
      `${userId}-${Date.now()}.${fileExt}`

    const {
      error: uploadError,
    } =
      await supabase.storage
        .from('avatars')
        .upload(
          filePath,
          file,
          {
            upsert: false,
          },
        )

    if (uploadError) {
      console.log(
        'UPLOAD ERROR:',
        uploadError,
      )

      return
    }

    const {
      data: {
        publicUrl,
      },
    } =
      supabase.storage
        .from('avatars')
        .getPublicUrl(
          filePath,
        )

    setProfileImage(
      `${publicUrl}?t=${Date.now()}`,
    )

    setProfile((prev) => ({
      ...prev,
      avatar_url:
        publicUrl,
    }))

    const {
      error: updateError,
    } =
      await supabase
        .from('profiles')
        .update({
          avatar_url:
            publicUrl,
        })
        .eq(
          'id',
          userId,
        )

    if (updateError) {
      console.log(
        'AVATAR UPDATE ERROR:',
        updateError,
      )

      return
    }

    setSaveSuccess(true)
  }

  async function saveProfile() {
    setSaving(true)
    setSaveSuccess(false)

    const {
      data: existingUser,
    } =
      await supabase
        .from('profiles')
        .select('id')
        .eq(
          'username',
          profile.username,
        )
        .neq(
          'id',
          userId,
        )
        .maybeSingle()

    if (existingUser) {
      setSaving(false)

      alert(
        'Username already taken',
      )

      return
    }

    const { error } =
      await supabase
        .from('profiles')
        .update({
          username:
            profile.username,
          nickname:
            profile.nickname,
          age:
            Number(profile.age) ||
            null,
          location:
            profile.location,
          bio:
            profile.bio,
          avatar_url:
            profile.avatar_url,
        })
        .eq(
          'id',
          userId,
        )

    if (error) {
      console.log(
        'SAVE PROFILE ERROR:',
        error,
      )

      alert(error.message)

      setSaving(false)
      return
    }

    setSaving(false)
    setSaveSuccess(true)

    window.setTimeout(() => {
      setSaveSuccess(false)
    }, 2400)
  }

  if (loading) {
    return (
      <AppShell>
        <div className="flex min-h-[70vh] items-center justify-center px-6">
          <div className="flex flex-col items-center text-center">
            <div className="relative flex size-12 items-center justify-center rounded-2xl border border-primary/10 bg-primary/[0.045]">
              <Sparkles className="size-5 animate-pulse text-primary" />

              <span className="absolute inset-[-5px] rounded-[18px] border border-primary/[0.06]" />
            </div>

            <p className="mt-4 text-sm font-medium">
              Loading settings
            </p>

            <p className="mt-1 text-xs text-muted-foreground/60">
              Preparing your Qllose controls…
            </p>
          </div>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="relative mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-10">

        {/* =================================================
            ATMOSPHERE
        ================================================= */}

        <div
          className="
            pointer-events-none
            absolute
            left-1/2
            top-0
            -z-10
            h-[420px]
            w-[720px]
            -translate-x-1/2
            rounded-full
            bg-primary/[0.035]
            blur-[130px]
          "
        />

        {/* =================================================
            PAGE HEADER
        ================================================= */}

        <header className="animate-fade-up-soft mb-6">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/10 bg-primary/[0.04] px-3 py-1.5 text-[10px] text-muted-foreground backdrop-blur-xl">
            <Sparkles className="size-3.5 text-primary" />

            <span>
              Qllose controls
            </span>
          </div>

          <h1 className="text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">
            Settings
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground/70">
            Manage your identity, preferences,
            and the way you experience Qllose.
          </p>
        </header>

        {/* =================================================
            ACCOUNT CARD
        ================================================= */}

        <section className="animate-fade-up-soft relative overflow-hidden rounded-[2rem] border border-white/[0.06] bg-background/35 shadow-[0_24px_80px_-42px_rgba(0,0,0,0.95)] backdrop-blur-2xl">

          {/* top light */}

          <div className="pointer-events-none absolute left-8 right-8 top-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

          {/* header */}

          <div className="border-b border-white/[0.05] px-5 py-5 sm:px-7">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl border border-primary/10 bg-primary/[0.055] text-primary">
                <Lock className="size-4" />
              </div>

              <div>
                <h2 className="text-sm font-semibold tracking-tight">
                  Account
                </h2>

                <p className="mt-0.5 text-[11px] text-muted-foreground/60">
                  Your public identity and basic information.
                </p>
              </div>
            </div>
          </div>

          <div className="px-5 py-5 sm:px-7 sm:py-7">

            {/* =================================================
                PROFILE IDENTITY
            ================================================= */}

            <div className="relative overflow-hidden rounded-2xl border border-white/[0.05] bg-white/[0.015] p-4 sm:p-5">
              <div className="pointer-events-none absolute -right-10 -top-10 size-32 rounded-full bg-primary/[0.04] blur-3xl" />

              <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center">

                {/* AVATAR */}

                <div className="relative mx-auto sm:mx-0">
                  <div className="rounded-full bg-card p-1.5 shadow-[0_16px_40px_-18px_rgba(0,0,0,0.9)]">
                    <div className="rounded-full ring-1 ring-white/[0.08]">
                      {profileImage ? (
                        <img
                          src={profileImage}
                          alt="Profile"
                          className="size-20 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex size-20 items-center justify-center rounded-full bg-primary text-xl font-semibold text-primary-foreground">
                          {(profile.username ||
                            'U')
                            .slice(
                              0,
                              2,
                            )
                            .toUpperCase()}
                        </div>
                      )}
                    </div>
                  </div>

                  <label
                    className="
                      group/camera
                      absolute
                      bottom-0
                      right-0
                      flex size-8
                      cursor-pointer
                      items-center
                      justify-center
                      rounded-xl
                      border
                      border-white/10
                      bg-background/90
                      text-muted-foreground
                      shadow-lg
                      backdrop-blur-xl
                      transition-all duration-200
                      hover:scale-105
                      hover:bg-primary
                      hover:text-primary-foreground
                      active:scale-95
                    "
                  >
                    <Camera className="size-3.5 transition-transform duration-200 group-hover/camera:scale-110" />

                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={
                        handleImageUpload
                      }
                    />
                  </label>
                </div>

                {/* PROFILE INFO */}

                <div className="min-w-0 flex-1 text-center sm:text-left">
                  <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                    <p className="text-sm font-semibold">
                      {profile.nickname ||
                        profile.username ||
                        'Your profile'}
                    </p>

                    <span className="inline-flex items-center gap-1 rounded-full border border-primary/10 bg-primary/[0.05] px-2 py-1 text-[9px] font-medium uppercase tracking-[0.12em] text-primary/75">
                      <UserRound className="size-3" />
                      Member
                    </span>
                  </div>

                  <p className="mt-1 text-xs text-muted-foreground/60">
                    @{profile.username ||
                      'username'}
                  </p>

                  <p className="mt-2 text-[11px] leading-5 text-muted-foreground/55">
                    Upload a clear avatar to make your identity easier to recognize.
                  </p>
                </div>

              </div>
            </div>

            {/* =================================================
                FIELDS
            ================================================= */}

            <div className="mt-6 grid gap-4 sm:grid-cols-2">

              <Field
                id="nickname"
                label="Display name"
                value={
                  profile.nickname
                }
                onChange={
                  handleChange
                }
              />

              <Field
                id="username"
                label="Username"
                value={
                  profile.username
                }
                onChange={
                  handleChange
                }
              />

              <Field
                id="email"
                label="Email"
                type="email"
                value={email}
                disabled
              />

              <Field
                id="age"
                label="Age"
                type="number"
                min="1"
                value={
                  profile.age
                }
                onChange={
                  handleChange
                }
              />

              <div className="sm:col-span-2">
                <Field
                  id="location"
                  label="Location"
                  value={
                    profile.location
                  }
                  onChange={
                    handleChange
                  }
                />
              </div>
            </div>

            {/* BIO */}

            <div className="mt-4 flex flex-col gap-1.5">
              <label
                htmlFor="bio"
                className="text-sm font-medium tracking-tight text-foreground/90"
              >
                Bio
              </label>

              <textarea
                id="bio"
                rows={4}
                value={
                  profile.bio
                }
                onChange={
                  handleChange
                }
                placeholder="Tell people a little about you..."
                className="
                  w-full
                  resize-none
                  rounded-xl
                  border
                  border-border/60
                  bg-background/35
                  px-3.5
                  py-3
                  text-sm
                  leading-6
                  text-foreground
                  outline-none
                  backdrop-blur-xl
                  transition-all duration-200
                  placeholder:text-muted-foreground/35
                  hover:border-border
                  focus:border-primary/30
                  focus:bg-background/45
                  focus:ring-2
                  focus:ring-primary/10
                "
              />
            </div>

            {/* SAVE */}

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[10px] text-muted-foreground/50">
                Your profile changes are saved to your Qllose identity.
              </p>

              <Button
                type="button"
                onClick={
                  saveProfile
                }
                disabled={
                  saving
                }
                className="
                  group
                  h-10
                  rounded-xl
                  px-5
                  shadow-[0_10px_30px_-18px_oklch(0.72_0.18_278_/_0.6)]
                  transition-all duration-300
                  hover:-translate-y-0.5
                "
              >
                {saveSuccess ? (
                  <span className="flex items-center gap-2">
                    <Check className="size-4" />
                    Saved
                  </span>
                ) : saving ? (
                  <span className="flex items-center gap-2">
                    <span className="size-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                    Saving…
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Save className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5" />
                    Save changes
                  </span>
                )}
              </Button>
            </div>
          </div>
        </section>

        {/* =================================================
            NOTIFICATIONS
        ================================================= */}

        <section
          className="
            animate-fade-up-soft
            mt-4
            rounded-[1.75rem]
            border border-white/[0.055]
            bg-background/30
            p-5
            backdrop-blur-2xl
            sm:p-6
          "
        >
          <SettingsHeader
            icon={Bell}
            title="Notifications"
            description="Control how Qllose keeps you informed."
          />

          <div className="mt-5 divide-y divide-white/[0.05]">
            <Toggle
              label="Mentions"
              description="Get notified when someone mentions you."
              checked={
                notifs.mentions
              }
              onChange={() =>
                setNotifs((current) => ({
                  ...current,
                  mentions:
                    !current.mentions,
                }))
              }
            />

            <Toggle
              label="Planet activity"
              description="Get updates from the planets you're part of."
              checked={
                notifs.planets
              }
              onChange={() =>
                setNotifs((current) => ({
                  ...current,
                  planets:
                    !current.planets,
                }))
              }
            />

            <Toggle
              label="Weekly digest"
              description="Receive a lightweight summary of your Qllose activity."
              checked={
                notifs.digest
              }
              onChange={() =>
                setNotifs((current) => ({
                  ...current,
                  digest:
                    !current.digest,
                }))
              }
            />
          </div>
        </section>

        {/* =================================================
            APPEARANCE
        ================================================= */}

        <section
          className="
            animate-fade-up-soft
            mt-4
            rounded-[1.75rem]
            border border-white/[0.055]
            bg-background/30
            p-5
            backdrop-blur-2xl
            sm:p-6
          "
        >
          <SettingsHeader
            icon={Palette}
            title="Appearance"
            description="Choose how Qllose looks and feels."
          />

          <div className="mt-5 flex items-center justify-between rounded-2xl border border-white/[0.05] bg-white/[0.015] px-4 py-3.5">
            <div>
              <p className="text-sm font-medium">
                Theme
              </p>

              <p className="mt-0.5 text-xs text-muted-foreground/55">
                Qllose currently runs in dark mode.
              </p>
            </div>

            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/10 bg-primary/[0.05] px-3 py-1.5 text-[10px] font-medium text-primary/80">
              <Sparkles className="size-3" />
              Dark
            </span>
          </div>
        </section>

        {/* =================================================
            COMING SOON
        ================================================= */}

        <section
          className="
            animate-fade-up-soft
            mt-4
            rounded-[1.75rem]
            border border-white/[0.055]
            bg-background/30
            p-5
            backdrop-blur-2xl
            sm:p-6
          "
        >
          <SettingsHeader
            icon={Sparkles}
            title="Coming soon"
            description="A glimpse at what we're building next."
          />

          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            {upcoming.map(
              (feature, index) => (
                <div
                  key={
                    feature
                  }
                  className="
                    group
                    flex
                    items-center
                    justify-between
                    rounded-xl
                    border border-dashed
                    border-white/[0.07]
                    bg-white/[0.012]
                    px-3.5 py-3
                    transition-all
                    duration-300
                    hover:border-primary/15
                    hover:bg-primary/[0.025]
                  "
                  style={{
                    animationDelay: `${index * 50}ms`,
                  }}
                >
                  <span className="text-xs text-muted-foreground/70 transition-colors duration-300 group-hover:text-foreground/80">
                    {feature}
                  </span>

                  <ChevronRight className="size-3.5 text-muted-foreground/30 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:text-primary/60" />
                </div>
              ),
            )}
          </div>
        </section>

        {/* =================================================
            DANGER ZONE
        ================================================= */}

        <section className="animate-fade-up-soft mt-4 rounded-[1.75rem] border border-red-500/10 bg-red-500/[0.02] p-5 backdrop-blur-2xl sm:p-6">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-red-500/10 bg-red-500/[0.05] text-red-400">
              <LogOut className="size-4" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground/90">
                Sign out
              </p>

              <p className="mt-1 text-xs leading-5 text-muted-foreground/60">
                End your current Qllose session on this device.
              </p>
            </div>
          </div>

          <Link
            href="/"
            className={cn(
              buttonVariants({
                variant:
                  'destructive',
              }),
              `
                group
                mt-4
                h-10
                rounded-xl
                px-4
                transition-all duration-300
                hover:-translate-y-0.5
              `,
            )}
          >
            <LogOut className="size-4 transition-transform duration-300 group-hover:-translate-x-0.5" />

            Logout
          </Link>
        </section>
      </div>
    </AppShell>
  )
}

/* =========================================================
   SETTINGS HEADER
========================================================= */

function SettingsHeader({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{
    className?: string
  }>
  title: string
  description: string
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-primary/10 bg-primary/[0.05] text-primary">
        <Icon className="size-4" />
      </div>

      <div className="min-w-0">
        <h2 className="text-sm font-semibold tracking-tight">
          {title}
        </h2>

        <p className="mt-1 text-[11px] leading-5 text-muted-foreground/55">
          {description}
        </p>
      </div>
    </div>
  )
}

/* =========================================================
   TOGGLE
========================================================= */

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string
  description: string
  checked: boolean
  onChange: () => void
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <div className="min-w-0">
        <p className="text-sm font-medium">
          {label}
        </p>

        <p className="mt-1 text-xs leading-5 text-muted-foreground/55">
          {description}
        </p>
      </div>

      <button
        type="button"
        onClick={onChange}
        aria-pressed={
          checked
        }
        className={cn(
          `
            relative
            h-6
            w-11
            shrink-0
            rounded-full
            border
            transition-all
            duration-300
            active:scale-95
          `,
          checked
            ? 'border-primary/20 bg-primary shadow-[0_0_16px_oklch(0.72_0.18_278_/_0.12)]'
            : 'border-white/[0.07] bg-secondary/70',
        )}
      >
        <span
          className={cn(
            `
              absolute
              top-0.5
              flex
              size-5
              items-center
              justify-center
              rounded-full
              bg-white
              shadow-sm
              transition-transform
              duration-300
            `,
            checked
              ? 'translate-x-[21px]'
              : 'translate-x-0.5',
          )}
        >
          {checked && (
            <Check className="size-2.5 text-primary" />
          )}
        </span>
      </button>
    </div>
  )
}

