
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  CalendarDays,
  Sparkles,
  MessageSquare,
  Orbit,
  Hash,
  Pencil,
  ArrowRight,
  MapPin,
  UserRound,
} from 'lucide-react'

import { AppShell } from '@/components/qllose/app-shell'
import { Avatar } from '@/components/qllose/avatar'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase'

export default function ProfilePage() {
  const [profile, setProfile] =
    useState<any>(null)

  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (data) {
        setProfile(data)
      }
    }

    loadProfile()
  }, [])

  if (!profile) {
    return (
      <AppShell>
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="flex flex-col items-center text-center">
            <div className="relative flex size-12 items-center justify-center rounded-2xl border border-primary/10 bg-primary/[0.05]">
              <Sparkles className="size-5 animate-pulse text-primary" />
              <span className="absolute inset-[-4px] rounded-2xl border border-primary/10 opacity-50" />
            </div>

            <p className="mt-4 text-sm font-medium">
              Loading profile
            </p>

            <p className="mt-1 text-xs text-muted-foreground/60">
              Preparing your Qllose identity…
            </p>
          </div>
        </div>
      </AppShell>
    )
  }

  const stats = [
    {
      label: 'Messages',
      value: 0,
      icon: MessageSquare,
    },
    {
      label: 'Planets',
      value: 3,
      icon: Orbit,
    },
    {
      label: 'Channels',
      value: 12,
      icon: Hash,
    },
  ]

  return (
    <AppShell>
      <div className="relative mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-10">

        {/* =================================================
            AMBIENT BACKGROUND
        ================================================= */}

        <div
          className="
            pointer-events-none
            absolute left-1/2 top-0
            -z-10
            h-[360px] w-[700px]
            -translate-x-1/2
            rounded-full
            bg-primary/[0.035]
            blur-[120px]
          "
        />

        {/* =================================================
            PROFILE CARD
        ================================================= */}

        <section className="animate-fade-up-soft relative overflow-hidden rounded-[2rem] border border-white/[0.06] bg-background/40 shadow-[0_25px_90px_-45px_rgba(0,0,0,0.95)] backdrop-blur-2xl">

          {/* COVER */}

          <div
            className="
              relative
              h-32
              overflow-hidden
              sm:h-40
            "
            style={{
              background: `
                linear-gradient(
                  120deg,
                  var(--creator),
                  var(--gamer-2) 52%,
                  var(--business)
                )
              `,
            }}
          >
            {/* dark overlay */}

            <div className="absolute inset-0 bg-black/30" />

            {/* atmosphere */}

            <div className="absolute -left-10 top-[-50px] size-56 rounded-full bg-white/10 blur-3xl" />

            <div className="absolute right-[-30px] bottom-[-70px] size-64 rounded-full bg-black/20 blur-3xl" />

            {/* diagonal sheen */}

            <div className="absolute inset-0 bg-[linear-gradient(120deg,transparent_25%,oklch(1_0_0_/_0.08)_50%,transparent_75%)] opacity-50" />

            {/* cover label */}

            <div className="absolute bottom-3 right-4 rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[9px] uppercase tracking-[0.18em] text-white/65 backdrop-blur-md">
              Qllose Identity
            </div>
          </div>

          {/* BODY */}

          <div className="relative px-5 pb-6 sm:px-7 sm:pb-8">

            {/* TOP ROW */}

            <div className="-mt-11 flex flex-col gap-4 sm:-mt-12 sm:flex-row sm:items-end sm:justify-between">

              {/* AVATAR */}

              <div className="relative w-fit">
                <div className="relative rounded-full bg-card p-1 shadow-[0_16px_40px_-18px_rgba(0,0,0,0.9)]">
                  <div className="rounded-full ring-2 ring-white/[0.08]">
                    <Avatar
                      initials={(
                        profile.username ||
                        'U'
                      )
                        .substring(
                          0,
                          2,
                        )
                        .toUpperCase()}
                      color="var(--primary)"
                      image={
                        profile.avatar_url
                      }
                      size={96}
                    />
                  </div>
                </div>

                {/* online/status glow */}

                <span className="absolute bottom-1 right-1 flex size-5 items-center justify-center rounded-full border-4 border-card bg-emerald-400 shadow-[0_0_14px_rgba(52,211,153,0.5)]">
                  <span className="size-1.5 rounded-full bg-white/80" />
                </span>

                {/* avatar glow */}

                <div className="pointer-events-none absolute inset-[-8px] -z-10 rounded-full bg-primary/[0.08] blur-xl" />
              </div>

              {/* EDIT */}

              <Link
                href="/settings"
                className={cn(
                  buttonVariants({
                    variant: 'outline',
                  }),
                  `
                    group
                    h-10
                    w-fit
                    rounded-xl
                    border-border/60
                    bg-background/25
                    px-4
                    backdrop-blur-xl
                    transition-all duration-300
                    hover:-translate-y-0.5
                    hover:border-primary/20
                    hover:bg-primary/[0.045]
                  `,
                )}
              >
                <Pencil className="size-3.5 transition-transform duration-300 group-hover:-rotate-6" />

                <span>
                  Edit profile
                </span>
              </Link>
            </div>

            {/* IDENTITY */}

            <div className="mt-5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-semibold tracking-[-0.035em] sm:text-3xl">
                  {profile.nickname ||
                    profile.username}
                </h1>

                <span className="inline-flex items-center gap-1 rounded-full border border-primary/10 bg-primary/[0.05] px-2 py-1 text-[9px] font-medium uppercase tracking-[0.13em] text-primary/80">
                  <UserRound className="size-3" />
                  Member
                </span>
              </div>

              <p className="mt-1 text-sm text-muted-foreground/65">
                @{profile.username}
              </p>
            </div>

            {/* BIO */}

            {profile.bio && (
              <div className="mt-5 max-w-2xl rounded-2xl border border-white/[0.045] bg-white/[0.015] px-4 py-3.5">
                <p className="text-sm leading-6 text-foreground/85">
                  {profile.bio}
                </p>
              </div>
            )}

            {/* META */}

            <div className="mt-4 flex flex-wrap gap-2">
              {profile.location && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border/50 bg-secondary/[0.18] px-3 py-1.5 text-[11px] text-muted-foreground">
                  <MapPin className="size-3.5 text-primary/75" />

                  {profile.location}
                </span>
              )}

              {profile.age !==
                null &&
                profile.age !==
                  undefined &&
                profile.age !== '' && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-border/50 bg-secondary/[0.18] px-3 py-1.5 text-[11px] text-muted-foreground">
                    <CalendarDays className="size-3.5" />

                    Age {profile.age}
                  </span>
                )}
            </div>
          </div>
        </section>

        {/* =================================================
            STATS
        ================================================= */}

        <section className="mt-4 grid grid-cols-3 gap-3 sm:mt-5 sm:gap-4">
          {stats.map(
            (
              stat,
              index,
            ) => (
              <div
                key={
                  stat.label
                }
                className="
                  group
                  animate-fade-up-soft
                  relative
                  overflow-hidden
                  rounded-2xl
                  border border-white/[0.055]
                  bg-background/35
                  px-3 py-4
                  text-center
                  backdrop-blur-xl
                  transition-all duration-300
                  hover:-translate-y-1
                  hover:border-primary/15
                  hover:bg-background/45
                  sm:px-4 sm:py-5
                "
                style={{
                  animationDelay:
                    `${index * 80}ms`,
                }}
              >
                {/* glow */}

                <div className="pointer-events-none absolute -right-8 -top-8 size-20 rounded-full bg-primary/[0.04] blur-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                <div className="relative">
                  <div className="mx-auto flex size-9 items-center justify-center rounded-xl border border-primary/10 bg-primary/[0.06] text-primary transition-transform duration-300 group-hover:scale-105">
                    <stat.icon className="size-4" />
                  </div>

                  <span className="mt-2 block text-lg font-semibold tracking-tight sm:text-xl">
                    {stat.value}
                  </span>

                  <span className="text-[10px] text-muted-foreground sm:text-xs">
                    {stat.label}
                  </span>
                </div>
              </div>
            ),
          )}
        </section>

        {/* =================================================
            PLANET CTA
        ================================================= */}

        <section className="mt-5 animate-fade-up-soft">
          <div className="relative overflow-hidden rounded-2xl border border-white/[0.055] bg-background/30 p-4 backdrop-blur-xl sm:p-5">

            <div className="pointer-events-none absolute right-[-60px] top-1/2 size-40 -translate-y-1/2 rounded-full bg-primary/[0.045] blur-3xl" />

            <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Orbit className="size-4 text-primary" />

                  <p className="text-sm font-semibold tracking-tight">
                    Explore the Qllose Universe
                  </p>
                </div>

                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  Discover planets and find the communities that fit you.
                </p>
              </div>

              <Link
                href="/planets"
                className={cn(
                  buttonVariants({
                    variant: 'default',
                  }),
                  `
                    group
                    h-10
                    rounded-xl
                    px-5
                    shadow-[0_10px_30px_-16px_oklch(0.72_0.18_278_/_0.55)]
                    transition-all duration-300
                    hover:-translate-y-0.5
                  `,
                )}
              >
                <span className="flex items-center gap-2">
                  Explore planets

                  <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  )
}

