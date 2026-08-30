
import { useMemo, useState } from 'react'
import type { Member } from '@/lib/qllose-data'
import { Avatar } from '@/components/qllose/avatar'
import Link from 'next/link'
import {
  Search,
  X,
  Users,
  Circle,
} from 'lucide-react'

interface MembersPanelProps {
  members: Member[]
  typingUsers: string[]
}

export function MembersPanel({
  members,
  typingUsers,
}: MembersPanelProps) {
  const [search, setSearch] = useState('')

  const filteredMembers = useMemo(() => {
    const query = search.trim().toLowerCase()

    if (!query) {
      return members
    }

    return members.filter((member) => {
      const name =
        member.name?.toLowerCase() || ''

      const role =
        member.role?.toLowerCase() || ''

      return (
        name.includes(query) ||
        role.includes(query)
      )
    })
  }, [members, search])

  const online = filteredMembers.filter(
    (member) => member.online
  )

  const offline = filteredMembers.filter(
    (member) => !member.online
  )

  return (
    <aside
      className="
        flex h-full min-h-0 w-[280px]
        flex-col
        border-l border-white/[0.06]
        bg-background/55
        backdrop-blur-2xl
      "
    >
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div
        className="
          relative shrink-0
          border-b border-white/[0.06]
          px-4 py-4
        "
      >
        {/* subtle header glow */}

        <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-[radial-gradient(circle_at_50%_0%,oklch(0.72_0.18_278_/_0.06),transparent_70%)]" />

        <div className="relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-xl border border-border/60 bg-secondary/25 text-muted-foreground">
                <Users className="size-4" />
              </div>

              <div>
                <p className="text-sm font-semibold tracking-tight">
                  Members
                </p>

                <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <span className="size-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.45)]" />

                  <span>
                    {online.length} online
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-full border border-border/60 bg-secondary/20 px-2.5 py-1 text-[10px] font-medium text-muted-foreground">
              {filteredMembers.length}
            </div>
          </div>

          {/* SEARCH */}

          <div className="relative mt-4">
            <Search
              className="
                pointer-events-none
                absolute left-3 top-1/2
                size-4
                -translate-y-1/2
                text-muted-foreground/70
              "
            />

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search members..."
              className="
                h-10
                w-full
                rounded-xl
                border border-border/60
                bg-secondary/[0.18]
                pl-9 pr-9
                text-sm
                text-foreground
                outline-none
                backdrop-blur-xl
                transition-all duration-200
                placeholder:text-muted-foreground/50
                focus:border-primary/35
                focus:bg-secondary/[0.24]
                focus:ring-2
                focus:ring-primary/10
              "
              aria-label="Search members"
            />

            {search.length > 0 && (
              <button
                type="button"
                onClick={() =>
                  setSearch('')
                }
                className="
                  absolute right-2 top-1/2
                  flex size-7
                  -translate-y-1/2
                  items-center justify-center
                  rounded-lg
                  text-muted-foreground
                  transition-all duration-200
                  hover:bg-secondary
                  hover:text-foreground
                  active:scale-95
                "
                aria-label="Clear search"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* =====================================================
          MEMBER LIST
      ===================================================== */}

      <div
        className="
          cosmic-scrollbar
          min-h-0
          flex-1
          overflow-y-auto
          px-2.5
          py-3
        "
      >
        {filteredMembers.length === 0 ? (
          <div className="flex h-full min-h-40 flex-col items-center justify-center px-5 text-center">
            <div className="mb-3 flex size-11 items-center justify-center rounded-2xl border border-border/60 bg-secondary/20 text-muted-foreground">
              <Search className="size-5" />
            </div>

            <p className="text-sm font-medium">
              No members found
            </p>

            <p className="mt-1.5 max-w-[210px] text-xs leading-5 text-muted-foreground">
              Try searching for another name or role.
            </p>
          </div>
        ) : (
          <>
            {online.length > 0 && (
              <MemberGroup
                label="Online"
                members={online}
                onlineGroup
              />
            )}

            {offline.length > 0 && (
              <MemberGroup
                label="Offline"
                members={offline}
              />
            )}
          </>
        )}
      </div>

      {/* =====================================================
          TYPING
      ===================================================== */}

      {typingUsers.length > 0 && (
        <div
          className="
            relative shrink-0
            border-t border-white/[0.06]
            bg-background/35
            px-4 py-3
            backdrop-blur-xl
          "
        >
          <div className="flex items-center gap-2.5">
            <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <span className="flex items-end gap-[3px]">
                <Dot delay="0s" />
                <Dot delay="0.15s" />
                <Dot delay="0.3s" />
              </span>
            </div>

            <div className="min-w-0">
              <p className="truncate text-[11px] text-muted-foreground">
                <span className="font-medium text-foreground/80">
                  {typingUsers.join(', ')}
                </span>{' '}
                typing…
              </p>
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}

function MemberGroup({
  label,
  members,
  onlineGroup = false,
}: {
  label: string
  members: Member[]
  onlineGroup?: boolean
}) {
  return (
    <div className="mb-5">
      <div className="mb-1.5 flex items-center justify-between px-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground/65">
          {label}
        </p>

        <span className="text-[10px] text-muted-foreground/45">
          {members.length}
        </span>
      </div>

      <ul className="flex flex-col gap-1">
        {members.map((member, index) => (
          <li
            key={member.user_id}
            className="animate-fade-up-soft"
            style={{
              animationDelay: `${Math.min(
                index * 35,
                220,
              )}ms`,
            }}
          >
            <Link
              href={`/profile/${member.user_id}`}
              className="
                group
                relative
                flex
                items-center
                gap-3
                overflow-hidden
                rounded-xl
                border border-transparent
                px-2.5 py-2
                transition-all
                duration-250
                hover:border-white/[0.05]
                hover:bg-secondary/[0.32]
              "
            >
              {/* hover glow */}

              {onlineGroup && (
                <span
                  className="
                    pointer-events-none
                    absolute
                    -left-8 -top-8
                    size-20
                    rounded-full
                    bg-emerald-400/[0.04]
                    blur-2xl
                    opacity-0
                    transition-opacity
                    duration-300
                    group-hover:opacity-100
                  "
                />
              )}

              {/* Avatar */}

              <div className="relative z-10 shrink-0">
                <div
                  className="
                    relative
                    rounded-full
                    transition-transform
                    duration-300
                    group-hover:scale-105
                  "
                >
                  {member.avatar_url ? (
                    <img
                      src={member.avatar_url}
                      alt={member.name}
                      className="
                        size-9
                        rounded-full
                        object-cover
                        ring-1
                        ring-white/[0.08]
                      "
                    />
                  ) : (
                    <Avatar
                      initials={
                        member.initials
                      }
                      color={
                        member.color
                      }
                      size={36}
                      online={
                        member.online
                      }
                    />
                  )}
                </div>

                {member.online && (
                  <span
                    className="
                      absolute
                      bottom-0
                      right-0
                      size-2.5
                      rounded-full
                      border-2
                      border-background
                      bg-emerald-400
                      shadow-[0_0_8px_rgba(52,211,153,0.5)]
                    "
                  />
                )}
              </div>

              {/* Member info */}

              <div className="relative z-10 min-w-0 flex-1">
                <p className="truncate text-sm font-medium tracking-tight">
                  {member.name}
                </p>

                <div className="mt-0.5 flex min-w-0 items-center gap-1.5">
                  <span className="truncate text-[10px] text-muted-foreground/65">
                    {member.role}
                  </span>

                  {member.role &&
                    member.role
                      .toLowerCase() ===
                      'founder' && (
                      <>
                        <span className="size-0.5 shrink-0 rounded-full bg-primary/60" />

                        <span className="shrink-0 text-[9px] font-medium text-primary/75">
                          Founder
                        </span>
                      </>
                    )}
                </div>
              </div>

              {/* Presence icon */}

              {member.online && (
                <Circle
                  className="
                    relative z-10
                    size-2
                    fill-emerald-400
                    text-emerald-400
                    opacity-45
                    transition-opacity
                    group-hover:opacity-100
                  "
                />
              )}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

function Dot({
  delay,
}: {
  delay: string
}) {
  return (
    <span
      className="size-1.5 animate-twinkle rounded-full bg-primary"
      style={{
        animationDelay: delay,
        animationDuration: '1s',
      }}
    />
  )
}

