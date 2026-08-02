import type { InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  id: string
}

export function Field({ label, id, className, ...props }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
      </label>

      <input
        id={id}
        name={id}
        className={cn(
          'h-11 w-full rounded-xl border border-input bg-background/40 px-3.5 text-sm text-foreground shadow-sm outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-ring focus:ring-3 focus:ring-ring/30',
          className,
        )}
        {...props}
      />
    </div>
  )
}