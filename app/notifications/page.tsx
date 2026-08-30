
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Bell,
  CheckCheck,
  Clock,
  User,
  Users,
  MessageCircle,
  FileText,
  X,
  ArrowLeft,
  Sparkles,
} from 'lucide-react'

import { supabase } from '@/lib/supabase'
import { Logo } from '@/components/qllose/logo'

type Notification = {
  id: string
  user_id: string
  actor_id: string | null
  type: string
  title: string
  message: string | null
  planet_id: string | null
  post_id: string | null
  is_read: boolean
  created_at: string
  actor?: {
    username: string
    nickname: string
    avatar_url: string | null
  } | null
}

function getNotificationIcon(type: string) {
  switch (type) {
    case 'follow':
    case 'friend':
      return User

    case 'join_request':
    case 'member':
      return Users

    case 'message':
      return MessageCircle

    case 'post':
    case 'comment':
      return FileText

    default:
      return Bell
  }
}

function getNotificationAccent(type: string) {
  switch (type) {
    case 'follow':
    case 'friend':
      return 'var(--creator)'

    case 'join_request':
    case 'member':
      return 'var(--gamer)'

    case 'message':
      return 'var(--primary)'

    case 'post':
    case 'comment':
      return 'var(--business)'

    default:
      return 'var(--primary)'
  }
}

function formatTime(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()

  const diff = now.getTime() - date.getTime()

  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (seconds < 60) {
    return 'Just now'
  }

  if (minutes < 60) {
    return `${minutes}m ago`
  }

  if (hours < 24) {
    return `${hours}h ago`
  }

  if (days < 7) {
    return `${days}d ago`
  }

  return date.toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    year:
      date.getFullYear() !==
      now.getFullYear()
        ? 'numeric'
        : undefined,
  })
}

export default function NotificationsPage() {
  const [notifications, setNotifications] =
    useState<Notification[]>([])

  const [loading, setLoading] =
    useState(true)

  const [markingAll, setMarkingAll] =
    useState(false)

  const [error, setError] =
    useState<string | null>(null)

  const unreadCount =
    notifications.filter(
      (notification) =>
        !notification.is_read,
    ).length

  async function loadNotifications() {
    setError(null)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setNotifications([])
      setLoading(false)
      return
    }

    const {
      data,
      error: notificationsError,
    } = await supabase
      .from('notifications')
      .select(`
        id,
        user_id,
        actor_id,
        type,
        title,
        message,
        planet_id,
        post_id,
        is_read,
        created_at
      `)
      .eq('user_id', user.id)
      .order('created_at', {
        ascending: false,
      })

    if (notificationsError) {
      console.log(
        'NOTIFICATIONS ERROR:',
        notificationsError,
      )

      setError(
        'Could not load notifications.',
      )

      setNotifications([])
      setLoading(false)

      return
    }

    const rows =
      (data || []) as Notification[]

    const actorIds = [
      ...new Set(
        rows
          .map(
            (notification) =>
              notification.actor_id,
          )
          .filter(
            (id): id is string =>
              Boolean(id),
          ),
      ),
    ]

    let actors: {
      id: string
      username: string
      nickname: string
      avatar_url: string | null
    }[] = []

    if (actorIds.length > 0) {
      const {
        data: actorData,
        error: actorError,
      } = await supabase
        .from('profiles')
        .select(
          'id,username,nickname,avatar_url',
        )
        .in('id', actorIds)

      if (actorError) {
        console.log(
          'NOTIFICATION ACTORS ERROR:',
          actorError,
        )
      } else {
        actors = actorData || []
      }
    }

    const formatted: Notification[] =
      rows.map((notification) => ({
        ...notification,
        actor:
          actors.find(
            (actor) =>
              actor.id ===
              notification.actor_id,
          ) || null,
      }))

    setNotifications(formatted)
    setLoading(false)
  }

  async function markAsRead(id: string) {
    const {
      error: updateError,
    } = await supabase
      .from('notifications')
      .update({
        is_read: true,
      })
      .eq('id', id)

    if (updateError) {
      console.log(
        'MARK READ ERROR:',
        updateError,
      )

      return
    }

    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id
          ? {
              ...notification,
              is_read: true,
            }
          : notification,
      ),
    )
  }

  async function markAllAsRead() {
    if (unreadCount === 0) {
      return
    }

    setMarkingAll(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setMarkingAll(false)
      return
    }

    const {
      error: updateError,
    } = await supabase
      .from('notifications')
      .update({
        is_read: true,
      })
      .eq('user_id', user.id)
      .eq('is_read', false)

    if (updateError) {
      console.log(
        'MARK ALL READ ERROR:',
        updateError,
      )

      setMarkingAll(false)
      return
    }

    setNotifications((prev) =>
      prev.map((notification) => ({
        ...notification,
        is_read: true,
      })),
    )

    setMarkingAll(false)
  }

  useEffect(() => {
    let notificationChannel:
      ReturnType<typeof supabase.channel> | null =
      null

    let mounted = true

    async function setupNotifications() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user || !mounted) {
        setLoading(false)
        return
      }

      await loadNotifications()

      if (!mounted) {
        return
      }

      notificationChannel = supabase
        .channel(
          `notifications-realtime-${user.id}`,
        )
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`,
          },
          async (payload) => {
            console.log(
              '🔥 NEW NOTIFICATION:',
              payload,
            )

            await loadNotifications()
          },
        )

      notificationChannel.subscribe(
        (status) => {
          console.log(
            '🔔 NOTIFICATIONS REALTIME:',
            status,
          )
        },
      )
    }

    setupNotifications()

    return () => {
      mounted = false

      if (notificationChannel) {
        supabase.removeChannel(
          notificationChannel,
        )

        notificationChannel = null
      }
    }
  }, [])

  return (
    <main className="relative min-h-dvh overflow-hidden bg-background text-foreground">
      {/* =====================================================
          ATMOSPHERE
      ===================================================== */}

      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden
      >
        <div className="absolute left-1/2 top-[-14%] h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-primary/[0.045] blur-[140px]" />

        <div className="absolute right-[-8%] top-[20%] size-[260px] rounded-full bg-[var(--creator)]/[0.025] blur-[100px]" />

        <div className="absolute left-[-8%] bottom-[8%] size-[240px] rounded-full bg-[var(--gamer)]/[0.02] blur-[100px]" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_32%,oklch(0.03_0.02_265_/_0.25)_100%)]" />
      </div>

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="relative z-20 mx-auto flex max-w-5xl items-center justify-between px-4 py-5 sm:px-6 sm:py-7">
        <Link
          href="/planets"
          className="group inline-flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4 transition-transform duration-200 group-hover:-translate-x-0.5" />

          <span className="hidden text-xs sm:inline">
            Back to universe
          </span>

          <span className="sm:hidden">
            Back
          </span>
        </Link>

        <Logo size={28} />

        <div className="w-[70px] sm:w-[110px]" />
      </header>

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <div className="relative z-10 mx-auto w-full max-w-3xl px-4 pb-12 sm:px-6 sm:pb-16">
        {/* Heading */}

        <div className="animate-fade-up-soft mb-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/10 bg-primary/[0.04] px-3 py-1.5 text-[10px] text-muted-foreground backdrop-blur-xl">
                <Sparkles className="size-3.5 text-primary" />

                <span>
                  Your activity
                </span>
              </div>

              <h1 className="text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
                Notifications
              </h1>

              <p className="mt-2 text-sm text-muted-foreground">
                {unreadCount > 0
                  ? `${unreadCount} unread notification${
                      unreadCount === 1
                        ? ''
                        : 's'
                    }`
                  : 'You are all caught up.'}
              </p>
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                disabled={markingAll}
                className="
                  group
                  inline-flex
                  shrink-0
                  items-center
                  gap-2
                  rounded-xl
                  border
                  border-border/60
                  bg-background/35
                  px-3.5
                  py-2
                  text-xs
                  font-medium
                  text-muted-foreground
                  backdrop-blur-xl
                  transition-all duration-300
                  hover:-translate-y-0.5
                  hover:border-primary/20
                  hover:bg-primary/[0.045]
                  hover:text-foreground
                  active:scale-[0.98]
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                <CheckCheck className="size-4 transition-transform duration-300 group-hover:scale-105" />

                <span className="hidden sm:inline">
                  {markingAll
                    ? 'Marking...'
                    : 'Mark all read'}
                </span>

                <span className="sm:hidden">
                  Read all
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Error */}

        {error && (
          <div
            className="
              mb-4
              animate-fade-up-soft
              flex items-center gap-3
              rounded-2xl
              border border-destructive/15
              bg-destructive/[0.06]
              px-4 py-3
              text-sm text-destructive
            "
          >
            <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-destructive/10">
              <X className="size-4" />
            </div>

            <span>
              {error}
            </span>
          </div>
        )}

        {/* Loading */}

        {loading && (
          <div className="space-y-2.5">
            {Array.from({
              length: 5,
            }).map((_, index) => (
              <div
                key={index}
                className="
                  h-[94px]
                  animate-pulse
                  rounded-2xl
                  border
                  border-white/[0.05]
                  bg-background/30
                  backdrop-blur-xl
                "
              />
            ))}
          </div>
        )}

        {/* Empty */}

        {!loading &&
          notifications.length === 0 && (
            <div className="animate-fade-up-soft relative overflow-hidden rounded-[2rem] border border-white/[0.055] bg-background/30 px-6 py-16 text-center shadow-[0_24px_80px_-45px_rgba(0,0,0,0.9)] backdrop-blur-2xl sm:py-20">
              <div className="pointer-events-none absolute left-1/2 top-[-40px] size-48 -translate-x-1/2 rounded-full bg-primary/[0.045] blur-3xl" />

              <div className="relative">
                <div className="mx-auto flex size-14 items-center justify-center rounded-2xl border border-primary/10 bg-primary/[0.05] text-primary shadow-[0_0_30px_oklch(0.72_0.18_278_/_0.06)]">
                  <Bell className="size-6" />
                </div>

                <h2 className="mt-5 text-base font-semibold tracking-tight">
                  Nothing here yet
                </h2>

                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground/70">
                  When something happens around your profile or communities, your notifications will appear here.
                </p>

                <Link
                  href="/planets"
                  className="
                    group
                    mt-6
                    inline-flex
                    items-center
                    gap-2
                    rounded-xl
                    border border-border/60
                    bg-background/35
                    px-4 py-2.5
                    text-xs
                    font-medium
                    text-foreground/80
                    backdrop-blur-xl
                    transition-all duration-300
                    hover:-translate-y-0.5
                    hover:border-primary/20
                    hover:bg-primary/[0.05]
                  "
                >
                  Explore planets

                  <ArrowLeft className="size-3.5 rotate-180 transition-transform duration-300 group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>
          )}

        {/* LIST */}

        {!loading &&
          notifications.length > 0 && (
            <div className="space-y-2.5">
              {notifications.map(
                (
                  notification,
                  index,
                ) => {
                  const Icon =
                    getNotificationIcon(
                      notification.type,
                    )

                  const accent =
                    getNotificationAccent(
                      notification.type,
                    )

                  return (
                    <button
                      key={
                        notification.id
                      }
                      type="button"
                      onClick={() => {
                        if (
                          !notification.is_read
                        ) {
                          void markAsRead(
                            notification.id,
                          )
                        }
                      }}
                      className={`
                        group
                        relative
                        flex w-full
                        items-start
                        gap-3.5
                        overflow-hidden
                        rounded-[1.35rem]
                        border
                        px-4 py-4
                        text-left
                        backdrop-blur-2xl
                        transition-all
                        duration-300
                        animate-fade-up-soft
                        hover:-translate-y-0.5
                        active:scale-[0.995]
                        ${
                          notification.is_read
                            ? `
                              border-white/[0.055]
                              bg-background/30
                              hover:border-white/[0.08]
                              hover:bg-background/40
                            `
                            : `
                              border-primary/15
                              bg-primary/[0.045]
                              shadow-[0_12px_40px_-25px_oklch(0.72_0.18_278_/_0.3)]
                              hover:border-primary/25
                              hover:bg-primary/[0.065]
                            `
                        }
                      `}
                      style={{
                        animationDelay: `${Math.min(
                          index * 50,
                          300,
                        )}ms`,
                      }}
                    >
                      {/* Accent glow */}

                      <span
                        className="
                          pointer-events-none
                          absolute
                          -left-8
                          -top-8
                          size-28
                          rounded-full
                          opacity-0
                          blur-3xl
                          transition-opacity
                          duration-500
                          group-hover:opacity-100
                        "
                        style={{
                          background:
                            accent,
                        }}
                      />

                      {/* Unread rail */}

                      {!notification.is_read && (
                        <span
                          className="
                            absolute
                            left-0
                            top-4
                            bottom-4
                            w-0.5
                            rounded-r-full
                            bg-primary
                            shadow-[0_0_10px_currentColor]
                          "
                        />
                      )}

                      {/* ICON */}

                      <div
                        className="
                          relative z-10
                          flex size-10
                          shrink-0
                          items-center
                          justify-center
                          rounded-xl
                          border
                          transition-all
                          duration-300
                        "
                        style={{
                          borderColor:
                            notification.is_read
                              ? 'rgba(255,255,255,0.055)'
                              : `color-mix(in oklab, ${accent} 18%, transparent)`,
                          background:
                            notification.is_read
                              ? 'rgba(255,255,255,0.025)'
                              : `color-mix(in oklab, ${accent} 8%, transparent)`,
                          color:
                            notification.is_read
                              ? 'var(--muted-foreground)'
                              : accent,
                        }}
                      >
                        <Icon className="size-4.5" />
                      </div>

                      {/* CONTENT */}

                      <div className="relative z-10 min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p
                              className={`
                                truncate
                                text-sm
                                tracking-tight
                                ${
                                  notification.is_read
                                    ? 'font-medium text-foreground/85'
                                    : 'font-semibold text-foreground'
                                }
                              `}
                            >
                              {
                                notification.title
                              }
                            </p>

                            {notification.actor && (
                              <p className="mt-0.5 truncate text-[10px] text-muted-foreground/55">
                                {notification.actor.nickname ||
                                  notification.actor.username}
                              </p>
                            )}
                          </div>

                          {!notification.is_read && (
                            <span className="relative mt-1.5 flex size-2 shrink-0">
                              <span className="absolute inset-0 animate-ping rounded-full bg-primary/35" />
                              <span className="relative size-2 rounded-full bg-primary shadow-[0_0_8px_oklch(0.72_0.18_278_/_0.7)]" />
                            </span>
                          )}
                        </div>

                        {notification.message && (
                          <p className="mt-2 line-clamp-2 text-sm leading-5 text-muted-foreground/75">
                            {
                              notification.message
                            }
                          </p>
                        )}

                        <div className="mt-2.5 flex items-center gap-2 text-[10px] text-muted-foreground/50">
                          <Clock className="size-3" />

                          <span>
                            {formatTime(
                              notification.created_at,
                            )}
                          </span>

                          <span className="size-0.5 rounded-full bg-border/70" />

                          <span className="capitalize">
                            {notification.type.replace(
                              /_/g,
                              ' ',
                            )}
                          </span>
                        </div>
                      </div>

                      {/* HOVER ARROW */}

                      <div
                        className="
                          relative z-10
                          hidden
                          self-center
                          text-muted-foreground/30
                          transition-all
                          duration-300
                          group-hover:translate-x-0.5
                          group-hover:text-muted-foreground/60
                          sm:block
                        "
                      >
                        →
                      </div>
                    </button>
                  )
                },
              )}
            </div>
          )}
      </div>
    </main>
  )
}

