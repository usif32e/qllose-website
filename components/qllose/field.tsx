
'use client'

import {
  useState,
  type InputHTMLAttributes,
} from 'react'
import {
  Eye,
  EyeOff,
} from 'lucide-react'

interface FieldProps
  extends InputHTMLAttributes<HTMLInputElement> {
  id: string
  label: string
  icon?: React.ReactNode
}

export function Field({
  id,
  label,
  value,
  onChange,
  icon,
  type = 'text',
  className = '',
  ...props
}: FieldProps) {
  const [showPassword, setShowPassword] =
    useState(false)

  const isPassword =
    type === 'password'

  const inputType =
    isPassword && showPassword
      ? 'text'
      : type

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="
          text-sm
          font-medium
          tracking-tight
          text-foreground/90
        "
      >
        {label}
      </label>

      <div className="relative">
        {/* Left icon */}

        {icon && (
          <span
            className="
              pointer-events-none
              absolute
              left-3
              top-1/2
              z-10
              flex
              -translate-y-1/2
              items-center
              justify-center
              text-muted-foreground/45
            "
          >
            {icon}
          </span>
        )}

        <input
          {...props}
          id={id}
          name={id}
          type={inputType}
          {...(onChange
            ? {
                value:
                  value ?? '',
                onChange,
              }
            : {
                defaultValue:
                  value ?? '',
              })}
          className={`
            h-11
            w-full
            rounded-xl
            border
            border-border/60
            bg-background/35
            px-3.5
            text-sm
            text-foreground
            outline-none
            backdrop-blur-xl
            transition-all
            duration-200

            placeholder:text-muted-foreground/35

            hover:border-border

            focus:border-primary/30
            focus:bg-background/45
            focus:ring-2
            focus:ring-primary/10

            disabled:cursor-not-allowed
            disabled:opacity-50

            ${icon ? 'pl-10' : ''}

            ${
              isPassword
                ? 'pr-11'
                : ''
            }

            ${className}
          `}
        />

        {/* Password visibility toggle */}

        {isPassword && (
          <button
            type="button"
            onClick={() =>
              setShowPassword(
                (current) =>
                  !current,
              )
            }
            className="
              absolute
              right-2
              top-1/2
              flex
              size-8
              -translate-y-1/2
              items-center
              justify-center
              rounded-lg
              text-muted-foreground/55
              transition-all
              duration-200
              hover:bg-secondary/60
              hover:text-foreground
              active:scale-95
            "
            aria-label={
              showPassword
                ? 'Hide password'
                : 'Show password'
            }
            title={
              showPassword
                ? 'Hide password'
                : 'Show password'
            }
          >
            {showPassword ? (
              <EyeOff className="size-4" />
            ) : (
              <Eye className="size-4" />
            )}
          </button>
        )}
      </div>
    </div>
  )
}

