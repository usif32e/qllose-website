import { InputHTMLAttributes } from 'react'

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string
  label: string
}

export function Field({
  id,
  label,
  value,
  onChange,
  ...props
}: FieldProps) {

  return (
    <div className="flex flex-col gap-1.5">

      <label className="text-sm font-medium">
        {label}
      </label>

      <input
        {...props}
        id={id}
        name={id}
        {...(onChange
          ? {
              value: value ?? '',
              onChange,
            }
          : {
              defaultValue: value ?? '',
            })}
        className="h-11 rounded-xl border px-4"
      />

    </div>
  )
}