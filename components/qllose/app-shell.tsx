'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  User,
  Settings,
  Bell,
} from 'lucide-react'

import { AppNav } from '@/components/qllose/app-nav'
import { Starfield } from '@/components/qllose/starfield'
import { cn } from '@/lib/utils'

/**
 * Authenticated page shell:
 * Desktop = fixed navigation rail
 * Mobile = bottom navigation
 *
 * UI-only change.
 * No backend or data logic is touched.
 */

const mobileItems = [
  {
    href: '/planets',
    label: 'Home',
    icon: Home,
  },
  {
    href: '/profile',
    label: 'Profile',
    icon: User,
  },
  {
    href: '/notifications',
    label: 'Alerts',
    icon: Bell,
  },
  {
    href: '/settings',
    label: 'Settings',
    icon: Settings,
  },
]

export function AppShell({
  children,
}: {
  children: ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="relative flex h-dvh overflow-hidden bg-background">
      {/* =====================================================
          BACKGROUND
      ===================================================== */}

      <Starfield density={60} />

      {/* =====================================================
          DESKTOP NAV
      ===================================================== */}

      <div className="relative z-30 hidden shrink-0 md:flex">
        <AppNav />
      </div>

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <div
        className="
          relative z-10
          min-w-0
          flex-1
          overflow-x-hidden
          overflow-y-auto
          pb-16
          md:pb-0
        "
      >
        {children}
      </div>

      {/* =====================================================
          MOBILE BOTTOM NAV
      ===================================================== */}

      <nav
        className="
          fixed
          inset-x-0
          bottom-0
          z-50
          flex
          h-16
          items-center
          justify-around
          border-t
          border-white/[0.06]
          bg-background/80
          px-2
          backdrop-blur-2xl
          shadow-[0_-16px_45px_oklch(0.02_0.015_265_/_0.30)]
          md:hidden
        "
        aria-label="Mobile navigation"
      >
        {/* top accent line */}

        <div
          className="
            pointer-events-none
            absolute
            inset-x-0
            -top-px
            h-px
            bg-gradient-to-r
            from-transparent
            via-primary/35
            to-transparent
          "
        />

        {mobileItems.map((item) => {
          const Icon = item.icon

          const active =
            pathname === item.href ||
            (
              item.href !== '/planets' &&
              pathname.startsWith(
                `${item.href}/`,
              )
            )

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              className={cn(
                `
                  group
                  relative
                  flex
                  min-w-0
                  flex-1
                  flex-col
                  items-center
                  justify-center
                  gap-0.5
                  rounded-2xl
                  py-1.5
                  transition-all
                  duration-300
                  active:scale-95
                `,
                active
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {/* Active glow */}

              {active && (
                <span
                  className="
                    pointer-events-none
                    absolute
                    left-1/2
                    top-1/2
                    size-12
                    -translate-x-1/2
                    -translate-y-1/2
                    rounded-full
                    bg-primary/[0.06]
                    blur-xl
                  "
                />
              )}

              {/* Icon */}

              <span
                className={cn(
                  `
                    relative
                    flex
                    size-9
                    items-center
                    justify-center
                    rounded-xl
                    transition-all
                    duration-300
                  `,
                  active
                    ? 'bg-primary/[0.10]'
                    : 'group-hover:bg-secondary/50',
                )}
              >
                <Icon
                  className={cn(
                    'size-[18px] transition-transform duration-300',
                    active
                      ? 'scale-105'
                      : 'group-hover:scale-105',
                  )}
                  strokeWidth={
                    active ? 2.2 : 1.8
                  }
                />
              </span>

              {/* Label */}

              <span
                className={cn(
                  `
                    relative
                    text-[9px]
                    font-medium
                    leading-none
                    transition-colors
                    duration-300
                  `,
                  active
                    ? 'text-primary'
                    : 'text-muted-foreground/65 group-hover:text-muted-foreground',
                )}
              >
                {item.label}
              </span>

              {/* Active indicator */}

              {active && (
                <span
                  className="
                    absolute
                    bottom-0.5
                    h-0.5
                    w-8
                    rounded-full
                    bg-primary
                    shadow-[0_0_10px_oklch(0.72_0.18_278_/_0.65)]
                  "
                />
              )}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

