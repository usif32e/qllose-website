'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Home, User, Settings, LogOut, Bell } from 'lucide-react'

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
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || !mounted) return

      const { count, error } = await supabase
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false)

      if (error) {
        console.log('NOTIFICATION COUNT ERROR:', error)
        return
      }
      if (mounted) setUnreadCount(count ?? 0)
    }

    loadUnreadCount()
    const channel = supabase
      .channel(`notifications-${Math.random()}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'notifications',
      }, loadUnreadCount)
      .subscribe()

    return () => {
      mounted = false
      supabase.removeChannel(channel)
    }
  }, [])

  const navClass = (active: boolean) => cn(
    'group/navitem relative flex size-11 items-center justify-center rounded-2xl border transition-all duration-300 ease-out',
    active
      ? 'border-primary/25 bg-primary/[0.13] text-primary shadow-[0_0_24px_-9px_var(--primary)]'
      : 'border-transparent text-muted-foreground/75 hover:border-white/[0.07] hover:bg-white/[0.045] hover:text-foreground',
  )

  return (
    <nav className="relative flex h-full w-[76px] shrink-0 flex-col items-center gap-2 overflow-visible border-r border-white/[0.07] bg-[linear-gradient(180deg,rgba(15,18,39,0.94),rgba(7,9,22,0.88))] py-4 shadow-[8px_0_35px_-28px_rgba(91,113,255,0.5)] backdrop-blur-2xl">
      <div className="pointer-events-none absolute inset-x-2 top-0 h-28 rounded-full bg-primary/[0.08] blur-3xl" />

      <Link href="/planets" className="group/logo relative mb-4 flex size-12 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.035] shadow-[0_8px_24px_-14px_rgba(106,126,255,0.8)] transition-all duration-300 hover:scale-[1.04] hover:border-primary/25 hover:bg-primary/[0.08]" aria-label="Qllose home">
        <span className="pointer-events-none absolute inset-0 rounded-2xl bg-primary/[0.07] opacity-0 blur-md transition-opacity duration-300 group-hover/logo:opacity-100" />
        <Logo showText={false} size={30} />
      </Link>

      <div className="relative flex w-full flex-col items-center gap-2 px-2">
        {items.map((item) => {
          const active = pathname === item.href || (item.href === '/planets' && pathname.startsWith('/planet/'))
          return (
            <Link key={item.href} href={item.href} aria-label={item.label} title={item.label} className={navClass(active)}>
              {active && <span className="absolute -left-[9px] h-6 w-[3px] rounded-r-full bg-primary shadow-[0_0_12px_var(--primary)]" />}
              <item.icon className={cn('size-[19px] transition-transform duration-300 group-hover/navitem:scale-110', active && 'drop-shadow-[0_0_7px_currentColor]')} strokeWidth={active ? 2.1 : 1.8} />
              <span className="pointer-events-none absolute left-[calc(100%+12px)] z-50 translate-x-1 whitespace-nowrap rounded-lg border border-white/10 bg-[#101329]/95 px-2.5 py-1.5 text-[11px] font-medium text-foreground opacity-0 shadow-xl backdrop-blur-xl transition-all duration-200 group-hover/navitem:translate-x-0 group-hover/navitem:opacity-100">{item.label}</span>
            </Link>
          )
        })}
      </div>

      <div className="my-2 h-px w-8 bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <Link href="/notifications" aria-label="Notifications" title="Notifications" className={navClass(pathname === '/notifications')}>
        {pathname === '/notifications' && <span className="absolute -left-[9px] h-6 w-[3px] rounded-r-full bg-primary shadow-[0_0_12px_var(--primary)]" />}
        <Bell className={cn('size-[19px] transition-transform duration-300 group-hover/navitem:scale-110', pathname === '/notifications' && 'drop-shadow-[0_0_7px_currentColor]')} strokeWidth={pathname === '/notifications' ? 2.1 : 1.8} />
        {unreadCount > 0 && <span className="absolute right-1 top-1 flex h-[17px] min-w-[17px] items-center justify-center rounded-full border border-[#11142a] bg-gradient-to-br from-fuchsia-400 to-primary px-1 text-[9px] font-bold leading-none text-white shadow-[0_0_12px_rgba(129,95,255,0.55)]">{unreadCount > 99 ? '99+' : unreadCount}</span>}
        <span className="pointer-events-none absolute left-[calc(100%+12px)] z-50 translate-x-1 whitespace-nowrap rounded-lg border border-white/10 bg-[#101329]/95 px-2.5 py-1.5 text-[11px] font-medium text-foreground opacity-0 shadow-xl backdrop-blur-xl transition-all duration-200 group-hover/navitem:translate-x-0 group-hover/navitem:opacity-100">Notifications</span>
      </Link>

      <div className="mt-auto flex w-full justify-center px-2">
        <Link href="/" aria-label="Logout" title="Logout" className="group/logout relative flex size-11 items-center justify-center rounded-2xl border border-transparent text-muted-foreground/65 transition-all duration-300 hover:border-rose-400/15 hover:bg-rose-400/[0.08] hover:text-rose-300">
          <LogOut className="size-[19px] transition-transform duration-300 group-hover/logout:-translate-x-0.5" strokeWidth={1.8} />
          <span className="pointer-events-none absolute left-[calc(100%+12px)] z-50 translate-x-1 whitespace-nowrap rounded-lg border border-white/10 bg-[#101329]/95 px-2.5 py-1.5 text-[11px] font-medium text-foreground opacity-0 shadow-xl backdrop-blur-xl transition-all duration-200 group-hover/logout:translate-x-0 group-hover/logout:opacity-100">Logout</span>
        </Link>
      </div>
    </nav>
  )
}
