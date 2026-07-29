'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, User, Settings, LogOut } from 'lucide-react'
import { Logo } from '@/components/qllose/logo'
import { cn } from '@/lib/utils'

const items = [
  { href: '/planets', label: 'Home', icon: Home },
  { href: '/profile', label: 'Profile', icon: User },
  { href: '/settings', label: 'Settings', icon: Settings },
]

/**
 * Minimal far-left icon rail present across the authenticated app.
 */
export function AppNav() {
  const pathname = usePathname()

  return (
    <nav className="flex h-full w-16 flex-col items-center gap-2 border-r border-border bg-sidebar/60 py-4 backdrop-blur-xl">
      <Link href="/planets" className="mb-3" aria-label="Qllose home">
        <Logo showText={false} size={30} />
      </Link>

      {items.map((item) => {
        const active = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-label={item.label}
            title={item.label}
            className={cn(
              'flex size-11 items-center justify-center rounded-xl transition-colors',
              active
                ? 'bg-primary/20 text-primary'
                : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
            )}
          >
            <item.icon className="size-5" />
          </Link>
        )
      })}

      <Link
        href="/"
        aria-label="Logout"
        title="Logout"
        className="mt-auto flex size-11 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-destructive/15 hover:text-destructive"
      >
        <LogOut className="size-5" />
      </Link>
    </nav>
  )
}
