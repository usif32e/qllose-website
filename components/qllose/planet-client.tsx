'use client'

import { useState, useEffect } from 'react'
import type { Planet, Message, Member } from '@/lib/qllose-data'

import { supabase } from '@/lib/supabase'

import { AppNav } from '@/components/qllose/app-nav'
import { PlanetSidebar } from '@/components/qllose/planet-sidebar'
import { ChatView } from '@/components/qllose/chat-view'
import { MembersPanel } from '@/components/qllose/members-panel'


interface PlanetClientProps {
  planet: Planet
}


export function PlanetClient({
  planet,
}: PlanetClientProps) {


  const [activeChannel, setActiveChannel] =
    useState('Global')


  const [profile, setProfile] =
    useState<{
      id:string
      username:string
      nickname:string
      avatar_url:string|null
    } | null>(null)


  const [planetMembers, setPlanetMembers] =
    useState<Member[]>([])


  const [memberCount,setMemberCount] =
    useState(0)


  const [threads,setThreads] =
    useState<Record<string,Message[]>>({
      Global:[]
    })


  const [typingUsers,setTypingUsers] =
    useState<string[]>([])



  async function loadProfile(){

    const {
      data:{user}
    } = await supabase.auth.getUser()


    if(!user)
      return


    const {data,error} =
      await supabase
      .from('profiles')
      .select(
        'id,username,nickname,avatar_url'
      )
      .eq(
        'id',
        user.id
      )
      .single()


    if(error){

      console.log(
        'PROFILE ERROR:',
        error
      )

      return

    }


    setProfile(data)

  }



  async function loadMembers(){

    const {data,error} =
      await supabase
      .from('planet_members')
      .select(`
        user_id,
        role,
        profiles(
          id,
          username,
          nickname,
          avatar_url
        )
      `)
      .eq(
        'planet_id',
        planet.id
      )


    if(error){

      console.log(
        'MEMBERS ERROR:',
        error
      )

      return

    }



    const formatted:Member[] =
      (data || []).map((m:any)=>{


        const p =
          Array.isArray(m.profiles)
          ? m.profiles[0]
          : m.profiles



        return {

          user_id:m.user_id,

          name:
            p?.nickname ||
            p?.username ||
            'User',


          initials:
            (
              p?.username ||
              'U'
            )
            .slice(0,2)
            .toUpperCase(),


          color:
            'var(--primary)',


          role:
            m.role || 'Member',


          online:true,


          avatar_url:
            p?.avatar_url || null

        }


      })


    setPlanetMembers(formatted)


    setMemberCount(
      formatted.length
    )

  }
  async function joinPlanet(){

    const {
      data:{user}
    } = await supabase.auth.getUser()


    if(!user)
      return



    const {error} =
      await supabase.rpc(
        'join_planet',
        {
          p_planet_id: planet.id
        }
      )


    if(error){

      console.log(
        'JOIN ERROR:',
        error
      )

      return

    }


    await loadMembers()

  }




  useEffect(()=>{

    async function init(){

      await loadProfile()

      await loadMembers()

    }


    init()


  },[planet.id])





  // MESSAGES

  useEffect(()=>{


    async function loadMessages(){


      const {data,error} =
        await supabase
        .from('messages')
        .select('*')
        .eq(
          'planet_id',
          planet.id
        )
        .eq(
          'channel',
          activeChannel
        )
        .order(
          'created_at',
          {
            ascending:true
          }
        )


      if(error){

        console.log(
          'MESSAGES ERROR:',
          error
        )

        return

      }



      const ids =
      [
        ...new Set(
          data.map(
            m=>m.user_id
          )
        )
      ]



      let profiles:any[] = []



      if(ids.length > 0){

        const {data:profileData} =
          await supabase
          .from('profiles')
          .select(
            'id,username,nickname,avatar_url'
          )
          .in(
            'id',
            ids
          )


        profiles =
          profileData || []

      }



      const formatted:Message[] =
      data.map((m:any)=>{


        const p =
          profiles.find(
            x=>x.id===m.user_id
          )


        return {

          id:m.id,

          author:
            p?.nickname ||
            p?.username ||
            'User',


          initials:
            (
              p?.username ||
              'U'
            )
            .slice(0,2)
            .toUpperCase(),


          color:
            'var(--primary)',


          avatar_url:
            p?.avatar_url || null,


          time:
            new Date(
              m.created_at
            )
            .toLocaleTimeString([],{
              hour:'2-digit',
              minute:'2-digit'
            }),


          text:
            m.content

        }


      })



      setThreads(prev=>({

        ...prev,

        [activeChannel]:
          formatted

      }))


    }



    loadMessages()



    const channel =
      supabase
      .channel(
        `messages-${planet.id}-${activeChannel}`
      )
      .on(
        'postgres_changes',
        {
          event:'INSERT',
          schema:'public',
          table:'messages',
          filter:
          `planet_id=eq.${planet.id}`
        },
        ()=>{

          loadMessages()

        }
      )
      .subscribe()



    return ()=>{

      supabase.removeChannel(
        channel
      )

    }



  },[
    planet.id,
    activeChannel
  ])
    // TYPING

  useEffect(()=>{


    const channel =
      supabase
      .channel(
        `typing-${planet.id}-${activeChannel}`
      )
      .on(
        'broadcast',
        {
          event:'typing'
        },
        ({payload})=>{


          setTypingUsers(prev=>{


            if(
              prev.includes(payload.username)
            )
            return prev



            return [
              ...prev,
              payload.username
            ]

          })



          setTimeout(()=>{


            setTypingUsers(prev=>

              prev.filter(
                x=>x!==payload.username
              )

            )


          },2000)


        }
      )
      .subscribe()



    return ()=>{

      supabase.removeChannel(
        channel
      )

    }


  },[
    planet.id,
    activeChannel
  ])





  function handleTyping(){


    if(!profile)
      return



    supabase
    .channel(
      `typing-${planet.id}-${activeChannel}`
    )
    .send({

      type:'broadcast',

      event:'typing',

      payload:{

        username:
          profile.nickname ||
          profile.username

      }

    })


  }






  async function handleSend(
    text:string
  ){


    const {
      data:{user}
    } =
    await supabase.auth.getUser()



    if(!user)
      return



    const {error} =
      await supabase
      .from('messages')
      .insert({

        user_id:user.id,

        planet_id:planet.id,

        channel:activeChannel,

        content:text

      })



    if(error){

      console.log(
        'SEND ERROR:',
        error
      )

    }


  }





  return (

    <main className="flex h-dvh overflow-hidden">


      <AppNav />


      <PlanetSidebar

        planet={{
          ...planet,
          members:memberCount
        }}

        activeChannel={
          activeChannel
        }

        onSelectChannel={
          setActiveChannel
        }

        isMember={
          planetMembers.some(
            m=>m.user_id===profile?.id
          )
        }

        onJoin={
          joinPlanet
        }

      />



      <ChatView

        channel={
          activeChannel
        }

        planetName={
          planet.name
        }

        messages={
          threads[activeChannel] ?? []
        }

        typingUsers={
          typingUsers
        }

        onSend={
          handleSend
        }

        onTyping={
          handleTyping
        }

        onToggleSidebar={
          ()=>{}
        }

      />



      <MembersPanel

        members={
          planetMembers
        }

        typingUsers={
          typingUsers
        }

      />


    </main>

  )


}
