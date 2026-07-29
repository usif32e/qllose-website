import Link from 'next/link'
import type { ReactNode } from 'react'
import { Starfield } from '@/components/qllose/starfield'
import { Logo } from '@/components/qllose/logo'
import { PlanetOrb } from '@/components/qllose/planet-orb'

interface AuthShellProps {
  title: string
  subtitle: string
  children: ReactNode
}

/**
 * Shared layout for authentication screens: centered glass card over space.
 */
export function AuthShell({ title, subtitle, children }: AuthShellProps) {
  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6 py-12">
      <Starfield density={70} />

      <div className="absolute -left-24 top-24 opacity-40">
        <PlanetOrb accent="var(--creator)" accent2="var(--creator-2)" size={220} />
      </div>
      <div className="absolute -right-20 bottom-16 opacity-40">
        <PlanetOrb accent="var(--gamer)" accent2="var(--gamer-2)" size={180} />
      </div>

      <div className="animate-rise glass-strong relative z-10 w-full max-w-md rounded-3xl p-8 shadow-2xl">
        <Link href="/" className="mb-8 flex justify-center">
          <Logo size={34} />
        </Link>
        <h1 className="text-center text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-2 text-center text-sm text-muted-foreground">{subtitle}</p>
        <div className="mt-8">{children}</div>
      </div>
    </main>
  )
}
