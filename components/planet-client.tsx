
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

  // Mouse-driven atmosphere is updated directly on the decorative layers.
  // This avoids rerendering the entire planet, chat, and member list on every pointer move.
  const mainRef = useRef<HTMLElement | null>(null)
  const cursorGlowRef = useRef<HTMLDivElement | null>(null)
  const atmosphereRef = useRef<HTMLDivElement | null>(null)
  const streakRef = useRef<HTMLDivElement | null>(null)

  const onlineIdsRef =
    useRef<Set<string>>(new Set())

  useEffect(() => {
    let frame = 0
    let x = 0
    let y = 0

    const paint = () => {
      frame = 0
      const main = mainRef.current
      const glow = cursorGlowRef.current
      const atmosphere = atmosphereRef.current
      const streak = streakRef.current

      if (main) {
        main.style.transform = `perspective(1200px) rotateX(${y * -0.8}deg) rotateY(${x * 0.8}deg)`
      }
      if (glow) {
        glow.style.opacity = '1'
        glow.style.background = `radial-gradient(520px circle at ${50 + x * 18}% ${50 + y * 18}%, ${planet.accent}16, transparent 68%)`
      }
      if (atmosphere) {
        atmosphere.style.transform = `translate3d(${x * 10}px, ${y * 10}px, 0)`
      }
      if (streak) {
        streak.style.transform = `translateX(${x * 30}px) rotate(-18deg)`
      }
    }

    const handlePointerMove = (event: PointerEvent) => {
      x = (event.clientX / window.innerWidth - 0.5) * 2
      y = (event.clientY / window.innerHeight - 0.5) * 2
      if (!frame) frame = window.requestAnimationFrame(paint)
    }

    const handlePointerLeave = () => {
      x = 0
      y = 0
      if (frame) window.cancelAnimationFrame(frame)
      frame = 0
      if (mainRef.current) mainRef.current.style.transform = 'none'
      if (cursorGlowRef.current) cursorGlowRef.current.style.opacity = '0'
      if (atmosphereRef.current) atmosphereRef.current.style.transform = 'translate3d(0, 0, 0)'
      if (streakRef.current) streakRef.current.style.transform = 'translateX(0) rotate(-18deg)'
    }

    window.addEventListener('pointermove', handlePointerMove, { passive: true })
    document.addEventListener('pointerleave', handlePointerLeave)
    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      document.removeEventListener('pointerleave', handlePointerLeave)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [planet.accent])

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

    const profilesById = new Map<string, any>(
      profiles.map((item: any) => [item.id, item] as [string, any]),
    )

    const formatted: Member[] =
      memberRows.map(
        (member: any) => {
          const memberProfile = profilesById.get(member.user_id)

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
    let cancelled = false

    async function init() {
      setPlanetReady(false)
      await Promise.all([loadProfile(), loadMembers()])
      if (cancelled) return

      requestAnimationFrame(() => {
        if (!cancelled) setPlanetReady(true)
      })
    }

    void init()
    return () => {
      cancelled = true
    }
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

    let presenceRefreshTimer: ReturnType<typeof setTimeout> | null = null

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

            if (presenceRefreshTimer) clearTimeout(presenceRefreshTimer)
            presenceRefreshTimer = setTimeout(() => {
              updateOnlineStatus()
              presenceRefreshTimer = null
            }, 500)
          }
        }
      )

    return () => {
      if (presenceRefreshTimer) clearTimeout(presenceRefreshTimer)
      void supabase.removeChannel(presenceChannel)
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
    let cancelled = false

    const formatRows = (rows: any[], profilesById: Map<string, any>): Message[] =>
      rows.map((m: any) => {
        const p = profilesById.get(m.user_id)
        return {
          id: m.id,
          user_id: m.user_id,
          author: p?.nickname || p?.username || 'User',
          initials: (p?.username || p?.nickname || 'U').slice(0, 2).toUpperCase(),
          color: 'var(--primary)',
          avatar_url: p?.avatar_url || null,
          time: new Date(m.created_at).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
          text: m.content || '',
          message_type: m.message_type === 'voice' ? 'voice' : m.message_type === 'image' ? 'image' : 'text',
          audio_path: m.audio_path || null,
          audio_duration: m.audio_duration || null,
          created_at: m.created_at,
        } as Message
      })

    const loadMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('planet_id', planet.id)
        .eq('channel', activeChannel)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('MESSAGES ERROR:', error)
        return
      }

      const rows = data || []
      const ids = [...new Set(rows.map((m: any) => m.user_id))]
      let profiles: any[] = []

      if (ids.length > 0) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id,username,nickname,avatar_url')
          .in('id', ids)
        if (profileError) console.error('MESSAGE PROFILES ERROR:', profileError)
        profiles = profileData || []
      }

      if (cancelled) return
      const formatted = formatRows(rows, new Map<string, any>(profiles.map((p: any) => [p.id, p] as [string, any])))
      setThreads((prev) => {
        // Merge with any realtime inserts that arrived while the initial query was in flight.
        const current = prev[activeChannel] || []
        const byId = new Map<string, Message>()
        for (const message of formatted) byId.set(message.id, message)
        for (const message of current) byId.set(message.id, message)
        const merged = [...byId.values()]
        const createdAt = (message: Message) => (message as Message & { created_at?: string }).created_at
        if (merged.every((message) => createdAt(message))) {
          merged.sort((a, b) => String(createdAt(a)).localeCompare(String(createdAt(b))))
        }
        return { ...prev, [activeChannel]: merged }
      })
    }

    void loadMessages()

    const channel = supabase
      .channel(`messages-${planet.id}-${activeChannel}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `planet_id=eq.${planet.id}`,
      }, async (payload) => {
        const row = payload.new as any
        if (!row?.id || row.channel !== activeChannel) return

        // Fetch only the new sender's profile; don't reload the full message history.
        let sender: any = null
        if (row.user_id) {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('id,username,nickname,avatar_url')
            .eq('id', row.user_id)
            .maybeSingle()
          if (profileError) console.error('NEW MESSAGE PROFILE ERROR:', profileError)
          sender = profileData
        }

        if (cancelled) return
        const [formatted] = formatRows([row], new Map<string, any>(sender ? [[sender.id, sender] as [string, any]] : []))
        // Keep the creation timestamp internally so concurrent inserts can be ordered correctly.
        ;(formatted as Message & { created_at?: string }).created_at = row.created_at

        setThreads((prev) => {
          const current = prev[activeChannel] || []
          if (current.some((message) => message.id === formatted.id)) return prev
          const next = [...current, formatted]
          next.sort((a, b) => {
            const at = (a as Message & { created_at?: string }).created_at || ''
            const bt = (b as Message & { created_at?: string }).created_at || ''
            return at.localeCompare(bt)
          })
          return { ...prev, [activeChannel]: next }
        })
      })
      .on('postgres_changes', {
        event: 'DELETE',
        schema: 'public',
        table: 'messages',
        filter: `planet_id=eq.${planet.id}`,
      }, (payload) => {
        const oldRow = payload.old as any
        const deletedId = oldRow?.id
        if (!deletedId) return
        if (oldRow.channel && oldRow.channel !== activeChannel) return
        setThreads((prev) => ({
          ...prev,
          [activeChannel]: (prev[activeChannel] || []).filter((message) => message.id !== deletedId),
        }))
      })
      .subscribe()

    return () => {
      cancelled = true
      void supabase.removeChannel(channel)
    }
  }, [planet.id, activeChannel])

  // =====================================================
  // TYPING
  // =====================================================

  const typingChannelRef = useRef<any>(null)
  const typingTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  useEffect(() => {
    const channel = supabase
      .channel(`typing-${planet.id}-${activeChannel}`)
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        const username = String(payload?.username || '')
        if (!username) return

        setTypingUsers((prev) => prev.includes(username) ? prev : [...prev, username])
        const existingTimer = typingTimersRef.current.get(username)
        if (existingTimer) clearTimeout(existingTimer)
        const timer = setTimeout(() => {
          typingTimersRef.current.delete(username)
          setTypingUsers((prev) => prev.filter((name) => name !== username))
        }, 2000)
        typingTimersRef.current.set(username, timer)
      })
      .subscribe()

    typingChannelRef.current = channel

    return () => {
      if (typingChannelRef.current === channel) typingChannelRef.current = null
      for (const timer of typingTimersRef.current.values()) clearTimeout(timer)
      typingTimersRef.current.clear()
      setTypingUsers([])
      void supabase.removeChannel(channel)
    }
  }, [planet.id, activeChannel])

  function handleTyping() {
    if (!profile || !typingChannelRef.current) return
    void typingChannelRef.current.send({
      type: 'broadcast',
      event: 'typing',
      payload: { username: profile.nickname || profile.username },
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
  // RENDER
  // =====================================================

  return (
    <main
      ref={mainRef}
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
        transform: 'none',
        transition: 'transform 0.35s cubic-bezier(0.22, 1, 0.36, 1)',
        willChange: 'transform',
      }}
    >
      {/* =================================================
          INTERACTIVE CURSOR GLOW
          ================================================= */}

      <div
        ref={cursorGlowRef}
        className="pointer-events-none fixed inset-0 z-[5] transition-opacity duration-500"
        aria-hidden
        style={{ opacity: 0, background: `radial-gradient(520px circle at 50% 50%, ${planet.accent}16, transparent 68%)` }}
      />








      {/* ATMOSPHERIC PLANET BACKDROP */}

      <div
        ref={atmosphereRef}
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
        aria-hidden
        style={{ transform: 'translate3d(0, 0, 0)', transition: 'transform 0.45s cubic-bezier(0.22, 1, 0.36, 1)', willChange: 'transform' }}
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
          ref={streakRef}
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
            transform: 'translateX(0) rotate(-18deg)',
            transition: 'transform 0.6s ease-out',
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

