
'use client'

import { useState } from 'react'
import {
  Search,
  Hash,
  Globe,
  Users,
  Sparkles,
  Check,
  ArrowRight,
} from 'lucide-react'

import type { Planet } from '@/lib/qllose-data'
import { cn } from '@/lib/utils'

interface PlanetSidebarProps {
  planet: Planet
  activeChannel: string
  onSelectChannel: (channel: string) => void
  isMember: boolean
  onJoin: () => void
}

export function PlanetSidebar({
  planet,
  activeChannel,
  onSelectChannel,
  isMember,
  onJoin,
}: PlanetSidebarProps) {
  const [query, setQuery] = useState('')

  const filtered = planet.channels.filter((channel) =>
    channel.toLowerCase().includes(query.toLowerCase()),
  )

  return (
    <aside
      className="
        relative flex h-full w-[248px] flex-col
        overflow-hidden border-r border-white/[0.055]
        bg-sidebar/45 backdrop-blur-2xl
      "
    >
      {/* ATMOSPHERE */}

      <div
        className="pointer-events-none absolute -top-20 left-1/2 size-48 -translate-x-1/2 rounded-full opacity-10 blur-[70px]"
        style={{ background: planet.accent }}
      />

      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          background: `radial-gradient(circle at 50% 0%, ${planet.accent}, transparent 48%)`,
        }}
      />

      {/* PLANET IDENTITY */}

      <div className="relative shrink-0 px-3.5 pb-3 pt-4">
        <div className="relative overflow-hidden rounded-2xl border border-white/[0.055] bg-background/25 px-3.5 py-3 shadow-[0_14px_40px_-28px_rgba(0,0,0,0.9)]">

          <div
            className="pointer-events-none absolute -right-8 -top-8 size-24 rounded-full opacity-[0.11] blur-2xl"
            style={{ background: planet.accent }}
          />

          <div className="relative flex items-center gap-3">

            {/* ANIMATED COSMIC PLANET */}

            <div
              className="relative flex size-11 shrink-0 items-center justify-center"
              role="img"
              aria-label={`${planet.name} animated planet`}
            >
              {/* Outer atmospheric glow */}

              <div
                className="absolute inset-0 rounded-full opacity-40 blur-md animate-pulse"
                style={{ background: planet.accent }}
              />

              {/* Rotating moon orbit */}

              <div
                className="absolute inset-0 animate-spin"
                style={{ animationDuration: '8s' }}
              >
                <span
                  className="absolute left-1/2 top-0 size-1.5 -translate-x-1/2 rounded-full"
                  style={{
                    background: '#E4D9FF',
                    boxShadow: `0 0 8px ${planet.accent}`,
                  }}
                />
              </div>

              {/* Planet sphere */}

              <div
                className="relative size-[30px] overflow-hidden rounded-full"
                style={{
                  background: `
                    radial-gradient(
                      circle at 30% 24%,
                      rgba(255,255,255,0.95) 0%,
                      ${planet.accent} 16%,
                      ${planet.accent2} 54%,
                      #101027 100%
                    )
                  `,
                  boxShadow: `
                    inset -5px -4px 9px rgba(0,0,0,0.55),
                    inset 3px 2px 5px rgba(255,255,255,0.3),
                    0 0 12px ${planet.accent}55
                  `,
                }}
              >
                {/* Moving planetary surface */}

                <div
                  className="absolute -inset-2 animate-spin rounded-full"
                  style={{
                    animationDuration: '14s',
                    background: `
                      repeating-linear-gradient(
                        165deg,
                        transparent 0px,
                        transparent 5px,
                        rgba(255,255,255,0.17) 6px,
                        transparent 9px
                      )
                    `,
                  }}
                />

                {/* Highlight */}

                <div className="absolute left-[5px] top-[4px] size-2 rounded-full bg-white/35 blur-[3px]" />

                {/* Night-side shadow */}

                <div className="absolute -right-1 top-0 h-full w-1/2 rounded-full bg-black/20 blur-[3px]" />
              </div>

              {/* Orbital ring */}

              <div
                className="pointer-events-none absolute left-1/2 top-1/2 h-[17px] w-[43px] -translate-x-1/2 -translate-y-1/2 rotate-[-24deg] rounded-[50%] border border-white/45"
                style={{
                  boxShadow: `0 0 6px ${planet.accent}45`,
                }}
              />

              {/* Second orbit */}

              <div
                className="pointer-events-none absolute left-1/2 top-1/2 h-[13px] w-[39px] -translate-x-1/2 -translate-y-1/2 rotate-[35deg] rounded-[50%] border border-white/15"
              />

              {/* Tiny companion moon */}

              <div
                className="absolute inset-0 animate-spin"
                style={{ animationDuration: '5s' }}
              >
                <span
                  className="absolute -right-0.5 top-[17px] size-[5px] rounded-full"
                  style={{
                    background: '#A8B9FF',
                    boxShadow: '0 0 7px #8B9DFF',
                  }}
                />
              </div>
            </div>

            {/* PLANET NAME */}

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <p className="truncate text-[13px] font-semibold tracking-tight">
                  {planet.name}
                </p>

                <Sparkles
                  className="size-3 shrink-0 animate-pulse"
                  style={{ color: planet.accent }}
                />
              </div>

              <div className="mt-1 flex items-center gap-1.5 text-[10px] text-muted-foreground/70">
                <Users className="size-3" />
                <span>{planet.members.toLocaleString()} members</span>
              </div>
            </div>
          </div>

          {/* ACCENT LINE */}

          <div className="relative mt-3 flex items-center gap-2">
            <div className="h-px flex-1 bg-white/[0.055]" />

            <span
              className="h-px w-8 opacity-60"
              style={{
                background: `linear-gradient(90deg, ${planet.accent}, transparent)`,
              }}
            />
          </div>
        </div>

        {/* JOIN / MEMBER STATE */}

        {!isMember ? (
          <button
            type="button"
            onClick={onJoin}
            className="
              group relative mt-2.5 flex h-10 w-full
              items-center justify-center gap-2 overflow-hidden
              rounded-xl border border-white/[0.07]
              bg-background/25 px-3 text-xs font-semibold
              text-foreground transition-all duration-300
              hover:border-white/[0.12] hover:bg-background/40
              active:scale-[0.985]
            "
          >
            <span
              className="pointer-events-none absolute inset-y-0 -left-[70%] w-1/2 skew-x-[-18deg] bg-white/10 opacity-0 transition-all duration-700 group-hover:left-[120%] group-hover:opacity-100"
            />

            <span
              className="size-1.5 rounded-full"
              style={{
                background: planet.accent,
                boxShadow: `0 0 8px ${planet.accent}`,
              }}
            />

            <span>Join Planet</span>

            <ArrowRight className="size-3.5 text-muted-foreground transition-transform duration-300 group-hover:translate-x-1" />
          </button>
        ) : (
          <div className="mt-2.5 flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-primary/10 bg-primary/[0.045] text-[11px] font-medium text-primary/90">
            <span className="flex size-5 items-center justify-center rounded-full bg-primary/10">
              <Check className="size-3" />
            </span>
            <span>You are a member</span>
          </div>
        )}
      </div>

      {/* CHANNEL SEARCH */}

      <div className="relative shrink-0 px-3 pb-2.5">
        <div className="group/search relative flex h-9 items-center gap-2 rounded-xl border border-white/[0.055] bg-background/20 px-3 transition-all duration-200 focus-within:border-primary/20 focus-within:bg-background/30">
          <Search className="size-3.5 shrink-0 text-muted-foreground/55 transition-colors group-focus-within/search:text-primary/70" />

          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search channels"
            className="min-w-0 flex-1 bg-transparent text-xs outline-none placeholder:text-muted-foreground/35"
            aria-label="Search channels"
          />

          {query.length > 0 && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="flex size-5 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground"
              aria-label="Clear channel search"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* CHANNEL LIST */}

      <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-3 [scrollbar-width:thin]">
        <div className="mb-1.5 flex items-center justify-between px-2">
          <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/45">
            Channels
          </p>

          <span className="text-[9px] text-muted-foreground/35">
            {filtered.length}
          </span>
        </div>

        <ul className="flex flex-col gap-0.5">
          {filtered.map((channel) => {
            const active = channel === activeChannel
            const Icon = channel === 'Global' ? Globe : Hash

            return (
              <li key={channel}>
                <button
                  type="button"
                  onClick={() => onSelectChannel(channel)}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'group/channel relative flex w-full items-center gap-2.5 rounded-xl px-2 py-2 text-left transition-all duration-300 active:scale-[0.99]',
                    active
                      ? 'bg-background/35 text-foreground'
                      : 'text-muted-foreground/75 hover:bg-background/20 hover:text-foreground',
                  )}
                >
                  {/* ACTIVE RAIL */}

                  <span
                    className={cn(
                      'absolute left-0 top-1/2 w-px -translate-y-1/2 rounded-full transition-all duration-300',
                      active ? 'h-5 opacity-100' : 'h-0 opacity-0',
                    )}
                    style={{
                      background: planet.accent,
                      boxShadow: `0 0 10px ${planet.accent}`,
                    }}
                  />

                  {/* CHANNEL ICON */}

                  <span
                    className={cn(
                      'flex size-7 shrink-0 items-center justify-center rounded-lg transition-all duration-300 group-hover/channel:scale-105',
                      active
                        ? 'bg-primary/10 text-primary'
                        : 'bg-white/[0.025] text-muted-foreground/55 group-hover/channel:bg-white/[0.045] group-hover/channel:text-muted-foreground',
                    )}
                    style={
                      active
                        ? {
                            boxShadow: `0 0 14px ${planet.accent}12`,
                          }
                        : undefined
                    }
                  >
                    <Icon className={cn('size-3.5', active && 'animate-pulse')} />
                  </span>

                  {/* CHANNEL NAME */}

                  <span
                    className={cn(
                      'min-w-0 flex-1 truncate text-xs',
                      active ? 'font-medium' : 'font-normal',
                    )}
                  >
                    {channel}
                  </span>

                  {/* ACTIVE DOT */}

                  <span
                    className={cn(
                      'size-1 shrink-0 rounded-full transition-all duration-300',
                      active
                        ? 'scale-100 opacity-100'
                        : 'scale-0 opacity-0',
                    )}
                    style={{
                      background: planet.accent,
                      boxShadow: `0 0 8px ${planet.accent}`,
                    }}
                  />
                </button>
              </li>
            )
          })}

          {filtered.length === 0 && (
            <li className="px-2 py-7 text-center">
              <div className="mx-auto flex size-9 items-center justify-center rounded-xl border border-white/[0.05] bg-background/20 text-muted-foreground/60">
                <Search className="size-4" />
              </div>

              <p className="mt-2 text-xs font-medium text-foreground/80">
                No channels found
              </p>

              <p className="mt-1 text-[10px] text-muted-foreground/45">
                Try another search.
              </p>
            </li>
          )}
        </ul>
      </div>

      {/* PLANET STATUS */}

      <div className="shrink-0 border-t border-white/[0.05] px-3.5 py-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[9px] uppercase tracking-[0.16em] text-muted-foreground/35">
            Qllose Planet
          </span>

          <span className="flex items-center gap-1.5 text-[9px] text-muted-foreground/45">
            <span
              className="size-1.5 animate-pulse rounded-full"
              style={{
                background: planet.accent,
                boxShadow: `0 0 7px ${planet.accent}`,
              }}
            />
            Active
          </span>
        </div>
      </div>
    </aside>
  )
}
