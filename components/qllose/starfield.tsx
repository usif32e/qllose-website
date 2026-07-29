'use client'

import { useEffect, useState } from 'react'

interface Star {
  top: string
  left: string
  size: number
  delay: string
  duration: string
  opacity: number
}

/**
 * Animated twinkling star layer for the deep-space background.
 * Stars are generated on the client to avoid hydration mismatches.
 */
export function Starfield({ density = 90 }: { density?: number }) {
  const [stars, setStars] = useState<Star[]>([])

  useEffect(() => {
    const generated = Array.from({ length: density }, () => ({
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: Math.random() * 2 + 1,
      delay: `${Math.random() * 4}s`,
      duration: `${Math.random() * 3 + 3}s`,
      opacity: Math.random() * 0.6 + 0.2,
    }))
    setStars(generated)
  }, [density])

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {stars.map((star, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-white animate-twinkle"
          style={{
            top: star.top,
            left: star.left,
            width: star.size,
            height: star.size,
            animationDelay: star.delay,
            animationDuration: star.duration,
            opacity: star.opacity,
          }}
        />
      ))}
    </div>
  )
}
