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
  baseMessages,
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
    Global: baseMessages,
  })


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



  const messages = threads[activeChannel] ?? []


  const typingUsers =
    messages.length > 0
      ? [members[0]?.name].filter(Boolean) as string[]
      : []



  async function handleSend(text: string) {

    const {
      data: { user },
    } = await supabase.auth.getUser()


    if (!user) return



    const { data, error } = await supabase
      .from('messages')
      .insert({
        user_id: user.id,
        planet_id: planet.id,
        channel: activeChannel,
        content: text,
      })
      .select()
      .single()



    if (error) {
      console.log('MESSAGE ERROR:', error)
      return
    }



   const newMessage: Message = {
  id: data.id,
  author: profile?.nickname || profile?.username || 'User',
  initials: (profile?.username || 'U')
    .slice(0, 2)
    .toUpperCase(),
  color: 'var(--primary)',
  avatar_url: profile?.avatar_url || null,
  time: new Date(data.created_at).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  }),
  text: data.content,
}



    setThreads((prev) => ({
      ...prev,

      [activeChannel]: [
        ...(prev[activeChannel] ?? []),
        newMessage,
      ],
    }))

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