'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Sparkles, Users, ArrowRight } from 'lucide-react'

import { Starfield } from '@/components/qllose/starfield'
import { Logo } from '@/components/qllose/logo'
import { PlanetOrb } from '@/components/qllose/planet-orb'
import { planets } from '@/lib/qllose-data'
import { supabase } from '@/lib/supabase'

const gamerPlanet = planets.find((planet) => planet.id === 'gamer')

const orbitingStars = [
  { size: 5, color: '#a78bfa', angle: 0, duration: '14s', radius: 155 },
  { size: 4, color: '#60a5fa', angle: 120, duration: '19s', radius: 190 },
  { size: 6, color: '#c4b5fd', angle: 220, duration: '23s', radius: 220 },
  { size: 3, color: '#ffffff', angle: 75, duration: '17s', radius: 135 },
  { size: 4, color: '#818cf8', angle: 270, duration: '21s', radius: 175 },
]

export default function PlanetSelectionPage() {
  const [memberCount, setMemberCount] = useState(0)

  useEffect(() => {
    let active = true

    async function loadMembers() {
      const { data, error } = await supabase
        .from('planet_members')
        .select('planet_id')
        .eq('planet_id', 'gamer')

      if (!active) return

      if (error) {
        console.error('XR-091 member count error:', error)
        return
      }

      setMemberCount(data?.length ?? 0)
    }

    loadMembers()

    return () => {
      active = false
    }
  }, [])

  if (!gamerPlanet) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-background text-foreground">
        XR-091 is unavailable.
      </main>
    )
  }

  return (
    <main className="relative min-h-dvh overflow-hidden bg-background text-foreground">
      <Starfield />

      {/* Space atmosphere */}
      <div
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
        aria-hidden="true"
      >
        <div
          className="xr091-atmosphere absolute left-1/2 top-[32%] h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[130px]"
          style={{
            background:
              'radial-gradient(circle, rgba(124,58,237,0.18), rgba(59,130,246,0.08) 45%, transparent 72%)',
          }}
        />

        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_10%,rgba(3,3,12,0.5)_100%)]" />
      </div>

      {/* Header */}
      <header className="relative z-20 mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8 sm:py-7">
        <Logo />

        <Link
          href="/profile"
          className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-muted-foreground backdrop-blur-xl transition hover:border-white/20 hover:text-foreground"
        >
          Profile
        </Link>
      </header>

      {/* Main planet experience */}
      <section className="relative z-10 mx-auto flex min-h-[calc(100dvh-90px)] max-w-7xl flex-col items-center px-5 pb-16 pt-5 sm:pt-10">
        {/* Intro */}
        <div className="relative z-10 text-center">
          <div className="xr091-reveal mb-5 inline-flex items-center gap-2 text-xs tracking-[0.24em] text-violet-300/80 uppercase">
            <Sparkles className="size-3.5" />
            The Qllose Universe
          </div>

          <h1 className="xr091-reveal xr091-reveal-delay-one text-4xl font-semibold tracking-[-0.055em] sm:text-6xl">
            One world.
            <span className="block bg-gradient-to-r from-violet-300 via-blue-300 to-violet-400 bg-clip-text text-transparent">
              Infinite players.
            </span>
          </h1>

          <p className="xr091-reveal xr091-reveal-delay-two mx-auto mt-4 max-w-md text-sm leading-7 text-muted-foreground sm:text-base">
            Find your people. Build your squad.
            <br className="hidden sm:block" />
            Enter the world of gaming.
          </p>
        </div>

        {/* Planet stage */}
        <div className="relative mt-5 flex w-full max-w-3xl flex-1 flex-col items-center justify-center">
          {/* Ambient glow */}
          <div
            className="xr091-core-glow pointer-events-none absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[90px] sm:h-80 sm:w-80"
            style={{
              background:
                'radial-gradient(circle, rgba(139,92,246,0.3), rgba(59,130,246,0.12) 50%, transparent 72%)',
            }}
          />

          {/* Orbiting stars */}
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-0 w-0">
            {orbitingStars.map((star, index) => (
              <div
                key={index}
                className="absolute left-0 top-0"
                style={{
                  width: star.radius * 2,
                  height: star.radius * 0.8,
                  marginLeft: -star.radius,
                  marginTop: -star.radius * 0.4,
                  transform: `rotate(${star.angle}deg)`,
                  animation: `qllose-star-orbit ${star.duration} linear infinite`,
                  animationDelay: `-${index * 2}s`,
                }}
              >
                <span
                  className="absolute left-full top-1/2 block -translate-x-1/2 -translate-y-1/2 rounded-full"
                  style={{
                    width: star.size,
                    height: star.size,
                    background: star.color,
                    boxShadow: `0 0 8px ${star.color}, 0 0 18px ${star.color}`,
                  }}
                />
              </div>
            ))}
          </div>

          {/* Orbit guides */}
          <div
            className="xr091-orbit-guide pointer-events-none absolute left-1/2 top-1/2 h-[190px] w-[310px] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border border-violet-400/20 sm:h-[240px] sm:w-[390px]"
            style={{ transform: 'translate(-50%, -50%) rotate(-18deg)' }}
          />

          <div
            className="xr091-orbit-guide xr091-orbit-guide-slow pointer-events-none absolute left-1/2 top-1/2 h-[235px] w-[350px] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border border-blue-400/15 sm:h-[300px] sm:w-[470px]"
            style={{ transform: 'translate(-50%, -50%) rotate(22deg)' }}
          />

          {/* Main planet */}
          <Link
            href="/planet/gamer"
            aria-label="Enter XR-091"
            className="group relative z-10 flex flex-col items-center outline-none"
          >
            <div className="xr091-planet-float relative transition-transform duration-700 ease-out group-hover:scale-105 group-focus-visible:scale-105">
              <PlanetOrb
                accent={gamerPlanet.accent}
                accent2={gamerPlanet.accent2}
                size={230}
                ring
              />

              {/* Controller symbol */}
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <svg
                  viewBox="0 0 64 44"
                  className="w-[74px] text-white/80 drop-shadow-[0_0_12px_rgba(167,139,250,0.85)] sm:w-[88px]"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M17 8h30c5 0 8 4 10 10l4 13c1 5-4 8-8 5L41 27H23L11 36c-4 3-9 0-8-5l4-13c2-6 5-10 10-10Z"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M18 14v12M12 20h12"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  <circle cx="44" cy="16" r="2.5" fill="currentColor" />
                  <circle cx="51" cy="22" r="2.5" fill="currentColor" />
                  <circle cx="38" cy="22" r="2.5" fill="currentColor" />
                  <circle cx="44" cy="28" r="2.5" fill="currentColor" />
                </svg>
              </div>
            </div>

            {/* Planet info */}
            <div className="mt-7 text-center">
              <h2 className="text-2xl font-semibold tracking-tight transition-colors group-hover:text-violet-300 sm:text-3xl">
                XR-091
              </h2>

              <p className="mt-2 text-sm text-muted-foreground">
                {gamerPlanet.tagline}
              </p>

              <div className="mt-4 inline-flex items-center gap-2 text-xs text-muted-foreground">
                <Users className="size-3.5" />
                <span>
                  {memberCount.toLocaleString()}{' '}
                  {memberCount === 1 ? 'member' : 'members'}
                </span>
              </div>
            </div>

            {/* Enter button */}
            <span className="mt-5 inline-flex items-center gap-2 rounded-full border border-violet-300/20 bg-violet-400/[0.07] px-5 py-2.5 text-sm text-violet-100 transition-all duration-300 group-hover:border-violet-300/40 group-hover:bg-violet-400/[0.14] group-hover:shadow-[0_0_30px_rgba(139,92,246,0.18)] group-focus-visible:ring-2 group-focus-visible:ring-violet-300">
              Enter Planet
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>

          {/* Extra orbit particles */}
          <div className="xr091-particle xr091-particle-one pointer-events-none absolute left-[18%] top-[43%] size-1 rounded-full bg-cyan-200 shadow-[0_0_14px_3px_rgba(103,232,249,0.55)]" />

          <div className="xr091-particle xr091-particle-two pointer-events-none absolute right-[19%] top-[22%] size-1.5 rounded-full bg-fuchsia-200 shadow-[0_0_14px_3px_rgba(232,121,249,0.4)]" />

          <div className="xr091-particle xr091-particle-three pointer-events-none absolute right-[28%] bottom-[18%] size-1 rounded-full bg-blue-100 shadow-[0_0_12px_3px_rgba(147,197,253,0.45)]" />

          {/* Floating stars */}
          <div className="xr091-drift xr091-drift-one pointer-events-none absolute left-[12%] top-[25%] size-1 rounded-full bg-violet-200 shadow-[0_0_12px_3px_rgba(167,139,250,0.45)]" />

          <div className="xr091-drift xr091-drift-two pointer-events-none absolute right-[13%] top-[35%] size-1.5 rounded-full bg-blue-200 shadow-[0_0_14px_3px_rgba(96,165,250,0.4)]" />

          <div className="xr091-drift xr091-drift-three pointer-events-none absolute bottom-[20%] left-[22%] size-1 rounded-full bg-white/80 shadow-[0_0_10px_2px_rgba(255,255,255,0.3)]" />

          <div className="xr091-drift xr091-drift-four pointer-events-none absolute bottom-[25%] right-[20%] size-1 rounded-full bg-violet-300 shadow-[0_0_12px_2px_rgba(167,139,250,0.4)]" />
        </div>

        <p className="relative z-10 mt-2 text-[10px] tracking-[0.22em] text-muted-foreground/50 uppercase">
          Connect + Close The Gap
        </p>
      </section>

      {/* XR-091 animations */}
      <style jsx global>{`
        .xr091-reveal {
          animation: xr091-reveal 900ms cubic-bezier(0.2, 0.7, 0.2, 1) both;
        }

        .xr091-reveal-delay-one {
          animation-delay: 100ms;
        }

        .xr091-reveal-delay-two {
          animation-delay: 220ms;
        }

        .xr091-atmosphere {
          animation: xr091-atmosphere 12s ease-in-out infinite alternate;
          will-change: opacity, transform;
        }

        .xr091-core-glow {
          animation: xr091-core-glow 6s ease-in-out infinite;
          will-change: opacity, transform;
        }

        .xr091-planet-float {
          animation: xr091-planet-float 7s ease-in-out infinite;
          transform-origin: center;
          will-change: transform;
        }

        .xr091-planet-float:hover {
          animation-play-state: paused;
        }

        .xr091-orbit-guide {
          animation: xr091-guide-breathe 9s ease-in-out infinite alternate;
          transform-origin: center;
        }

        .xr091-orbit-guide-slow {
          animation-duration: 14s;
          animation-delay: -4s;
        }

        .xr091-drift {
          animation: xr091-drift 6s ease-in-out infinite;
          will-change: transform, opacity;
        }

        .xr091-drift-two {
          animation-delay: -1.5s;
          animation-duration: 7.5s;
        }

        .xr091-drift-three {
          animation-delay: -3s;
          animation-duration: 8s;
        }

        .xr091-drift-four {
          animation-delay: -4.2s;
          animation-duration: 6.8s;
        }

        .xr091-particle {
          animation: xr091-particle 8s ease-in-out infinite;
          will-change: transform, opacity;
        }

        .xr091-particle-two {
          animation-delay: -2.5s;
          animation-duration: 9s;
        }

        .xr091-particle-three {
          animation-delay: -5s;
          animation-duration: 7s;
        }

        @keyframes xr091-reveal {
          from {
            opacity: 0;
            translate: 0 14px;
          }

          to {
            opacity: 1;
            translate: 0 0;
          }
        }

        @keyframes xr091-atmosphere {
          from {
            opacity: 0.65;
            scale: 0.92;
          }

          to {
            opacity: 1;
            scale: 1.08;
          }
        }

        @keyframes xr091-core-glow {
          0%,
          100% {
            opacity: 0.7;
            scale: 0.92;
          }

          50% {
            opacity: 1;
            scale: 1.1;
          }
        }

        @keyframes xr091-planet-float {
          0%,
          100% {
            translate: 0 0;
            rotate: -1deg;
          }

          50% {
            translate: 0 -10px;
            rotate: 1deg;
          }
        }

        @keyframes xr091-guide-breathe {
          from {
            opacity: 0.45;
          }

          to {
            opacity: 1;
          }
        }

        @keyframes xr091-drift {
          0%,
          100% {
            translate: 0 0;
            opacity: 0.55;
          }

          50% {
            translate: 8px -14px;
            opacity: 1;
          }
        }

        @keyframes xr091-particle {
          0%,
          100% {
            translate: 0 0;
            scale: 0.8;
            opacity: 0.35;
          }

          50% {
            translate: -10px -18px;
            scale: 1.2;
            opacity: 1;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .xr091-reveal,
          .xr091-atmosphere,
          .xr091-core-glow,
          .xr091-planet-float,
          .xr091-orbit-guide,
          .xr091-drift,
          .xr091-particle {
            animation: none !important;
            will-change: auto;
          }
        }
      `}</style>
    </main>
  )
}