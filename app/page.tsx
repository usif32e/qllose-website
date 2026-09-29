'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
Globe2,
Sparkles,
MessagesSquare,
ShieldCheck,
ArrowRight,
Orbit,
Zap,
} from 'lucide-react'

import { Starfield } from '@/components/qllose/starfield'
import { Logo } from '@/components/qllose/logo'
import { PlanetOrb } from '@/components/qllose/planet-orb'
import { buttonVariants } from '@/components/ui/button'

import { planets } from '@/lib/qllose-data'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase'

const features = [
{
icon: Globe2,
title: 'Join planets, not noise',
description:
'Pick a universe built around what you actually care about and dive straight in.',
},
{
icon: MessagesSquare,
title: 'Channels for everything',
description:
'Every planet is organized into focused channels so conversations stay on topic.',
},
{
icon: Sparkles,
title: 'Designed to feel calm',
description:
'A premium, minimal interface that gets out of the way and lets you connect.',
},
{
icon: ShieldCheck,
title: 'Your space, your rules',
description:
'Clean moderation-ready structure so communities stay safe as they grow.',
},
]

const btn = (
variant: 'default' | 'outline' | 'ghost',
extra?: string,
) =>
cn(
buttonVariants({ variant }),
'h-11 rounded-xl px-6 text-sm',
extra,
)

export default function LandingPage() {
const router = useRouter()

useEffect(() => {
let mounted = true

async function checkSession() {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!mounted) return

  if (session?.user) {
    router.replace('/planets')
  }
}

void checkSession()

return () => {
  mounted = false
}


}, [router])

return ( <main className="relative min-h-dvh overflow-hidden bg-background"> <Starfield />

  {/* =====================================================
      GLOBAL ATMOSPHERE
  ===================================================== */}

  <div
    className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
    aria-hidden
  >
    <div className="absolute left-1/2 top-[-17%] h-[560px] w-[1000px] -translate-x-1/2 rounded-full bg-primary/10 blur-[145px]" />

    <div className="absolute left-[3%] top-[24%] h-[240px] w-[240px] rounded-full bg-[var(--creator)]/5 blur-[105px]" />

    <div className="absolute right-[3%] top-[38%] h-[280px] w-[280px] rounded-full bg-[var(--gamer)]/5 blur-[115px]" />

    <div className="absolute bottom-[-8%] left-1/2 h-[400px] w-[850px] -translate-x-1/2 rounded-full bg-[var(--business)]/[0.03] blur-[125px]" />

    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_26%,oklch(0.03_0.02_265_/_0.34)_100%)]" />
  </div>

  {/* =====================================================
      HEADER
  ===================================================== */}

  <header className="relative z-30 mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8 sm:py-7">
    <div className="animate-fade-up-soft">
      <Logo />
    </div>

    <nav className="flex items-center gap-1.5 sm:gap-2">
      <Link
        href="/login"
        className={btn(
          'ghost',
          'animate-fade-up-soft hover:bg-primary/5',
        )}
      >
        Login
      </Link>

      <Link
        href="/register"
        className={btn(
          'default',
          'group animate-fade-up-soft shadow-[0_0_24px_oklch(0.72_0.18_278_/_0.10)]',
        )}
      >
        <span className="flex items-center gap-2">
          Create Account
          <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
        </span>
      </Link>
    </nav>
  </header>

  {/* =====================================================
      HERO
  ===================================================== */}

  <section className="relative z-10 mx-auto max-w-7xl px-5 pb-8 pt-5 sm:px-8 sm:pt-8 lg:pb-10 lg:pt-10">
    <div className="grid items-center gap-5 lg:grid-cols-[1.03fr_0.97fr] lg:gap-0">
      <div className="text-center lg:text-left">
        <div className="animate-fade-up-soft mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/[0.045] px-3.5 py-1.5 text-xs text-muted-foreground backdrop-blur-xl lg:mx-0">
          <span className="relative flex size-1.5">
            <span className="absolute inset-0 animate-ping rounded-full bg-primary/55" />
            <span className="relative size-1.5 rounded-full bg-primary" />
          </span>

          <Sparkles className="size-3.5 text-primary" />

          <span>
            Welcome to your corner of the universe
          </span>
        </div>

        <h1 className="animate-fade-up-soft text-balance text-5xl font-semibold leading-[0.94] tracking-[-0.06em] sm:text-6xl lg:max-w-2xl lg:text-[5.45rem]">
          Find your{' '}
          <span className="text-gradient">universe.</span>
        </h1>

        <p className="animate-fade-up-soft mx-auto mt-5 max-w-2xl text-pretty text-sm leading-7 text-muted-foreground sm:text-base lg:mx-0 lg:text-lg">
          Qllose lets you join entire planets built around your
          interests. Enter a channel, find your people, and start
          talking in seconds.
        </p>

        <div className="animate-fade-up-soft mt-7 flex flex-col items-center gap-3 sm:flex-row lg:items-start">
          <Link
            href="/register"
            className={btn(
              'default',
              'group h-12 px-7 shadow-[0_15px_40px_-18px_oklch(0.72_0.18_278_/_0.65)]',
            )}
          >
            <span className="flex items-center gap-2">
              Create Account
              <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
            </span>
          </Link>

          <Link
            href="/login"
            className={btn(
              'outline',
              'h-12 border-border/70 bg-background/30 backdrop-blur-xl',
            )}
          >
            Login
          </Link>
        </div>

        <div className="animate-fade-up-soft mt-7 flex flex-wrap items-center justify-center gap-4 text-[11px] text-muted-foreground lg:justify-start">
          <span className="inline-flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-emerald-400 shadow-[0_0_9px_rgba(52,211,153,0.55)]" />
            Real communities
          </span>

          <span className="hidden h-3 w-px bg-border sm:block" />

          <span className="inline-flex items-center gap-2">
            <Zap className="size-3 text-primary" />
            Real-time conversations
          </span>
        </div>
      </div>

      <div className="relative mx-auto h-[330px] w-full max-w-[560px] sm:h-[390px] lg:h-[430px]">
        <div className="absolute left-1/2 top-1/2 size-[290px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/[0.055] blur-[75px] sm:size-[340px]" />

        <div className="absolute left-1/2 top-1/2 h-[210px] w-[400px] -translate-x-1/2 -translate-y-1/2 rotate-[-18deg] rounded-[50%] border border-primary/10 animate-spin-slow sm:h-[250px] sm:w-[460px]" />

        <div className="absolute left-1/2 top-1/2 h-[155px] w-[310px] -translate-x-1/2 -translate-y-1/2 rotate-[19deg] rounded-[50%] border border-white/[0.05] animate-spin-reverse sm:h-[195px] sm:w-[360px]" />

        <div className="absolute left-1/2 top-1/2 h-[245px] w-[435px] -translate-x-1/2 -translate-y-1/2 rotate-[38deg] rounded-[50%] border border-white/[0.035] sm:h-[275px] sm:w-[500px]" />

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 animate-float-gentle">
          <PlanetOrb
            accent="var(--creator)"
            accent2="var(--creator-2)"
            size={210}
          />
        </div>

        <div className="absolute left-[4%] top-[11%] animate-float-medium sm:left-[8%]">
          <PlanetOrb
            accent="var(--gamer)"
            accent2="var(--gamer-2)"
            size={76}
          />
        </div>

        <div className="absolute bottom-[10%] right-[4%] animate-float-slow sm:right-[8%]">
          <PlanetOrb
            accent="var(--business)"
            accent2="var(--business-2)"
            size={90}
          />
        </div>

        <div className="absolute left-[2%] top-[41%] hidden rounded-2xl border border-border/60 bg-background/45 px-3 py-2 shadow-xl backdrop-blur-xl sm:block">
          <div className="flex items-center gap-2">
            <span
              className="size-1.5 rounded-full"
              style={{
                backgroundColor: 'var(--gamer)',
                boxShadow: '0 0 10px var(--gamer)',
              }}
            />

            <span className="text-[10px] font-medium text-muted-foreground">
              Gamer
            </span>
          </div>
        </div>

        <div className="absolute bottom-[20%] left-[5%] hidden rounded-2xl border border-border/60 bg-background/45 px-3 py-2 shadow-xl backdrop-blur-xl sm:block">
          <div className="flex items-center gap-2">
            <span
              className="size-1.5 rounded-full"
              style={{
                backgroundColor: 'var(--creator)',
                boxShadow: '0 0 10px var(--creator)',
              }}
            />

            <span className="text-[10px] font-medium text-muted-foreground">
              Creator
            </span>
          </div>
        </div>

        <div className="absolute right-[5%] top-[20%] hidden rounded-2xl border border-border/60 bg-background/45 px-3 py-2 shadow-xl backdrop-blur-xl sm:block">
          <div className="flex items-center gap-2">
            <span
              className="size-1.5 rounded-full"
              style={{
                backgroundColor: 'var(--business)',
                boxShadow: '0 0 10px var(--business)',
              }}
            />

            <span className="text-[10px] font-medium text-muted-foreground">
              Business
            </span>
          </div>
        </div>

        <div className="absolute bottom-[1%] left-1/2 -translate-x-1/2 rounded-full border border-border/60 bg-background/50 px-3.5 py-1.5 text-[10px] uppercase tracking-[0.2em] text-muted-foreground backdrop-blur-xl">
          Qllose Universe
        </div>
      </div>
    </div>
  </section>

  <section className="relative z-10 mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-12">
    <div className="mx-auto max-w-3xl text-center">
      <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/35 px-3 py-1.5 text-[11px] text-muted-foreground backdrop-blur-xl">
        <Orbit className="size-3.5 text-primary" />
        Worlds built around interests
      </div>

      <h2 className="text-balance text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
        Three universes.
        <span className="text-gradient">
          {' '}
          Endless conversations.
        </span>
      </h2>

      <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-muted-foreground sm:text-base">
        Different interests. Different people. One place to find the
        conversation that feels right.
      </p>
    </div>

    <div className="mt-8 grid gap-5 md:grid-cols-3">
      {planets.map((planet, index) => (
        <article
          key={planet.id}
          className="group relative animate-fade-up-soft"
          style={{
            animationDelay: `${index * 90}ms`,
          }}
        >
          <div
            className="pointer-events-none absolute -inset-5 rounded-[2.5rem] opacity-0 blur-3xl transition-opacity duration-700 group-hover:opacity-25"
            style={{
              background: planet.accent,
            }}
          />

          <div className="relative min-h-[285px] overflow-hidden rounded-[1.75rem] border border-border/60 bg-background/45 p-6 shadow-[0_16px_55px_-30px_rgba(0,0,0,0.9)] backdrop-blur-2xl transition-all duration-500 group-hover:-translate-y-1 group-hover:border-white/10">
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.045] transition-opacity duration-500 group-hover:opacity-[0.085]"
              style={{
                background: `radial-gradient(
                  circle at 50% 8%,
                  ${planet.accent},
                  transparent 58%
                )`,
              }}
            />

            <div className="relative z-10 flex items-start justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60">
                  Planet
                </span>

                <h3 className="mt-1 text-lg font-semibold tracking-tight">
                  {planet.name}
                </h3>
              </div>

              <div
                className="flex size-9 items-center justify-center rounded-xl border border-border/60 bg-background/30"
                style={{
                  color: planet.accent,
                }}
              >
                <Orbit className="size-4 transition-transform duration-500 group-hover:rotate-45" />
              </div>
            </div>

            <div className="mt-6 flex items-center gap-5">
              <div className="relative shrink-0 transition-transform duration-500 group-hover:scale-105">
                <PlanetOrb
                  accent={planet.accent}
                  accent2={planet.accent2}
                  size={82}
                  float={false}
                  ring={false}
                />
              </div>

              <p className="text-sm leading-6 text-muted-foreground">
                {planet.description}
              </p>
            </div>

            <div className="mt-6 flex flex-wrap gap-1.5">
              {planet.audience
                .slice(0, 4)
                .map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-border/60 bg-background/30 px-2.5 py-1 text-[10px] text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
            </div>

            <div className="mt-5">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 text-xs font-medium text-primary/80 transition-colors duration-200 hover:text-primary"
              >
                Create an account to enter
                <ArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </article>
      ))}
    </div>
  </section>

  <section className="relative z-10 mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
    <div className="grid gap-5 sm:grid-cols-2">
      {features.map((feature, index) => (
        <article
          key={feature.title}
          className="group animate-fade-up-soft relative overflow-hidden rounded-[1.5rem] border border-border/60 bg-background/35 p-6 backdrop-blur-2xl transition-all duration-400 hover:-translate-y-1 hover:border-white/10 hover:bg-background/45"
          style={{
            animationDelay: `${index * 80}ms`,
          }}
        >
          <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
            <div className="absolute -left-10 -top-10 size-32 rounded-full bg-primary/5 blur-3xl" />
          </div>

          <div className="relative flex gap-4">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-primary/15 bg-primary/10 text-primary shadow-[0_0_20px_oklch(0.72_0.18_278_/_0.06)] transition-transform duration-300 group-hover:scale-105">
              <feature.icon className="size-5" />
            </span>

            <div>
              <h3 className="font-medium tracking-tight">
                {feature.title}
              </h3>

              <p className="mt-1.5 max-w-xl text-sm leading-6 text-muted-foreground">
                {feature.description}
              </p>
            </div>
          </div>
        </article>
      ))}
    </div>
  </section>

  <section className="relative z-10 mx-auto max-w-5xl px-5 py-16 sm:px-8 sm:py-20">
    <div className="relative overflow-hidden rounded-[2rem] border border-border/70 bg-background/45 px-6 py-14 text-center shadow-[0_24px_90px_-45px_rgba(0,0,0,0.9)] backdrop-blur-2xl sm:px-10 sm:py-20">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,oklch(0.72_0.18_278_/_0.11),transparent_48%)]" />

      <div className="relative">
        <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/[0.04] px-3 py-1.5 text-[11px] text-muted-foreground">
          <Sparkles className="size-3.5 text-primary" />
          Start your journey
        </div>

        <h2 className="mx-auto mt-5 max-w-2xl text-balance text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
          Your universe is waiting.
        </h2>

        <p className="mx-auto mt-4 max-w-md text-pretty text-sm leading-7 text-muted-foreground sm:text-base">
          Create an account, choose a planet, and meet your people
          today.
        </p>

        <Link
          href="/register"
          className={btn(
            'default',
            'group mt-8 h-12 px-7 shadow-[0_15px_40px_-18px_oklch(0.72_0.18_278_/_0.65)]',
          )}
        >
          <span className="flex items-center gap-2">
            Get started
            <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
          </span>
        </Link>
      </div>
    </div>
  </section>

  <footer className="relative z-10 mx-auto max-w-7xl px-5 py-10 sm:px-8">
    <div className="flex flex-col items-center justify-between gap-4 border-t border-border/60 pt-8 sm:flex-row">
      <Logo size={24} />

      <p className="text-xs text-muted-foreground">
        © {new Date().getFullYear()} Qllose. Find your universe.
      </p>

      <div className="flex gap-5 text-xs text-muted-foreground">
        <span className="transition-colors hover:text-foreground">
          Privacy
        </span>

        <span className="transition-colors hover:text-foreground">
          Terms
        </span>

        <span className="transition-colors hover:text-foreground">
          Contact
        </span>
      </div>
    </div>
  </footer>
</main>

)
}
