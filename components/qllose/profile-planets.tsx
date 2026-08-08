interface ProfilePlanetsProps {
  planets: {
    id: string
    name: string
    role?: string
  }[]
}


const planetIcons: Record<string, string> = {
  gamer: '🎮',
  creator: '🎨',
  business: '💼',
}



const planetColors: Record<string, string> = {
  gamer: 'from-green-500/20',
  creator: 'from-purple-500/20',
  business: 'from-blue-500/20',
}



export function ProfilePlanets({
  planets,
}: ProfilePlanetsProps) {


  return (

    <section className="
      mt-6
      rounded-3xl
      border
      border-border
      bg-background/50
      p-6
      backdrop-blur-xl
    ">


      <h2 className="
        text-sm
        font-semibold
        uppercase
        tracking-wider
        text-muted-foreground
      ">
        Planets
      </h2>



      <div className="mt-5 grid gap-4">


        {planets.length === 0 && (

          <p className="text-sm text-muted-foreground">
            No planets joined yet.
          </p>

        )}



        {planets.map((planet) => (

          <div
            key={planet.id}
            className={`
              relative
              overflow-hidden
              rounded-2xl
              border
              border-border
              bg-gradient-to-br
              ${planetColors[planet.id] || 'from-primary/20'}
              to-background
              p-5
              transition
              hover:-translate-y-1
            `}
          >


            <div className="
              flex
              items-center
              justify-between
            ">


              <div className="flex items-center gap-4">


                <div className="
                  flex
                  size-12
                  items-center
                  justify-center
                  rounded-2xl
                  bg-background/50
                  text-2xl
                ">
                  {planetIcons[planet.id] || '🌌'}
                </div>



                <div>


                  <p className="text-lg font-semibold">
                    {planet.name}
                  </p>


                  {planet.role && (

                    <span className="
                      mt-1
                      inline-flex
                      rounded-full
                      bg-primary/20
                      px-3
                      py-1
                      text-xs
                      font-medium
                      text-primary
                    ">
                      {planet.role}
                    </span>

                  )}


                </div>


              </div>



              <span className="
                text-xs
                text-muted-foreground
              ">
                Joined
              </span>


            </div>


          </div>

        ))}


      </div>


    </section>

  )

}