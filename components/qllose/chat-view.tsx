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
  onTyping: () => void
  onToggleSidebar: () => void
}

export function ChatView({
  channel,
  planetName,
  messages,
  typingUsers,
  onSend,
  onTyping,
  onToggleSidebar,
}: ChatViewProps) {

  const [draft, setDraft] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    })
  }, [messages, typingUsers])


  function submit(e: FormEvent) {
    e.preventDefault()

    const text = draft.trim()

    if (!text) return

    onSend(text)
    setDraft('')
  }


  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {

    if (
      e.key === 'Enter' &&
      !e.shiftKey &&
      !e.nativeEvent.isComposing &&
      e.keyCode !== 229
    ) {
      e.preventDefault()
      submit(e)
    }

  }


  const Icon = channel === 'Global' ? Globe : Hash


  return (

    <section className="flex h-full min-w-0 flex-1 flex-col">


      <header className="flex items-center gap-3 border-b border-border px-4 py-3.5 backdrop-blur-xl">

        <button
          onClick={onToggleSidebar}
          className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary md:hidden"
        >
          <Menu className="size-5" />
        </button>


        <Icon className="size-5 text-muted-foreground" />


        <div>

          <h1 className="text-sm font-semibold">
            {channel}
          </h1>

          <p className="text-xs text-muted-foreground">
            {planetName}
          </p>

        </div>

      </header>



      <div
        ref={scrollRef}
        className="flex-1 space-y-5 overflow-y-auto px-4 py-6 sm:px-6"
      >


        {messages.map((m) => (

          <div key={m.id} className="flex gap-3">


            {m.avatar_url ? (

              <img
                src={m.avatar_url}
                alt={m.author}
                className="size-10 rounded-full object-cover"
              />

            ) : (

              <Avatar
                initials={m.initials}
                color={m.color}
                size={40}
              />

            )}



            <div className="min-w-0 flex-1">


              <div className="flex items-baseline gap-2">

                <span className="text-sm font-semibold">
                  {m.author}
                </span>


                <span className="text-xs text-muted-foreground">
                  {m.time}
                </span>

              </div>



              <p className="mt-0.5 text-sm leading-relaxed text-foreground/90">
                {m.text}
              </p>


            </div>


          </div>

        ))}



        {typingUsers.length > 0 && (

          <div className="text-xs text-muted-foreground">

            {typingUsers.join(', ')} typing…

          </div>

        )}



      </div>




      <form
        onSubmit={submit}
        className="px-4 pb-5 pt-1 sm:px-6"
      >


        <div className="flex items-end gap-2 rounded-2xl border border-input bg-background/50 px-3 py-2">


          <button type="button">
            <Plus className="size-5" />
          </button>



          <textarea

            value={draft}

            onChange={(e)=>{

              setDraft(e.target.value)

              onTyping()

            }}

            onKeyDown={handleKeyDown}

            rows={1}

            placeholder={`Message #${channel}`}

            className="flex-1 resize-none bg-transparent outline-none"

          />



          <button type="button">

            <Smile className="size-5" />

          </button>



          <button

            type="submit"

            disabled={!draft.trim()}

            className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground disabled:opacity-40"

          >

            <Send className="size-4" />

          </button>


        </div>


      </form>


    </section>

  )

}