import Image from "next/image"
import { cn } from "@/lib/utils"

interface AvatarProps {
  initials: string
  color: string
  image?: string
  size?: number
  online?: boolean
  className?: string
}

export function Avatar({
  initials,
  color,
  image,
  size = 40,
  online,
  className,
}: AvatarProps) {
  return (
    <span
      className={cn("relative inline-flex shrink-0", className)}
      style={{ width: size, height: size }}
    >
      {image ? (
        <Image
          src={image}
          alt="Profile"
          width={size}
          height={size}
          className="rounded-full object-cover"
        />
      ) : (
        <span
          className="flex h-full w-full items-center justify-center rounded-full font-medium text-white"
          style={{
            background: `linear-gradient(140deg, color-mix(in oklab, ${color} 85%, white 15%), ${color})`,
            fontSize: size * 0.36,
          }}
        >
          {initials}
        </span>
      )}

      {online !== undefined && (
        <span
          className={cn(
            "absolute bottom-0 right-0 rounded-full border-2 border-card",
            online
              ? "bg-emerald-400"
              : "bg-muted-foreground/50"
          )}
          style={{
            width: size * 0.28,
            height: size * 0.28,
          }}
        />
      )}
    </span>
  )
}