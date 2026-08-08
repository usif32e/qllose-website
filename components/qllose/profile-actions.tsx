'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'


interface ProfileActionsProps {
  profileId: string
}


export function ProfileActions({
  profileId,
}: ProfileActionsProps) {

  const router = useRouter()

  const [userId, setUserId] = useState<string | null>(null)
  const [following, setFollowing] = useState(false)
  const [loading, setLoading] = useState(true)



  useEffect(() => {

    loadProfileFollow()

  }, [profileId])



  async function loadProfileFollow() {


    const {
      data: {
        user
      },
      error: authError
    } = await supabase.auth.getUser()



    console.log('AUTH USER:', user)

    console.log('AUTH ERROR:', authError)



    if (!user) {

      setLoading(false)
      return

    }



    setUserId(user.id)



    if (user.id === profileId) {

      setLoading(false)
      return

    }



    const {
      data,
      error
    } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', user.id)
      .eq('following_id', profileId)
      .maybeSingle()



    console.log('CHECK FOLLOW:', data, error)



    setFollowing(Boolean(data))

    setLoading(false)

  }





  async function toggleFollow() {


    if (!userId) {

      console.log('NO USER ID')

      return

    }



    setLoading(true)



    if (following) {


      const {
        error
      } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', userId)
        .eq('following_id', profileId)



      console.log('UNFOLLOW ERROR:', error)



      if (!error) {

        setFollowing(false)

      }



    } else {


      const {
        data,
        error
      } = await supabase
        .from('follows')
        .insert({
          follower_id: userId,
          following_id: profileId,
        })
        .select()
        .single()



      console.log('FOLLOW DATA:', data)

      console.log('FOLLOW ERROR:', {

        message: error?.message,

        details: error?.details,

        hint: error?.hint,

        code: error?.code

      })



      if (!error) {

        setFollowing(true)

      }


    }



    router.refresh()

    setLoading(false)

  }





  if (userId === profileId) {


    return (

      <Button
        variant="outline"
        className="mt-5 rounded-xl"
      >

        Edit Profile

      </Button>

    )

  }





  return (

    <div className="mt-5 flex gap-3">


      <Button

        onClick={toggleFollow}

        disabled={loading}

        className="rounded-xl px-6"

      >

        {
          loading
          ? 'Loading...'
          :
          following
          ? 'Following ✓'
          :
          'Follow +'
        }

      </Button>



      <Button

        variant="outline"

        className="rounded-xl px-6"

      >

        Message

      </Button>


    </div>

  )

}