'use client'

import { useState } from 'react'
import type { Planet, Message, Member } from '@/lib/qllose-data'
import { currentUser } from '@/lib/qllose-data'
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

/**
 * Orchestrates the planet workspace: nav rail, channel sidebar, chat and members.
 * Holds all client-side chat state so backend wiring stays isolated to data props.
 */
export function PlanetClient({ planet, baseMessages, members }: PlanetClientProps) {
  const [activeChannel, setActiveChannel] = useState('Global')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Messages are stored per channel. Global seeds with the sample conversation.
  const [threads, setThreads] = useState<Record<string, Message[]>>({
    Global: baseMessages,
  })

  const messages = threads[activeChannel] ?? []
  const typingUsers = messages.length > 0 ? [members[0]?.name].filter(Boolean) as string[] : []

  function handleSend(text: string) {
    const newMessage: Message = {
      id: `${Date.now()}`,
      author: currentUser.displayName,
      initials: currentUser.initials,
      color: 'var(--primary)',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text,
    }
    setThreads((prev) => ({
      ...prev,
      [activeChannel]: [...(prev[activeChannel] ?? []), newMessage],
    }))
  }

  function selectChannel(channel: string) {
    setActiveChannel(channel)
    setSidebarOpen(false)
  }

  return (
    <main className="flex h-dvh overflow-hidden">
      <AppNav />

      {/* Channel sidebar — slides in on mobile */}
      <div
        className={cn(
          'fixed inset-y-0 left-16 z-30 transition-transform duration-300 md:static md:left-0 md:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-[120%]',
        )}
      >
        <PlanetSidebar planet={planet} activeChannel={activeChannel} onSelectChannel={selectChannel} />
      </div>

      {/* Backdrop for mobile sidebar */}
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
        onToggleSidebar={() => setSidebarOpen((v) => !v)}
      />

      <MembersPanel members={members} typingUsers={typingUsers} />
    </main>
  )
}
