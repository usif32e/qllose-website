
import { notFound } from 'next/navigation'
import { ArrowUpRight, Sparkles } from 'lucide-react'

import { supabase } from '@/lib/supabase'

import { ProfileHeader } from '@/components/qllose/profile-header'
import { ProfileActions } from '@/components/qllose/profile-actions'
import { ProfileStats } from '@/components/qllose/profile-stats'
import { ProfileAbout } from '@/components/qllose/profile-about'
import { ProfilePlanets } from '@/components/qllose/profile-planets'
import { BackToChat } from '@/components/qllose/back-to-chat'

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const {
    data: profile,
    error,
  } = await supabase
    .from('profiles')
    .select(`
      id,
      username,
      nickname,
      age,
      location,
      bio,
      avatar_url,
      is_founder,
      created_at
    `)
    .eq('id', id)
    .maybeSingle()

  if (error || !profile) {
    notFound()
  }

  const {
    data: planetMembers,
    error: planetsError,
  } = await supabase
    .from('planet_members')
    .select(`
      role,
      planet_id
    `)
    .eq('user_id', id)

  console.log(
    'PROFILE PLANETS:',
    planetMembers,
  )

  console.log(
    'PLANETS ERROR:',
    planetsError,
  )

  const planets = (
    planetMembers || []
  ).map((p) => ({
    id: p.planet_id,

    name:
      p.planet_id.charAt(0).toUpperCase() +
      p.planet_id.slice(1),

    role: p.role,
  }))

  return (
    <main className="relative min-h-dvh overflow-hidden bg-background text-foreground">
      {/* =====================================================
          ATMOSPHERE
      ===================================================== */}

      <div
        className="
          pointer-events-none
          absolute inset-0
          overflow-hidden
        "
        aria-hidden
      >
        <div className="
          absolute
          left-1/2
          top-[-12%]
          h-[500px]
          w-[800px]
          -translate-x-1/2
          rounded-full
          bg-primary/[0.035]
          blur-[130px]
        " />

        <div className="
          absolute
          left-[-8%]
          top-[24%]
          size-[250px]
          rounded-full
          bg-[var(--creator)]/[0.02]
          blur-[100px]
        " />

        <div className="
          absolute
          right-[-7%]
          bottom-[14%]
          size-[270px]
          rounded-full
          bg-[var(--gamer)]/[0.02]
          blur-[105px]
        " />

        <div className="
          absolute inset-0
          bg-[radial-gradient(circle_at_center,transparent_32%,oklch(0.03_0.02_265_/_0.22)_100%)]
        " />
      </div>

      {/* =====================================================
          PAGE
      ===================================================== */}

      <div className="relative z-10 mx-auto max-w-4xl px-4 py-5 sm:px-6 sm:py-8 lg:px-8">

        {/* ===================================================
            TOP BAR
        =================================================== */}

        <div className="animate-fade-up-soft mb-5 flex items-center justify-between">
          <BackToChat />

          <div className="
            hidden
            items-center
            gap-2
            rounded-full
            border
            border-white/[0.05]
            bg-background/30
            px-3
            py-1.5
            text-[9px]
            uppercase
            tracking-[0.16em]
            text-muted-foreground/45
            backdrop-blur-xl
            sm:flex
          ">
            <Sparkles className="size-3 text-primary/70" />
            Qllose Identity
          </div>

          <span className="
            inline-flex
            items-center
            gap-1.5
            rounded-full
            border
            border-primary/10
            bg-primary/[0.035]
            px-2.5
            py-1.5
            text-[9px]
            text-primary/70
            sm:hidden
          ">
            <Sparkles className="size-3" />
            Profile
          </span>
        </div>

        {/* ===================================================
            PROFILE SHELL
        =================================================== */}

        <div className="relative overflow-hidden rounded-[2rem] border border-white/[0.06] bg-background/30 shadow-[0_28px_100px_-50px_rgba(0,0,0,0.95)] backdrop-blur-2xl">

          {/* top highlight */}

          <div className="
            pointer-events-none
            absolute
            left-10
            right-10
            top-0
            h-px
            bg-gradient-to-r
            from-transparent
            via-primary/20
            to-transparent
          " />

          {/* subtle identity glow */}

          <div className="
            pointer-events-none
            absolute
            right-[-90px]
            top-[-90px]
            size-[260px]
            rounded-full
            bg-primary/[0.025]
            blur-[90px]
          " />

          {/* =================================================
              HEADER
          ================================================= */}

          <section className="relative p-4 sm:p-6">
            <div className="animate-fade-up-soft">
              <ProfileHeader
                profile={profile}
              />
            </div>
          </section>

          {/* divider */}

          <div className="h-px bg-white/[0.045]" />

          {/* =================================================
              ACTIONS
          ================================================= */}

          <section className="animate-fade-up-soft px-4 py-4 [animation-delay:70ms] sm:px-6">
            <div className="relative overflow-hidden rounded-2xl border border-white/[0.05] bg-white/[0.012] p-3">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_50%,oklch(0.72_0.18_278_/_0.035),transparent_35%)]" />

              <div className="relative">
                <ProfileActions
                  profileId={id}
                />
              </div>
            </div>
          </section>

          {/* =================================================
              STATS
          ================================================= */}

          <section className="animate-fade-up-soft px-4 pb-1 [animation-delay:120ms] sm:px-6">
            <div className="rounded-2xl border border-white/[0.05] bg-white/[0.012] p-3 sm:p-4">
              <ProfileStats
                profileId={id}
                planets={planets.length}
              />
            </div>
          </section>

          {/* =================================================
              ABOUT
          ================================================= */}

          <section className="animate-fade-up-soft px-4 py-4 [animation-delay:170ms] sm:px-6">
            <div className="relative overflow-hidden rounded-2xl border border-white/[0.05] bg-white/[0.012] p-4 sm:p-5">
              <div className="pointer-events-none absolute -right-10 -top-10 size-28 rounded-full bg-primary/[0.025] blur-3xl" />

              <div className="relative">
                <ProfileAbout
                  age={profile.age}
                  location={
                    profile.location
                  }
                  bio={profile.bio}
                  createdAt={
                    profile.created_at
                  }
                />
              </div>
            </div>
          </section>

          {/* =================================================
              PLANETS
          ================================================= */}

          <section className="animate-fade-up-soft px-4 pb-5 [animation-delay:220ms] sm:px-6 sm:pb-6">
            <div className="relative overflow-hidden rounded-2xl border border-white/[0.05] bg-white/[0.012] p-4 sm:p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-8 items-center justify-center rounded-xl border border-primary/10 bg-primary/[0.05] text-primary">
                    <Sparkles className="size-3.5" />
                  </div>

                  <div>
                    <p className="text-sm font-semibold tracking-tight">
                      Planets
                    </p>

                    <p className="mt-0.5 text-[10px] text-muted-foreground/50">
                      Worlds this person belongs to
                    </p>
                  </div>
                </div>

                <ArrowUpRight className="size-4 text-muted-foreground/30" />
              </div>

              <ProfilePlanets
                planets={planets}
              />
            </div>
          </section>
        </div>

        {/* bottom note */}

        <div className="animate-fade-up-soft mt-4 text-center [animation-delay:260ms]">
          <p className="text-[9px] uppercase tracking-[0.18em] text-muted-foreground/30">
            Part of the Qllose Universe
          </p>
        </div>
      </div>
    </main>
  )
}

