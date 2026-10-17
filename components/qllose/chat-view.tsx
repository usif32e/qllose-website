
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
  onSendVoice?: (audioBlob: Blob, duration: number) => Promise<void>
  onSendImage?: (file: File) => Promise<void>
  onTyping: () => void
  onDeleteMessage?: (id: string) => void
  currentUserId?: string
  isFounder?: boolean
  onToggleSidebar: () => void
}

const REACTION_EMOJIS = ['❤️', '😂', '😭', '😡', '😮', '👍']

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
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [audioUrls, setAudioUrls] = useState<Record<string, string>>({})
  const [reactionPickerId, setReactionPickerId] = useState<string | null>(null)
  const [messageReactions, setMessageReactions] = useState<Record<string, Reaction[]>>({})
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null)
  const [isComposerFocused, setIsComposerFocused] = useState(false)

  const imageInputRef = useRef<HTMLInputElement | null>(null)
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const emojiRef = useRef<HTMLDivElement | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const recordingTimeRef = useRef(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // AUTO SCROLL
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    })
  }, [messages, typingUsers])

  // GROUP REACTIONS
  function groupReactions(rows: ChatReactionRow[]) {
    const grouped: Record<string, Reaction[]> = {}

    for (const row of rows) {
      if (!grouped[row.message_id]) {
        grouped[row.message_id] = []
      }

      const existing = grouped[row.message_id].find(
        (reaction) => reaction.emoji === row.emoji,
      )

      if (existing) {
        existing.count += 1
        if (row.user_id === currentUserId) {
          existing.reactedByMe = true
        }
      } else {
        grouped[row.message_id].push({
          emoji: row.emoji,
          count: 1,
          reactedByMe: row.user_id === currentUserId,
        })
      }
    }

    return grouped
  }

  // LOAD REACTIONS
  async function loadReactions() {
    const messageIds = messages.map((message) => message.id)

    if (messageIds.length === 0) {
      setMessageReactions({})
      return
    }

    const { data, error } = await supabase
      .from('message_reactions')
      .select('id,message_id,user_id,emoji,created_at')
      .in('message_id', messageIds)

    if (error) {
      console.error('REACTIONS LOAD ERROR:', error)
      return
    }

    setMessageReactions(groupReactions((data || []) as ChatReactionRow[]))
  }

  // LOAD REACTIONS ON MESSAGE CHANGE
  useEffect(() => {
    let cancelled = false

    async function run() {
      const messageIds = messages.map((message) => message.id)

      if (messageIds.length === 0) {
        setMessageReactions({})
        return
      }

      const { data, error } = await supabase
        .from('message_reactions')
        .select('id,message_id,user_id,emoji,created_at')
        .in('message_id', messageIds)

      if (error || cancelled) {
        if (error) {
          console.error('REACTIONS LOAD ERROR:', error)
        }
        return
      }

      setMessageReactions(groupReactions((data || []) as ChatReactionRow[]))
    }

    run()

    return () => {
      cancelled = true
    }
  }, [messages, currentUserId])

  // REALTIME REACTIONS
  useEffect(() => {
    if (messages.length === 0) return

    const reactionChannel = supabase
      .channel(`message-reactions-${channel}-${crypto.randomUUID()}`)
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
      supabase.removeChannel(reactionChannel)
    }
  }, [channel, messages, currentUserId])

  // LOAD SIGNED VOICE URLS
  useEffect(() => {
    let cancelled = false

    async function loadVoiceUrls() {
      const voiceMessages = messages.filter(
        (message) =>
          message.message_type === 'voice' &&
          Boolean(message.audio_path),
      )

      if (voiceMessages.length === 0) {
        setAudioUrls({})
        return
      }

      const nextUrls: Record<string, string> = {}

      for (const message of voiceMessages) {
        const audioPath = message.audio_path
        if (!audioPath) continue

        try {
          const { data, error } = await supabase.storage
            .from('voice-messages')
            .createSignedUrl(audioPath, 60 * 60)

          if (error) {
            console.error('VOICE SIGNED URL ERROR:', error)
            continue
          }

          if (!data?.signedUrl) continue
          nextUrls[message.id] = data.signedUrl
        } catch (error) {
          console.error('VOICE URL ERROR:', error)
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

  // CLEANUP
  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current)
      }

      mediaStreamRef.current?.getTracks().forEach((track) => track.stop())

      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ''
      }
    }
  }, [])

  // OUTSIDE CLICK
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node
      const picker = document.querySelector('[data-reaction-picker]')

      if (picker && !picker.contains(target)) {
        setReactionPickerId(null)
      }

      if (emojiRef.current && !emojiRef.current.contains(target)) {
        setShowEmojiPicker(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // SEND TEXT
  function submit(e: FormEvent) {
    e.preventDefault()
    const text = draft.trim()

    if (!text) return

    onSend(text)
    setDraft('')
    setShowEmojiPicker(false)
  }

  // IMAGE
  function handleImageSelect(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Please select an image.')
      return
    }

    void onSendImage?.(file)
    e.target.value = ''
  }

  // ENTER
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

  // EMOJI
  function handleEmojiClick(emojiData: EmojiClickData) {
    setDraft((current) => {
      const textarea =
        document.activeElement instanceof HTMLTextAreaElement
          ? document.activeElement
          : null

      if (!textarea) return current + emojiData.emoji

      const start = textarea.selectionStart ?? current.length
      const end = textarea.selectionEnd ?? current.length

      return (
        current.slice(0, start) +
        emojiData.emoji +
        current.slice(end)
      )
    })

    onTyping()
  }

  // GET REACTIONS
  function getReactions(messageId: string) {
    return messageReactions[messageId] ?? []
  }

  // HANDLE REACTION
  async function handleReaction(messageId: string, emoji: string) {
    if (!currentUserId) return

    try {
      const { data: existing, error: findError } = await supabase
        .from('message_reactions')
        .select('id,emoji')
        .eq('message_id', messageId)
        .eq('user_id', currentUserId)
        .maybeSingle()

      if (findError) {
        console.error('REACTION FIND ERROR:', findError)
        return
      }

      if (existing?.emoji === emoji) {
        const { error } = await supabase
          .from('message_reactions')
          .delete()
          .eq('id', existing.id)

        if (error) {
          console.error('REACTION DELETE ERROR:', error)
          return
        }
      } else if (existing) {
        const { error } = await supabase
          .from('message_reactions')
          .update({ emoji })
          .eq('id', existing.id)

        if (error) {
          console.error('REACTION UPDATE ERROR:', error)
          return
        }
      } else {
        const { error } = await supabase
          .from('message_reactions')
          .insert({
            message_id: messageId,
            user_id: currentUserId,
            emoji,
          })

        if (error) {
          console.error('REACTION INSERT ERROR:', error)
          return
        }
      }

      setReactionPickerId(null)
      await loadReactions()
    } catch (error) {
      console.error('REACTION ERROR:', error)
    }
  }

  // RECORDING TIME
  function formatRecordingTime(seconds: number) {
    const safeSeconds = Math.max(0, Math.floor(seconds))
    const minutes = Math.floor(safeSeconds / 60)
    const remainingSeconds = safeSeconds % 60

    return `${String(minutes).padStart(2, '0')}:${String(
      remainingSeconds,
    ).padStart(2, '0')}`
  }

  // START RECORDING
  async function startRecording() {
    if (!onSendVoice) return

    if (
      typeof window === 'undefined' ||
      !navigator.mediaDevices?.getUserMedia
    ) {
      alert('Voice recording is not supported in this browser.')
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      })

      mediaStreamRef.current = stream
      audioChunksRef.current = []

      let mimeType = ''

      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        mimeType = 'audio/webm;codecs=opus'
      } else if (MediaRecorder.isTypeSupported('audio/webm')) {
        mimeType = 'audio/webm'
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        mimeType = 'audio/mp4'
      }

      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream)

      mediaRecorderRef.current = recorder

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      recorder.onstop = async () => {
        const duration = recordingTimeRef.current
        const finalMimeType = recorder.mimeType || mimeType || 'audio/webm'

        const blob = new Blob(audioChunksRef.current, {
          type: finalMimeType,
        })

        audioChunksRef.current = []

        mediaStreamRef.current?.getTracks().forEach((track) => track.stop())
        mediaStreamRef.current = null
        mediaRecorderRef.current = null

        if (blob.size === 0) return

        try {
          await onSendVoice(blob, duration)
        } catch (error) {
          console.error('VOICE SEND ERROR:', error)
        }
      }

      recorder.start()
      setIsRecording(true)
      setRecordingTime(0)
      recordingTimeRef.current = 0

      recordingTimerRef.current = setInterval(() => {
        setRecordingTime((current) => {
          const next = current + 1
          recordingTimeRef.current = next
          return next
        })
      }, 1000)
    } catch (error) {
      console.error('MICROPHONE ERROR:', error)
      alert('Microphone permission is required to record voice messages.')
    }
  }

  // STOP RECORDING
  function stopRecording() {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current)
      recordingTimerRef.current = null
    }

    setIsRecording(false)

    const recorder = mediaRecorderRef.current

    if (recorder && recorder.state !== 'inactive') {
      recorder.stop()
    }
  }

  // CANCEL RECORDING
  function cancelRecording() {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current)
      recordingTimerRef.current = null
    }

    const recorder = mediaRecorderRef.current

    if (recorder) {
      recorder.ondataavailable = null
      recorder.onstop = null

      if (recorder.state !== 'inactive') {
        recorder.stop()
      }
    }

    mediaStreamRef.current?.getTracks().forEach((track) => track.stop())
    mediaStreamRef.current = null
    mediaRecorderRef.current = null
    audioChunksRef.current = []

    setIsRecording(false)
    setRecordingTime(0)
    recordingTimeRef.current = 0
  }

  // VOICE
  function handleVoiceClick() {
    if (isRecording) {
      stopRecording()
    } else {
      void startRecording()
    }
  }

  // PLAY VOICE
  async function toggleVoice(messageId: string) {
    const url = audioUrls[messageId]
    if (!url) return

    if (playingId === messageId && audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      setPlayingId(null)
      return
    }

    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      audioRef.current.src = ''
      audioRef.current = null
    }

    const audio = new Audio()
    audio.preload = 'auto'
    audio.src = url
    audioRef.current = audio

    audio.onplay = () => setPlayingId(messageId)

    audio.onended = () => {
      setPlayingId(null)
      if (audioRef.current === audio) audioRef.current = null
    }

    audio.onpause = () => {
      if (audioRef.current === audio && !audio.ended) {
        setPlayingId(null)
      }
    }

    audio.onerror = () => {
      setPlayingId(null)
      if (audioRef.current === audio) audioRef.current = null
    }

    try {
      await audio.play()
    } catch (error) {
      console.error('VOICE PLAY FAILED:', error)
      setPlayingId(null)
    }
  }

  // HEADER
  const Icon = channel === 'Global' ? Globe : Hash

  return (
    <section className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-background">
      {/* CHAT ATMOSPHERE */}
      <div
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
        aria-hidden
      >
        <div className="qllose-space-grain absolute inset-0" />

        <div className="qllose-chat-stars qllose-stars-far absolute inset-0 overflow-hidden">
          {Array.from({ length: 150 }, (_, index) => {
            const left = (index * 73 + 19) % 100
            const top = (index * 47 + Math.floor(index / 3) * 13 + 5) % 100
            const size =
              index % 31 === 0
                ? 2.8
                : index % 8 === 0
                  ? 1.8
                  : index % 3 === 0
                    ? 1.25
                    : 0.8

            return (
              <span
                key={`far-${index}`}
                className="qllose-chat-star qllose-star-far absolute rounded-full bg-white"
                style={{
                  left: `${left}%`,
                  top: `${top}%`,
                  width: `${size}px`,
                  height: `${size}px`,
                  animationDelay: `${(index % 29) * -0.63}s`,
                  animationDuration: `${4.5 + (index % 13) * 1.35}s`,
                  opacity: 0.18 + ((index * 7) % 65) / 100,
                }}
              />
            )
          })}
        </div>

        <div className="qllose-stars-near absolute inset-0 overflow-hidden">
          {Array.from({ length: 34 }, (_, index) => {
            const left = (index * 41 + 7) % 100
            const top = (index * 67 + 21) % 100

            return (
              <span
                key={`near-${index}`}
                className={`qllose-near-star absolute rounded-full ${
                  index % 4 === 0 ? 'bg-cyan-100' : 'bg-indigo-100'
                }`}
                style={{
                  left: `${left}%`,
                  top: `${top}%`,
                  width: `${index % 6 === 0 ? 3 : 1.7}px`,
                  height: `${index % 6 === 0 ? 3 : 1.7}px`,
                  animationDelay: `${(index % 11) * -1.2}s`,
                  animationDuration: `${8 + (index % 8) * 2}s`,
                }}
              />
            )
          })}
        </div>

        <div className="qllose-nebula qllose-nebula-violet absolute -left-[18%] top-[8%] h-[34rem] w-[34rem] rounded-full" />
        <div className="qllose-nebula qllose-nebula-blue absolute -right-[18%] top-[27%] h-[32rem] w-[32rem] rounded-full" />
        <div className="qllose-nebula qllose-nebula-pink absolute bottom-[-25%] left-[24%] h-[28rem] w-[38rem] rounded-full" />
        <div className="qllose-nebula-filament absolute left-[-10%] top-[48%] h-44 w-[120%]" />

        {/* SOFTER PURPLE RINGED PLANET */}
        <div className="qllose-distant-planet absolute -right-24 top-[34%] h-72 w-72 sm:-right-16 sm:h-80 sm:w-80">
          <div className="qllose-planet-halo absolute inset-[-20%] rounded-full" />

          <div className="qllose-planet-ring absolute left-[-27%] top-[43%] h-[24%] w-[150%] rounded-[50%]" />

          <div className="qllose-planet-surface absolute inset-0 overflow-hidden rounded-full">
            <div className="qllose-planet-cloud qllose-planet-cloud-one absolute -left-[20%] top-[20%] h-[16%] w-[145%] rounded-full" />
            <div className="qllose-planet-cloud qllose-planet-cloud-two absolute -left-[10%] top-[53%] h-[12%] w-[130%] rounded-full" />

            <div className="qllose-planet-shine absolute inset-0 rounded-full" />
            <div className="qllose-planet-shadow absolute inset-0 rounded-full" />
          </div>

          <div className="qllose-planet-ring qllose-planet-ring-front absolute left-[-27%] top-[43%] h-[24%] w-[150%] rounded-[50%]" />
        </div>

        <div className="qllose-shooting-star qllose-shooting-star-one absolute" />
        <div className="qllose-shooting-star qllose-shooting-star-two absolute" />
        <div className="qllose-chat-orbit qllose-chat-orbit-one absolute -right-28 top-[18%] h-64 w-64 rounded-full border border-primary/[0.10]" />
        <div className="qllose-chat-orbit qllose-chat-orbit-two absolute -right-16 top-[22%] h-48 w-48 rounded-full border border-cyan-200/[0.07]" />

        <style>{`
          @keyframes qllose-chat-twinkle {
            0%, 100% { opacity: 0.2; transform: scale(0.72); }
            45% { opacity: 0.95; transform: scale(1.45); }
            60% { opacity: 0.55; transform: scale(1); }
          }

          @keyframes qllose-near-drift {
            0%, 100% { opacity: 0.25; transform: translate3d(0, 0, 0) scale(0.8); }
            50% { opacity: 0.95; transform: translate3d(-7px, 10px, 0) scale(1.2); }
          }

          @keyframes qllose-chat-orbit-drift {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }

          @keyframes qllose-nebula-drift {
            0%, 100% { transform: translate3d(0, 0, 0) scale(1) rotate(0deg); }
            50% { transform: translate3d(30px, -22px, 0) scale(1.12) rotate(8deg); }
          }

          @keyframes qllose-planet-float {
            0%, 100% { transform: translate3d(0, 0, 0) rotate(-12deg); }
            50% { transform: translate3d(-12px, -16px, 0) rotate(-8deg); }
          }

          @keyframes qllose-planet-cloud {
            from { transform: translateX(-8%) rotate(-12deg); }
            to { transform: translateX(12%) rotate(-12deg); }
          }

          @keyframes qllose-planet-shimmer {
            0%, 100% { opacity: 0.22; transform: rotate(-15deg) translateX(-8%); }
            50% { opacity: 0.5; transform: rotate(-15deg) translateX(8%); }
          }

          @keyframes qllose-shooting-star {
            0%, 75%, 100% { opacity: 0; transform: translate3d(0, 0, 0) rotate(-28deg) scaleX(0.2); }
            78% { opacity: 0.95; }
            86% { opacity: 0; transform: translate3d(-240px, 145px, 0) rotate(-28deg) scaleX(1); }
          }

          .qllose-space-grain {
            opacity: 0.42;
            background-image:
              radial-gradient(ellipse at 50% 48%, rgba(8, 12, 38, 0) 0%, rgba(3, 4, 18, 0.16) 58%, rgba(2, 3, 14, 0.66) 100%),
              linear-gradient(155deg, #080b20 0%, #07091a 42%, #0b0822 100%);
          }

          .qllose-chat-star {
            animation: qllose-chat-twinkle 6s ease-in-out infinite;
          }

          .qllose-star-far {
            box-shadow: 0 0 4px rgba(195, 213, 255, 0.7);
          }

          .qllose-near-star {
            box-shadow: 0 0 8px rgba(132, 196, 255, 0.9), 0 0 18px rgba(129, 105, 255, 0.42);
            animation: qllose-near-drift 11s ease-in-out infinite;
          }

          .qllose-nebula {
            pointer-events: none;
            filter: blur(58px);
            animation: qllose-nebula-drift 28s ease-in-out infinite;
          }

          .qllose-nebula-violet {
            background: radial-gradient(ellipse, rgba(113, 73, 255, 0.23) 0%, rgba(89, 47, 192, 0.10) 38%, transparent 72%);
          }

          .qllose-nebula-blue {
            background: radial-gradient(ellipse, rgba(35, 143, 255, 0.19) 0%, rgba(38, 75, 190, 0.09) 42%, transparent 72%);
            animation-delay: -9s;
          }

          .qllose-nebula-pink {
            background: radial-gradient(ellipse, rgba(173, 59, 255, 0.13) 0%, rgba(76, 47, 168, 0.07) 45%, transparent 72%);
            animation-delay: -16s;
          }

          .qllose-nebula-filament {
            opacity: 0.23;
            filter: blur(30px);
            background: linear-gradient(90deg, transparent, rgba(54, 106, 255, 0.22), rgba(173, 80, 255, 0.18), transparent);
            transform: rotate(-18deg);
          }

          /* Planet: softer violet-blue colors and less intense glow */
          .qllose-distant-planet {
            opacity: 0.88;
            transform-origin: center;
            animation: qllose-planet-float 18s ease-in-out infinite;
            filter: saturate(1.18) contrast(1.03);
            will-change: transform;
          }

          .qllose-planet-halo {
            background:
              radial-gradient(circle, rgba(153, 112, 255, 0.25) 0%, rgba(105, 85, 220, 0.16) 38%, rgba(124, 58, 237, 0.08) 55%, transparent 72%);
            filter: blur(20px);
            animation: qllose-planet-shimmer 9s ease-in-out infinite;
          }

          .qllose-planet-surface {
            isolation: isolate;
            background:
              radial-gradient(ellipse at 27% 20%, rgba(240, 225, 255, 0.78) 0%, rgba(195, 168, 255, 0.42) 9%, transparent 26%),
              radial-gradient(ellipse at 35% 30%, #a995ee 0%, #7865d4 20%, #5750ad 39%, #413576 58%, #242044 78%, #0a0c27 100%);
            box-shadow:
              inset -34px -15px 55px rgba(1, 4, 26, 0.82),
              inset -8px -2px 24px rgba(4, 8, 40, 0.48),
              inset 12px 8px 32px rgba(216, 202, 255, 0.35),
              inset 0 0 18px rgba(174, 145, 255, 0.15),
              0 0 26px rgba(131, 105, 230, 0.22),
              0 0 55px rgba(103, 76, 205, 0.14);
          }

          .qllose-planet-shine {
            z-index: 2;
            pointer-events: none;
            background:
              linear-gradient(118deg, rgba(255, 255, 255, 0.2) 0%, rgba(220, 205, 255, 0.09) 15%, transparent 36%, transparent 68%, rgba(3, 6, 31, 0.25) 100%),
              radial-gradient(ellipse at 20% 15%, rgba(255, 255, 255, 0.2), transparent 38%);
            mix-blend-mode: screen;
          }

          .qllose-planet-shadow {
            z-index: 3;
            pointer-events: none;
            background: linear-gradient(112deg, transparent 18%, rgba(8, 12, 43, 0.04) 40%, rgba(3, 5, 25, 0.32) 67%, rgba(2, 3, 17, 0.72) 100%);
          }

          .qllose-planet-ring {
            z-index: 1;
            border: 8px solid rgba(179, 158, 235, 0.58);
            transform: rotate(-19deg);
            box-shadow:
              0 0 8px rgba(169, 144, 238, 0.34),
              0 0 20px rgba(117, 96, 210, 0.22),
              inset 0 0 8px rgba(220, 205, 255, 0.2);
          }

          .qllose-planet-ring-front {
            z-index: 4;
            clip-path: inset(50% 0 0 0);
            border-color: rgba(209, 195, 255, 0.68);
            box-shadow:
              0 0 9px rgba(169, 144, 238, 0.32),
              0 0 20px rgba(99, 82, 180, 0.2);
          }

          .qllose-planet-cloud {
            z-index: 1;
            background: linear-gradient(
              90deg,
              transparent,
              rgba(225, 215, 255, 0.3),
              rgba(159, 143, 232, 0.2),
              rgba(177, 151, 255, 0.14),
              transparent
            );
            filter: blur(7px);
            animation: qllose-planet-cloud 32s linear infinite alternate;
          }

          .qllose-planet-cloud-two {
            animation-duration: 41s;
            animation-direction: alternate-reverse;
            opacity: 0.68;
          }

          .qllose-shooting-star {
            width: 150px;
            height: 1px;
            opacity: 0;
            background: linear-gradient(90deg, rgba(180,220,255,0), rgba(180,220,255,0.9), #fff);
            box-shadow: 0 0 8px rgba(129,190,255,0.75);
            transform: rotate(-28deg);
            animation: qllose-shooting-star 13s ease-out infinite;
          }

          .qllose-shooting-star-one {
            top: 17%;
            right: 4%;
          }

          .qllose-shooting-star-two {
            top: 39%;
            right: 38%;
            animation-delay: -7s;
            animation-duration: 17s;
          }

          .qllose-chat-orbit-one {
            animation: qllose-chat-orbit-drift 95s linear infinite;
          }

          .qllose-chat-orbit-two {
            animation: qllose-chat-orbit-drift 125s linear infinite reverse;
          }

          @media (prefers-reduced-motion: reduce) {
            .qllose-chat-star,
            .qllose-near-star,
            .qllose-chat-orbit-one,
            .qllose-chat-orbit-two,
            .qllose-nebula,
            .qllose-distant-planet,
            .qllose-planet-cloud,
            .qllose-planet-halo,
            .qllose-shooting-star {
              animation: none !important;
            }
          }
        `}</style>

        <div
          className="absolute -left-24 -top-28 size-72 rounded-full opacity-[0.045] blur-[100px]"
          style={{ background: 'var(--primary)' }}
        />

        <div
          className="absolute -right-20 top-[12%] size-64 rounded-full opacity-[0.028] blur-[90px]"
          style={{ background: 'var(--creator)' }}
        />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_38%,oklch(0.03_0.02_265_/_0.16)_100%)]" />
      </div>

      {/* HEADER */}
      <header className="relative z-20 flex shrink-0 items-center gap-3 border-b border-white/[0.055] bg-background/60 px-3.5 py-3 backdrop-blur-2xl sm:px-5">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="group flex size-9 shrink-0 items-center justify-center rounded-xl border border-white/[0.055] bg-background/25 text-muted-foreground transition-all duration-200 hover:border-primary/20 hover:bg-primary/[0.055] hover:text-foreground active:scale-95 md:hidden"
          aria-label="Open channels"
        >
          <Icon className="size-4 transition-transform duration-300 group-hover:scale-110" />
        </button>

        <div className="relative flex size-9 shrink-0 items-center justify-center rounded-xl border border-primary/15 bg-primary/[0.055] shadow-[0_0_26px_oklch(0.72_0.18_278_/_0.07)]">
          <Icon className="size-4 text-primary/85" />
          <span className="absolute -right-0.5 -top-0.5 size-1.5 rounded-full bg-primary shadow-[0_0_8px_currentColor]" />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="truncate text-sm font-semibold tracking-tight">
              {planetName}
            </h2>

            <span className="hidden rounded-full border border-white/[0.055] bg-secondary/20 px-2 py-0.5 text-[9px] font-medium uppercase tracking-[0.12em] text-muted-foreground/60 sm:inline-flex">
              Community
            </span>
          </div>

          <div className="mt-0.5 flex items-center gap-1.5 text-[10px] text-muted-foreground/65 sm:text-[11px]">
            <span className="relative flex size-1.5">
              <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/40" />
              <span className="relative size-1.5 rounded-full bg-emerald-400 shadow-[0_0_7px_rgba(52,211,153,0.45)]" />
            </span>
            <span>#{channel}</span>
          </div>
        </div>

        <div className="ml-auto hidden items-center gap-2 sm:flex">
          <div className="h-4 w-px bg-border/50" />
          <span className="text-[10px] text-muted-foreground/55">
            {messages.length} {messages.length === 1 ? 'message' : 'messages'}
          </span>
        </div>
      </header>

      {/* MESSAGES */}
      <div
        ref={scrollRef}
        className="cosmic-scrollbar relative z-10 flex-1 min-h-0 space-y-1 overflow-y-auto px-2.5 py-4 sm:px-4 sm:py-5"
      >
        {messages.length === 0 && (
          <div className="flex h-full min-h-56 items-center justify-center px-6">
            <div className="max-w-sm text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-2xl border border-primary/10 bg-primary/[0.045] text-primary">
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
          const canDelete = isFounder || m.user_id === currentUserId
          const isVoice = m.message_type === 'voice'
          const isImage = m.message_type === 'image'
          const voiceUrl = audioUrls[m.id]
          const isPlaying = playingId === m.id
          const reactions = getReactions(m.id)
          const myReaction =
            reactions.find((reaction) => reaction.reactedByMe)?.emoji ?? null
          const hasReaction = Boolean(myReaction)
          const isHovered = hoveredMessageId === m.id

          return (
            <article
              key={m.id}
              onMouseEnter={() => setHoveredMessageId(m.id)}
              onMouseLeave={() => setHoveredMessageId(null)}
              className="group/message relative animate-message-in rounded-2xl px-2 py-2.5 transition-all duration-200 sm:px-3"
              style={{
                animationDelay: `${Math.min(index * 12, 120)}ms`,
              }}
            >
              <div
                className={`pointer-events-none absolute inset-0 rounded-2xl transition-all duration-300 ${
                  isHovered
                    ? 'bg-white/[0.017] shadow-[inset_0_1px_0_oklch(1_0_0_/_0.025)]'
                    : 'bg-transparent'
                }`}
              />

              <div className="relative flex gap-3">
                <div className="relative shrink-0 pt-0.5">
                  <div
                    className={`rounded-full transition-all duration-300 ${
                      isHovered
                        ? 'shadow-[0_0_20px_oklch(0.72_0.18_278_/_0.10)]'
                        : ''
                    }`}
                  >
                    <Avatar
                      image={m.avatar_url ?? undefined}
                      initials={m.initials}
                      color={m.color}
                    />
                  </div>

                  <span
                    className={`absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-background bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.35)] transition-all duration-200 ${
                      isHovered ? 'scale-110 opacity-100' : 'opacity-0'
                    }`}
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                    <span
                      className={`text-sm font-semibold tracking-tight transition-colors duration-200 ${
                        isHovered ? 'text-primary/95' : 'text-foreground'
                      }`}
                    >
                      {m.author}
                    </span>
                    <span className="text-[10px] text-muted-foreground/45">
                      {m.time}
                    </span>
                  </div>

                  {isImage ? (
                    <div className="mt-2 max-w-full overflow-hidden">
                      <div
                        className={`relative inline-block overflow-hidden rounded-2xl border bg-secondary/[0.08] transition-all duration-300 ${
                          isHovered
                            ? 'border-primary/20 shadow-[0_18px_50px_oklch(0.02_0.015_265_/_0.28)]'
                            : 'border-border/60 shadow-sm'
                        }`}
                      >
                        <img
                          src={m.text}
                          alt="Shared image"
                          className="max-h-[26rem] max-w-[min(100%,28rem)] rounded-[calc(1rem-1px)] object-contain transition-transform duration-500 ease-out hover:scale-[1.012]"
                          loading="lazy"
                        />
                        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,transparent_30%,oklch(1_0_0_/_0.045),transparent_70%)] opacity-0 transition-opacity duration-500 hover:opacity-100" />
                      </div>
                    </div>
                  ) : isVoice ? (
                    <div
                      className={`mt-2 flex max-w-md items-center gap-3 rounded-2xl border px-3 py-2.5 backdrop-blur-xl transition-all duration-300 ${
                        isPlaying
                          ? 'border-primary/30 bg-primary/[0.07] shadow-[0_0_32px_oklch(0.72_0.18_278_/_0.08)]'
                          : isHovered
                            ? 'border-primary/12 bg-secondary/[0.36]'
                            : 'border-border/60 bg-secondary/[0.20]'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => void toggleVoice(m.id)}
                        disabled={!voiceUrl}
                        aria-label={isPlaying ? 'Pause voice message' : 'Play voice message'}
                        className={`relative flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_0_20px_oklch(0.72_0.18_278_/_0.16)] transition-all duration-200 hover:scale-105 hover:shadow-[0_0_26px_oklch(0.72_0.18_278_/_0.22)] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 ${
                          isPlaying ? 'ring-4 ring-primary/10' : ''
                        }`}
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
                          {Array.from({ length: 30 }).map((_, index) => (
                            <span
                              key={index}
                              className={`w-1 shrink-0 rounded-full transition-all duration-300 ${
                                isPlaying ? 'bg-primary animate-waveform' : 'bg-primary/40'
                              } ${
                                index % 5 === 0
                                  ? 'h-6'
                                  : index % 4 === 0
                                    ? 'h-4'
                                    : index % 3 === 0
                                      ? 'h-3'
                                      : 'h-2'
                              }`}
                              style={{ animationDelay: `${index * 45}ms` }}
                            />
                          ))}
                        </div>

                        <div className="mt-1 flex items-center justify-between gap-3">
                          <span className="text-[10px] font-medium text-muted-foreground/75">
                            {typeof m.audio_duration === 'number' &&
                            m.audio_duration > 0
                              ? formatRecordingTime(Math.round(m.audio_duration))
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
                    <p className="max-w-3xl whitespace-pre-wrap break-words text-sm leading-6 text-foreground/90">
                      {m.text}
                    </p>
                  )}

                  {reactions.length > 0 && (
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      {reactions.map((reaction) => (
                        <button
                          key={reaction.emoji}
                          type="button"
                          onClick={() => void handleReaction(m.id, reaction.emoji)}
                          className={`group/reaction inline-flex h-7 items-center gap-1.5 rounded-full border px-2.5 text-xs backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:scale-[1.015] active:scale-95 ${
                            reaction.reactedByMe
                              ? 'border-primary/45 bg-primary/12 shadow-[0_0_16px_oklch(0.72_0.18_278_/_0.08)]'
                              : 'border-border/65 bg-secondary/30 hover:border-primary/25 hover:bg-primary/[0.07]'
                          }`}
                          title={reaction.reactedByMe ? 'Remove reaction' : 'React'}
                        >
                          <span className="text-sm transition-transform duration-200 group-hover/reaction:scale-110">
                            {reaction.emoji}
                          </span>
                          <span className="font-medium text-muted-foreground/80">
                            {reaction.count}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div
                  className={`absolute right-1 top-[-8px] z-30 transition-all duration-200 sm:right-2 ${
                    isHovered
                      ? 'translate-y-0 opacity-100'
                      : 'pointer-events-none translate-y-1 opacity-0'
                  }`}
                >
                  <div
                    className="flex items-center gap-0.5 rounded-xl border border-white/[0.07] bg-background/92 p-1 shadow-[0_18px_45px_-20px_rgba(0,0,0,0.9)] backdrop-blur-2xl"
                    data-reaction-picker
                  >
                    <button
                      type="button"
                      disabled={hasReaction}
                      onClick={() => void handleReaction(m.id, '❤️')}
                      className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-all duration-150 hover:scale-105 hover:bg-secondary hover:text-foreground active:scale-95 disabled:cursor-not-allowed disabled:opacity-30"
                      title={hasReaction ? `You already reacted with ${myReaction}` : 'React ❤️'}
                      aria-label="React with heart"
                    >
                      ❤️
                    </button>

                    <div className="relative">
                      <button
                        type="button"
                        disabled={hasReaction}
                        onClick={() =>
                          setReactionPickerId(reactionPickerId === m.id ? null : m.id)
                        }
                        className={`flex size-8 items-center justify-center rounded-lg transition-all duration-150 hover:scale-105 active:scale-95 ${
                          reactionPickerId === m.id
                            ? 'bg-primary/10 text-primary'
                            : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                        } disabled:cursor-not-allowed disabled:opacity-30`}
                        title={hasReaction ? `You already reacted with ${myReaction}` : 'More reactions'}
                        aria-label="More reactions"
                      >
                        <Smile className="size-4" />
                      </button>

                      {reactionPickerId === m.id && !hasReaction && (
                        <div className="absolute right-0 top-full z-50 mt-2 flex origin-top-right animate-in fade-in zoom-in-95 slide-in-from-top-1 items-center gap-0.5 rounded-2xl border border-white/[0.07] bg-background/96 p-1.5 shadow-2xl backdrop-blur-2xl duration-150">
                          {REACTION_EMOJIS.map((emoji) => (
                            <button
                              key={emoji}
                              type="button"
                              onClick={() => void handleReaction(m.id, emoji)}
                              className="flex size-9 items-center justify-center rounded-xl text-lg transition-all duration-150 hover:-translate-y-0.5 hover:scale-110 hover:bg-secondary active:scale-95"
                              aria-label={`React ${emoji}`}
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {!isVoice && !isImage && m.text && (
                      <button
                        type="button"
                        onClick={() => void navigator.clipboard?.writeText(m.text)}
                        className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-all duration-150 hover:scale-105 hover:bg-secondary hover:text-foreground active:scale-95"
                        title="Copy message"
                        aria-label="Copy message"
                      >
                        <Copy className="size-3.5" />
                      </button>
                    )}

                    {canDelete && (
                      <>
                        <div className="mx-0.5 h-5 w-px bg-border/60" />
                        <button
                          type="button"
                          onClick={() => onDeleteMessage?.(m.id)}
                          className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-all duration-150 hover:scale-105 hover:bg-red-500/10 hover:text-red-400 active:scale-95"
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

        {typingUsers.length > 0 && (
          <div className="animate-fade-up-soft flex items-center gap-2 px-3 py-2">
            <div className="flex items-center gap-1.5 rounded-full border border-primary/10 bg-primary/[0.04] px-2.5 py-1.5">
              <span className="flex items-end gap-[3px]">
                <span className="size-1.5 animate-bounce rounded-full bg-primary/80" />
                <span className="size-1.5 animate-bounce rounded-full bg-primary/55 [animation-delay:120ms]" />
                <span className="size-1.5 animate-bounce rounded-full bg-primary/35 [animation-delay:240ms]" />
              </span>
              <span className="text-[10px] text-muted-foreground/70">
                {typingUsers.join(', ')} typing…
              </span>
            </div>
          </div>
        )}
      </div>

      {/* COMPOSER */}
      <form
        onSubmit={submit}
        className="relative z-20 shrink-0 px-2.5 pb-3 pt-2 sm:px-4 sm:pb-4"
      >
        {showEmojiPicker && (
          <div
            ref={emojiRef}
            className="absolute bottom-[calc(100%-0.25rem)] right-2.5 z-50 mb-2 overflow-hidden rounded-2xl border border-white/[0.07] shadow-2xl animate-in fade-in slide-in-from-bottom-2 zoom-in-95 duration-150 sm:right-4"
          >
            <EmojiPicker
              onEmojiClick={handleEmojiClick}
              theme={'dark' as any}
              width={320}
              height={400}
              lazyLoadEmojis
            />
          </div>
        )}

        <div
          className={`pointer-events-none absolute inset-x-3 bottom-0 h-24 rounded-[2rem] bg-primary/[0.035] blur-3xl transition-opacity duration-300 ${
            isComposerFocused ? 'opacity-100' : 'opacity-0'
          } sm:inset-x-5`}
        />

        <div
          className={`relative flex w-full min-w-0 items-center gap-1.5 overflow-hidden rounded-[1.35rem] border px-2 py-2 backdrop-blur-2xl transition-all duration-300 sm:gap-2 sm:px-3 ${
            isComposerFocused
              ? 'border-primary/25 bg-secondary/[0.23] shadow-[0_16px_45px_oklch(0.02_0.015_265_/_0.24),0_0_28px_oklch(0.72_0.18_278_/_0.05)]'
              : 'border-white/[0.07] bg-secondary/[0.14] shadow-[0_12px_35px_oklch(0.02_0.015_265_/_0.15)]'
          }`}
        >
          <div
            className={`pointer-events-none absolute inset-x-6 top-0 h-px transition-opacity duration-300 ${
              isComposerFocused ? 'opacity-100' : 'opacity-25'
            }`}
            style={{
              background: 'linear-gradient(90deg, transparent, var(--primary), transparent)',
            }}
          />

          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageSelect}
          />

          {isRecording ? (
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <span className="relative flex size-8 shrink-0 items-center justify-center rounded-full bg-red-500/10">
                <span className="absolute inset-1 animate-ping rounded-full bg-red-500/20" />
                <span className="relative size-2 rounded-full bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.6)]" />
              </span>

              <span className="shrink-0 font-mono text-sm font-semibold tabular-nums text-red-400">
                {formatRecordingTime(recordingTime)}
              </span>

              <div className="flex min-w-0 flex-1 items-center gap-1 overflow-hidden">
                {Array.from({ length: 24 }).map((_, index) => (
                  <span
                    key={index}
                    className={`w-1 shrink-0 rounded-full bg-red-400/60 animate-recording-wave ${
                      index % 3 === 0 ? 'h-5' : index % 2 === 0 ? 'h-3' : 'h-2'
                    }`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={cancelRecording}
                aria-label="Cancel recording"
                className="flex size-9 shrink-0 items-center justify-center rounded-xl text-muted-foreground transition-all duration-200 hover:bg-secondary hover:text-foreground active:scale-95"
              >
                <X className="size-4" />
              </button>

              <button
                type="button"
                onClick={stopRecording}
                aria-label="Send voice message"
                className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-[0_0_20px_oklch(0.72_0.18_278_/_0.18)] transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <Send className="size-4" />
              </button>
            </div>
          ) : (
            <>
              <button
                type="button"
                aria-label="Add photo"
                onClick={() => imageInputRef.current?.click()}
                className="flex size-9 shrink-0 items-center justify-center rounded-xl text-muted-foreground transition-all duration-200 hover:scale-105 hover:bg-secondary hover:text-foreground active:scale-95"
              >
                <Plus className="size-5" />
              </button>

              <textarea
                value={draft}
                onFocus={() => setIsComposerFocused(true)}
                onBlur={() => setIsComposerFocused(false)}
                onChange={(e) => {
                  setDraft(e.target.value)
                  onTyping()
                }}
                onKeyDown={handleKeyDown}
                rows={1}
                placeholder={`Message #${channel}`}
                className="block min-h-9 max-h-32 min-w-0 flex-1 resize-none border-0 bg-transparent px-1 py-1.5 text-sm leading-5 text-foreground outline-none ring-0 placeholder:text-muted-foreground/40 focus:outline-none focus:ring-0"
                aria-label={`Message #${channel}`}
              />

              <button
                type="button"
                aria-label="Add emoji"
                onClick={() => setShowEmojiPicker((current) => !current)}
                className={`flex size-9 shrink-0 items-center justify-center rounded-xl transition-all duration-200 active:scale-95 ${
                  showEmojiPicker
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:scale-105 hover:bg-secondary hover:text-foreground'
                }`}
              >
                <Smile className="size-5" />
              </button>

              <button
                type="button"
                aria-label="Record voice"
                onClick={handleVoiceClick}
                className="flex size-9 shrink-0 items-center justify-center rounded-xl text-muted-foreground transition-all duration-200 hover:scale-105 hover:bg-secondary hover:text-foreground active:scale-95"
              >
                <Mic className="size-5" />
              </button>

              <button
                type="submit"
                disabled={!draft.trim()}
                className="group/send relative flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-primary text-primary-foreground shadow-[0_0_20px_oklch(0.72_0.18_278_/_0.14)] transition-all duration-200 hover:scale-105 hover:shadow-[0_0_28px_oklch(0.72_0.18_278_/_0.22)] active:scale-95 disabled:cursor-not-allowed disabled:opacity-25 disabled:hover:scale-100"
              >
                <span className="absolute inset-y-0 -left-full w-1/2 skew-x-[-20deg] bg-white/15 transition-all duration-700 group-hover/send:left-[130%]" />
                <Send className="relative size-4 transition-transform duration-200 group-hover/send:translate-x-0.5" />
              </button>
            </>
          )}
        </div>
      </form>
    </section>
  )
}
