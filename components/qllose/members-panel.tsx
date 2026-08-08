
import { useMemo, useState } from 'react'
import type { Member } from '@/lib/qllose-data'
import { Avatar } from '@/components/qllose/avatar'
import Link from 'next/link'
import { Search, X } from 'lucide-react'

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
      const name = member.name?.toLowerCase() || ''
      const role = member.role?.toLowerCase() || ''

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
    <aside className="flex h-full min-h-0 flex-col bg-background">

      {/* Header */}
      <div className="shrink-0 border-b border-border px-4 py-4">

        <div className="flex items-center justify-between">

          <div>
            <p className="text-sm font-semibold">
              Members
            </p>

            <p className="text-xs text-muted-foreground">
              {online.length} online
            </p>
          </div>

          <span className="text-xs text-muted-foreground">
            {filteredMembers.length}
          </span>

        </div>

        {/* Search */}
        <div className="relative mt-3">

          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

          <input
            type="text"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search members..."
            className="
              h-9
              w-full
              rounded-lg
              border
              border-border
              bg-muted/30
              pl-9
              pr-9
              text-sm
              outline-none
              transition
              placeholder:text-muted-foreground
              focus:border-primary
              focus:ring-1
              focus:ring-primary
            "
          />

          {search.length > 0 && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="
                absolute
                right-2
                top-1/2
                flex
                size-6
                -translate-y-1/2
                items-center
                justify-center
                rounded-md
                text-muted-foreground
                transition
                hover:bg-muted
                hover:text-foreground
              "
              aria-label="Clear search"
            >
              <X className="size-3.5" />
            </button>
          )}

        </div>

      </div>

      {/* Members list */}
      <div className="min-h-0 flex-1 overflow-y-auto px-2 py-3">

        {filteredMembers.length === 0 ? (

          <div className="flex h-full min-h-32 flex-col items-center justify-center px-4 text-center">

            <Search className="mb-2 size-6 text-muted-foreground" />

            <p className="text-sm font-medium">
              No members found
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              Try a different name or role.
            </p>

          </div>

        ) : (

          <>
            {online.length > 0 && (
              <MemberGroup
                label={`Online — ${online.length}`}
                members={online}
              />
            )}

            {offline.length > 0 && (
              <MemberGroup
                label={`Offline — ${offline.length}`}
                members={offline}
              />
            )}
          </>

        )}

      </div>

      {/* Typing */}
      {typingUsers.length > 0 && (
        <div className="shrink-0 border-t border-border px-4 py-3">

          <div className="flex items-center gap-2 text-xs text-muted-foreground">

            <span className="flex gap-0.5">
              <Dot delay="0s" />
              <Dot delay="0.15s" />
              <Dot delay="0.3s" />
            </span>

            <span className="truncate">
              {typingUsers.join(', ')} typing
            </span>

          </div>

        </div>
      )}

    </aside>
  )
}

function MemberGroup({
  label,
  members,
}: {
  label: string
  members: Member[]
}) {
  return (
    <div className="mb-4">

      <p className="px-2 py-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>

      <ul className="flex flex-col gap-0.5">

        {members.map((member) => (
          <li key={member.user_id}>

            <Link
              href={`/profile/${member.user_id}`}
              className="
                flex
                items-center
                gap-3
                rounded-lg
                px-2
                py-2
                transition-colors
                hover:bg-muted/50
              "
            >

              {/* Avatar */}
              <div className="relative shrink-0">

                {member.avatar_url ? (

                  <img
                    src={member.avatar_url}
                    alt={member.name}
                    className="size-8 rounded-full object-cover"
                  />

                ) : (

                  <Avatar
                    initials={member.initials}
                    color={member.color}
                    size={32}
                    online={member.online}
                  />

                )}

                {member.online && (
                  <span
                    className="
                      absolute
                      bottom-0
                      right-0
                      size-2
                      rounded-full
                      bg-green-500
                      ring-2
                      ring-background
                    "
                  />
                )}

              </div>

              {/* Member info */}
              <div className="min-w-0 flex-1">

                <p className="truncate text-sm font-medium">
                  {member.name}
                </p>

                <p className="truncate text-xs text-muted-foreground">
                  {member.role}
                </p>

              </div>

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

