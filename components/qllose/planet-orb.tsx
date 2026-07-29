import { cn } from '@/lib/utils'

interface PlanetOrbProps {
  accent: string
  accent2: string
  size?: number
  className?: string
  float?: boolean
  ring?: boolean
}

/**
 * A glowing planet sphere rendered with layered CSS gradients.
 * Purely presentational — the visual identity of a Qllose planet.
 */
export function PlanetOrb({
  accent,
  accent2,
  size = 160,
  className,
  float = true,
  ring = true,
}: PlanetOrbProps) {
  return (
    <div
      className={cn('relative', float && 'animate-float-slow', className)}
      style={{ width: size, height: size }}
      aria-hidden
    >
      {/* outer glow */}
      <div
        className="absolute inset-0 rounded-full blur-2xl opacity-60"
        style={{ background: `radial-gradient(circle at 50% 50%, ${accent}, transparent 70%)` }}
      />
      {/* orbit ring */}
      {ring && (
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-[50%] border animate-spin-slow"
          style={{
            width: size * 1.5,
            height: size * 0.5,
            transform: 'translate(-50%, -50%) rotate(-24deg)',
            borderColor: `color-mix(in oklab, ${accent} 45%, transparent)`,
          }}
        />
      )}
      {/* sphere */}
      <div
        className="absolute inset-0 rounded-full shadow-2xl"
        style={{
          background: `radial-gradient(circle at 32% 28%, color-mix(in oklab, ${accent} 90%, white 25%), ${accent} 42%, ${accent2} 78%, oklch(0.14 0.03 265) 120%)`,
          boxShadow: `0 0 60px color-mix(in oklab, ${accent} 55%, transparent), inset -12px -12px 40px oklch(0 0 0 / 0.45)`,
        }}
      />
      {/* highlight */}
      <div
        className="absolute rounded-full opacity-70 blur-md"
        style={{
          top: size * 0.16,
          left: size * 0.2,
          width: size * 0.28,
          height: size * 0.18,
          background: 'oklch(1 0 0 / 0.5)',
        }}
      />
    </div>
  )
}
