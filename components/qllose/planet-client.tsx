
'use client'


import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import type { Planet, Message, Member } from '@/lib/qllose-data'
import {
  Home,
  Bell,
  Settings,
  Sparkles,
  Users,
  Hash,
} from 'lucide-react'

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

  const [planetReady, setPlanetReady] =
    useState(false)

  // =====================================================
  // INTERACTIVE ATMOSPHERE
  // FRONTEND ONLY
  // =====================================================

  const [mousePosition, setMousePosition] =
    useState({
      x: 0,
      y: 0,
    })

  const [isPointerInside, setIsPointerInside] =
    useState(false)

  const onlineIdsRef =
    useRef<Set<string>>(new Set())

  // =====================================================
  // MOUSE INTERACTION
  // =====================================================

  useEffect(() => {
    const handleMouseMove = (
      event: MouseEvent
    ) => {
      const x =
        (event.clientX /
          window.innerWidth -
          0.5) * 2

      const y =
        (event.clientY /
          window.innerHeight -
          0.5) * 2

      setMousePosition({
        x,
        y,
      })
    }

    const handleMouseEnter = () => {
      setIsPointerInside(true)
    }

    const handleMouseLeave = () => {
      setIsPointerInside(false)

      setMousePosition({
        x: 0,
        y: 0,
      })
    }

    window.addEventListener(
      'mousemove',
      handleMouseMove,
      { passive: true }
    )

    window.addEventListener(
      'mouseenter',
      handleMouseEnter
    )

    window.addEventListener(
      'mouseleave',
      handleMouseLeave
    )

    return () => {
      window.removeEventListener(
        'mousemove',
        handleMouseMove
      )

      window.removeEventListener(
        'mouseenter',
        handleMouseEnter
      )

      window.removeEventListener(
        'mouseleave',
        handleMouseLeave
      )
    }
  }, [])

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

    if (
      !memberRows ||
      memberRows.length === 0
    ) {
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
      setPlanetReady(false)

      await loadProfile()
      await loadMembers()

      requestAnimationFrame(() => {
        setPlanetReady(true)
      })
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
                  p?.nickname ||
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
                    hour: '2-digit',
                    minute: '2-digit',
                  }
                ),

              text:
                m.content || '',

              message_type:
                m.message_type ===
                'voice'
                  ? 'voice'
                  : m.message_type ===
                      'image'
                    ? 'image'
                    : 'text',

              audio_path:
                m.audio_path ||
                null,

              audio_duration:
                m.audio_duration ||
                null,
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
        .on(
          'postgres_changes',
          {
            event: 'DELETE',
            schema: 'public',
            table: 'messages',
            filter:
              `planet_id=eq.${planet.id}`,
          },
          payload => {
            console.log(
              '🔥 REALTIME DELETE:',
              payload
            )

            const deletedId =
              payload.old?.id

            if (!deletedId) {
              loadMessages()
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
                    message =>
                      message.id !==
                      deletedId
                  ),
              })
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

    void supabase
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
  // SEND VOICE
  // =====================================================

  async function handleSendVoice(
    audioBlob: Blob,
    duration: number,
  ) {
    try {
      const {
        data: { user },
      } =
        await supabase.auth.getUser()

      if (!user) return

      const fileExtension =
        audioBlob.type.includes(
          'mp4'
        )
          ? 'mp4'
          : audioBlob.type.includes(
                'ogg'
              )
            ? 'ogg'
            : 'webm'

      const filePath =
        `${planet.id}/${user.id}/${crypto.randomUUID()}.${fileExtension}`

      const {
        error: uploadError,
      } =
        await supabase.storage
          .from(
            'voice-messages'
          )
          .upload(
            filePath,
            audioBlob,
            {
              contentType:
                audioBlob.type ||
                'audio/webm',
              upsert: false,
            }
          )

      if (uploadError) {
        console.log(
          'VOICE UPLOAD ERROR:',
          uploadError
        )
        return
      }

      const {
        error: messageError,
      } =
        await supabase
          .from('messages')
          .insert({
            user_id:
              user.id,
            planet_id:
              planet.id,
            channel:
              activeChannel,
            content: '',
            message_type:
              'voice',
            audio_path:
              filePath,
            audio_duration:
              Math.round(
                duration
              ),
          })

      if (messageError) {
        console.log(
          'VOICE MESSAGE ERROR:',
          messageError
        )

        await supabase.storage
          .from(
            'voice-messages'
          )
          .remove([
            filePath,
          ])

        return
      }

      console.log(
        'VOICE SENT SUCCESSFULLY'
      )
    } catch (error) {
      console.log(
        'VOICE SEND ERROR:',
        error
      )
    }
  }

  // =====================================================
  // SEND IMAGE
  // =====================================================

  async function handleSendImage(
    file: File
  ) {
    try {
      const {
        data: { user },
      } =
        await supabase.auth.getUser()

      if (!user) return

      if (
        !file.type.startsWith(
          'image/'
        )
      ) {
        alert(
          'Please select an image.'
        )
        return
      }

      const extension =
        file.name
          .split('.')
          .pop()
          ?.toLowerCase() ||
        'jpg'

      const filePath =
        `${planet.id}/${user.id}/${crypto.randomUUID()}.${extension}`

      const {
        error: uploadError,
      } =
        await supabase.storage
          .from(
            'chat-images'
          )
          .upload(
            filePath,
            file,
            {
              contentType:
                file.type,
              upsert: false,
            }
          )

      if (uploadError) {
        console.log(
          'IMAGE UPLOAD ERROR:',
          uploadError
        )
        return
      }

      const { data } =
        supabase.storage
          .from(
            'chat-images'
          )
          .getPublicUrl(
            filePath
          )

      const publicUrl =
        data.publicUrl

      const {
        error: messageError,
      } =
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
              publicUrl,
            message_type:
              'image',
          })

      if (messageError) {
        console.log(
          'IMAGE MESSAGE ERROR:',
          messageError
        )

        await supabase.storage
          .from(
            'chat-images'
          )
          .remove([
            filePath,
          ])

        return
      }

      console.log(
        'IMAGE SENT SUCCESSFULLY'
      )
    } catch (error) {
      console.log(
        'IMAGE SEND ERROR:',
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

    let query = supabase
      .from('messages')
      .delete()
      .eq('id', id)

    if (!isFounder) {
      query = query.eq(
        'user_id',
        user.id
      )
    }

    const {
      data,
      error,
    } = await query.select()

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
  // FOUNDER
  // =====================================================

  const isFounder =
    planetMembers.some(
      member =>
        member.user_id ===
          profile?.id &&
        member.role
          ?.toLowerCase() ===
          'founder'
    )

  const isMember =
    planetMembers.some(
      member =>
        member.user_id ===
        profile?.id
    )

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
      (
        selectedChannel: string
      ) => {
        setActiveChannel(
          selectedChannel
        )

        setMobileView(
          'chat'
        )
      },

    isMember,
    onJoin: joinPlanet,
  }

  // =====================================================
  // MOBILE NAV ITEM
  // =====================================================

  function mobileNavButtonClass(
    active: boolean
  ) {
    return `
      group relative flex size-11 items-center
      justify-center rounded-xl
      transition-all duration-200
      active:scale-95
      ${
        active
          ? 'bg-primary/12 text-primary'
          : 'text-muted-foreground hover:bg-secondary/70 hover:text-foreground'
      }
    `
  }

  function ActiveIndicator({
    active,
  }: {
    active: boolean
  }) {
    if (!active) return null

    return (
      <span
        className="
          absolute inset-x-3 bottom-1 h-0.5
          rounded-full bg-primary
          shadow-[0_0_10px_oklch(0.72_0.18_278_/_0.6)]
        "
      />
    )
  }

  // =====================================================
  // INTERACTIVE TRANSFORMS
  // =====================================================

  const atmosphereTransform = `
    translate3d(
      ${mousePosition.x * 10}px,
      ${mousePosition.y * 10}px,
      0
    )
  `

  const contentTransform = `
    perspective(1200px)
    rotateX(${mousePosition.y * -0.8}deg)
    rotateY(${mousePosition.x * 0.8}deg)
  `

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <main
      className={`
        relative flex h-dvh overflow-hidden bg-background
        transition-opacity duration-700
        ${
          planetReady
            ? 'opacity-100'
            : 'opacity-0'
        }
      `}
      style={{
        transform:
          isPointerInside
            ? contentTransform
            : 'none',
        transition:
          'transform 0.35s cubic-bezier(0.22, 1, 0.36, 1)',
      }}
    >
      {/* =================================================
          INTERACTIVE CURSOR GLOW
          ================================================= */}

      <div
        className="
          pointer-events-none fixed inset-0 z-[5]
          transition-opacity duration-500
        "
        aria-hidden
        style={{
          opacity:
            isPointerInside
              ? 1
              : 0,

          background:
            `radial-gradient(
              520px circle at
              ${50 + mousePosition.x * 18}%
              ${50 + mousePosition.y * 18}%,
              ${planet.accent}16,
              transparent 68%
            )`,
        }}
      />








      {/* ATMOSPHERIC PLANET BACKDROP */}

      <div
        className="
          pointer-events-none absolute inset-0
          z-0 overflow-hidden
        "
        aria-hidden
        style={{
          transform:
            atmosphereTransform,

          transition:
            'transform 0.45s cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        {/* Main planet atmosphere */}

        <div
          className="
            absolute -left-[12%] -top-[20%]
            h-[55%] w-[55%] rounded-full
            blur-3xl opacity-20
            animate-float-gentle
          "
          style={{
            background:
              `radial-gradient(
                circle,
                ${planet.accent},
                transparent 68%
              )`,
          }}
        />

        {/* Secondary atmosphere */}

        <div
          className="
            absolute -right-[15%] top-[8%]
            h-[48%] w-[48%] rounded-full
            blur-3xl opacity-12
            animate-float-medium
          "
          style={{
            background:
              `radial-gradient(
                circle,
                ${planet.accent2},
                transparent 68%
              )`,
          }}
        />

        {/* Extra ambient glow */}

        <div
          className="
            absolute left-1/2 top-1/2
            h-[35vw] w-[35vw]
            -translate-x-1/2
            -translate-y-1/2
            rounded-full
            blur-[140px]
            opacity-[0.035]
            animate-pulse
          "
          style={{
            background:
              planet.accent,
          }}
        />

        {/* Vignette */}

        <div
          className="
            absolute inset-0
            bg-[radial-gradient(
              ellipse_at_center,
              transparent_35%,
              oklch(0.05_0.02_265_/_0.18)_100%
            )]
          "
        />

        {/* Moving light streak */}

        <div
          className="
            absolute -left-[20%]
            top-[35%]
            h-px w-[70%]
            rotate-[-18deg]
            opacity-[0.035]
            blur-[1px]
          "
          style={{
            background:
              `linear-gradient(
                90deg,
                transparent,
                ${planet.accent},
                transparent
              )`,
            transform:
              `translateX(${mousePosition.x * 30}px)`,
            transition:
              'transform 0.6s ease-out',
          }}
        />
      </div>

      {/* DESKTOP */}

      <div className="relative z-10 hidden min-h-0 flex-1 md:flex">
        <div className="animate-fade-up-soft">
          <AppNav />
        </div>

        <div className="relative z-10 flex min-h-0 shrink-0">
          <div className="animate-fade-up-soft [animation-delay:70ms]">
            <PlanetSidebar
              {...sidebarProps}
            />
          </div>
        </div>

        <div className="relative z-10 flex min-w-0 flex-1 animate-scale-in-soft [animation-delay:110ms]">
          <div className="relative flex min-w-0 flex-1 overflow-hidden">
            <div
              className="
                pointer-events-none absolute
                inset-x-0 top-0 z-20 h-20
              "
              aria-hidden
            >
              <div
                className="h-full w-full opacity-70"
                style={{
                  background:
                    `linear-gradient(
                      180deg,
                      color-mix(
                        in oklab,
                        ${planet.accent} 7%,
                        transparent
                      ),
                      transparent
                    )`,
                }}
              />
            </div>

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
              onSendVoice={
                handleSendVoice
              }
              onSendImage={
                handleSendImage
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
              isFounder={
                isFounder
              }
              onToggleSidebar={
                () => {}
              }
            />
          </div>
        </div>

        <div className="relative z-10 flex min-h-0 shrink-0 animate-fade-up-soft [animation-delay:150ms]">
          <MembersPanel
            members={
              planetMembers
            }
            typingUsers={
              typingUsers
            }
          />
        </div>
      </div>

      {/* MOBILE */}

      <div className="relative z-10 flex min-w-0 flex-1 flex-col md:hidden">
        <div className="relative min-h-0 flex-1">

          {/* CHAT */}

          {mobileView ===
            'chat' && (
            <div className="animate-scale-in-soft flex h-full min-h-0 flex-col">
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
                onSendVoice={
                  handleSendVoice
                }
                onSendImage={
                  handleSendImage
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
                isFounder={
                  isFounder
                }
                onToggleSidebar={
                  () =>
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
            <div className="animate-fade-up-soft flex h-full min-h-0 flex-col">
              <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-28 bg-[linear-gradient(180deg,oklch(0.72_0.18_278_/_0.055),transparent)]" />

              <PlanetSidebar
                {...sidebarProps}
              />
            </div>
          )}

          {/* MEMBERS */}

          {mobileView ===
            'members' && (
            <div className="animate-fade-up-soft flex h-full min-h-0 flex-col">
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

        {/* MOBILE NAVIGATION */}

        <nav
          className="
            relative z-30 flex h-16 shrink-0
            items-center justify-around
            border-t border-border/70
            bg-background/85 px-1
            backdrop-blur-2xl
            shadow-[0_-12px_36px_oklch(0.02_0.015_265_/_0.25)]
          "
          aria-label="Mobile navigation"
        >
          {/* top glow */}

          <div
            className="
              pointer-events-none absolute
              inset-x-0 -top-px h-px opacity-70
            "
            style={{
              background:
                `linear-gradient(
                  90deg,
                  transparent,
                  color-mix(
                    in oklab,
                    ${planet.accent} 35%,
                    transparent
                  ),
                  transparent
                )`,
            }}
          />

          {/* HOME */}

          <Link
            href="/planets"
            aria-label="Home"
            className={mobileNavButtonClass(
              false
            )}
          >
            <Home className="size-5 transition-transform duration-200 group-hover:scale-110" />
          </Link>

          {/* CHANNELS */}

          <button
            type="button"
            onClick={() =>
              setMobileView(
                'channels'
              )
            }
            aria-label="Channels"
            className={mobileNavButtonClass(
              mobileView ===
                'channels'
            )}
          >
            <ActiveIndicator
              active={
                mobileView ===
                'channels'
              }
            />

            <Hash className="size-5 transition-transform duration-200 group-hover:scale-110" />
          </button>

          {/* CHAT */}

          <button
            type="button"
            onClick={() =>
              setMobileView(
                'chat'
              )
            }
            aria-label="Chat"
            className={mobileNavButtonClass(
              mobileView ===
                'chat'
            )}
          >
            <ActiveIndicator
              active={
                mobileView ===
                'chat'
              }
            />

            <Sparkles className="size-5 transition-transform duration-200 group-hover:scale-110" />
          </button>

          {/* MEMBERS */}

          <button
            type="button"
            onClick={() =>
              setMobileView(
                'members'
              )
            }
            aria-label="Members"
            className={mobileNavButtonClass(
              mobileView ===
                'members'
            )}
          >
            <ActiveIndicator
              active={
                mobileView ===
                'members'
              }
            />

            <Users className="size-5 transition-transform duration-200 group-hover:scale-110" />
          </button>

          {/* NOTIFICATIONS */}

          <Link
            href="/notifications"
            aria-label="Notifications"
            className={mobileNavButtonClass(
              false
            )}
          >
            <Bell className="size-5 transition-transform duration-200 group-hover:scale-110" />
          </Link>

          {/* SETTINGS */}

          <Link
            href="/settings"
            aria-label="Settings"
            className={mobileNavButtonClass(
              false
            )}
          >
            <Settings className="size-5 transition-transform duration-200 group-hover:scale-110" />
          </Link>
        </nav>
      </div>
    </main>
  )
}

