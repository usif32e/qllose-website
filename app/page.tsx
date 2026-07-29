import Link from 'next/link'
import { Globe2, Sparkles, MessagesSquare, ShieldCheck, ArrowRight } from 'lucide-react'
import { Starfield } from '@/components/qllose/starfield'
import { Logo } from '@/components/qllose/logo'
import { PlanetOrb } from '@/components/qllose/planet-orb'
import { buttonVariants } from '@/components/ui/button'
import { planets } from '@/lib/qllose-data'
import { cn } from '@/lib/utils'

const features = [
  {
    icon: Globe2,
    title: 'Join planets, not noise',
    description: 'Pick a universe built around what you actually care about and dive straight in.',
  },
  {
    icon: MessagesSquare,
    title: 'Channels for everything',
    description: 'Every planet is organized into focused channels so conversations stay on topic.',
  },
  {
    icon: Sparkles,
    title: 'Designed to feel calm',
    description: 'A premium, minimal interface that gets out of the way and lets you connect.',
  },
  {
    icon: ShieldCheck,
    title: 'Your space, your rules',
    description: 'Clean moderation-ready structure so communities stay safe as they grow.',
  },
]

const btn = (variant: 'default' | 'outline' | 'ghost', extra?: string) =>
  cn(buttonVariants({ variant }), 'h-11 rounded-xl px-6 text-sm', extra)

export default function LandingPage() {
  return (
    <main className="relative min-h-dvh overflow-hidden">
      <Starfield />

      {/* Header */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Logo />
        <nav className="flex items-center gap-2">
          <Link href="/login" className={btn('ghost')}>
            Login
          </Link>
          <Link href="/register" className={btn('default')}>
            Create Account
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pt-16 pb-24 text-center">
        <div className="animate-rise mx-auto mb-8 flex w-fit items-center gap-2 rounded-full border border-border glass px-4 py-1.5 text-xs text-muted-foreground">
          <Sparkles className="size-3.5 text-primary" />
          Welcome to your corner of the universe
        </div>

        <h1 className="animate-rise text-balance text-5xl font-semibold leading-[1.05] tracking-tight sm:text-7xl">
          Find Your <span className="text-gradient">Universe.</span>
        </h1>

        <p className="animate-rise mx-auto mt-6 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
          Qllose lets you join entire planets built around your interests. Enter a
          channel and start talking with your people in seconds.
        </p>

        <div className="animate-rise mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/register" className={btn('default', 'group')}>
            Create Account
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link href="/login" className={btn('outline')}>
            Login
          </Link>
        </div>

        {/* Floating planets */}
        <div className="relative mt-20 flex items-end justify-center gap-6 sm:gap-16">
          <PlanetOrb accent="var(--gamer)" accent2="var(--gamer-2)" size={110} className="mb-8 hidden sm:block" />
          <PlanetOrb accent="var(--creator)" accent2="var(--creator-2)" size={200} />
          <PlanetOrb accent="var(--business)" accent2="var(--business-2)" size={130} className="mb-4 hidden sm:block" />
        </div>
      </section>

      {/* Planets preview */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="text-center text-2xl font-semibold tracking-tight sm:text-3xl">
          Three universes. Endless conversations.
        </h2>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {planets.map((planet) => (
            <div
              key={planet.id}
              className="glass rounded-3xl p-6 transition-transform duration-300 hover:-translate-y-1"
            >
              <PlanetOrb accent={planet.accent} accent2={planet.accent2} size={72} float={false} ring={false} />
              <h3 className="mt-5 text-lg font-semibold">{planet.name}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{planet.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-4 sm:grid-cols-2">
          {features.map((feature) => (
            <div key={feature.title} className="glass flex gap-4 rounded-2xl p-6">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <feature.icon className="size-5" />
              </span>
              <div>
                <h3 className="font-medium">{feature.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-3xl px-6 py-16 text-center">
        <div className="glass-strong rounded-3xl px-8 py-14">
          <h2 className="text-balance text-3xl font-semibold tracking-tight">Your universe is waiting.</h2>
          <p className="mx-auto mt-3 max-w-md text-pretty text-muted-foreground">
            Create an account, choose a planet and meet your people today.
          </p>
          <Link href="/register" className={btn('default', 'mt-7 group')}>
            Get started
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
          <Logo size={24} />
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Qllose. Find your universe.
          </p>
          <div className="flex gap-5 text-xs text-muted-foreground">
            <span className="transition-colors hover:text-foreground">Privacy</span>
            <span className="transition-colors hover:text-foreground">Terms</span>
            <span className="transition-colors hover:text-foreground">Contact</span>
          </div>
        </div>
      </footer>
    </main>
  )
}
