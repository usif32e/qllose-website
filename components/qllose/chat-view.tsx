'use client'

import { useEffect, useRef, useState } from 'react'
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

  // =====================================================
  // AUTO SCROLL
  // =====================================================

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    })
  }, [messages, typingUsers])

  // =====================================================
  // GROUP REACTIONS
  // =====================================================

  function groupReactions(
    rows: ChatReactionRow[],
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
          currentUserId
        ) {
          existing.reactedByMe = true
        }
      } else {
        grouped[row.message_id].push({
          emoji: row.emoji,
          count: 1,
          reactedByMe:
            row.user_id ===
            currentUserId,
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

  // =====================================================
  // LOAD REACTIONS ON MESSAGE CHANGE
  // =====================================================

  useEffect(() => {
    let cancelled = false

    async function run() {
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
  }, [
    messages,
    currentUserId,
  ])

  // =====================================================
  // REALTIME REACTIONS
  // =====================================================

  useEffect(() => {
    if (
      messages.length === 0
    ) {
      return
    }


const reactionChannel =
  supabase
    .channel(
      `message-reactions-${channel}-${crypto.randomUUID()}`,
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'message_reactions',
      },
      async () => {
        await loadReactions()
      },
    )
    .subscribe()
    
    return () => {
      supabase.removeChannel(
        reactionChannel,
      )
    }
  }, [
    channel,
    messages,
    currentUserId,
  ])

  // =====================================================
  // LOAD SIGNED VOICE URLS
  // =====================================================

  useEffect(() => {
    let cancelled = false

    async function loadVoiceUrls() {
      const voiceMessages =
        messages.filter(
          (message) =>
            message.message_type ===
              'voice' &&
            Boolean(
              message.audio_path,
            ),
        )

      if (
        voiceMessages.length === 0
      ) {
        setAudioUrls({})
        return
      }

      const nextUrls: Record<
        string,
        string
      > = {}

      for (const message of voiceMessages) {
        const audioPath =
          message.audio_path

        if (!audioPath) {
          continue
        }

        try {
          const {
            data,
            error,
          } =
            await supabase.storage
              .from(
                'voice-messages',
              )
              .createSignedUrl(
                audioPath,
                60 * 60,
              )

          if (error) {
            console.error(
              'VOICE SIGNED URL ERROR:',
              error,
            )
            continue
          }

          if (
            !data?.signedUrl
          ) {
            continue
          }

          nextUrls[
            message.id
          ] = data.signedUrl
        } catch (error) {
          console.error(
            'VOICE URL ERROR:',
            error,
          )
        }
      }

      if (!cancelled) {
        setAudioUrls(nextUrls)
      }
    }

    loadVoiceUrls()

    return () => {
      cancelled = true
    }
  }, [messages])

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

      // Same emoji = remove it
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
      }

      // Different emoji = replace it
      else if (existing) {
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
      }

      // First reaction
      else {
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
    <section className="flex min-h-0 flex-1 flex-col overflow-hidden bg-background">

      {/* HEADER */}

      <div className="relative flex items-center gap-3 border-b border-border/60 bg-background/80 px-4 py-3 backdrop-blur-xl sm:px-5">

        <div className="flex size-9 items-center justify-center rounded-xl border border-border/60 bg-secondary/40 shadow-sm">
          <Icon className="size-4 text-muted-foreground" />
        </div>

        <div className="min-w-0">
          <h2 className="truncate text-sm font-semibold tracking-tight">
            {planetName}
          </h2>

          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <span className="size-1.5 rounded-full bg-emerald-400" />

            <span>
              #{channel}
            </span>
          </div>
        </div>

        <div className="ml-auto hidden text-[11px] text-muted-foreground sm:block">
          {messages.length}{' '}
          {messages.length === 1
            ? 'message'
            : 'messages'}
        </div>
      </div>

      {/* MESSAGES */}

      <div
        ref={scrollRef}
        className="scrollbar-thin flex-1 space-y-1 overflow-y-auto px-3 py-5 sm:px-5"
      >
        {messages.map((m) => {
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
            <div
              key={m.id}
              className="group relative flex gap-3 rounded-2xl px-2 py-2.5 transition-colors duration-200 hover:bg-secondary/[0.035] sm:px-3"
            >

              {/* AVATAR */}

              <div className="relative shrink-0">
                <Avatar
                  image={
                    m.avatar_url ??
                    undefined
                  }
                  initials={
                    m.initials
                  }
                  color={m.color}
                />

                <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-background bg-emerald-400 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
              </div>

              <div className="min-w-0 flex-1">

                {/* HEADER */}

                <div className="mb-0.5 flex items-baseline gap-2">
                  <span className="text-sm font-semibold tracking-tight">
                    {m.author}
                  </span>

                  <span className="text-[10px] text-muted-foreground/60">
                    {m.time}
                  </span>
                </div>

                {/* CONTENT */}

                {isImage ? (
                  <div className="mt-2 overflow-hidden rounded-2xl">
                    <img
                      src={m.text}
                      alt="Shared image"
                      className="max-h-96 max-w-sm rounded-2xl border border-border/60 object-contain shadow-sm transition-transform duration-300 group-hover:scale-[1.005]"
                      loading="lazy"
                    />
                  </div>
                ) : isVoice ? (
                  <div className="mt-2 flex max-w-md items-center gap-3 rounded-2xl border border-border/60 bg-secondary/30 px-3 py-2.5 shadow-sm transition-colors duration-200 hover:border-border hover:bg-secondary/45">

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
                      className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition-transform duration-200 hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {isPlaying ? (
                        <Pause className="size-4" />
                      ) : (
                        <Play className="ml-0.5 size-4 fill-current" />
                      )}
                    </button>

                    <div className="min-w-0 flex-1">
                      <div className="flex h-6 items-center gap-1 overflow-hidden">
                        {Array.from({
                          length: 28,
                        }).map(
                          (_, index) => (
                            <span
                              key={
                                index
                              }
                              className={`w-1 shrink-0 rounded-full transition-all duration-300 ${
                                isPlaying
                                  ? 'bg-primary'
                                  : 'bg-primary/50'
                              } ${
                                index % 4 ===
                                0
                                  ? 'h-5'
                                  : index % 3 ===
                                      0
                                    ? 'h-3'
                                    : 'h-2'
                              }`}
                            />
                          ),
                        )}
                      </div>

                      <span className="mt-1 block text-[10px] text-muted-foreground">
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
                    </div>
                  </div>
                ) : (
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
                          className={`group/reaction inline-flex h-7 items-center gap-1.5 rounded-full border px-2.5 text-xs shadow-sm backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 ${
                            reaction.reactedByMe
                              ? 'border-primary/50 bg-primary/15'
                              : 'border-border/70 bg-secondary/35 hover:border-primary/30 hover:bg-primary/10'
                          }`}
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

                          <span className="font-medium text-muted-foreground">
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
                  HOVER TOOLBAR — ONLY PLACE FOR PICKER
              ================================================= */}

              <div
                className="absolute right-2 -top-1 z-30"
                data-reaction-picker
              >
                <div className="flex translate-y-1 items-center gap-0.5 rounded-xl border border-border/70 bg-background/95 p-1 opacity-0 shadow-xl backdrop-blur-xl transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100">

                  {/* QUICK HEART */}

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
                    className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-all duration-150 hover:bg-secondary hover:scale-105 disabled:cursor-not-allowed disabled:opacity-30"
                    title={
                      hasReaction
                        ? `You already reacted with ${myReaction}`
                        : 'React ❤️'
                    }
                    aria-label="React with heart"
                  >
                    ❤️
                  </button>

                  {/* MORE */}

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
                      className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-all duration-150 hover:bg-secondary hover:text-foreground hover:scale-105 disabled:cursor-not-allowed disabled:opacity-30"
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
                      <div className="absolute right-0 top-full z-50 mt-2 flex origin-top-right items-center gap-0.5 rounded-2xl border border-border/70 bg-background/95 p-1.5 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
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
                              className="flex size-9 items-center justify-center rounded-xl text-lg transition-all duration-150 hover:-translate-y-0.5 hover:bg-secondary hover:scale-110"
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
                        className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-all duration-150 hover:bg-secondary hover:text-foreground hover:scale-105"
                        title="Copy message"
                        aria-label="Copy message"
                      >
                        <span className="text-xs">
                          ⧉
                        </span>
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
                        className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-all duration-150 hover:bg-red-500/10 hover:text-red-400 hover:scale-105"
                        title="Delete message"
                        aria-label="Delete message"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )
        })}

        {/* TYPING */}

        {typingUsers.length >
          0 && (
          <div className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-0.5">
              <span className="size-1 rounded-full bg-muted-foreground/70 animate-pulse" />
              <span className="size-1 rounded-full bg-muted-foreground/70 animate-pulse [animation-delay:150ms]" />
              <span className="size-1 rounded-full bg-muted-foreground/70 animate-pulse [animation-delay:300ms]" />
            </span>

            <span>
              {typingUsers.join(
                ', ',
              )}{' '}
              typing…
            </span>
          </div>
        )}
      </div>

      {/* COMPOSER */}

      <form
        onSubmit={submit}
        className="px-3 pb-4 pt-2 sm:px-5 sm:pb-5"
      >
        <div className="relative">

          {showEmojiPicker && (
            <div
              ref={emojiRef}
              className="absolute bottom-full right-0 z-50 mb-2 overflow-hidden rounded-2xl border border-border/70 shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-150"
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

          <div className="group/composer flex items-end gap-1.5 rounded-2xl border border-border/70 bg-secondary/[0.18] px-2.5 py-2 shadow-sm backdrop-blur-xl transition-all duration-200 focus-within:border-primary/30 focus-within:bg-secondary/[0.25] focus-within:shadow-lg sm:px-3">

            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={
                handleImageSelect
              }
            />

            <button
              type="button"
              aria-label="Add photo"
              onClick={() =>
                imageInputRef.current?.click()
              }
              className="flex size-9 shrink-0 items-center justify-center rounded-xl text-muted-foreground transition-all duration-200 hover:bg-secondary hover:text-foreground hover:scale-105"
            >
              <Plus className="size-5" />
            </button>

            {isRecording ? (
              <div className="flex min-w-0 flex-1 items-center gap-3">

                <span className="size-2 shrink-0 animate-pulse rounded-full bg-red-500" />

                <span className="shrink-0 text-sm font-medium tabular-nums text-red-400">
                  {formatRecordingTime(
                    recordingTime,
                  )}
                </span>

                <div className="flex flex-1 items-center gap-1 overflow-hidden">
                  {Array.from({
                    length: 24,
                  }).map(
                    (_, index) => (
                      <span
                        key={
                          index
                        }
                        className={`w-1 shrink-0 rounded-full bg-red-500/60 ${
                          index % 3 ===
                          0
                            ? 'h-5'
                            : index % 2 ===
                                0
                              ? 'h-3'
                              : 'h-2'
                        }`}
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
                  className="flex size-9 shrink-0 items-center justify-center rounded-xl text-muted-foreground transition-all duration-200 hover:bg-secondary hover:text-foreground hover:scale-105"
                >
                  <X className="size-4" />
                </button>

                <button
                  type="button"
                  onClick={
                    stopRecording
                  }
                  aria-label="Send voice message"
                  className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm transition-all duration-200 hover:scale-105"
                >
                  <Send className="size-4" />
                </button>
              </div>
            ) : (
              <>
                <textarea
                  value={draft}
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
                  className="max-h-32 min-h-9 flex-1 resize-none bg-transparent px-1 py-1.5 text-sm leading-5 outline-none placeholder:text-muted-foreground/50"
                />

                <button
                  type="button"
                  aria-label="Add emoji"
                  onClick={() =>
                    setShowEmojiPicker(
                      (current) =>
                        !current,
                    )
                  }
                  className={`flex size-9 shrink-0 items-center justify-center rounded-xl transition-all duration-200 ${
                    showEmojiPicker
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                  }`}
                >
                  <Smile className="size-5" />
                </button>

                <button
                  type="button"
                  aria-label="Record voice"
                  onClick={
                    handleVoiceClick
                  }
                  className="flex size-9 shrink-0 items-center justify-center rounded-xl text-muted-foreground transition-all duration-200 hover:bg-secondary hover:text-foreground"
                >
                  <Mic className="size-5" />
                </button>

                <button
                  type="submit"
                  disabled={
                    !draft.trim()
                  }
                  className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm transition-all duration-200 hover:scale-105 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:scale-100"
                >
                  <Send className="size-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </form>
    </section>
  )
}