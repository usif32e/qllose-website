'use client'

import { useState } from 'react'
import { Search, Hash, Globe, Users } from 'lucide-react'
import type { Planet } from '@/lib/qllose-data'
import { cn } from '@/lib/utils'

interface PlanetSidebarProps {
  planet: Planet
  activeChannel: string
  onSelectChannel: (channel: string) => void
  isMember: boolean
  onJoin: () => void
}

export function PlanetSidebar({
  planet,
  activeChannel,
  onSelectChannel,
  isMember,
  onJoin,
}: PlanetSidebarProps) {

  const [query, setQuery] = useState('')

  const filtered = planet.channels.filter((c) =>
    c.toLowerCase().includes(query.toLowerCase())
  )


  return (
    <aside className="flex h-full w-64 flex-col border-r border-border bg-sidebar/50 backdrop-blur-xl">


      {/* Planet header */}
      <div className="border-b border-border px-4 py-4">

        <div className="flex items-center gap-3">

          <span
            className="flex size-9 shrink-0 items-center justify-center rounded-xl"
            style={{
              background:
              `radial-gradient(circle at 35% 30%, color-mix(in oklab, ${planet.accent} 85%, white 20%), ${planet.accent2})`,
            }}
          />


          <div className="min-w-0">

            <p className="truncate text-sm font-semibold">
              {planet.name}
            </p>


            <div className="flex items-center gap-1 text-xs text-muted-foreground">

              <Users className="size-3" />

              {planet.members.toLocaleString()} members

            </div>

          </div>

        </div>



        {/* Join button */}

        {!isMember && (

          <button
            onClick={onJoin}
            className="
            mt-4
            w-full
            rounded-xl
            bg-primary
            py-2
            text-sm
            font-semibold
            text-primary-foreground
            transition
            hover:opacity-90
            "
          >
            Join Planet
          </button>

        )}


        {isMember && (

          <div
            className="
            mt-4
            rounded-xl
            bg-primary/10
            py-2
            text-center
            text-xs
            text-primary
            "
          >
            ✓ You are a member
          </div>

        )}


      </div>




      {/* Search */}

      <div className="px-3 py-3">

        <div className="flex h-9 items-center gap-2 rounded-lg border border-input bg-background/40 px-2.5">


          <Search className="size-4 text-muted-foreground" />


          <input

            value={query}

            onChange={(e)=>setQuery(e.target.value)}

            placeholder="Search channels"

            className="
            w-full
            bg-transparent
            text-sm
            outline-none
            placeholder:text-muted-foreground/70
            "

          />


        </div>


      </div>





      {/* Channels */}

      <div className="flex-1 overflow-y-auto px-2 pb-4">


        <p className="
        px-2
        py-1.5
        text-xs
        font-medium
        uppercase
        tracking-wider
        text-muted-foreground
        ">
          Channels
        </p>



        <ul className="flex flex-col gap-0.5">


          {filtered.map((channel)=>{


            const active =
            channel === activeChannel


            const Icon =
            channel === 'Global'
            ? Globe
            : Hash



            return (

              <li key={channel}>

                <button

                  onClick={()=>onSelectChannel(channel)}

                  className={cn(

                    'flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition-colors',

                    active

                    ? 'bg-primary/15 font-medium text-foreground'

                    : 'text-muted-foreground hover:bg-secondary/70 hover:text-foreground'

                  )}

                >

                  <Icon className="size-4 shrink-0 opacity-70"/>

                  <span className="truncate">
                    {channel}
                  </span>


                </button>


              </li>

            )

          })}



          {
            filtered.length===0 && (

              <li className="px-2.5 py-2 text-sm text-muted-foreground">
                No channels found
              </li>

            )
          }



        </ul>


      </div>


    </aside>
  )
}