'use client'

import { useEffect, useId, useRef, useState } from 'react'
import type {
  FormEvent,
  KeyboardEvent,
  ChangeEvent,
} from 'react'

import {
  Hash,
  Globe,
  Send,
  Smile,
  Plus,
  Trash2,
  Mic,
  X,
  Play,
  Pause,
  Copy,
  Sparkles,
} from 'lucide-react'

import EmojiPicker, {
  type EmojiClickData,
} from 'emoji-picker-react'

import type { Message } from '@/lib/qllose-data'
import { Avatar } from '@/components/qllose/avatar'
import { supabase } from '@/lib/supabase'

type Reaction = {
  emoji: string
  count: number
  reactedByMe?: boolean
}

type ChatReactionRow = {
  id: string
  message_id: string
  user_id: string
  emoji: string
  created_at: string
}

type ChatMessage = Message & {
  message_type?: string | null
  audio_path?: string | null
  audio_duration?: number | null
  reactions?: Reaction[]
}

interface ChatViewProps {
  channel: string
  planetName: string
  messages: ChatMessage[]
  typingUsers: string[]

  onSend: (text: string) => void

  onSendVoice?: (
    audioBlob: Blob,
    duration: number,
  ) => Promise<void>

  onSendImage?: (
    file: File,
  ) => Promise<void>

  onTyping: () => void

  onDeleteMessage?: (
    id: string,
  ) => void

  currentUserId?: string

  isFounder?: boolean

  onToggleSidebar: () => void
}

const REACTION_EMOJIS = [
  '❤️',
  '😂',
  '😭',
  '😡',
  '😮',
  '👍',
]

export function ChatView({
  channel,
  planetName,
  messages,
  typingUsers,
  onSend,
  onSendVoice,
  onSendImage,
  onTyping,
  onDeleteMessage,
  currentUserId,
  isFounder = false,
  onToggleSidebar,
}: ChatViewProps) {
  const [draft, setDraft] = useState('')

  const [showEmojiPicker, setShowEmojiPicker] =
    useState(false)

  const [isRecording, setIsRecording] =
    useState(false)

  const [recordingTime, setRecordingTime] =
    useState(0)

  const [playingId, setPlayingId] =
    useState<string | null>(null)

  const [audioUrls, setAudioUrls] =
    useState<Record<string, string>>({})

  const [reactionPickerId, setReactionPickerId] =
    useState<string | null>(null)

  const [messageReactions, setMessageReactions] =
    useState<Record<string, Reaction[]>>({})

  const [isComposerFocused, setIsComposerFocused] =
    useState(false)

  const imageInputRef =
    useRef<HTMLInputElement | null>(null)

  const scrollRef =
    useRef<HTMLDivElement | null>(null)

  const emojiRef =
    useRef<HTMLDivElement | null>(null)

  const mediaRecorderRef =
    useRef<MediaRecorder | null>(null)

  const mediaStreamRef =
    useRef<MediaStream | null>(null)

  const audioChunksRef =
    useRef<Blob[]>([])

  const recordingTimerRef =
    useRef<ReturnType<typeof setInterval> | null>(
      null,
    )

  const recordingTimeRef =
    useRef(0)

  const audioRef =
    useRef<HTMLAudioElement | null>(null)

  const instanceId = useId()
  const messagesRef = useRef(messages)
  messagesRef.current = messages
  const currentUserIdRef = useRef(currentUserId)
  currentUserIdRef.current = currentUserId
  const shouldAutoScrollRef = useRef(true)
  const voiceUrlCacheRef = useRef<Record<string, { url: string; expiresAt: number }>>({})

  // =====================================================
  // AUTO SCROLL
  // =====================================================

  useEffect(() => {
    const container = scrollRef.current
    if (!container || !shouldAutoScrollRef.current) return

    container.scrollTo({
      top: container.scrollHeight,
      behavior: 'smooth',
    })
  }, [messages.length, typingUsers.length])

  // =====================================================
  // GROUP REACTIONS
  // =====================================================

  function groupReactions(
    rows: ChatReactionRow[],
    userId: string | undefined = currentUserId,
  ) {
    const grouped: Record<string, Reaction[]> =
      {}

    for (const row of rows) {
      if (!grouped[row.message_id]) {
        grouped[row.message_id] = []
      }

      const existing =
        grouped[row.message_id].find(
          (reaction) =>
            reaction.emoji === row.emoji,
        )

      if (existing) {
        existing.count += 1

        if (
          row.user_id ===
          userId
        ) {
          existing.reactedByMe = true
        }
      } else {
        grouped[row.message_id].push({
          emoji: row.emoji,
          count: 1,
          reactedByMe:
            row.user_id === userId,
        })
      }
    }

    return grouped
  }

  // =====================================================
  // LOAD REACTIONS
  // =====================================================

  async function loadReactions() {
    const messageIds =
      messages.map(
        (message) => message.id,
      )

    if (
      messageIds.length === 0
    ) {
      setMessageReactions({})
      return
    }

    const {
      data,
      error,
    } = await supabase
      .from('message_reactions')
      .select(
        'id,message_id,user_id,emoji,created_at',
      )
      .in(
        'message_id',
        messageIds,
      )

    if (error) {
      console.error(
        'REACTIONS LOAD ERROR:',
        error,
      )
      return
    }

    setMessageReactions(
      groupReactions(
        (data ||
          []) as ChatReactionRow[],
      ),
    )
  }

  const messageIdsKey = messages.map((message) => message.id).join(',')

  // =====================================================
  // LOAD REACTIONS ON MESSAGE CHANGE
  // =====================================================

  useEffect(() => {
    let cancelled = false

    async function run() {
      const messageIds = messagesRef.current.map(
        (message) => message.id,
      )

      if (
        messageIds.length === 0
      ) {
        setMessageReactions({})
        return
      }

      const {
        data,
        error,
      } = await supabase
        .from('message_reactions')
        .select(
          'id,message_id,user_id,emoji,created_at',
        )
        .in(
          'message_id',
          messageIds,
        )

      if (
        error ||
        cancelled
      ) {
        if (error) {
          console.error(
            'REACTIONS LOAD ERROR:',
            error,
          )
        }

        return
      }

      setMessageReactions(
        groupReactions(
          (data ||
            []) as ChatReactionRow[],
        ),
      )
    }

    run()

    return () => {
      cancelled = true
    }
  }, [messageIdsKey, currentUserId])

  // =====================================================
  // REALTIME REACTIONS
  // =====================================================

  useEffect(() => {
    const reactionChannel = supabase
      .channel(`message-reactions-${channel}-${instanceId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'message_reactions',
      }, async (payload) => {
        const changed = (payload.new || payload.old) as Partial<ChatReactionRow> | null
        const currentIds = new Set(messagesRef.current.map((message) => message.id))
        if (!changed?.message_id || !currentIds.has(changed.message_id)) return

        const ids = [...currentIds]
        if (ids.length === 0) return
        const { data, error } = await supabase
          .from('message_reactions')
          .select('id,message_id,user_id,emoji,created_at')
          .in('message_id', ids)
        if (error) {
          console.error('REACTIONS LOAD ERROR:', error)
          return
        }
        setMessageReactions(groupReactions((data || []) as ChatReactionRow[], currentUserIdRef.current))
      })
      .subscribe()

    return () => {
      void supabase.removeChannel(reactionChannel)
    }
  }, [channel, instanceId])

  // =====================================================
  // LOAD SIGNED VOICE URLS
  // =====================================================

  const voiceMessagesKey = messages
    .filter((message) => message.message_type === 'voice' && Boolean(message.audio_path))
    .map((message) => `${message.id}:${message.audio_path}`)
    .join('|')

  useEffect(() => {
    let cancelled = false

    async function loadVoiceUrls() {
      const voiceMessages = messagesRef.current.filter(
        (message) => message.message_type === 'voice' && Boolean(message.audio_path),
      )
      const now = Date.now()
      const nextUrls: Record<string, string> = {}
      const missing: typeof voiceMessages = []

      for (const message of voiceMessages) {
        const path = message.audio_path
        if (!path) continue
        const cached = voiceUrlCacheRef.current[path]
        if (cached && cached.expiresAt > now + 60_000) {
          nextUrls[message.id] = cached.url
        } else {
          missing.push(message)
        }
      }

      await Promise.all(missing.map(async (message) => {
        const path = message.audio_path
        if (!path) return
        try {
          const { data, error } = await supabase.storage
            .from('voice-messages')
            .createSignedUrl(path, 60 * 60)
          if (error) {
            console.error('VOICE SIGNED URL ERROR:', error)
            return
          }
          if (!data?.signedUrl) return
          voiceUrlCacheRef.current[path] = {
            url: data.signedUrl,
            expiresAt: Date.now() + 55 * 60 * 1000,
          }
          nextUrls[message.id] = data.signedUrl
        } catch (error) {
          console.error('VOICE URL ERROR:', error)
        }
      }))

      if (cancelled) return
      setAudioUrls((previous) => {
        const currentVoiceIds = new Set(voiceMessages.map((message) => message.id))
        const merged: Record<string, string> = {}
        for (const [id, url] of Object.entries(previous)) {
          if (currentVoiceIds.has(id)) merged[id] = url
        }
        return { ...merged, ...nextUrls }
      })
    }

    void loadVoiceUrls()
    return () => { cancelled = true }
  }, [voiceMessagesKey])

  // =====================================================
  // CLEANUP
  // =====================================================

  useEffect(() => {
    return () => {
      if (
        recordingTimerRef.current
      ) {
        clearInterval(
          recordingTimerRef.current,
        )
      }

      mediaStreamRef.current
        ?.getTracks()
        .forEach(
          (track) =>
            track.stop(),
        )

      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ''
      }
    }
  }, [])

  // =====================================================
  // OUTSIDE CLICK
  // =====================================================

  useEffect(() => {
    function handleClickOutside(
      event: MouseEvent,
    ) {
      const target =
        event.target as Node

      const picker =
        document.querySelector(
          '[data-reaction-picker]',
        )

      if (
        picker &&
        !picker.contains(target)
      ) {
        setReactionPickerId(
          null,
        )
      }

      if (
        emojiRef.current &&
        !emojiRef.current.contains(
          target,
        )
      ) {
        setShowEmojiPicker(false)
      }
    }

    document.addEventListener(
      'mousedown',
      handleClickOutside,
    )

    return () => {
      document.removeEventListener(
        'mousedown',
        handleClickOutside,
      )
    }
  }, [])

  // =====================================================
  // SEND TEXT
  // =====================================================

  function submit(
    e: FormEvent,
  ) {
    e.preventDefault()

    const text =
      draft.trim()

    if (!text) {
      return
    }

    onSend(text)

    setDraft('')
    setShowEmojiPicker(false)
  }

  // =====================================================
  // IMAGE
  // =====================================================

  function handleImageSelect(
    e: ChangeEvent<HTMLInputElement>,
  ) {
    const file =
      e.target.files?.[0]

    if (!file) {
      return
    }

    if (
      !file.type.startsWith(
        'image/',
      )
    ) {
      alert(
        'Please select an image.',
      )
      return
    }

    void onSendImage?.(file)

    e.target.value = ''
  }

  // =====================================================
  // ENTER
  // =====================================================

  function handleKeyDown(
    e: KeyboardEvent<HTMLTextAreaElement>,
  ) {
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

  // =====================================================
  // EMOJI
  // =====================================================

  function handleEmojiClick(
    emojiData: EmojiClickData,
  ) {
    setDraft(
      (current) => {
        const textarea =
          document.activeElement instanceof
          HTMLTextAreaElement
            ? document.activeElement
            : null

        if (!textarea) {
          return (
            current +
            emojiData.emoji
          )
        }

        const start =
          textarea.selectionStart ??
          current.length

        const end =
          textarea.selectionEnd ??
          current.length

        return (
          current.slice(
            0,
            start,
          ) +
          emojiData.emoji +
          current.slice(end)
        )
      },
    )

    onTyping()
  }

  // =====================================================
  // GET REACTIONS
  // =====================================================

  function getReactions(
    messageId: string,
  ) {
    return (
      messageReactions[
        messageId
      ] ?? []
    )
  }

  // =====================================================
  // HANDLE REACTION
  // =====================================================

  async function handleReaction(
    messageId: string,
    emoji: string,
  ) {
    if (!currentUserId) {
      return
    }

    try {
      const {
        data: existing,
        error: findError,
      } =
        await supabase
          .from(
            'message_reactions',
          )
          .select(
            'id,emoji',
          )
          .eq(
            'message_id',
            messageId,
          )
          .eq(
            'user_id',
            currentUserId,
          )
          .maybeSingle()

      if (findError) {
        console.error(
          'REACTION FIND ERROR:',
          findError,
        )
        return
      }

      if (
        existing?.emoji ===
        emoji
      ) {
        const {
          error,
        } =
          await supabase
            .from(
              'message_reactions',
            )
            .delete()
            .eq(
              'id',
              existing.id,
            )

        if (error) {
          console.error(
            'REACTION DELETE ERROR:',
            error,
          )

          return
        }
      } else if (existing) {
        const {
          error,
        } =
          await supabase
            .from(
              'message_reactions',
            )
            .update({
              emoji,
            })
            .eq(
              'id',
              existing.id,
            )

        if (error) {
          console.error(
            'REACTION UPDATE ERROR:',
            error,
          )

          return
        }
      } else {
        const {
          error,
        } =
          await supabase
            .from(
              'message_reactions',
            )
            .insert({
              message_id:
                messageId,
              user_id:
                currentUserId,
              emoji,
            })

        if (error) {
          console.error(
            'REACTION INSERT ERROR:',
            error,
          )

          return
        }
      }

      setReactionPickerId(
        null,
      )

      await loadReactions()
    } catch (error) {
      console.error(
        'REACTION ERROR:',
        error,
      )
    }
  }

  // =====================================================
  // RECORDING TIME
  // =====================================================

  function formatRecordingTime(
    seconds: number,
  ) {
    const safeSeconds =
      Math.max(
        0,
        Math.floor(seconds),
      )

    const minutes =
      Math.floor(
        safeSeconds / 60,
      )

    const remainingSeconds =
      safeSeconds % 60

    return `${String(
      minutes,
    ).padStart(
      2,
      '0',
    )}:${String(
      remainingSeconds,
    ).padStart(
      2,
      '0',
    )}`
  }

  // =====================================================
  // START RECORDING
  // =====================================================

  async function startRecording() {
    if (!onSendVoice) {
      return
    }

    if (
      typeof window ===
        'undefined' ||
      !navigator.mediaDevices
        ?.getUserMedia
    ) {
      alert(
        'Voice recording is not supported in this browser.',
      )
      return
    }

    try {
      const stream =
        await navigator.mediaDevices.getUserMedia({
          audio: true,
        })

      mediaStreamRef.current =
        stream

      audioChunksRef.current =
        []

      let mimeType = ''

      if (
        MediaRecorder.isTypeSupported(
          'audio/webm;codecs=opus',
        )
      ) {
        mimeType =
          'audio/webm;codecs=opus'
      } else if (
        MediaRecorder.isTypeSupported(
          'audio/webm',
        )
      ) {
        mimeType =
          'audio/webm'
      } else if (
        MediaRecorder.isTypeSupported(
          'audio/mp4',
        )
      ) {
        mimeType =
          'audio/mp4'
      }

      const recorder =
        mimeType
          ? new MediaRecorder(
              stream,
              { mimeType },
            )
          : new MediaRecorder(
              stream,
            )

      mediaRecorderRef.current =
        recorder

      recorder.ondataavailable =
        (event) => {
          if (
            event.data.size > 0
          ) {
            audioChunksRef.current.push(
              event.data,
            )
          }
        }

      recorder.onstop =
        async () => {
          const duration =
            recordingTimeRef.current

          const finalMimeType =
            recorder.mimeType ||
            mimeType ||
            'audio/webm'

          const blob =
            new Blob(
              audioChunksRef.current,
              {
                type:
                  finalMimeType,
              },
            )

          audioChunksRef.current =
            []

          mediaStreamRef.current
            ?.getTracks()
            .forEach(
              (track) =>
                track.stop(),
            )

          mediaStreamRef.current =
            null

          mediaRecorderRef.current =
            null

          if (blob.size === 0) {
            return
          }

          try {
            await onSendVoice(
              blob,
              duration,
            )
          } catch (error) {
            console.error(
              'VOICE SEND ERROR:',
              error,
            )
          }
        }

      recorder.start()

      setIsRecording(true)
      setRecordingTime(0)

      recordingTimeRef.current =
        0

      recordingTimerRef.current =
        setInterval(() => {
          setRecordingTime(
            (current) => {
              const next =
                current + 1

              recordingTimeRef.current =
                next

              return next
            },
          )
        }, 1000)
    } catch (error) {
      console.error(
        'MICROPHONE ERROR:',
        error,
      )

      alert(
        'Microphone permission is required to record voice messages.',
      )
    }
  }

  // =====================================================
  // STOP RECORDING
  // =====================================================

  function stopRecording() {
    if (
      recordingTimerRef.current
    ) {
      clearInterval(
        recordingTimerRef.current,
      )

      recordingTimerRef.current =
        null
    }

    setIsRecording(false)

    const recorder =
      mediaRecorderRef.current

    if (
      recorder &&
      recorder.state !==
        'inactive'
    ) {
      recorder.stop()
    }
  }

  // =====================================================
  // CANCEL RECORDING
  // =====================================================

  function cancelRecording() {
    if (
      recordingTimerRef.current
    ) {
      clearInterval(
        recordingTimerRef.current,
      )

      recordingTimerRef.current =
        null
    }

    const recorder =
      mediaRecorderRef.current

    if (recorder) {
      recorder.ondataavailable =
        null

      recorder.onstop =
        null

      if (
        recorder.state !==
        'inactive'
      ) {
        recorder.stop()
      }
    }

    mediaStreamRef.current
      ?.getTracks()
      .forEach(
        (track) =>
          track.stop(),
      )

    mediaStreamRef.current =
      null

    mediaRecorderRef.current =
      null

    audioChunksRef.current =
      []

    setIsRecording(false)
    setRecordingTime(0)

    recordingTimeRef.current =
      0
  }

  // =====================================================
  // VOICE
  // =====================================================

  function handleVoiceClick() {
    if (isRecording) {
      stopRecording()
    } else {
      void startRecording()
    }
  }

  // =====================================================
  // PLAY VOICE
  // =====================================================

  async function toggleVoice(
    messageId: string,
  ) {
    const url =
      audioUrls[messageId]

    if (!url) {
      return
    }

    if (
      playingId === messageId &&
      audioRef.current
    ) {
      audioRef.current.pause()
      audioRef.current.currentTime =
        0

      setPlayingId(null)
      return
    }

    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime =
        0
      audioRef.current.src = ''
      audioRef.current = null
    }

    const audio =
      new Audio()

    audio.preload = 'auto'
    audio.src = url

    audioRef.current =
      audio

    audio.onplay = () => {
      setPlayingId(messageId)
    }

    audio.onended = () => {
      setPlayingId(null)

      if (
        audioRef.current ===
        audio
      ) {
        audioRef.current =
          null
      }
    }

    audio.onpause = () => {
      if (
        audioRef.current ===
          audio &&
        !audio.ended
      ) {
        setPlayingId(null)
      }
    }

    audio.onerror = () => {
      setPlayingId(null)

      if (
        audioRef.current ===
        audio
      ) {
        audioRef.current =
          null
      }
    }

    try {
      await audio.play()
    } catch (error) {
      console.error(
        'VOICE PLAY FAILED:',
        error,
      )
      setPlayingId(null)
    }
  }

  // =====================================================
  // HEADER
  // =====================================================

  const Icon =
    channel === 'Global'
      ? Globe
      : Hash

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <section className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-background">
      {/* =================================================
          CHAT ATMOSPHERE
      ================================================= */}

      <div
        className="
          pointer-events-none
          absolute inset-0 z-0
          overflow-hidden
        "
        aria-hidden
      >
        <div
          className="
            absolute -left-24 -top-28
            size-72 rounded-full
            opacity-[0.045]
            blur-[100px]
          "
          style={{
            background:
              'var(--primary)',
          }}
        />

        <div
          className="
            absolute -right-20 top-[12%]
            size-64 rounded-full
            opacity-[0.028]
            blur-[90px]
          "
          style={{
            background:
              'var(--creator)',
          }}
        />

        {/* PURPLE DISTANT PLANET */}
        <style>{`
          @keyframes qllose-chat-planet-float {
            0%, 100% { transform: translate3d(0, 0, 0) rotate(-8deg); }
            50% { transform: translate3d(-8px, -12px, 0) rotate(-5deg); }
          }
          @keyframes qllose-chat-ring-glow {
            0%, 100% { opacity: .68; filter: drop-shadow(0 0 8px rgba(174, 112, 255, .42)); }
            50% { opacity: .95; filter: drop-shadow(0 0 15px rgba(174, 112, 255, .68)); }
          }
          @keyframes qllose-chat-planet-clouds {
            0% { transform: translateX(-7%) rotate(-18deg); }
            100% { transform: translateX(7%) rotate(-18deg); }
          }
        `}</style>

        <div
          className="absolute -right-24 top-[28%] h-64 w-64 sm:-right-16 sm:h-80 sm:w-80"
          style={{ animation: 'qllose-chat-planet-float 18s ease-in-out infinite', opacity: 0.78 }}
        >
          {/* soft atmospheric glow */}
          <div
            className="absolute -inset-[24%] rounded-full blur-2xl"
            style={{ background: 'radial-gradient(circle, rgba(158, 91, 255, .32) 0%, rgba(93, 67, 220, .16) 42%, transparent 72%)' }}
          />
          {/* back side of the rings */}
          <div
            className="absolute left-[-28%] top-[42%] h-[25%] w-[156%] rounded-[50%]"
            style={{ border: '8px solid rgba(176, 133, 255, .58)', transform: 'rotate(-19deg)', boxShadow: '0 0 18px rgba(147, 93, 255, .3)', animation: 'qllose-chat-ring-glow 7s ease-in-out infinite' }}
          />
          {/* planet surface */}
          <div
            className="absolute inset-0 overflow-hidden rounded-full"
            style={{
              background: 'radial-gradient(circle at 29% 23%, #f0ddff 0%, #c79aff 9%, #9660f4 24%, #643cc5 43%, #30206d 68%, #090b25 100%)',
              boxShadow: 'inset -28px -12px 42px rgba(4, 3, 24, .7), inset 9px 4px 24px rgba(235, 215, 255, .38), 0 0 34px rgba(146, 83, 255, .23), 0 0 68px rgba(101, 70, 255, .14)',
            }}
          >
            <div className="absolute -left-[18%] top-[22%] h-[13%] w-[140%] rounded-full blur-md" style={{ background: 'linear-gradient(90deg, transparent, rgba(244, 224, 255, .42), rgba(167, 126, 255, .18), transparent)', animation: 'qllose-chat-planet-clouds 24s ease-in-out infinite alternate' }} />
            <div className="absolute -left-[12%] top-[54%] h-[10%] w-[130%] rounded-full blur-md" style={{ background: 'linear-gradient(90deg, transparent, rgba(167, 139, 255, .34), rgba(218, 188, 255, .12), transparent)', animation: 'qllose-chat-planet-clouds 31s ease-in-out infinite alternate-reverse' }} />
            <div className="absolute inset-0 rounded-full" style={{ background: 'linear-gradient(115deg, rgba(255,255,255,.22), transparent 29%, rgba(5,5,28,.68) 83%)' }} />
          </div>
          {/* front side of the rings */}
          <div
            className="absolute left-[-28%] top-[42%] h-[25%] w-[156%] rounded-[50%]"
            style={{ border: '8px solid rgba(219, 194, 255, .78)', clipPath: 'inset(50% 0 0 0)', transform: 'rotate(-19deg)', boxShadow: '0 0 12px rgba(190, 145, 255, .42)', animation: 'qllose-chat-ring-glow 7s ease-in-out infinite' }}
          />
        </div>

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_38%,oklch(0.03_0.02_265_/_0.16)_100%)]" />
      </div>

      {/* =================================================
          HEADER
      ================================================= */}

      <header
        className="
          relative z-20
          flex shrink-0 items-center gap-3
          border-b border-white/[0.055]
          bg-background/60
          px-3.5 py-3
          backdrop-blur-2xl
          sm:px-5
        "
      >
        <button
          type="button"
          onClick={onToggleSidebar}
          className="
            group
            flex size-9 shrink-0
            items-center justify-center
            rounded-xl
            border border-white/[0.055]
            bg-background/25
            text-muted-foreground
            transition-all duration-200
            hover:border-primary/20
            hover:bg-primary/[0.055]
            hover:text-foreground
            active:scale-95
            md:hidden
          "
          aria-label="Open channels"
        >
          <Icon className="size-4 transition-transform duration-300 group-hover:scale-110" />
        </button>

        <div
          className="
            relative flex size-9 shrink-0
            items-center justify-center
            rounded-xl
            border border-primary/15
            bg-primary/[0.055]
            shadow-[0_0_26px_oklch(0.72_0.18_278_/_0.07)]
          "
        >
          <Icon className="size-4 text-primary/85" />

          <span className="absolute -right-0.5 -top-0.5 size-1.5 rounded-full bg-primary shadow-[0_0_8px_currentColor]" />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="truncate text-sm font-semibold tracking-tight">
              {planetName}
            </h2>

            <span
              className="
                hidden rounded-full
                border border-white/[0.055]
                bg-secondary/20
                px-2 py-0.5
                text-[9px]
                font-medium
                uppercase
                tracking-[0.12em]
                text-muted-foreground/60
                sm:inline-flex
              "
            >
              Community
            </span>
          </div>

          <div className="mt-0.5 flex items-center gap-1.5 text-[10px] text-muted-foreground/65 sm:text-[11px]">
            <span className="relative flex size-1.5">
              <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/40" />
              <span className="relative size-1.5 rounded-full bg-emerald-400 shadow-[0_0_7px_rgba(52,211,153,0.45)]" />
            </span>

            <span>
              #{channel}
            </span>
          </div>
        </div>

        <div className="ml-auto hidden items-center gap-2 sm:flex">
          <div className="h-4 w-px bg-border/50" />

          <span className="text-[10px] text-muted-foreground/55">
            {messages.length}{' '}
            {messages.length === 1
              ? 'message'
              : 'messages'}
          </span>
        </div>
      </header>

      {/* =================================================
          MESSAGES
      ================================================= */}

      <div
        ref={scrollRef}
        className="
          cosmic-scrollbar
          relative z-10
          flex-1
          min-h-0
          space-y-1
          overflow-y-auto
          px-2.5 py-4
          sm:px-4 sm:py-5
        "
        onScroll={(event) => {
          const element = event.currentTarget
          shouldAutoScrollRef.current =
            element.scrollHeight - element.scrollTop - element.clientHeight < 120
        }}
      >
        {messages.length === 0 && (
          <div className="flex h-full min-h-56 items-center justify-center px-6">
            <div className="max-w-sm text-center">
              <div
                className="
                  mx-auto flex size-12
                  items-center justify-center
                  rounded-2xl
                  border border-primary/10
                  bg-primary/[0.045]
                  text-primary
                "
              >
                <Sparkles className="size-5" />
              </div>

              <p className="mt-4 text-sm font-medium tracking-tight">
                Your conversation starts here.
              </p>

              <p className="mt-1.5 text-xs leading-5 text-muted-foreground/60">
                Say something and start the first conversation in #{channel}.
              </p>
            </div>
          </div>
        )}

        {messages.map((m, index) => {
          const canDelete =
            isFounder ||
            m.user_id ===
              currentUserId

          const isVoice =
            m.message_type ===
            'voice'

          const isImage =
            m.message_type ===
            'image'

          const voiceUrl =
            audioUrls[m.id]

          const isPlaying =
            playingId === m.id

          const reactions =
            getReactions(m.id)

          const myReaction =
            reactions.find(
              (reaction) =>
                reaction.reactedByMe,
            )?.emoji ?? null

          const hasReaction =
            Boolean(
              myReaction,
            )

          return (
            <article
              key={m.id}
              className="
                group/message
                relative
                animate-message-in
                rounded-2xl
                px-2 py-2.5
                transition-all
                duration-200
                sm:px-3
              "
              style={{
                animationDelay:
                  `${Math.min(
                    index * 12,
                    120,
                  )}ms`,
              }}
            >
              {/* subtle message glow */}

              <div
                className={`
                  pointer-events-none
                  absolute inset-0
                  rounded-2xl
                  transition-all duration-300
                  bg-transparent
                  group-hover/message:bg-white/[0.017]
                  group-hover/message:shadow-[inset_0_1px_0_oklch(1_0_0_/_0.025)]
                `}
              />

              <div className="relative flex gap-3">
                {/* AVATAR */}

                <div className="relative shrink-0 pt-0.5">
                  <div
                    className={`
                      rounded-full
                      transition-all duration-300
                      group-hover/message:shadow-[0_0_20px_oklch(0.72_0.18_278_/_0.10)]
                    `}
                  >
                    <Avatar
                      image={
                        m.avatar_url ??
                        undefined
                      }
                      initials={
                        m.initials
                      }
                      color={
                        m.color
                      }
                    />
                  </div>

                  <span
                    className={`
                      absolute -bottom-0.5 -right-0.5
                      size-2.5
                      rounded-full
                      border-2 border-background
                      bg-emerald-400
                      shadow-[0_0_8px_rgba(52,211,153,0.35)]
                      transition-all duration-200
                      opacity-0
                      group-hover/message:scale-110
                      group-hover/message:opacity-100
                    `}
                  />
                </div>

                <div className="min-w-0 flex-1">
                  {/* MESSAGE HEADER */}

                  <div className="mb-1 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                    <span
                      className={`
                        text-sm
                        font-semibold
                        tracking-tight
                        transition-colors
                        duration-200
                        text-foreground
                        group-hover/message:text-primary/95
                      `}
                    >
                      {m.author}
                    </span>

                    <span className="text-[10px] text-muted-foreground/45">
                      {m.time}
                    </span>
                  </div>

                  {/* IMAGE */}

                  {isImage ? (
                    <div className="mt-2 max-w-full overflow-hidden">
                      <div
                        className={`
                          relative inline-block
                          overflow-hidden
                          rounded-2xl
                          border
                          bg-secondary/[0.08]
                          transition-all duration-300
                          border-border/60 shadow-sm
                          group-hover/message:border-primary/20
                          group-hover/message:shadow-[0_18px_50px_oklch(0.02_0.015_265_/_0.28)]
                        `}
                      >
                        <img
                          src={m.text}
                          alt="Shared image"
                          className="
                            max-h-[26rem]
                            max-w-[min(100%,28rem)]
                            rounded-[calc(1rem-1px)]
                            object-contain
                            transition-transform
                            duration-500
                            ease-out
                            hover:scale-[1.012]
                          "
                          loading="lazy"
                        />

                        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,transparent_30%,oklch(1_0_0_/_0.045),transparent_70%)] opacity-0 transition-opacity duration-500 hover:opacity-100" />
                      </div>
                    </div>
                  ) : isVoice ? (
                    /* =================================================
                       VOICE
                    ================================================= */

                    <div
                      className={`
                        mt-2
                        flex
                        max-w-md
                        items-center
                        gap-3
                        rounded-2xl
                        border
                        px-3 py-2.5
                        backdrop-blur-xl
                        transition-all duration-300
                        ${
                          isPlaying
                            ? 'border-primary/30 bg-primary/[0.07] shadow-[0_0_32px_oklch(0.72_0.18_278_/_0.08)]'
                            : 'border-border/60 bg-secondary/[0.20] group-hover/message:border-primary/12 group-hover/message:bg-secondary/[0.36]'
                        }
                      `}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          void toggleVoice(
                            m.id,
                          )
                        }
                        disabled={
                          !voiceUrl
                        }
                        aria-label={
                          isPlaying
                            ? 'Pause voice message'
                            : 'Play voice message'
                        }
                        className={`
                          relative flex
                          size-10 shrink-0
                          items-center
                          justify-center
                          rounded-full
                          bg-primary
                          text-primary-foreground
                          shadow-[0_0_20px_oklch(0.72_0.18_278_/_0.16)]
                          transition-all duration-200
                          hover:scale-105
                          hover:shadow-[0_0_26px_oklch(0.72_0.18_278_/_0.22)]
                          active:scale-95
                          disabled:cursor-not-allowed
                          disabled:opacity-40
                          ${
                            isPlaying
                              ? 'ring-4 ring-primary/10'
                              : ''
                          }
                        `}
                      >
                        {isPlaying && (
                          <span className="absolute inset-0 animate-ping rounded-full bg-primary/15" />
                        )}

                        <span className="relative">
                          {isPlaying ? (
                            <Pause className="size-4" />
                          ) : (
                            <Play className="ml-0.5 size-4 fill-current" />
                          )}
                        </span>
                      </button>

                      <div className="min-w-0 flex-1">
                        <div className="flex h-7 items-center gap-1 overflow-hidden">
                          {Array.from({
                            length: 30,
                          }).map(
                            (_, index) => (
                              <span
                                key={
                                  index
                                }
                                className={`
                                  w-1 shrink-0
                                  rounded-full
                                  transition-all
                                  duration-300
                                  ${
                                    isPlaying
                                      ? 'bg-primary animate-waveform'
                                      : 'bg-primary/40'
                                  }
                                  ${
                                    index % 5 ===
                                    0
                                      ? 'h-6'
                                      : index % 4 ===
                                          0
                                        ? 'h-4'
                                        : index % 3 ===
                                            0
                                          ? 'h-3'
                                          : 'h-2'
                                  }
                                `}
                                style={{
                                  animationDelay:
                                    `${index * 45}ms`,
                                }}
                              />
                            ),
                          )}
                        </div>

                        <div className="mt-1 flex items-center justify-between gap-3">
                          <span className="text-[10px] font-medium text-muted-foreground/75">
                            {typeof m.audio_duration ===
                              'number' &&
                            m.audio_duration >
                              0
                              ? formatRecordingTime(
                                  Math.round(
                                    m.audio_duration,
                                  ),
                                )
                              : 'Voice message'}
                          </span>

                          {isPlaying && (
                            <span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-primary/75">
                              playing
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* =================================================
                       TEXT
                    ================================================= */

                    <p className="max-w-3xl whitespace-pre-wrap break-words text-sm leading-6 text-foreground/90">
                      {m.text}
                    </p>
                  )}

                  {/* REACTIONS */}

                  {reactions.length >
                    0 && (
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      {reactions.map(
                        (reaction) => (
                          <button
                            key={
                              reaction.emoji
                            }
                            type="button"
                            onClick={() =>
                              void handleReaction(
                                m.id,
                                reaction.emoji,
                              )
                            }
                            className={`
                              group/reaction
                              inline-flex
                              h-7
                              items-center
                              gap-1.5
                              rounded-full
                              border
                              px-2.5
                              text-xs
                              backdrop-blur-sm
                              transition-all duration-200
                              hover:-translate-y-0.5
                              hover:scale-[1.015]
                              active:scale-95
                              ${
                                reaction.reactedByMe
                                  ? 'border-primary/45 bg-primary/12 shadow-[0_0_16px_oklch(0.72_0.18_278_/_0.08)]'
                                  : 'border-border/65 bg-secondary/30 hover:border-primary/25 hover:bg-primary/[0.07]'
                              }
                            `}
                            title={
                              reaction.reactedByMe
                                ? 'Remove reaction'
                                : 'React'
                            }
                          >
                            <span className="text-sm transition-transform duration-200 group-hover/reaction:scale-110">
                              {
                                reaction.emoji
                              }
                            </span>

                            <span className="font-medium text-muted-foreground/80">
                              {
                                reaction.count
                              }
                            </span>
                          </button>
                        ),
                      )}
                    </div>
                  )}
                </div>

                {/* =================================================
                    MESSAGE TOOLBAR
                ================================================= */}

                <div
                  className={`
                    absolute right-1 top-[-8px]
                    z-30
                    transition-all
                    duration-200
                    sm:right-2
                    pointer-events-none translate-y-1 opacity-0
                    group-hover/message:pointer-events-auto
                    group-hover/message:translate-y-0
                    group-hover/message:opacity-100
                    group-focus-within/message:pointer-events-auto
                    group-focus-within/message:translate-y-0
                    group-focus-within/message:opacity-100
                  `}
                >
                  <div
                    className="
                      flex items-center
                      gap-0.5
                      rounded-xl
                      border border-white/[0.07]
                      bg-background/92
                      p-1
                      shadow-[0_18px_45px_-20px_rgba(0,0,0,0.9)]
                      backdrop-blur-2xl
                    "
                    data-reaction-picker
                  >
                    {/* HEART */}

                    <button
                      type="button"
                      disabled={
                        hasReaction
                      }
                      onClick={() =>
                        void handleReaction(
                          m.id,
                          '❤️',
                        )
                      }
                      className="
                        flex size-8
                        items-center justify-center
                        rounded-lg
                        text-muted-foreground
                        transition-all duration-150
                        hover:scale-105
                        hover:bg-secondary
                        hover:text-foreground
                        active:scale-95
                        disabled:cursor-not-allowed
                        disabled:opacity-30
                      "
                      title={
                        hasReaction
                          ? `You already reacted with ${myReaction}`
                          : 'React ❤️'
                      }
                      aria-label="React with heart"
                    >
                      ❤️
                    </button>

                    {/* REACTIONS */}

                    <div className="relative">
                      <button
                        type="button"
                        disabled={
                          hasReaction
                        }
                        onClick={() =>
                          setReactionPickerId(
                            reactionPickerId ===
                              m.id
                              ? null
                              : m.id,
                          )
                        }
                        className={`
                          flex size-8
                          items-center justify-center
                          rounded-lg
                          transition-all duration-150
                          hover:scale-105
                          active:scale-95
                          ${
                            reactionPickerId ===
                            m.id
                              ? 'bg-primary/10 text-primary'
                              : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                          }
                          disabled:cursor-not-allowed
                          disabled:opacity-30
                        `}
                        title={
                          hasReaction
                            ? `You already reacted with ${myReaction}`
                            : 'More reactions'
                        }
                        aria-label="More reactions"
                      >
                        <Smile className="size-4" />
                      </button>

                      {reactionPickerId ===
                        m.id &&
                        !hasReaction && (
                        <div className="absolute right-0 top-full z-50 mt-2 flex origin-top-right animate-in fade-in zoom-in-95 slide-in-from-top-1 items-center gap-0.5 rounded-2xl border border-white/[0.07] bg-background/96 p-1.5 shadow-2xl backdrop-blur-2xl duration-150">
                          {REACTION_EMOJIS.map(
                            (emoji) => (
                              <button
                                key={
                                  emoji
                                }
                                type="button"
                                onClick={() =>
                                  void handleReaction(
                                    m.id,
                                    emoji,
                                  )
                                }
                                className="
                                  flex size-9
                                  items-center
                                  justify-center
                                  rounded-xl
                                  text-lg
                                  transition-all
                                  duration-150
                                  hover:-translate-y-0.5
                                  hover:scale-110
                                  hover:bg-secondary
                                  active:scale-95
                                "
                                aria-label={`React ${emoji}`}
                              >
                                {emoji}
                              </button>
                            ),
                          )}
                        </div>
                      )}
                    </div>

                    {/* COPY */}

                    {!isVoice &&
                      !isImage &&
                      m.text && (
                        <button
                          type="button"
                          onClick={() =>
                            void navigator.clipboard?.writeText(
                              m.text,
                            )
                          }
                          className="
                            flex size-8
                            items-center
                            justify-center
                            rounded-lg
                            text-muted-foreground
                            transition-all duration-150
                            hover:scale-105
                            hover:bg-secondary
                            hover:text-foreground
                            active:scale-95
                          "
                          title="Copy message"
                          aria-label="Copy message"
                        >
                          <Copy className="size-3.5" />
                        </button>
                      )}

                    {/* DELETE */}

                    {canDelete && (
                      <>
                        <div className="mx-0.5 h-5 w-px bg-border/60" />

                        <button
                          type="button"
                          onClick={() =>
                            onDeleteMessage?.(
                              m.id,
                            )
                          }
                          className="
                            flex size-8
                            items-center
                            justify-center
                            rounded-lg
                            text-muted-foreground
                            transition-all duration-150
                            hover:scale-105
                            hover:bg-red-500/10
                            hover:text-red-400
                            active:scale-95
                          "
                          title="Delete message"
                          aria-label="Delete message"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </article>
          )
        })}

        {/* =================================================
            TYPING
        ================================================= */}

        {typingUsers.length >
          0 && (
          <div className="animate-fade-up-soft flex items-center gap-2 px-3 py-2">
            <div className="flex items-center gap-1.5 rounded-full border border-primary/10 bg-primary/[0.04] px-2.5 py-1.5">
              <span className="flex items-end gap-[3px]">
                <span className="size-1.5 animate-bounce rounded-full bg-primary/80" />
                <span className="size-1.5 animate-bounce rounded-full bg-primary/55 [animation-delay:120ms]" />
                <span className="size-1.5 animate-bounce rounded-full bg-primary/35 [animation-delay:240ms]" />
              </span>

              <span className="text-[10px] text-muted-foreground/70">
                {typingUsers.join(
                  ', ',
                )}{' '}
                typing…
              </span>
            </div>
          </div>
        )}
      </div>

      {/* =================================================
          COMPOSER
      ================================================= */}

      <form
        onSubmit={submit}
        className="
          relative z-20
          shrink-0
          px-2.5
          pb-3
          pt-2
          sm:px-4
          sm:pb-4
        "
      >
        {showEmojiPicker && (
          <div
            ref={emojiRef}
            className="
              absolute
              bottom-[calc(100%-0.25rem)]
              right-2.5
              z-50
              mb-2
              overflow-hidden
              rounded-2xl
              border border-white/[0.07]
              shadow-2xl
              animate-in
              fade-in
              slide-in-from-bottom-2
              zoom-in-95
              duration-150
              sm:right-4
            "
          >
            <EmojiPicker
              onEmojiClick={
                handleEmojiClick
              }
              theme={
                'dark' as any
              }
              width={320}
              height={400}
              lazyLoadEmojis
            />
          </div>
        )}

        {/* composer aura */}

        <div
          className={`
            pointer-events-none
            absolute
            inset-x-3
            bottom-0
            h-24
            rounded-[2rem]
            bg-primary/[0.035]
            blur-3xl
            transition-opacity duration-300
            ${
              isComposerFocused
                ? 'opacity-100'
                : 'opacity-0'
            }
            sm:inset-x-5
          `}
        />

        <div
          className={`
            relative overflow-hidden
            rounded-[1.35rem]
            border
            px-2.5 py-2
            backdrop-blur-2xl
            transition-all duration-300
            sm:px-3
            ${
              isComposerFocused
                ? 'border-primary/25 bg-secondary/[0.23] shadow-[0_16px_45px_oklch(0.02_0.015_265_/_0.24),0_0_28px_oklch(0.72_0.18_278_/_0.05)]'
                : 'border-white/[0.07] bg-secondary/[0.14] shadow-[0_12px_35px_oklch(0.02_0.015_265_/_0.15)]'
            }
          `}
        >
          {/* composer top line */}

          <div
            className={`
              pointer-events-none
              absolute inset-x-6 top-0 h-px
              transition-opacity duration-300
              ${
                isComposerFocused
                  ? 'opacity-100'
                  : 'opacity-25'
              }
            `}
            style={{
              background:
                'linear-gradient(90deg, transparent, var(--primary), transparent)',
            }}
          />

          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={
              handleImageSelect
            }
          />

          {isRecording ? (
            /* =================================================
               RECORDING
            ================================================= */

            <div className="flex min-w-0 items-center gap-3">
              <span className="relative flex size-8 shrink-0 items-center justify-center rounded-full bg-red-500/10">
                <span className="absolute inset-1 animate-ping rounded-full bg-red-500/20" />

                <span className="relative size-2 rounded-full bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.6)]" />
              </span>

              <span className="shrink-0 font-mono text-sm font-semibold tabular-nums text-red-400">
                {formatRecordingTime(
                  recordingTime,
                )}
              </span>

              <div className="flex min-w-0 flex-1 items-center gap-1 overflow-hidden">
                {Array.from({
                  length: 24,
                }).map(
                  (_, index) => (
                    <span
                      key={
                        index
                      }
                      className={`
                        w-1 shrink-0
                        rounded-full
                        bg-red-400/60
                        animate-recording-wave
                        ${
                          index % 3 ===
                          0
                            ? 'h-5'
                            : index % 2 ===
                                0
                              ? 'h-3'
                              : 'h-2'
                        }
                      `}
                      style={{
                        animationDelay:
                          `${index * 50}ms`,
                      }}
                    />
                  ),
                )}
              </div>

              <button
                type="button"
                onClick={
                  cancelRecording
                }
                aria-label="Cancel recording"
                className="
                  flex size-9 shrink-0
                  items-center justify-center
                  rounded-xl
                  text-muted-foreground
                  transition-all duration-200
                  hover:bg-secondary
                  hover:text-foreground
                  active:scale-95
                "
              >
                <X className="size-4" />
              </button>

              <button
                type="button"
                onClick={
                  stopRecording
                }
                aria-label="Send voice message"
                className="
                  flex size-9 shrink-0
                  items-center justify-center
                  rounded-xl
                  bg-primary
                  text-primary-foreground
                  shadow-[0_0_20px_oklch(0.72_0.18_278_/_0.18)]
                  transition-all duration-200
                  hover:scale-105
                  active:scale-95
                "
              >
                <Send className="size-4" />
              </button>
            </div>
          ) : (
            <>
              {/* IMAGE */}

              <button
                type="button"
                aria-label="Add photo"
                onClick={() =>
                  imageInputRef.current?.click()
                }
                className="
                  flex size-9 shrink-0
                  items-center justify-center
                  rounded-xl
                  text-muted-foreground
                  transition-all duration-200
                  hover:scale-105
                  hover:bg-secondary
                  hover:text-foreground
                  active:scale-95
                "
              >
                <Plus className="size-5" />
              </button>

              {/* TEXT */}

              <textarea
                value={draft}
                onFocus={() =>
                  setIsComposerFocused(
                    true,
                  )
                }
                onBlur={() =>
                  setIsComposerFocused(
                    false,
                  )
                }
                onChange={(e) => {
                  setDraft(
                    e.target.value,
                  )
                  onTyping()
                }}
                onKeyDown={
                  handleKeyDown
                }
                rows={1}
                placeholder={`Message #${channel}`}
                className="
                  max-h-32
                  min-h-9
                  flex-1
                  resize-none
                  bg-transparent
                  px-1
                  py-1.5
                  text-sm
                  leading-5
                  text-foreground
                  outline-none
                  placeholder:text-muted-foreground/40
                "
                aria-label={`Message #${channel}`}
              />

              {/* EMOJI */}

              <button
                type="button"
                aria-label="Add emoji"
                onClick={() =>
                  setShowEmojiPicker(
                    (current) =>
                      !current,
                  )
                }
                className={`
                  flex size-9 shrink-0
                  items-center justify-center
                  rounded-xl
                  transition-all duration-200
                  active:scale-95
                  ${
                    showEmojiPicker
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:scale-105 hover:bg-secondary hover:text-foreground'
                  }
                `}
              >
                <Smile className="size-5" />
              </button>

              {/* MIC */}

              <button
                type="button"
                aria-label="Record voice"
                onClick={
                  handleVoiceClick
                }
                className="
                  flex size-9 shrink-0
                  items-center justify-center
                  rounded-xl
                  text-muted-foreground
                  transition-all duration-200
                  hover:scale-105
                  hover:bg-secondary
                  hover:text-foreground
                  active:scale-95
                "
              >
                <Mic className="size-5" />
              </button>

              {/* SEND */}

              <button
                type="submit"
                disabled={
                  !draft.trim()
                }
                className="
                  group/send
                  relative
                  flex size-9 shrink-0
                  items-center justify-center
                  overflow-hidden
                  rounded-xl
                  bg-primary
                  text-primary-foreground
                  shadow-[0_0_20px_oklch(0.72_0.18_278_/_0.14)]
                  transition-all duration-200
                  hover:scale-105
                  hover:shadow-[0_0_28px_oklch(0.72_0.18_278_/_0.22)]
                  active:scale-95
                  disabled:cursor-not-allowed
                  disabled:opacity-25
                  disabled:hover:scale-100
                "
              >
                <span
                  className="
                    absolute inset-y-0
                    -left-full
                    w-1/2
                    skew-x-[-20deg]
                    bg-white/15
                    transition-all duration-700
                    group-hover/send:left-[130%]
                  "
                />

                <Send className="relative size-4 transition-transform duration-200 group-hover/send:translate-x-0.5" />
              </button>
            </>
          )}
        </div>
      </form>
    </section>
  )
}