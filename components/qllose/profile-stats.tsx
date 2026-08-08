'use client'

import { useFollowStats } from '@/hooks/use-follow-stats'


interface ProfileStatsProps {

  profileId: string
  planets: number

}



export function ProfileStats({

  profileId,
  planets,

}: ProfileStatsProps) {


  const {
    followers,
    following,

  } = useFollowStats(profileId)



  return (

    <div className="mt-6 grid grid-cols-3 gap-3">


      <Stat
        label="Followers"
        value={followers}
      />


      <Stat
        label="Following"
        value={following}
      />


      <Stat
        label="Planets"
        value={planets}
      />


    </div>

  )

}



function Stat({

  label,
  value,

}: {
  label:string
  value:number
}) {


  return (

    <div className="rounded-2xl border border-border bg-background/50 p-4 text-center">

      <p className="text-xl font-bold">
        {value}
      </p>

      <p className="text-xs text-muted-foreground">
        {label}
      </p>

    </div>

  )

}