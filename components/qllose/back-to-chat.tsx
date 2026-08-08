'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export function BackToChat() {

  const router = useRouter()

  return (
    <Button
      onClick={() => router.push('/planets')}
      variant="outline"
      className="mb-5 rounded-xl"
    >
      ← Back to Planets
    </Button>
  )

}