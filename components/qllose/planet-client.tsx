'use client'

import { useState, useEffect } from 'react'
import type { Planet, Message, Member } from '@/lib/qllose-data'
import { supabase } from '@/lib/supabase'
import { AppNav } from '@/components/qllose/app-nav'
import { PlanetSidebar } from '@/components/qllose/planet-sidebar'
import { ChatView } from '@/components/qllose/chat-view'
import { MembersPanel } from '@/components/qllose/members-panel'
import { cn } from '@/lib/utils'

interface PlanetClientProps {
  planet: Planet
  baseMessages: Message[]
  members: Member[]
}

export function PlanetClient({
  planet,
  members,
}: PlanetClientProps) {

  const [activeChannel, setActiveChannel] = useState('Global')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const [profile, setProfile] = useState<{
    username: string
    nickname: string
    avatar_url: string | null
  } | null>(null)


  const [threads, setThreads] = useState<Record<string, Message[]>>({
    Global: [],
  })


  // Load current user profile
  useEffect(() => {

    async function loadProfile() {

      const {
        data: { user },
      } = await supabase.auth.getUser()


      if (!user) return


      const { data, error } = await supabase
        .from('profiles')
        .select('username, nickname, avatar_url')
        .eq('id', user.id)
        .single()


      if (error) {
        console.log(error)
        return
      }


      setProfile(data)

    }


    loadProfile()

  }, [])



  // Load messages + realtime
useEffect(() => {
  async function loadMessages() {
    console.log('Loading messages...')
    console.log('Planet:', planet.id)
    console.log('Channel:', activeChannel)

    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('planet_id', planet.id)
      .eq('channel', activeChannel)
      .order('created_at', {
        ascending: true,
      })


    if (error) {
      console.log('LOAD MESSAGE ERROR:', error)
      return
    }

console.log('RAW MESSAGES:', data)
console.log('ERROR:', error)


    const userIds = [
      ...new Set(
        data.map((m) => m.user_id)
      ),
    ]


    const { data: profiles, error: profileError } =
      await supabase
        .from('profiles')
        .select(
          'id, username, nickname, avatar_url'
        )
        .in('id', userIds)


    if (profileError) {
      console.log(
        'PROFILE ERROR:',
        profileError
      )
    }


    const formatted: Message[] = data.map((m) => {

      const userProfile =
        profiles?.find(
          (p) => p.id === m.user_id
        )


      return {
        id: m.id,

        author:
          userProfile?.nickname ||
          userProfile?.username ||
          'User',

        initials:
          (
            userProfile?.username ||
            'U'
          )
            .slice(0, 2)
            .toUpperCase(),

        color: 'var(--primary)',

        avatar_url:
          userProfile?.avatar_url ||
          null,

        time:
          new Date(m.created_at)
            .toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            }),

        text: m.content,
      }
    })


    setThreads((prev) => ({
      ...prev,
      [activeChannel]: formatted,
    }))

  }


  loadMessages()


  const channel = supabase
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
    supabase.removeChannel(channel)
  }


}, [planet.id, activeChannel])


  const messages =
    threads[activeChannel] ?? []


  const typingUsers =
    messages.length > 0
      ? [members[0]?.name].filter(Boolean) as string[]
      : []

   async function handleSend(text: string) {

    const {
      data: { user },
    } = await supabase.auth.getUser()


    if (!user) return


    const { error } = await supabase
      .from('messages')
      .insert({
        user_id: user.id,
        planet_id: planet.id,
        channel: activeChannel,
        content: text,
      })


    if (error) {
      console.log('SEND MESSAGE ERROR:', error)
    }

  }



  function selectChannel(channel: string) {

    setActiveChannel(channel)

    setSidebarOpen(false)

  }



  return (

    <main className="flex h-dvh overflow-hidden">

      <AppNav />


      <div
        className={cn(
          'fixed inset-y-0 left-16 z-30 transition-transform duration-300 md:static md:left-0 md:translate-x-0',

          sidebarOpen
            ? 'translate-x-0'
            : '-translate-x-[120%]',
        )}
      >

        <PlanetSidebar
          planet={planet}
          activeChannel={activeChannel}
          onSelectChannel={selectChannel}
        />

      </div>



      {sidebarOpen && (

        <button
          aria-label="Close channels"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-20 bg-background/60 backdrop-blur-sm md:hidden"
        />

      )}



      <ChatView

        channel={activeChannel}

        planetName={planet.name}

        messages={messages}

        typingUsers={typingUsers}

        onSend={handleSend}

        onToggleSidebar={() =>
          setSidebarOpen((v) => !v)
        }

      />



      <MembersPanel

        members={members}

        typingUsers={typingUsers}

      />

    </main>

  )

}