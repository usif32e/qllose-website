import { Avatar } from '@/components/qllose/avatar'

interface ProfileHeaderProps {
  profile: {
    username: string
    nickname: string | null
    avatar_url: string | null
    is_founder: boolean
    bio: string | null
  }
}


export function ProfileHeader({
  profile,
}: ProfileHeaderProps) {

  return (

    <section className="relative overflow-hidden rounded-3xl border border-border bg-background/50 backdrop-blur-xl">


      {/* Space Cover */}

      <div className="relative h-40 overflow-hidden bg-gradient-to-br from-primary/60 via-purple-500/30 to-transparent">

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.2),transparent_50%)]" />

        <div className="absolute right-8 top-8 size-20 rounded-full bg-primary/20 blur-2xl" />

        <div className="absolute left-10 bottom-5 size-3 rounded-full bg-white/70" />
        <div className="absolute right-20 bottom-12 size-2 rounded-full bg-white/50" />

      </div>



      <div className="-mt-16 px-6 pb-7">


        {/* Avatar */}

        <div className="relative w-fit">

          {profile.avatar_url ? (

            <img
              src={profile.avatar_url}
              alt={profile.username}
              className="
                size-32
                rounded-full
                border-4
                border-background
                object-cover
                shadow-xl
                shadow-primary/30
              "
            />

          ) : (

            <Avatar
              initials={
                profile.username
                  ?.slice(0,2)
                  .toUpperCase()
              }
              size={128}
              color="var(--primary)"
            />

          )}


          {profile.is_founder && (

            <div className="
              absolute
              -bottom-1
              -right-1
              flex
              size-10
              items-center
              justify-center
              rounded-full
              border-4
              border-background
              bg-primary
              text-lg
            ">
              👑
            </div>

          )}

        </div>



        <div className="mt-5">


          <div className="flex items-center gap-3 flex-wrap">


            <h1 className="text-3xl font-bold tracking-tight">
              {profile.nickname || profile.username}
            </h1>


            {profile.is_founder && (

              <span className="
                rounded-full
                bg-primary/20
                px-3
                py-1
                text-xs
                font-semibold
                text-primary
              ">
                Founder
              </span>

            )}


          </div>



          <p className="mt-1 text-sm text-muted-foreground">
            @{profile.username}
          </p>



          {profile.bio && (

            <p className="
              mt-5
              max-w-xl
              text-sm
              leading-relaxed
              text-muted-foreground
            ">
              {profile.bio}
            </p>

          )}


        </div>


      </div>


    </section>

  )
}