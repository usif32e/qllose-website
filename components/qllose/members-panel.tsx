import type { Member } from '@/lib/qllose-data'
import { Avatar } from '@/components/qllose/avatar'

interface MembersPanelProps {
  members: Member[]
  typingUsers: string[]
}

export function MembersPanel({
  members,
  typingUsers,
}: MembersPanelProps) {


  const online =
    members.filter(
      member => member.online
    )


  const offline =
    members.filter(
      member => !member.online
    )


  return (
    <aside className="hidden h-full w-60 flex-col border-l border-border bg-sidebar/50 backdrop-blur-xl lg:flex">


      <div className="border-b border-border px-4 py-4">

        <p className="text-sm font-semibold">
          Members
        </p>


        <p className="text-xs text-muted-foreground">
          {online.length} online
        </p>

      </div>




      <div className="flex-1 overflow-y-auto px-2 py-3">


        {online.length > 0 && (

          <MemberGroup
            label={`Online — ${online.length}`}
            members={online}
          />

        )}



        {offline.length > 0 && (

          <MemberGroup
            label={`Offline — ${offline.length}`}
            members={offline}
          />

        )}


      </div>




      {typingUsers.length > 0 && (

        <div className="border-t border-border px-4 py-3">

          <div className="flex items-center gap-2 text-xs text-muted-foreground">


            <span className="flex gap-0.5">

              <Dot delay="0s" />

              <Dot delay="0.15s" />

              <Dot delay="0.3s" />

            </span>


            {typingUsers.join(', ')} typing


          </div>

        </div>

      )}


    </aside>
  )
}





function MemberGroup({
  label,
  members,
}: {
  label:string
  members:Member[]
}) {


  return (

    <div className="mb-3">


      <p className="px-2 py-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">

        {label}

      </p>



      <ul className="flex flex-col gap-0.5">


        {members.map((m)=>(


          <li
            key={m.user_id}
            className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-secondary/70"
          >



            <div className="relative">


              {m.avatar_url ? (

                <img
                  src={m.avatar_url}
                  alt={m.name}
                  className="size-8 rounded-full object-cover"
                />

              ) : (

                <Avatar
                  initials={m.initials}
                  color={m.color}
                  size={32}
                  online={m.online}
                />

              )}



              {m.online && (

                <span className="absolute bottom-0 right-0 size-2 rounded-full bg-green-500 ring-2 ring-background" />

              )}


            </div>




            <div className="min-w-0">


              <p className="truncate text-sm font-medium">
                {m.name}
              </p>


              <p className="truncate text-xs text-muted-foreground">
                {m.role}
              </p>


            </div>



          </li>


        ))}


      </ul>


    </div>

  )
}





function Dot({
  delay,
}: {
  delay:string
}) {


  return (

    <span
      className="size-1.5 animate-twinkle rounded-full bg-primary"
      style={{
        animationDelay:delay,
        animationDuration:'1s',
      }}
    />

  )
}