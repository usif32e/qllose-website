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
} from 'lucide-react'

import { AppShell } from '@/components/qllose/app-shell'
import { Avatar } from '@/components/qllose/avatar'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase'

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null)

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
        <div className="flex h-[70vh] items-center justify-center text-lg">
          Loading...
        </div>
      </AppShell>
    )
  }

  const stats = [
    { label: 'Messages', value: 0, icon: MessageSquare },
    { label: 'Planets', value: 3, icon: Orbit },
    { label: 'Channels', value: 12, icon: Hash },
  ]

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl px-6 py-10">
        <div className="glass overflow-hidden rounded-3xl">

          <div
            className="h-32 w-full"
            style={{
              background:
                'linear-gradient(120deg,var(--creator),var(--gamer-2) 55%,var(--business))',
            }}
          />

          <div className="px-6 pb-6">

            <div className="-mt-10 flex items-end justify-between">

              <div className="rounded-full ring-4 ring-card">
                <Avatar
                  initials={(profile.username || 'U')
                    .substring(0, 2)
                    .toUpperCase()}
                  color="var(--primary)"
                  image={profile.avatar_url}
                  size={84}
                />
              </div>

              <Link
                href="/settings"
                className={cn(
                  buttonVariants({ variant: 'outline' }),
                  'h-9 gap-1.5 rounded-lg'
                )}
              >
                <Pencil className="size-3.5" />
                Edit profile
              </Link>

            </div>

            <h1 className="mt-4 text-2xl font-semibold tracking-tight">
              {profile.nickname}
            </h1>

            <p className="text-sm text-muted-foreground">
              @{profile.username}
            </p>

            <p className="mt-4 max-w-lg text-pretty text-sm leading-relaxed text-foreground/90">
              {profile.bio}
            </p>

            <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">

              <span className="flex items-center gap-1.5">
                <Sparkles className="size-4 text-primary" />
                {profile.location}
              </span>

              <span className="flex items-center gap-1.5">
                <CalendarDays className="size-4" />
                Age {profile.age}
              </span>

            </div>

          </div>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-4">

          {stats.map((s) => (
            <div
              key={s.label}
              className="glass flex flex-col items-center rounded-2xl px-4 py-5 text-center"
            >
              <s.icon className="size-5 text-primary" />
              <span className="mt-2 text-xl font-semibold">
                {s.value}
              </span>
              <span className="text-xs text-muted-foreground">
                {s.label}
              </span>
            </div>
          ))}

        </div>

        <div className="mt-6">

          <Link
            href="/planets"
            className={cn(
              buttonVariants({ variant: 'default' }),
              'h-10 rounded-xl px-5'
            )}
          >
            <Orbit className="size-4" />
            Explore planets
          </Link>

        </div>

      </div>
    </AppShell>
  )
}