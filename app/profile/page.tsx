'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CalendarDays, Sparkles, MessageSquare, Orbit, Hash, Pencil } from 'lucide-react'
import { AppShell } from '@/components/qllose/app-shell'
import { Avatar } from '@/components/qllose/avatar'
import { buttonVariants } from '@/components/ui/button'
import { currentUser } from '@/lib/qllose-data'
import { cn } from '@/lib/utils'

const stats = [
  { label: 'Messages', value: currentUser.stats.messages.toLocaleString(), icon: MessageSquare },
  { label: 'Planets', value: currentUser.stats.planets, icon: Orbit },
  { label: 'Channels', value: currentUser.stats.channels, icon: Hash },
]

export default function ProfilePage() {
  const [profileImage, setProfileImage] = useState<string | undefined>()

  useEffect(() => {
    const image = localStorage.getItem('qllose-profile-image')

    if (image) {
      setProfileImage(image)
    }
  }, [])

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl px-6 py-10">
        <div className="glass overflow-hidden rounded-3xl">

          {/* Banner */}
          <div
            className="h-32 w-full"
            style={{
              background:
                'linear-gradient(120deg, var(--creator), var(--gamer-2) 55%, var(--business))',
            }}
          />

          <div className="px-6 pb-6">
            <div className="-mt-10 flex items-end justify-between">

              <div className="rounded-full ring-4 ring-card">
                <Avatar
                  initials={currentUser.initials}
                  color="var(--primary)"
                  image={profileImage}
                  size={84}
                />
              </div>

              <Link
                href="/settings"
                className={cn(buttonVariants({ variant: 'outline' }), 'h-9 gap-1.5 rounded-lg')}
              >
                <Pencil className="size-3.5" />
                Edit profile
              </Link>

            </div>

            <h1 className="mt-4 text-2xl font-semibold tracking-tight">
              {currentUser.displayName}
            </h1>

            <p className="text-sm text-muted-foreground">
              @{currentUser.username}
            </p>

            <p className="mt-4 max-w-lg text-pretty text-sm leading-relaxed text-foreground/90">
              {currentUser.bio}
            </p>

            <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">

              <span className="flex items-center gap-1.5">
                <Sparkles className="size-4 text-primary" />
                Favorite: {currentUser.favoritePlanet}
              </span>

              <span className="flex items-center gap-1.5">
                <CalendarDays className="size-4" />
                Joined {currentUser.joinDate}
              </span>

            </div>
          </div>
        </div>


        {/* Stats */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="glass flex flex-col items-center rounded-2xl px-4 py-5 text-center"
            >
              <s.icon className="size-5 text-primary" />
              <span className="mt-2 text-xl font-semibold">{s.value}</span>
              <span className="text-xs text-muted-foreground">{s.label}</span>
            </div>
          ))}
        </div>


        <div className="mt-6">
          <Link
            href="/planets"
            className={cn(buttonVariants({ variant: 'default' }), 'h-10 rounded-xl px-5')}
          >
            <Orbit className="size-4" />
            Explore planets
          </Link>
        </div>

      </div>
    </AppShell>
  )
}