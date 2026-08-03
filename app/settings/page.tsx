
'use client'

import { useEffect, useState } from 'react'
import { Bell, Lock, Palette, Sparkles, LogOut, Camera } from 'lucide-react'
import Link from 'next/link'

import { AppShell } from '@/components/qllose/app-shell'
import { Field } from '@/components/qllose/field'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase'

const upcoming = [
  'AI Assistant',
  'Private Messages',
  'Voice & Video Chat',
  'Notifications',
  'Achievements & Levels',
  'Trending Topics',
]

export default function SettingsPage() {
  const [userId, setUserId] = useState('')
  const [email, setEmail] = useState('')

  const [profile, setProfile] = useState({
    username: '',
    nickname: '',
    age: '',
    location: '',
    bio: '',
    avatar_url: '',
  })

  const [profileImage, setProfileImage] = useState<string | undefined>()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [notifs, setNotifs] = useState({
    mentions: true,
    planets: true,
    digest: false,
  })

  useEffect(() => {
    loadProfile()
  }, [])

  async function loadProfile() {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    setUserId(user.id)
    setEmail(user.email || '')

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (data) {
      setProfile(data)
      setProfileImage(data.avatar_url)
    }

    setLoading(false)
  }


  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setProfile({
      ...profile,
      [e.target.id]: e.target.value,
    })
  }


  async function handleImageUpload(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0]

    if (!file || !userId) return

    const filePath = `${userId}.png`

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, {
        upsert: true,
      })

    if (uploadError) {
      console.log(uploadError)
      return
    }


    const {
      data: { publicUrl },
    } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath)


    setProfileImage(publicUrl)

    setProfile({
      ...profile,
      avatar_url: publicUrl,
    })
  }


  async function saveProfile() {
    setSaving(true)

    const { error } = await supabase
      .from('profiles')
      .update({
        username: profile.username,
        nickname: profile.nickname,
        age: Number(profile.age),
        location: profile.location,
        bio: profile.bio,
        avatar_url: profile.avatar_url,
      })
      .eq('id', userId)


    if (error) {
      console.log(error)
    }

    setSaving(false)
  }


  if (loading) {
    return (
      <AppShell>
        <div className="flex h-[70vh] items-center justify-center">
          Loading...
        </div>
      </AppShell>
    )
  }


  return (
    <AppShell>
      <div className="mx-auto max-w-2xl px-6 py-10">

        <h1 className="text-2xl font-semibold tracking-tight">
          Settings
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Manage your account and preferences.
        </p>


        <SettingsCard icon={Lock} title="Account">

          <div className="flex flex-col gap-4">


            <div className="flex items-center gap-4">

              <div className="relative">

                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="size-20 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex size-20 items-center justify-center rounded-full bg-primary text-2xl font-semibold text-white">
                    U
                  </div>
                )}


                <label className="absolute bottom-0 right-0 flex size-7 cursor-pointer items-center justify-center rounded-full bg-primary text-white shadow">

                  <Camera className="size-4" />

                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />

                </label>

              </div>


              <div>
                <p className="text-sm font-medium">
                  Profile picture
                </p>

                <p className="text-xs text-muted-foreground">
                  Upload a new avatar image.
                </p>
              </div>

            </div>



            <Field
              id="nickname"
              label="Display name"
              value={profile.nickname}
              onChange={handleChange}
            />


            <Field
              id="username"
              label="Username"
              value={profile.username}
              onChange={handleChange}
            />


            <Field
              id="email"
              label="Email"
              type="email"
              value={email}
              disabled
            />


            <Field
              id="age"
              label="Age"
              value={profile.age}
              onChange={handleChange}
            />


            <Field
              id="location"
              label="Location"
              value={profile.location}
              onChange={handleChange}
            />


            <div className="flex flex-col gap-1.5">

              <label className="text-sm font-medium">
                Bio
              </label>

              <textarea
                id="bio"
                rows={3}
                value={profile.bio}
                onChange={handleChange}
                className="w-full resize-none rounded-xl border border-input bg-background/40 px-3.5 py-2.5 text-sm outline-none focus:border-ring focus:ring-3 focus:ring-ring/30"
              />

            </div>


            <Button
              onClick={saveProfile}
              disabled={saving}
              className="h-10 w-fit rounded-xl px-5"
            >
              {saving ? 'Saving...' : 'Save changes'}
            </Button>


          </div>

        </SettingsCard>



        <SettingsCard icon={Bell} title="Notifications">

          <div className="flex flex-col divide-y divide-border">

            <Toggle
              label="Mentions"
              description="Get notified when someone mentions you."
              checked={notifs.mentions}
              onChange={() =>
                setNotifs((n) => ({
                  ...n,
                  mentions: !n.mentions,
                }))
              }
            />

          </div>

        </SettingsCard>



        <SettingsCard icon={Palette} title="Appearance">

          <span className="rounded-full border border-border bg-secondary/60 px-3 py-1 text-xs">
            Dark
          </span>

        </SettingsCard>



        <SettingsCard icon={Sparkles} title="Coming soon">

          <div className="flex flex-wrap gap-2">

            {upcoming.map((feature) => (
              <span
                key={feature}
                className="rounded-full border border-dashed border-border px-3 py-1 text-xs text-muted-foreground"
              >
                {feature}
              </span>
            ))}

          </div>

        </SettingsCard>



        <Link
          href="/"
          className={cn(
            buttonVariants({ variant: 'destructive' }),
            'mt-6 h-10 gap-1.5 rounded-xl px-5'
          )}
        >
          <LogOut className="size-4" />
          Logout
        </Link>


      </div>
    </AppShell>
  )
}



function SettingsCard({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="glass mt-6 rounded-2xl p-6">
      <div className="mb-5 flex items-center gap-2">
        <Icon className="size-4 text-primary" />
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </h2>
      </div>

      {children}
    </section>
  )
}



function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string
  description: string
  checked: boolean
  onChange: () => void
}) {
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>

      <button
        type="button"
        onClick={onChange}
        className={cn(
          'relative h-6 w-11 rounded-full transition-colors',
          checked ? 'bg-primary' : 'bg-secondary'
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 size-5 rounded-full bg-white transition-transform',
            checked ? 'translate-x-5' : 'translate-x-0.5'
          )}
        />
      </button>

    </div>
  )
}
