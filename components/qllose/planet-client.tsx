'use client'

import { useState, useEffect, useRef } from 'react'
import type { Planet, Message, Member } from '@/lib/qllose-data'

import { supabase } from '@/lib/supabase'

import { AppNav } from '@/components/qllose/app-nav'
import { PlanetSidebar } from '@/components/qllose/planet-sidebar'
import { ChatView } from '@/components/qllose/chat-view'
import { MembersPanel } from '@/components/qllose/members-panel'

interface PlanetClientProps {
  planet: Planet
}

type MobileView = 'chat' | 'channels' | 'members'

export function PlanetClient({
  planet,
}: PlanetClientProps) {
  const [activeChannel, setActiveChannel] =
    useState('Global')

  const [profile, setProfile] =
    useState<{
      id: string
      username: string
      nickname: string
      avatar_url: string | null
    } | null>(null)

  const [planetMembers, setPlanetMembers] =
    useState<Member[]>([])

  const [memberCount, setMemberCount] =
    useState(0)

  const [threads, setThreads] =
    useState<Record<string, Message[]>>({
      Global: [],
    })

  const [typingUsers, setTypingUsers] =
    useState<string[]>([])

  const [mobileView, setMobileView] =
    useState<MobileView>('chat')

  const onlineIdsRef =
    useRef<Set<string>>(new Set())

  // =====================================================
  // PROFILE
  // =====================================================

  async function loadProfile() {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const { data, error } =
      await supabase
        .from('profiles')
        .select(
          'id,username,nickname,avatar_url'
        )
        .eq('id', user.id)
        .single()

    if (error) {
      console.log(
        'PROFILE ERROR:',
        error
      )
      return
    }

    setProfile(data)
  }

  // =====================================================
  // MEMBERS
  // =====================================================

  async function loadMembers() {
    /*
     * IMPORTANT:
     * We intentionally do NOT use:
     *
     * profiles(...)
     *
     * inside the planet_members query.
     *
     * We first get the member IDs, then get their
     * profiles separately. This avoids relationship/RLS
     * issues with Supabase nested selects.
     */

    const {
      data: memberRows,
      error: membersError,
    } = await supabase
      .from('planet_members')
      .select('user_id,role')
      .eq(
        'planet_id',
        planet.id
      )

    if (membersError) {
      console.log(
        'MEMBERS ERROR:',
        membersError
      )

      setPlanetMembers([])
      setMemberCount(0)

      return
    }

    if (!memberRows || memberRows.length === 0) {
      setPlanetMembers([])
      setMemberCount(0)

      console.log(
        'NO MEMBERS FOUND FOR PLANET:',
        planet.id
      )

      return
    }

    const userIds = [
      ...new Set(
        memberRows.map(
          (member: any) =>
            member.user_id
        )
      ),
    ]

    const {
      data: profileRows,
      error: profilesError,
    } = await supabase
      .from('profiles')
      .select(
        'id,username,nickname,avatar_url'
      )
      .in(
        'id',
        userIds
      )

    if (profilesError) {
      console.log(
        'MEMBER PROFILES ERROR:',
        profilesError
      )
    }

    const profiles =
      profileRows || []

    const formatted: Member[] =
      memberRows.map(
        (member: any) => {
          const memberProfile =
            profiles.find(
              (p: any) =>
                p.id ===
                member.user_id
            )

          return {
            user_id:
              member.user_id,

            name:
              memberProfile?.nickname ||
              memberProfile?.username ||
              'User',

            initials:
              (
                memberProfile?.username ||
                memberProfile?.nickname ||
                'U'
              )
                .slice(0, 2)
                .toUpperCase(),

            color:
              'var(--primary)',

            role:
              member.role ||
              'Member',

            online:
              onlineIdsRef.current.has(
                member.user_id
              ),

            avatar_url:
              memberProfile?.avatar_url ||
              null,
          }
        }
      )

    setPlanetMembers(
      formatted
    )

    setMemberCount(
      formatted.length
    )
  }

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    async function init() {
      await loadProfile()
      await loadMembers()
    }

    init()
  }, [planet.id])

  // =====================================================
  // REALTIME PRESENCE
  // =====================================================

  useEffect(() => {
    if (
      !planet?.id ||
      !profile?.id
    ) {
      return
    }

    const presenceChannel =
      supabase.channel(
        `planet-presence-${planet.id}`,
        {
          config: {
            presence: {
              key: profile.id,
            },
          },
        }
      )

    const updateOnlineStatus =
      () => {
        const state =
          presenceChannel.presenceState()

        const onlineIds =
          new Set<string>()

        Object.entries(
          state
        ).forEach(
          ([key, presences]) => {
            onlineIds.add(key)

            ;(
              presences as any[]
            ).forEach(
              (
                presence
              ) => {
                if (
                  presence?.user_id
                ) {
                  onlineIds.add(
                    presence.user_id
                  )
                }
              }
            )
          }
        )

        onlineIdsRef.current =
          onlineIds

        setPlanetMembers(
          prev =>
            prev.map(
              member => ({
                ...member,

                online:
                  onlineIds.has(
                    member.user_id
                  ),
              })
            )
        )
      }

    presenceChannel
      .on(
        'presence',
        {
          event: 'sync',
        },
        updateOnlineStatus
      )
      .on(
        'presence',
        {
          event: 'join',
        },
        updateOnlineStatus
      )
      .on(
        'presence',
        {
          event: 'leave',
        },
        updateOnlineStatus
      )
      .subscribe(
        async status => {
          if (
            status ===
            'SUBSCRIBED'
          ) {
            await presenceChannel.track(
              {
                user_id:
                  profile.id,
              }
            )

            onlineIdsRef.current.add(
              profile.id
            )

            setPlanetMembers(
              prev =>
                prev.map(
                  member => ({
                    ...member,

                    online:
                      member.user_id ===
                      profile.id
                        ? true
                        : onlineIdsRef.current.has(
                            member.user_id
                          ),
                  })
                )
            )

            setTimeout(
              () => {
                updateOnlineStatus()
              },
              500
            )
          }
        }
      )

    return () => {
      supabase.removeChannel(
        presenceChannel
      )
    }
  }, [
    planet?.id,
    profile?.id,
  ])

  // =====================================================
  // JOIN PLANET
  // =====================================================

  async function joinPlanet() {
    const {
      data: { user },
    } =
      await supabase.auth.getUser()

    if (!user) return

    const { error } =
      await supabase.rpc(
        'join_planet',
        {
          p_planet_id:
            planet.id,
        }
      )

    if (error) {
      console.log(
        'JOIN ERROR:',
        error
      )

      return
    }

    await loadMembers()
  }

  // =====================================================
  // MESSAGES
  // =====================================================

  useEffect(() => {
    async function loadMessages() {
      const {
        data,
        error,
      } =
        await supabase
          .from('messages')
          .select('*')
          .eq(
            'planet_id',
            planet.id
          )
          .eq(
            'channel',
            activeChannel
          )
          .order(
            'created_at',
            {
              ascending: true,
            }
          )

      if (error) {
        console.log(
          'MESSAGES ERROR:',
          error
        )

        return
      }

      const ids = [
        ...new Set(
          (data || []).map(
            (m: any) =>
              m.user_id
          )
        ),
      ]

      let profiles: any[] = []

      if (ids.length > 0) {
        const {
          data: profileData,
        } =
          await supabase
            .from('profiles')
            .select(
              'id,username,nickname,avatar_url'
            )
            .in(
              'id',
              ids
            )

        profiles =
          profileData || []
      }

      const formatted: Message[] =
        (data || []).map(
          (m: any) => {
            const p =
              profiles.find(
                x =>
                  x.id ===
                  m.user_id
              )

            return {
              id: m.id,

              user_id:
                m.user_id,

              author:
                p?.nickname ||
                p?.username ||
                'User',

              initials:
                (
                  p?.username ||
                  'U'
                )
                  .slice(0, 2)
                  .toUpperCase(),

              color:
                'var(--primary)',

              avatar_url:
                p?.avatar_url ||
                null,

              time:
                new Date(
                  m.created_at
                ).toLocaleTimeString(
                  [],
                  {
                    hour:
                      '2-digit',
                    minute:
                      '2-digit',
                  }
                ),

              text:
                m.content,
            }
          }
        )

      setThreads(
        prev => ({
          ...prev,

          [activeChannel]:
            formatted,
        })
      )
    }

    loadMessages()

    const channel =
      supabase
        .channel(
          `messages-${planet.id}-${activeChannel}`
        )
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter:
              `planet_id=eq.${planet.id}`,
          },
          () => {
            loadMessages()
          }
        )
        .subscribe()

    return () => {
      supabase.removeChannel(
        channel
      )
    }
  }, [
    planet.id,
    activeChannel,
  ])

  // =====================================================
  // TYPING
  // =====================================================

  useEffect(() => {
    const channel =
      supabase
        .channel(
          `typing-${planet.id}-${activeChannel}`
        )
        .on(
          'broadcast',
          {
            event: 'typing',
          },
          ({ payload }) => {
            setTypingUsers(
              prev => {
                if (
                  prev.includes(
                    payload.username
                  )
                ) {
                  return prev
                }

                return [
                  ...prev,
                  payload.username,
                ]
              }
            )

            setTimeout(
              () => {
                setTypingUsers(
                  prev =>
                    prev.filter(
                      x =>
                        x !==
                        payload.username
                    )
                )
              },
              2000
            )
          }
        )
        .subscribe()

    return () => {
      supabase.removeChannel(
        channel
      )
    }
  }, [
    planet.id,
    activeChannel,
  ])

  function handleTyping() {
    if (!profile) return

    supabase
      .channel(
        `typing-${planet.id}-${activeChannel}`
      )
      .send({
        type: 'broadcast',

        event: 'typing',

        payload: {
          username:
            profile.nickname ||
            profile.username,
        },
      })
  }

  // =====================================================
  // SEND MESSAGE
  // =====================================================

  async function handleSend(
    text: string
  ) {
    const {
      data: { user },
    } =
      await supabase.auth.getUser()

    if (!user) return

    const { error } =
      await supabase
        .from('messages')
        .insert({
          user_id:
            user.id,

          planet_id:
            planet.id,

          channel:
            activeChannel,

          content:
            text,
        })

    if (error) {
      console.log(
        'SEND ERROR:',
        error
      )
    }
  }

  // =====================================================
  // DELETE MESSAGE
  // =====================================================

  async function handleDeleteMessage(
    id: string
  ) {
    console.log(
      'DELETE CLICKED:',
      id
    )

    const {
      data: { user },
    } =
      await supabase.auth.getUser()

    console.log(
      'CURRENT USER:',
      user?.id
    )

    if (!user) return

    const {
      data,
      error,
    } =
      await supabase
        .from('messages')
        .delete()
        .eq(
          'id',
          id
        )
        .eq(
          'user_id',
          user.id
        )
        .select()

    console.log(
      'DELETE DATA:',
      data
    )

    console.log(
      'DELETE ERROR:',
      error
    )

    if (error) {
      alert(
        "You can't delete this message"
      )

      return
    }

    if (
      !data ||
      data.length === 0
    ) {
      alert(
        'Delete blocked by permission'
      )

      return
    }

    setThreads(
      prev => ({
        ...prev,

        [activeChannel]:
          (
            prev[
              activeChannel
            ] ?? []
          ).filter(
            m =>
              m.id !== id
          ),
      })
    )
  }

  // =====================================================
  // SHARED SIDEBAR PROPS
  // =====================================================

  const sidebarProps = {
    planet: {
      ...planet,
      members:
        memberCount,
    },

    activeChannel,

    onSelectChannel:
      (channel: string) => {
        setActiveChannel(
          channel
        )

        setMobileView(
          'chat'
        )
      },

    isMember:
      planetMembers.some(
        m =>
          m.user_id ===
          profile?.id
      ),

    onJoin:
      joinPlanet,
  }

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <main className="flex h-dvh overflow-hidden">

      {/* ================================================= */}
      {/* DESKTOP — ORIGINAL LAYOUT, UNTOUCHED */}
      {/* ================================================= */}

      <div className="hidden md:flex md:flex-1 md:min-w-0">

        <AppNav />

        <PlanetSidebar
          planet={{
            ...planet,
            members:
              memberCount,
          }}
          activeChannel={
            activeChannel
          }
          onSelectChannel={
            setActiveChannel
          }
          isMember={
            planetMembers.some(
              m =>
                m.user_id ===
                profile?.id
            )
          }
          onJoin={
            joinPlanet
          }
        />

        <ChatView
          channel={
            activeChannel
          }
          planetName={
            planet.name
          }
          messages={
            threads[
              activeChannel
            ] ?? []
          }
          typingUsers={
            typingUsers
          }
          onSend={
            handleSend
          }
          onTyping={
            handleTyping
          }
          onDeleteMessage={
            handleDeleteMessage
          }
          currentUserId={
            profile?.id
          }
          onToggleSidebar={
            () => {}
          }
        />

        <MembersPanel
          members={
            planetMembers
          }
          typingUsers={
            typingUsers
          }
        />

      </div>

      {/* ================================================= */}
      {/* MOBILE — ONLY MOBILE */}
      {/* ================================================= */}

      <div className="flex min-w-0 flex-1 flex-col md:hidden">

        <div className="min-h-0 flex-1">

          {/* CHAT */}

          {mobileView ===
            'chat' && (
            <div className="flex h-full min-h-0 flex-col">

              <ChatView
                channel={
                  activeChannel
                }
                planetName={
                  planet.name
                }
                messages={
                  threads[
                    activeChannel
                  ] ?? []
                }
                typingUsers={
                  typingUsers
                }
                onSend={
                  handleSend
                }
                onTyping={
                  handleTyping
                }
                onDeleteMessage={
                  handleDeleteMessage
                }
                currentUserId={
                  profile?.id
                }
                onToggleSidebar={() =>
                  setMobileView(
                    'channels'
                  )
                }
              />

            </div>
          )}

          {/* CHANNELS */}

          {mobileView ===
            'channels' && (
            <div className="flex h-full min-h-0 flex-col">

              <PlanetSidebar
                {...sidebarProps}
              />

            </div>
          )}

          {/* MEMBERS */}

          {mobileView ===
            'members' && (
            <div className="flex h-full min-h-0 flex-col">

              <MembersPanel
                members={
                  planetMembers
                }
                typingUsers={
                  typingUsers
                }
              />

            </div>
          )}

        </div>

        {/* MOBILE BOTTOM BAR */}

        <nav
          className="
            flex
            h-16
            shrink-0
            items-center
            justify-around
            border-t
            border-border
            bg-background/95
            px-2
            backdrop-blur-xl
          "
          aria-label="Planet navigation"
        >

          {/* CHANNELS */}

          <button
            type="button"
            onClick={() =>
              setMobileView(
                'channels'
              )
            }
            className={`
              flex
              min-w-20
              flex-col
              items-center
              justify-center
              gap-1
              rounded-xl
              px-3
              py-2
              text-xs
              transition-colors
              ${
                mobileView ===
                'channels'
                  ? 'bg-primary/15 text-primary'
                  : 'text-muted-foreground'
              }
            `}
          >
            <span className="text-base">
              #
            </span>

            <span>
              Channels
            </span>
          </button>

          {/* CHAT */}

          <button
            type="button"
            onClick={() =>
              setMobileView(
                'chat'
              )
            }
            className={`
              flex
              min-w-20
              flex-col
              items-center
              justify-center
              gap-1
              rounded-xl
              px-3
              py-2
              text-xs
              transition-colors
              ${
                mobileView ===
                'chat'
                  ? 'bg-primary/15 text-primary'
                  : 'text-muted-foreground'
              }
            `}
          >
            <span className="text-base">
              💬
            </span>

            <span>
              Chat
            </span>
          </button>

          {/* MEMBERS */}

          <button
            type="button"
            onClick={() =>
              setMobileView(
                'members'
              )
            }
            className={`
              flex
              min-w-20
              flex-col
              items-center
              justify-center
              gap-1
              rounded-xl
              px-3
              py-2
              text-xs
              transition-colors
              ${
                mobileView ===
                'members'
                  ? 'bg-primary/15 text-primary'
                  : 'text-muted-foreground'
              }
            `}
          >
            <span className="text-base">
              👥
            </span>

            <span>
              Members
            </span>
          </button>

        </nav>

      </div>

    </main>
  )
}