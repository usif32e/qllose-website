'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { AuthShell } from '@/components/qllose/auth-shell'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function CreateProfilePage() {
  const router = useRouter()

  const [image, setImage] = useState<File | null>(null)
  const [username, setUsername] = useState('')
  const [nickname, setNickname] = useState('')
  const [age, setAge] = useState('')
  const [location, setLocation] = useState('')
  const [bio, setBio] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)


  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    setLoading(true)
    setError(null)

    try {

      const {
        data: { user },
      } = await supabase.auth.getUser()


      if (!user) {
        setError('You are not logged in')
        setLoading(false)
        return
      }


      let avatar_url = null



      if (image) {

        const fileExt = image.name.split('.').pop()
        const fileName = `${user.id}.${fileExt}`


        const { error: uploadError } =
          await supabase.storage
            .from('avatars')
            .upload(fileName, image, {
              upsert: true,
            })


        if (uploadError) {

          console.log(uploadError)
          setError(uploadError.message)
          setLoading(false)
          return

        }


        const { data } =
          supabase.storage
            .from('avatars')
            .getPublicUrl(fileName)


        avatar_url = data.publicUrl

      }



      // Check username availability

      const { data: existingUser } =
        await supabase
          .from('profiles')
          .select('id')
          .eq('username', username)
          .neq('id', user.id)
          .maybeSingle()



      if (existingUser) {

        setError('Username already taken')
        setLoading(false)
        return

      }





      const { error: profileError } =
        await supabase
          .from('profiles')
          .upsert({

            id: user.id,
            username,
            nickname,
            age: Number(age),
            location,
            bio,
            avatar_url,

          })



if (profileError) {
  console.log("PROFILE ERROR:", profileError)
  alert(JSON.stringify(profileError, null, 2))

  setError(profileError.message)
  setLoading(false)
  return
}



      router.push('/planets')



    } catch (err) {

      console.log(err)
      setError('Something went wrong')

    }


    setLoading(false)

  }





  return (

    <AuthShell
      title="Create your profile"
      subtitle="Tell the universe who you are."
    >


      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4"
      >


        <div className="flex flex-col items-center gap-3">


          <div className="h-24 w-24 rounded-xl border flex items-center justify-center overflow-hidden">

            {image ? (

              <img
                src={URL.createObjectURL(image)}
                alt="profile"
                className="h-full w-full object-cover"
              />

            ) : (

              <span className="text-xs">
                Photo
              </span>

            )}

          </div>



          <label className="cursor-pointer rounded-xl border px-4 py-2">

            Upload Photo

            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e)=>{

                const file =
                  e.target.files?.[0]

                if(file){
                  setImage(file)
                }

              }}
            />

          </label>


        </div>





        <input
          className="h-11 rounded-xl border px-4"
          placeholder="Username"
          value={username}
          onChange={(e)=>setUsername(e.target.value)}
          required
        />



        <input
          className="h-11 rounded-xl border px-4"
          placeholder="Nickname"
          value={nickname}
          onChange={(e)=>setNickname(e.target.value)}
          required
        />



        <input
          className="h-11 rounded-xl border px-4"
          placeholder="Age"
          type="number"
          value={age}
          onChange={(e)=>setAge(e.target.value)}
          required
        />



        <input
          className="h-11 rounded-xl border px-4"
          placeholder="Location"
          value={location}
          onChange={(e)=>setLocation(e.target.value)}
          required
        />



        <textarea
          className="min-h-24 rounded-xl border px-4 py-3"
          placeholder="Tell the universe about you..."
          value={bio}
          onChange={(e)=>setBio(e.target.value)}
        />




        {error && (

          <p className="text-sm text-red-500">
            {error}
          </p>

        )}





        <Button
          type="submit"
          disabled={loading}
        >

          {loading
            ? 'Creating...'
            : 'Enter The Universe'
          }

        </Button>



      </form>


    </AuthShell>

  )

}