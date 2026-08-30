'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Users, Sparkles } from 'lucide-react'

import { Starfield } from '@/components/qllose/starfield'
import { Logo } from '@/components/qllose/logo'
import { PlanetOrb } from '@/components/qllose/planet-orb'
import { buttonVariants } from '@/components/ui/button'

import { planets } from '@/lib/qllose-data'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'

export default function PlanetSelectionPage() {
  const [memberCounts, setMemberCounts] =
    useState<Record<string, number>>({})

  const [mouse, setMouse] = useState({
    x: 50,
    y: 50,
  })

  useEffect(() => {
    async function loadCounts() {
      const { data, error } = await supabase
        .from('planet_members')
        .select('planet_id')

      if (error) {
        console.log('MEMBERS COUNT ERROR:', error)
        return
      }

      const counts: Record<string, number> = {}

      ;(data || []).forEach((member) => {
        counts[member.planet_id] =
          (counts[member.planet_id] || 0) + 1
      })

      setMemberCounts(counts)
    }

    loadCounts()
  }, [])

  function handleMouseMove(
    event: React.MouseEvent<HTMLElement>,
  ) {
    const rect =
      event.currentTarget.getBoundingClientRect()

    const x =
      ((event.clientX - rect.left) /
        rect.width) *
      100

    const y =
      ((event.clientY - rect.top) /
        rect.height) *
      100

    setMouse({ x, y })
  }

  return (
    <main
      className="relative min-h-dvh overflow-hidden bg-background"
      onMouseMove={handleMouseMove}
    >
      <Starfield />

      {/* GLOBAL ATMOSPHERE */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        aria-hidden
      >
        <div
          className="absolute left-1/2 top-[-16%] h-[560px] w-[980px] -translate-x-1/2 rounded-full blur-[140px] opacity-18"
          style={{
            background:
              'radial-gradient(circle, oklch(0.68 0.2 278 / 0.52), transparent 68%)',
          }}
        />

        <div
          className="absolute inset-0 opacity-30 transition-all duration-700"
          style={{
            background: `radial-gradient(
              circle 460px at ${mouse.x}% ${mouse.y}%,
              oklch(0.7 0.18 278 / 0.065),
              transparent 70%
            )`,
          }}
        />

        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,oklch(0.03_0.02_265_/_0.36)_100%)]" />
      </div>

      {/* HEADER */}
      <header className="relative z-20 mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8 sm:py-7">
        <div className="animate-fade-up-soft">
          <Logo />
        </div>

        <Link
          href="/profile"
          className={cn(
            buttonVariants({
              variant: 'ghost',
            }),
            `
              animate-fade-up-soft
              h-9 rounded-xl
              border border-border/50
              bg-background/30
              px-4
              backdrop-blur-xl
              transition-all duration-300
              hover:border-primary/30
              hover:bg-primary/5
              hover:-translate-y-0.5
            `,
          )}
        >
          Profile
        </Link>
      </header>

      {/* HERO */}
      <section className="relative z-10 mx-auto max-w-7xl px-5 pb-24 pt-8 sm:px-8 sm:pt-14">
        <div className="mx-auto max-w-3xl text-center">
          <div
            className="
              animate-fade-up-soft
              mb-5 inline-flex items-center gap-2
              rounded-full
              border border-primary/15
              bg-primary/[0.04]
              px-3.5 py-1.5
              text-xs text-muted-foreground
              shadow-[0_0_30px_oklch(0.7_0.18_278_/_0.05)]
              backdrop-blur-xl
            "
          >
            <Sparkles className="size-3.5 text-primary" />

            <span>
              Explore the Qllose Universe
            </span>

            <span className="size-1 rounded-full bg-primary/70 shadow-[0_0_8px_currentColor]" />
          </div>

          <h1
            className="
              animate-fade-up-soft
              text-balance
              text-5xl font-semibold
              tracking-[-0.055em]
              sm:text-6xl
              lg:text-7xl
            "
          >
            Choose your{' '}
            <span className="text-gradient">
              planet
            </span>
          </h1>

          <p
            className="
              animate-fade-up-soft
              mx-auto mt-5
              max-w-xl
              text-pretty
              text-sm
              leading-7
              text-muted-foreground
              sm:text-base
            "
          >
            Every planet has its own people,
            energy, and purpose.
            <br className="hidden sm:block" />
            Find your world and step inside.
          </p>
        </div>

        {/* PLANETS */}
        <div className="mt-12 grid gap-5 md:grid-cols-3 md:gap-6 lg:mt-16">
          {planets.map((planet, index) => {
            const memberCount =
              memberCounts[planet.id] || 0

            return (
              <article
                key={planet.id}
                className="group relative animate-fade-up-soft"
                style={{
                  animationDelay:
                    `${160 + index * 120}ms`,
                }}
              >
                {/* Planet glow */}

                <div
                  className="
                    pointer-events-none
                    absolute -inset-8
                    rounded-[3rem]
                    opacity-0
                    blur-3xl
                    transition-opacity
                    duration-700
                    group-hover:opacity-30
                  "
                  style={{
                    background: `
                      radial-gradient(
                        circle at 50% 38%,
                        ${planet.accent},
                        transparent 67%
                      )
                    `,
                  }}
                />

                {/* COMPACT CARD */}

                <div
                  className="
                    relative
                    flex min-h-[485px]
                    flex-col
                    items-center
                    overflow-hidden
                    rounded-[1.75rem]
                    border border-border/60
                    bg-background/48
                    p-5
                    text-center
                    shadow-[0_18px_55px_-30px_rgba(0,0,0,0.9)]
                    backdrop-blur-2xl
                    transition-all
                    duration-400
                    ease-out
                    group-hover:border-white/12
                    group-hover:shadow-[0_24px_75px_-35px_rgba(0,0,0,0.95)]
                    sm:min-h-[500px]
                    sm:p-6
                  "
                >
                  {/* mouse spotlight */}
                  <div
                    className="
                      pointer-events-none
                      absolute inset-0
                      opacity-0
                      transition-opacity
                      duration-400
                      group-hover:opacity-100
                    "
                    style={{
                      background: `radial-gradient(
                        280px circle at ${mouse.x}% ${mouse.y}%,
                        ${planet.accent}12,
                        transparent 72%
                      )`,
                    }}
                  />

                  {/* top light */}
                  <div
                    className="
                      pointer-events-none
                      absolute left-1/2 top-0
                      h-px w-1/2
                      -translate-x-1/2
                      opacity-20
                      transition-all duration-500
                      group-hover:w-3/4
                      group-hover:opacity-70
                    "
                    style={{
                      background: `
                        linear-gradient(
                          90deg,
                          transparent,
                          ${planet.accent},
                          transparent
                        )
                      `,
                    }}
                  />

                  {/* PLANET */}

                  <div className="relative z-10 mt-1">
                    <div
                      className="
                        absolute left-1/2 top-1/2
                        size-48
                        -translate-x-1/2
                        -translate-y-1/2
                        rounded-full
                        opacity-0
                        blur-3xl
                        transition-opacity
                        duration-500
                        group-hover:opacity-25
                      "
                      style={{
                        background:
                          planet.accent,
                      }}
                    />

                    <div
                      className="
                        relative
                        transition-all
                        duration-600
                        ease-out
                        group-hover:scale-[1.07]
                        group-hover:rotate-[2deg]
                      "
                    >
                      <PlanetOrb
                        accent={
                          planet.accent
                        }
                        accent2={
                          planet.accent2
                        }
                        size={155}
                      />
                    </div>
                  </div>

                  {/* CONTENT */}

                  <div className="relative z-10 flex w-full flex-1 flex-col items-center">
                    <h2
                      className="
                        mt-6
                        text-xl
                        font-semibold
                        tracking-tight
                        transition-colors
                        duration-300
                        group-hover:text-foreground
                      "
                    >
                      {planet.name}
                    </h2>

                    <p
                      className="
                        mt-1.5
                        max-w-xs
                        text-sm
                        leading-6
                        text-muted-foreground
                      "
                    >
                      {planet.tagline}
                    </p>

                    {/* TAGS */}

                    <div className="mt-4 flex min-h-6 flex-wrap justify-center gap-1.5">
                      {planet.audience
                        .slice(0, 4)
                        .map((tag) => (
                          <span
                            key={tag}
                            className="
                              rounded-full
                              border border-border/60
                              bg-background/40
                              px-2.5 py-1
                              text-[10px]
                              text-muted-foreground
                              transition-all
                              duration-300
                              group-hover:bg-background/60
                              group-hover:text-foreground/80
                            "
                          >
                            {tag}
                          </span>
                        ))}
                    </div>

                    {/* MEMBERS */}

                    <div
                      className="
                        mt-4
                        inline-flex
                        items-center gap-2
                        rounded-full
                        border border-border/50
                        bg-secondary/20
                        px-3 py-1.5
                        text-[11px]
                        text-muted-foreground
                        transition-all duration-300
                        group-hover:border-primary/20
                      "
                    >
                      <span
                        className="size-1.5 rounded-full"
                        style={{
                          backgroundColor:
                            planet.accent,
                          boxShadow:
                            `0 0 10px ${planet.accent}`,
                        }}
                      />

                      <Users className="size-3.5" />

                      <span>
                        {memberCount.toLocaleString()}{' '}
                        {memberCount === 1
                          ? 'member'
                          : 'members'}
                      </span>
                    </div>

                    {/* ENTER BUTTON */}

                    <Link
                      href={`/planet/${planet.id}`}
                      className={cn(
                        buttonVariants({
                          variant: 'default',
                        }),
                        `
                          group/btn
                          relative
                          mt-auto
                          h-10
                          w-full
                          overflow-hidden
                          rounded-xl
                          border
                          border-white/10
                          text-sm
                          shadow-lg
                          transition-all
                          duration-300
                          hover:-translate-y-0.5
                        `,
                      )}
                    >
                      {/* Sweep */}

                      <span
                        className="
                          absolute inset-y-0
                          -left-[110%]
                          w-[70%]
                          skew-x-[-20deg]
                          opacity-0
                          transition-all
                          duration-700
                          group-hover/btn:left-[130%]
                          group-hover/btn:opacity-30
                        "
                        style={{
                          background:
                            `linear-gradient(
                              90deg,
                              transparent,
                              ${planet.accent},
                              transparent
                            )`,
                        }}
                      />

                      <span className="relative z-10 flex items-center justify-center gap-2">
                        Enter Planet

                        <ArrowRight
                          className="
                            size-4
                            transition-transform
                            duration-300
                            group-hover/btn:translate-x-1
                          "
                        />
                      </span>
                    </Link>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </section>
    </main>
  )
}

