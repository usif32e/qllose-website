import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'

import { ProfileHeader } from '@/components/qllose/profile-header'
import { ProfileActions } from '@/components/qllose/profile-actions'
import { ProfileStats } from '@/components/qllose/profile-stats'
import { ProfileAbout } from '@/components/qllose/profile-about'
import { ProfilePlanets } from '@/components/qllose/profile-planets'
import { BackToChat } from '@/components/qllose/back-to-chat'


export default async function ProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {


  const { id } = await params



  const {
    data: profile,
    error,
  } = await supabase
    .from('profiles')
    .select(`
      id,
      username,
      nickname,
      age,
      location,
      bio,
      avatar_url,
      is_founder,
      created_at
    `)
    .eq('id', id)
    .maybeSingle()



  if (error || !profile) {

    notFound()

  }




  const {
    data: planetMembers,
    error: planetsError
  } = await supabase
    .from('planet_members')
    .select(`
      role,
      planet_id
    `)
    .eq('user_id', id)



  console.log('PROFILE PLANETS:', planetMembers)
  console.log('PLANETS ERROR:', planetsError)



  const planets = (planetMembers || []).map((p) => ({

    id: p.planet_id,

    name:
      p.planet_id.charAt(0).toUpperCase() +
      p.planet_id.slice(1),

    role: p.role,

  }))





  return (

    <main className="min-h-screen p-6">

      <div className="mx-auto max-w-2xl">


        <BackToChat />



        <ProfileHeader
          profile={profile}
        />



        <ProfileActions
          profileId={id}
        />



        <ProfileStats
          profileId={id}
          planets={planets.length}
        />



        <ProfileAbout

          age={profile.age}

          location={profile.location}

          bio={profile.bio}

          createdAt={profile.created_at}

        />



        <ProfilePlanets
          planets={planets}
        />



      </div>


    </main>

  )

}