import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Starfield } from '@/components/qllose/starfield'
import { Logo } from '@/components/qllose/logo'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function WelcomePage() {
  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6 py-16 text-center">
      <Starfield density={110} />

      {/* Ambient cosmic light behind the whole scene */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[640px] w-[640px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
        style={{
          background:
            'radial-gradient(circle, oklch(0.65 0.16 290 / 0.22), oklch(0.6 0.15 265 / 0.1) 45%, transparent 70%)',
        }}
      />

      <div className="animate-rise flex flex-col items-center">
        {/* Centered brand logo with cosmic glow, proportions preserved */}
        <Logo showText={false} size={168} cinematic className="mb-2" />

        <h1 className="mt-10 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
          Welcome to Qllose
        </h1>

        <p className="mt-5 text-pretty text-lg font-medium text-gradient sm:text-xl">
          Connect. Create. Build your universe.
        </p>

        <p className="mt-5 max-w-lg text-pretty leading-relaxed text-muted-foreground">
          Discover communities, creators, gamers and businesses across different planets.
        </p>

        <Link
          href="/planets"
          className={cn(
            buttonVariants({ variant: 'default' }),
            'group mt-12 h-12 rounded-xl px-8 text-sm font-medium',
          )}
        >
          Explore The Universe
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </main>
  )
}
