
'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'
import {
  ArrowLeft,
  Sparkles,
} from 'lucide-react'

import { Starfield } from '@/components/qllose/starfield'
import { Logo } from '@/components/qllose/logo'
import { PlanetOrb } from '@/components/qllose/planet-orb'

interface AuthShellProps {
  title: string
  subtitle: string
  children: ReactNode
}

/**
 * Shared authentication shell.
 *
 * UI-only layer:
 * - No authentication logic
 * - No Supabase logic
 * - Shared by Login and Register
 */

export function AuthShell({
  title,
  subtitle,
  children,
}: AuthShellProps) {
  return (
    <main
      className="
        relative
        flex
        min-h-dvh
        items-center
        justify-center
        overflow-hidden
        bg-background
        px-4
        py-8
        sm:px-6
        sm:py-12
      "
    >
      {/* =====================================================
          STARFIELD
      ===================================================== */}

      <Starfield density={70} />

      {/* =====================================================
          GLOBAL ATMOSPHERE
      ===================================================== */}

      <div
        className="
          pointer-events-none
          absolute inset-0
          overflow-hidden
        "
        aria-hidden
      >
        {/* center glow */}

        <div
          className="
            absolute
            left-1/2
            top-[10%]
            h-[520px]
            w-[820px]
            -translate-x-1/2
            rounded-full
            bg-primary/[0.045]
            blur-[130px]
          "
        />

        {/* creator atmosphere */}

        <div
          className="
            absolute
            -left-[100px]
            top-[8%]
            size-[360px]
            rounded-full
            opacity-[0.055]
            blur-[110px]
          "
          style={{
            background:
              'var(--creator)',
          }}
        />

        {/* gamer atmosphere */}

        <div
          className="
            absolute
            -right-[100px]
            bottom-[7%]
            size-[380px]
            rounded-full
            opacity-[0.05]
            blur-[115px]
          "
          style={{
            background:
              'var(--gamer)',
          }}
        />

        {/* subtle vignette */}

        <div
          className="
            absolute inset-0
            bg-[radial-gradient(
              circle_at_center,
              transparent_28%,
              oklch(0.03_0.02_265_/_0.36)_100%
            )]
          "
        />
      </div>

      {/* =====================================================
          BACKGROUND PLANETS
      ===================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          -left-[125px]
          top-[9%]
          opacity-35
          blur-[0.2px]
          sm:-left-[100px]
        "
      >
        <PlanetOrb
          accent="var(--creator)"
          accent2="var(--creator-2)"
          size={230}
          float
          ring
        />
      </div>

      <div
        className="
          pointer-events-none
          absolute
          -right-[95px]
          bottom-[8%]
          opacity-30
          sm:-right-[65px]
        "
      >
        <PlanetOrb
          accent="var(--gamer)"
          accent2="var(--gamer-2)"
          size={190}
          float
          ring
        />
      </div>

      {/* =====================================================
          MAIN CARD
      ===================================================== */}

      <section
        className="
          relative
          z-10
          w-full
          max-w-[430px]
          animate-rise
        "
      >
        {/* outer aura */}

        <div
          className="
            pointer-events-none
            absolute
            -inset-8
            rounded-[2.5rem]
            bg-primary/[0.035]
            blur-3xl
          "
        />

        <div
          className="
            relative
            overflow-hidden
            rounded-[2rem]
            border
            border-white/[0.07]
            bg-background/[0.58]
            p-5
            shadow-[0_28px_90px_-42px_rgba(0,0,0,0.95)]
            backdrop-blur-2xl
            sm:p-7
          "
        >
          {/* =================================================
              INNER LIGHT
          ================================================= */}

          <div
            className="
              pointer-events-none
              absolute
              inset-0
              opacity-[0.055]
              bg-[radial-gradient(
                circle_at_50%_0%,
                oklch(0.72_0.18_278_/_0.55),
                transparent_48%
              )]
            "
          />

          {/* top highlight */}

          <div
            className="
              pointer-events-none
              absolute
              left-10
              right-10
              top-0
              h-px
              bg-gradient-to-r
              from-transparent
              via-primary/30
              to-transparent
            "
          />

          {/* =================================================
              BACK TO HOME
          ================================================= */}

          <div className="relative mb-5 flex items-center justify-between">
            <Link
              href="/"
              className="
                group
                inline-flex
                items-center
                gap-1.5
                rounded-lg
                px-2
                py-1.5
                text-[10px]
                text-muted-foreground/65
                transition-all
                duration-200
                hover:bg-secondary/30
                hover:text-foreground
              "
            >
              <ArrowLeft className="size-3 transition-transform duration-200 group-hover:-translate-x-0.5" />

              <span>
                Back
              </span>
            </Link>

            <span
              className="
                inline-flex
                items-center
                gap-1.5
                rounded-full
                border
                border-primary/10
                bg-primary/[0.035]
                px-2.5
                py-1
                text-[9px]
                uppercase
                tracking-[0.14em]
                text-muted-foreground/55
              "
            >
              <Sparkles className="size-3 text-primary/70" />
              Qllose
            </span>
          </div>

          {/* =================================================
              LOGO
          ================================================= */}

          <Link
            href="/"
            className="
              group
              relative
              mx-auto
              mb-7
              flex
              w-fit
              items-center
              justify-center
            "
          >
            <span
              className="
                pointer-events-none
                absolute
                -inset-5
                rounded-full
                bg-primary/[0.055]
                blur-2xl
                opacity-70
                transition-opacity
                duration-500
                group-hover:opacity-100
              "
            />

            <div
              className="
                relative
                rounded-2xl
                border
                border-white/[0.06]
                bg-background/20
                px-3.5
                py-2
                shadow-[0_12px_35px_-25px_rgba(0,0,0,0.9)]
                backdrop-blur-xl
              "
            >
              <Logo size={34} />
            </div>
          </Link>

          {/* =================================================
              HEADING
          ================================================= */}

          <div className="relative text-center">
            <h1
              className="
                text-[1.8rem]
                font-semibold
                tracking-[-0.045em]
                sm:text-[2rem]
              "
            >
              {title}
            </h1>

            <p
              className="
                mx-auto
                mt-2
                max-w-sm
                text-sm
                leading-6
                text-muted-foreground/70
              "
            >
              {subtitle}
            </p>
          </div>

          {/* =================================================
              CONTENT
          ================================================= */}

          <div className="relative mt-7">
            {children}
          </div>

          {/* bottom micro glow */}

          <div
            className="
              pointer-events-none
              absolute
              bottom-0
              left-1/2
              h-px
              w-1/2
              -translate-x-1/2
              bg-gradient-to-r
              from-transparent
              via-primary/15
              to-transparent
            "
          />
        </div>
      </section>
    </main>
  )
}

