
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
 * Qllose Planet Orb
 *
 * Purely presentational.
 * No backend, auth, database, or product logic.
 *
 * Visual direction:
 * - quiet futuristic
 * - cinematic depth
 * - soft atmospheric lighting
 * - subtle motion
 */

export function PlanetOrb({
  accent,
  accent2,
  size = 160,
  className,
  float = true,
  ring = true,
}: PlanetOrbProps) {
  const ringWidth =
    size * 1.62

  const ringHeight =
    size * 0.54

  return (
    <div
      className={cn(
        'group relative isolate select-none',
        float &&
          'animate-float-slow motion-safe:animate-float-slow',
        className,
      )}
      style={{
        width: size,
        height: size,
        perspective: 1000,
      }}
      aria-hidden
    >
      {/* =====================================================
          DEEP SPACE AURA
      ===================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          -inset-[22%]
          rounded-full
          blur-[55px]
          opacity-25
          transition-all duration-700 ease-out
          group-hover:scale-105
          group-hover:opacity-35
        "
        style={{
          background: `
            radial-gradient(
              circle,
              color-mix(
                in oklab,
                ${accent} 55%,
                transparent
              ),
              transparent 68%
            )
          `,
        }}
      />

      {/* tighter atmospheric glow */}

      <div
        className="
          pointer-events-none
          absolute
          -inset-[8%]
          rounded-full
          opacity-45
          blur-xl
          transition-all duration-700
          group-hover:opacity-60
        "
        style={{
          background: `
            radial-gradient(
              circle at 42% 35%,
              color-mix(
                in oklab,
                ${accent} 42%,
                transparent
              ),
              transparent 62%
            )
          `,
        }}
      />

      {/* =====================================================
          ORBIT SYSTEM
      ===================================================== */}

      {ring && (
        <>
          {/* rear orbit */}

          <div
            className="
              pointer-events-none
              absolute left-1/2 top-1/2
              rounded-[50%]
              border
              opacity-45
              transition-all duration-700
              ease-out
              group-hover:opacity-65
              group-hover:scale-[1.025]
            "
            style={{
              width: ringWidth,
              height: ringHeight,
              transform:
                'translate(-50%, -50%) rotate(-24deg)',
              borderColor: `
                color-mix(
                  in oklab,
                  ${accent} 32%,
                  transparent
                )
              `,
              boxShadow: `
                0 0 18px
                color-mix(
                  in oklab,
                  ${accent} 12%,
                  transparent
                )
              `,
            }}
          />

          {/* secondary orbit */}

          <div
            className="
              pointer-events-none
              absolute left-1/2 top-1/2
              rounded-[50%]
              border
              opacity-15
              animate-spin-slow
            "
            style={{
              width: ringWidth * 1.08,
              height: ringHeight * 0.8,
              transform:
                'translate(-50%, -50%) rotate(18deg)',
              borderColor: `
                color-mix(
                  in oklab,
                  ${accent2} 35%,
                  transparent
                )
              `,
              boxShadow: `
                0 0 22px
                color-mix(
                  in oklab,
                  ${accent2} 8%,
                  transparent
                )
              `,
            }}
          />

          {/* subtle orbital guide */}

          <div
            className="
              pointer-events-none
              absolute left-1/2 top-1/2
              rounded-[50%]
              border
              border-white/[0.025]
            "
            style={{
              width: ringWidth * 1.16,
              height: ringHeight * 0.9,
              transform:
                'translate(-50%, -50%) rotate(-8deg)',
            }}
          />
        </>
      )}

      {/* =====================================================
          PLANET BODY
      ===================================================== */}

      <div
        className="
          absolute inset-0
          overflow-hidden
          rounded-full
          transition-all duration-700
          ease-out
          group-hover:scale-[1.025]
        "
        style={{
          transformStyle:
            'preserve-3d',

          background: `
            radial-gradient(
              circle at 30% 23%,
              color-mix(
                in oklab,
                ${accent} 82%,
                white 30%
              ),
              transparent 18%
            ),

            radial-gradient(
              circle at 39% 32%,
              color-mix(
                in oklab,
                white 12%,
                transparent
              ),
              transparent 34%
            ),

            radial-gradient(
              circle at 65% 65%,
              color-mix(
                in oklab,
                ${accent2} 90%,
                black 14%
              ),
              transparent 55%
            ),

            radial-gradient(
              circle at 38% 34%,
              ${accent},
              ${accent2} 62%,
              oklch(0.10 0.03 265) 118%
            )
          `,

          boxShadow: `
            0 0 0 1px
              color-mix(
                in oklab,
                ${accent} 18%,
                transparent
              ),

            0 0 26px
              color-mix(
                in oklab,
                ${accent} 24%,
                transparent
              ),

            0 0 75px
              color-mix(
                in oklab,
                ${accent} 11%,
                transparent
              ),

            inset -20px -22px 46px
              oklch(0 0 0 / 0.46),

            inset 11px 8px 22px
              oklch(1 0 0 / 0.055)
          `,

          filter:
            'saturate(1.05)',
        }}
      >
        {/* =================================================
            SURFACE MOVEMENT
        ================================================= */}

        <div
          className="
            pointer-events-none
            absolute
            -inset-[24%]
            opacity-20
            mix-blend-screen
            animate-spin-slow
          "
          style={{
            background: `
              conic-gradient(
                from 18deg,

                transparent 0deg,

                color-mix(
                  in oklab,
                  ${accent} 12%,
                  transparent
                ) 55deg,

                transparent 110deg,

                color-mix(
                  in oklab,
                  ${accent2} 10%,
                  transparent
                ) 185deg,

                transparent 250deg,

                color-mix(
                  in oklab,
                  white 6%,
                  transparent
                ) 320deg,

                transparent 360deg
              )
            `,
          }}
        />

        {/* secondary surface flow */}

        <div
          className="
            pointer-events-none
            absolute
            -left-[30%]
            top-[34%]
            h-[34%]
            w-[160%]
            rotate-[-17deg]
            rounded-full
            opacity-10
            blur-2xl
          "
          style={{
            background: `
              linear-gradient(
                90deg,
                transparent,
                color-mix(
                  in oklab,
                  white 12%,
                  ${accent} 35%
                ),
                transparent
              )
            `,
          }}
        />

        {/* =================================================
            ATMOSPHERIC EDGE
        ================================================= */}

        <div
          className="
            pointer-events-none
            absolute
            inset-[-1px]
            rounded-full
            opacity-75
          "
          style={{
            background: `
              radial-gradient(
                circle at 24% 20%,
                transparent 0 36%,
                color-mix(
                  in oklab,
                  white 6%,
                  transparent
                ) 51%,
                transparent 72%
              )
            `,
          }}
        />

        {/* =================================================
            MAIN HIGHLIGHT
        ================================================= */}

        <div
          className="
            pointer-events-none
            absolute
            rounded-full
            blur-[6px]
            opacity-55
            transition-all duration-700
            ease-out
            group-hover:translate-x-1
            group-hover:-translate-y-0.5
            group-hover:opacity-75
          "
          style={{
            top: size * 0.12,
            left: size * 0.17,
            width: size * 0.31,
            height: size * 0.18,
            background: `
              radial-gradient(
                ellipse,
                oklch(1 0 0 / 0.56),
                oklch(1 0 0 / 0.14) 44%,
                transparent 78%
              )
            `,
          }}
        />

        {/* small specular point */}

        <div
          className="
            pointer-events-none
            absolute
            rounded-full
            bg-white/75
            blur-[1px]
          "
          style={{
            top: size * 0.225,
            left: size * 0.275,
            width: Math.max(
              3,
              size * 0.024,
            ),
            height: Math.max(
              3,
              size * 0.024,
            ),
          }}
        />

        {/* =================================================
            DEPTH SHADOW
        ================================================= */}

        <div
          className="
            pointer-events-none
            absolute inset-0
            rounded-full
          "
          style={{
            background: `
              radial-gradient(
                ellipse at 50% 115%,
                oklch(0 0 0 / 0.54),
                transparent 55%
              )
            `,
          }}
        />

        {/* soft side shade */}

        <div
          className="
            pointer-events-none
            absolute inset-0
            rounded-full
          "
          style={{
            background: `
              radial-gradient(
                ellipse at 92% 52%,
                oklch(0 0 0 / 0.18),
                transparent 54%
              )
            `,
          }}
        />

        {/* atmospheric rim */}

        <div
          className="
            pointer-events-none
            absolute
            inset-0
            rounded-full
            border
            border-white/[0.045]
          "
        />
      </div>

      {/* =====================================================
          FOREGROUND ORBIT
      ===================================================== */}

      {ring && (
        <>
          <div
            className="
              pointer-events-none
              absolute left-1/2 top-1/2
              rounded-[50%]
              border
              transition-all duration-700
              ease-out
              group-hover:brightness-125
            "
            style={{
              width: ringWidth,
              height: ringHeight,
              transform:
                'translate(-50%, -50%) rotate(-24deg)',
              borderColor: `
                color-mix(
                  in oklab,
                  ${accent} 23%,
                  transparent
                )
              `,
              clipPath:
                'inset(48% 0 0 0)',
              boxShadow: `
                0 0 15px
                color-mix(
                  in oklab,
                  ${accent} 10%,
                  transparent
                )
              `,
            }}
          />

          {/* orbital spark */}

          <div
            className="
              pointer-events-none
              absolute left-1/2 top-1/2
              size-1.5
              rounded-full
              opacity-60
              animate-orbit-pulse
            "
            style={{
              transform: `
                translate(
                  calc(-50% + ${ringWidth * 0.36}px),
                  calc(-50% - ${ringHeight * 0.16}px)
                )
              `,
              background:
                accent,
              boxShadow: `
                0 0 8px ${accent},
                0 0 18px
                color-mix(
                  in oklab,
                  ${accent} 45%,
                  transparent
                )
              `,
            }}
          />
        </>
      )}
    </div>
  )
}

