import type { ReactNode } from 'react'
import { AppNav } from '@/components/qllose/app-nav'
import { Starfield } from '@/components/qllose/starfield'

/**
 * Authenticated page shell: fixed nav rail + scrollable space content.
 */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-dvh overflow-hidden">
      <Starfield density={60} />
      <AppNav />
      <div className="flex-1 overflow-y-auto">{children}</div>
    </div>
  )
}
