import Image from 'next/image'
import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
  showText?: boolean
  size?: number
  /** Enables a stronger cosmic glow + slow float, for hero/welcome placements. */
  cinematic?: boolean
}

/**
 * Qllose brand mark: the crystalline meteor "Q" cosmic symbol.
 * The single source of truth for the logo across the whole app.
 */
export function Logo({ className, showText = true, size = 32, cinematic = false }: LogoProps) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <span
        className={cn('relative inline-flex shrink-0 items-center justify-center', cinematic && 'animate-float-medium')}
        style={{ width: size, height: size }}
      >
        {/* cosmic glow halo */}
        <span
          aria-hidden
          className="absolute inset-0 rounded-full blur-xl"
          style={{
            background:
              'radial-gradient(circle, oklch(0.8 0.12 290 / 0.55), oklch(0.7 0.14 280 / 0.15) 60%, transparent 75%)',
            transform: cinematic ? 'scale(1.6)' : 'scale(1.25)',
          }}
        />
        <Image
          src="/qllose-logo.png"
          alt="Qllose"
          width={size}
          height={size}
          priority
          className="relative z-10 h-full w-full object-contain mix-blend-screen"
        />
      </span>
      {showText && (
        <span className="text-lg font-semibold tracking-tight text-foreground">Qllose</span>
      )}
    </span>
  )
}
