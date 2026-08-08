interface ProfileAboutProps {

  age: number | null
  location: string | null
  bio: string | null
  createdAt: string

}



export function ProfileAbout({

  age,
  location,
  bio,
  createdAt,

}: ProfileAboutProps) {


  const joinDate = new Date(createdAt)
    .toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })



  return (

    <section className="mt-6 rounded-3xl border border-border bg-background/50 p-6">


      <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        About
      </h2>



      {bio && (

        <p className="mt-4 text-sm leading-relaxed">
          {bio}
        </p>

      )}



      <div className="mt-5 flex flex-col gap-3 text-sm text-muted-foreground">


        {location && (

          <p>
            🌍 {location}
          </p>

        )}



        {age && (

          <p>
            🎂 Age: {age}
          </p>

        )}



        <p>
          📅 Joined: {joinDate}
        </p>


      </div>


    </section>

  )

}