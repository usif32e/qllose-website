'use client'

import { useEffect, useRef, useState } from 'react'
import type { FormEvent, KeyboardEvent } from 'react'
import { Hash, Globe, Menu, Send, Smile, Plus } from 'lucide-react'
import type { Message } from '@/lib/qllose-data'
import { Avatar } from '@/components/qllose/avatar'

interface ChatViewProps {
  channel: string
  planetName: string
  messages: Message[]
  typingUsers: string[]
  onSend: (text: string) => void
  onToggleSidebar: () => void
}

export function ChatView({
  channel,
  planetName,
  messages,
  typingUsers,
  onSend,
  onToggleSidebar,
}: ChatViewProps) {
  const [draft, setDraft] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, typingUsers])

  function submit(e: FormEvent) {
    e.preventDefault()
    const text = draft.trim()
    if (!text) return
    onSend(text)
    setDraft('')
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    // Respect IME composition (CJK) before submitting on Enter.
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing && e.keyCode !== 229) {
      e.preventDefault()
      submit(e)
    }
  }

  const Icon = channel === 'Global' ? Globe : Hash

  return (
    <section className="flex h-full min-w-0 flex-1 flex-col">
      {/* Top navigation */}
      <header className="flex items-center gap-3 border-b border-border px-4 py-3.5 backdrop-blur-xl">
        <button
          onClick={onToggleSidebar}
          className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary md:hidden"
          aria-label="Toggle channels"
        >
          <Menu className="size-5" />
        </button>
        <Icon className="size-5 text-muted-foreground" />
        <div className="min-w-0">
          <h1 className="truncate text-sm font-semibold">{channel}</h1>
          <p className="truncate text-xs text-muted-foreground">{planetName}</p>
        </div>
      </header>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 space-y-5 overflow-y-auto px-4 py-6 sm:px-6">
        <div className="mx-auto mb-2 w-fit rounded-full border border-border bg-background/40 px-3 py-1 text-xs text-muted-foreground">
          Beginning of #{channel.toLowerCase().replace(/\s+/g, '-')}
        </div>

        {messages.map((m) => (
          <div key={m.id} className="flex gap-3">
            <Avatar initials={m.initials} color={m.color} size={40} />
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-semibold">{m.author}</span>
                <span className="text-xs text-muted-foreground">{m.time}</span>
              </div>
              <p className="mt-0.5 text-sm leading-relaxed text-foreground/90">{m.text}</p>
              {m.reactions && m.reactions.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {m.reactions.map((r) => (
                    <span
                      key={r.emoji}
                      className="flex items-center gap-1 rounded-full border border-border bg-secondary/60 px-2 py-0.5 text-xs"
                    >
                      <span>{r.emoji}</span>
                      <span className="text-muted-foreground">{r.count}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {typingUsers.length > 0 && (
          <div className="flex items-center gap-2 pl-1 text-xs text-muted-foreground">
            <span className="flex gap-0.5">
              <span className="size-1.5 animate-twinkle rounded-full bg-primary" style={{ animationDuration: '1s' }} />
              <span className="size-1.5 animate-twinkle rounded-full bg-primary" style={{ animationDelay: '0.15s', animationDuration: '1s' }} />
              <span className="size-1.5 animate-twinkle rounded-full bg-primary" style={{ animationDelay: '0.3s', animationDuration: '1s' }} />
            </span>
            {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing…
          </div>
        )}
      </div>

      {/* Composer */}
      <form onSubmit={submit} className="px-4 pb-5 pt-1 sm:px-6">
        <div className="flex items-end gap-2 rounded-2xl border border-input bg-background/50 px-3 py-2 backdrop-blur-xl focus-within:border-ring">
          <button type="button" className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary" aria-label="Add attachment">
            <Plus className="size-5" />
          </button>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder={`Message #${channel.toLowerCase().replace(/\s+/g, '-')}`}
            className="max-h-32 flex-1 resize-none bg-transparent py-1.5 text-sm outline-none placeholder:text-muted-foreground/70"
            aria-label="Message input"
          />
          <button type="button" className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary" aria-label="Add emoji">
            <Smile className="size-5" />
          </button>
          <button
            type="submit"
            disabled={!draft.trim()}
            className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-opacity disabled:opacity-40"
            aria-label="Send message"
          >
            <Send className="size-4" />
          </button>
        </div>
      </form>
    </section>
  )
}
