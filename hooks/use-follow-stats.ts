'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'


export function useFollowStats(profileId: string) {

  const [followers, setFollowers] = useState(0)
  const [following, setFollowing] = useState(0)



  async function loadStats() {


    const {
      count: followersCount
    } = await supabase
      .from('follows')
      .select('*', {
        count: 'exact',
        head: true,
      })
      .eq('following_id', profileId)



    const {
      count: followingCount
    } = await supabase
      .from('follows')
      .select('*', {
        count: 'exact',
        head: true,
      })
      .eq('follower_id', profileId)



    setFollowers(followersCount || 0)

    setFollowing(followingCount || 0)

  }





  useEffect(() => {


    loadStats()



    const channel = supabase
      .channel(`follow-stats-${profileId}`)


      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'follows',
        },
        () => {

          loadStats()

        }
      )


      .subscribe()



    return () => {

      supabase.removeChannel(channel)

    }


  }, [profileId])



  return {
    followers,
    following,
  }

}