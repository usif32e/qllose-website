'use client'

import { useEffect, useRef, useState } from 'react'
import type { FormEvent, KeyboardEvent } from 'react'
import { Hash, Globe, Send, Smile, Plus, Trash2 } from 'lucide-react'

import type { Message } from '@/lib/qllose-data'
import { Avatar } from '@/components/qllose/avatar'


interface ChatViewProps {

channel: string

planetName: string

messages: Message[]

typingUsers: string[]

onSend: (text: string) => void

onTyping: () => void

onDeleteMessage?: (id: string) => void

currentUserId?: string

onToggleSidebar: () => void

}

export function ChatView({
  channel,
  planetName,
  messages,
  typingUsers,
  onSend,
  onTyping,
  onDeleteMessage,
  currentUserId,
  onToggleSidebar,
}: ChatViewProps) {

  const [draft,setDraft] = useState('')

  const scrollRef =
    useRef<HTMLDivElement | null>(null)


useEffect(()=>{


scrollRef.current?.scrollTo({

top:
scrollRef.current.scrollHeight,

behavior:'smooth'

})


},[
messages,
typingUsers
])





function submit(e:FormEvent){


e.preventDefault()


const text =
draft.trim()


if(!text)
return



onSend(text)


setDraft('')


}





function handleKeyDown(
e:KeyboardEvent
){


if(

e.key === 'Enter' &&

!e.shiftKey &&

!e.nativeEvent.isComposing &&

e.keyCode !== 229

){


e.preventDefault()


submit(e)

}


}



const Icon =
channel === 'Global'
?
Globe
:
Hash





return (


<section className="flex flex-1 flex-col overflow-hidden">


<div className="flex items-center gap-2 border-b border-border p-4">


<Icon className="size-5"/>


<h2 className="font-semibold">

{planetName}

</h2>


</div>





<div
ref={scrollRef}
className="flex-1 space-y-4 overflow-y-auto p-4"
>


{messages.map((m)=>(


<div
key={m.id}
className="flex gap-3"
>


<Avatar
  image={m.avatar_url ?? undefined}
  initials={m.initials}
  color={m.color}
/>


<div className="flex-1">


<div className="flex items-center gap-2">


<span className="font-medium">

{m.author}

</span>



<span className="text-xs text-muted-foreground">

{m.time}

</span>



<button

onClick={() => onDeleteMessage?.(m.id)}

className="ml-auto text-muted-foreground hover:text-red-500"

title="Delete message"

>

<Trash2 className="size-4"/>

</button>



</div>




<p className="mt-1 text-sm leading-relaxed text-foreground/90">

{m.text}

</p>



</div>


</div>


))}





{
typingUsers.length > 0 && (


<div className="text-xs text-muted-foreground">


{typingUsers.join(', ')} typing…

</div>


)
}



</div>






<form

onSubmit={submit}

className="px-4 pb-5 pt-1 sm:px-6"

>



<div className="flex items-end gap-2 rounded-2xl border border-input bg-background/50 px-3 py-2">



<button type="button">

<Plus className="size-5"/>

</button>




<textarea

value={draft}

onChange={(e)=>{

setDraft(e.target.value)

onTyping()

}}

onKeyDown={handleKeyDown}

rows={1}

placeholder={`Message #${channel}`}

className="flex-1 resize-none bg-transparent outline-none"

/>




<button type="button">

<Smile className="size-5"/>

</button>





<button

type="submit"

disabled={!draft.trim()}

className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground disabled:opacity-40"

>

<Send className="size-4"/>

</button>



</div>


</form>


</section>


)

}