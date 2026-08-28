'use client'

import { useEffect, useState } from 'react'
import {
  Bell,
  CheckCheck,
  Clock,
  User,
  Users,
  MessageCircle,
  FileText,
  X,
} from 'lucide-react'

import { supabase } from '@/lib/supabase'

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
      date.getFullYear() !== now.getFullYear()
        ? 'numeric'
        : undefined,
  })
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [markingAll, setMarkingAll] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const unreadCount = notifications.filter(
    (notification) => !notification.is_read,
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

      setError('Could not load notifications.')
      setNotifications([])
      setLoading(false)

      return
    }

    const rows = (data || []) as Notification[]

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

  /*
   * Initial load + Supabase Realtime
   */
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

      // Load existing notifications first
      await loadNotifications()

      if (!mounted) {
        return
      }

      /*
       * IMPORTANT:
       * .on() MUST come BEFORE .subscribe()
       */
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

            // Reload notifications so actor/profile data
            // is also loaded correctly.
            await loadNotifications()
          },
        )

      // Subscribe AFTER .on()
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
    <main className="min-h-dvh bg-background text-foreground">
      <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 sm:py-8">

        {/* Header */}
        <div className="mb-6 flex items-center justify-between gap-4">

          <div className="flex min-w-0 items-center gap-3">

            <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary">
              <Bell className="size-5" />
            </div>

            <div className="min-w-0">

              <h1 className="text-xl font-semibold sm:text-2xl">
                Notifications
              </h1>

              <p className="mt-1 text-sm text-muted-foreground">
                {unreadCount > 0
                  ? `${unreadCount} unread`
                  : 'All caught up'}
              </p>

            </div>

          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllAsRead}
              disabled={markingAll}
              className="flex shrink-0 items-center gap-2 rounded-xl border border-border px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-50"
            >

              <CheckCheck className="size-4" />

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

        {/* Error */}
        {error && (
          <div className="mb-4 flex items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">

            <X className="size-4 shrink-0" />

            <span>{error}</span>

          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="space-y-2">

            {Array.from({
              length: 5,
            }).map((_, index) => (
              <div
                key={index}
                className="h-20 animate-pulse rounded-2xl border border-border bg-card/50"
              />
            ))}

          </div>
        )}

        {/* Empty */}
        {!loading &&
          notifications.length === 0 && (
            <div className="flex min-h-[50vh] items-center justify-center rounded-3xl border border-border bg-card/30 px-6 text-center">

              <div>

                <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-secondary">

                  <Bell className="size-6 text-muted-foreground" />

                </div>

                <h2 className="text-base font-semibold">
                  No notifications yet
                </h2>

                <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                  When something happens around your
                  profile or communities, you'll see it here.
                </p>

              </div>

            </div>
          )}

        {/* List */}
        {!loading &&
          notifications.length > 0 && (
            <div className="space-y-2">

              {notifications.map(
                (notification) => {

                  const Icon =
                    getNotificationIcon(
                      notification.type,
                    )

                  return (
                    <button
                      key={notification.id}
                      type="button"
                      onClick={() => {
                        if (
                          !notification.is_read
                        ) {
                          markAsRead(
                            notification.id,
                          )
                        }
                      }}
                      className={`
                        flex
                        w-full
                        items-start
                        gap-3
                        rounded-2xl
                        border
                        px-4
                        py-4
                        text-left
                        transition-colors
                        ${
                          notification.is_read
                            ? 'border-border bg-card/20 hover:bg-secondary/40'
                            : 'border-primary/20 bg-primary/5 hover:bg-primary/10'
                        }
                      `}
                    >

                      {/* Icon */}
                      <div
                        className={`
                          flex
                          size-10
                          shrink-0
                          items-center
                          justify-center
                          rounded-xl
                          ${
                            notification.is_read
                              ? 'bg-secondary text-muted-foreground'
                              : 'bg-primary/15 text-primary'
                          }
                        `}
                      >

                        <Icon className="size-5" />

                      </div>

                      {/* Content */}
                      <div className="min-w-0 flex-1">

                        <div className="flex items-start justify-between gap-3">

                          <p className="min-w-0 text-sm font-semibold">
                            {notification.title}
                          </p>

                          {!notification.is_read && (
                            <span className="mt-1 size-2 shrink-0 rounded-full bg-primary" />
                          )}

                        </div>

                        {notification.message && (
                          <p className="mt-1 text-sm leading-5 text-muted-foreground">
                            {notification.message}
                          </p>
                        )}

                        <div className="mt-2 flex items-center gap-2 text-[11px] text-muted-foreground">

                          <Clock className="size-3.5" />

                          <span>
                            {formatTime(
                              notification.created_at,
                            )}
                          </span>

                          {notification.actor && (
                            <>
                              <span>•</span>

                              <span className="truncate">
                                {notification.actor.nickname ||
                                  notification.actor.username}
                              </span>
                            </>
                          )}

                        </div>

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