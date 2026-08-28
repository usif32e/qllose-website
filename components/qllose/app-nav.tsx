'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import {
  Home,
  User,
  Settings,
  LogOut,
  Bell,
} from 'lucide-react'

import { Logo } from '@/components/qllose/logo'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase'

const items = [
  { href: '/planets', label: 'Home', icon: Home },
  { href: '/profile', label: 'Profile', icon: User },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export function AppNav() {
  const pathname = usePathname()

  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    let mounted = true

    async function loadUnreadCount() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user || !mounted) {
        return
      }

      const { count, error } = await supabase
        .from('notifications')
        .select('id', {
          count: 'exact',
          head: true,
        })
        .eq('user_id', user.id)
        .eq('is_read', false)

      if (error) {
        console.log(
          'NOTIFICATION COUNT ERROR:',
          error,
        )
        return
      }

      if (mounted) {
        setUnreadCount(count ?? 0)
      }
    }

    loadUnreadCount()

    const channel = supabase
      .channel(`notifications-${Math.random()}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
        },
        () => {
          loadUnreadCount()
        },
      )
      .subscribe()

    return () => {
      mounted = false
      supabase.removeChannel(channel)
    }
  }, [])

  return (
    <nav className="flex h-full w-16 flex-col items-center gap-2 border-r border-border bg-sidebar/60 py-4 backdrop-blur-xl">
      <Link
        href="/planets"
        className="mb-3"
        aria-label="Qllose home"
      >
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

      {/* Notifications */}
      <Link
        href="/notifications"
        aria-label="Notifications"
        title="Notifications"
        className={cn(
          'relative flex size-11 items-center justify-center rounded-xl transition-colors',
          pathname === '/notifications'
            ? 'bg-primary/20 text-primary'
            : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
        )}
      >
        <Bell className="size-5" />

        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex min-w-4 h-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold leading-none text-primary-foreground ring-2 ring-background">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </Link>

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