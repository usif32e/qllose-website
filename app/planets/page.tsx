'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Users } from 'lucide-react'
import { Starfield } from '@/components/qllose/starfield'
import { Logo } from '@/components/qllose/logo'
import { PlanetOrb } from '@/components/qllose/planet-orb'
import { buttonVariants } from '@/components/ui/button'
import { planets } from '@/lib/qllose-data'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'


export default function PlanetSelectionPage() {


  const [memberCounts,setMemberCounts] =
    useState<Record<string,number>>({})



  useEffect(()=>{


    async function loadCounts(){


      const { data,error } =
        await supabase
        .from('planet_members')
        .select('planet_id')


      if(error){

        console.log(
          'MEMBERS COUNT ERROR:',
          error
        )

        return
      }



      const counts:Record<string,number>={}



      data.forEach((member)=>{

        counts[member.planet_id] =
          (counts[member.planet_id] || 0) + 1

      })



      setMemberCounts(counts)


    }


    loadCounts()


  },[])





  return (
    <main className="relative min-h-dvh overflow-hidden">

      <Starfield />


      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">

        <Logo />

        <Link
          href="/profile"
          className={cn(
            buttonVariants({
              variant:'ghost'
            }),
            'h-9 rounded-lg'
          )}
        >
          Profile
        </Link>

      </header>



      <section className="mx-auto max-w-6xl px-6 pb-24 pt-6 text-center">


        <h1 className="animate-rise text-balance text-4xl font-semibold tracking-tight sm:text-5xl">

          Choose your <span className="text-gradient">planet</span>

        </h1>


        <p className="animate-rise mx-auto mt-4 max-w-lg text-pretty leading-relaxed text-muted-foreground">

          Each planet is a universe of its own. Pick where you belong and step inside.

        </p>




        <div className="mt-16 grid gap-8 md:grid-cols-3">


          {planets.map((planet)=>(


            <article
              key={planet.id}
              className="group glass relative flex flex-col items-center rounded-3xl p-8 text-center transition-all duration-300 hover:-translate-y-2"
            >


              <div
                className="relative transition-transform duration-500 group-hover:scale-105"
              >

                <PlanetOrb
                  accent={planet.accent}
                  accent2={planet.accent2}
                  size={150}
                />

              </div>




              <h2 className="relative mt-8 text-xl font-semibold">

                {planet.name}

              </h2>




              <p className="relative mt-1 text-sm text-muted-foreground">

                {planet.tagline}

              </p>





              <div className="relative mt-4 flex flex-wrap justify-center gap-1.5">


                {planet.audience.slice(0,4).map((tag)=>(

                  <span
                    key={tag}
                    className="rounded-full border border-border bg-background/30 px-2.5 py-0.5 text-xs text-muted-foreground"
                  >

                    {tag}

                  </span>

                ))}


              </div>





              <div className="relative mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">

                <Users className="size-3.5" />

                {(
                  memberCounts[planet.id] || 0
                ).toLocaleString()} members


              </div>





              <Link

                href={`/planet/${planet.id}`}

                className={cn(
                  buttonVariants({
                    variant:'default'
                  }),
                  'group/btn relative mt-6 h-10 w-full rounded-xl text-sm'
                )}

              >

                Enter Planet

                <ArrowRight className="size-4 transition-transform group-hover/btn:translate-x-0.5"/>


              </Link>



            </article>


          ))}


        </div>


      </section>


    </main>
  )
}