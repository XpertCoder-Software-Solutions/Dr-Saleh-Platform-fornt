import { useId, useState, type InputHTMLAttributes, type ReactNode } from 'react'
import { Icon } from '@/components/ui/Icon'
import { inputClass } from '@/components/ui/button'
import { cn } from '@/lib/cn'

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string | null
  hint?: ReactNode
  labelAside?: ReactNode
  /** Left-to-right value (email, phone, password) shown right-aligned. */
  ltr?: boolean
}

function FieldFrame({
  id,
  label,
  labelAside,
  error,
  hint,
  children,
}: {
  id: string
  label: string
  labelAside?: ReactNode
  error?: string | null
  hint?: ReactNode
  children: ReactNode
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between">
        <label htmlFor={id} className="text-[15px] font-semibold text-ink">
          {label}
        </label>
        {labelAside && <span className="text-sm font-semibold">{labelAside}</span>}
      </div>
      {children}
      {error ? (
        <span id={`${id}-err`} className="text-sm text-danger">
          {error}
        </span>
      ) : (
        hint && (
          <span id={`${id}-hint`} className="text-[13px] text-muted">
            {hint}
          </span>
        )
      )}
    </div>
  )
}

export function TextField({ label, error, hint, labelAside, ltr, className, ...input }: FieldProps) {
  const id = useId()
  return (
    <FieldFrame id={id} label={label} labelAside={labelAside} error={error} hint={hint}>
      <input
        id={id}
        className={cn(inputClass, ltr && 'text-right [direction:ltr]', className)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-err` : hint ? `${id}-hint` : undefined}
        {...input}
      />
    </FieldFrame>
  )
}

export function PasswordField({
  label,
  error,
  hint,
  labelAside,
  ...input
}: Omit<FieldProps, 'type' | 'ltr'>) {
  const [show, setShow] = useState(false)
  const id = useId()
  return (
    <FieldFrame id={id} label={label} labelAside={labelAside} error={error} hint={hint}>
      <div className="relative">
        <input
          id={id}
          type={show ? 'text' : 'password'}
          className={cn(inputClass, 'pl-12 text-right [direction:ltr]')}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-err` : hint ? `${id}-hint` : undefined}
          {...input}
        />
        <button
          type="button"
          className="absolute top-1/2 left-1.5 flex size-10 -translate-y-1/2 items-center justify-center rounded-[10px] border-0 bg-transparent text-muted hover:bg-hover"
          aria-label={show ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
          aria-pressed={show}
          onClick={() => setShow((s) => !s)}
        >
          <Icon name={show ? 'eyeOff' : 'eye'} size={18} />
        </button>
      </div>
    </FieldFrame>
  )
}

/** Six single-digit boxes that behave like one input (paste, backspace, arrows). */
export function OtpInput({
  value,
  onChange,
  length = 6,
}: {
  value: string
  onChange: (v: string) => void
  length?: number
}) {
  const digits = Array.from({ length }, (_, i) => value[i] ?? '')

  function focusAt(i: number) {
    const el = document.querySelector<HTMLInputElement>(`[data-otp="${i}"]`)
    el?.focus()
    el?.select()
  }

  return (
    <div className="flex justify-center gap-2.5 [direction:ltr]" role="group" aria-label="كود التفعيل">
      {digits.map((d, i) => (
        <input
          key={i}
          data-otp={i}
          inputMode="numeric"
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          aria-label={`الرقم ${i + 1}`}
          maxLength={length}
          value={d}
          className="h-16 w-14 rounded-field border-[1.5px] border-line-2 bg-white text-center font-head text-[26px] font-bold text-ink focus:border-blue-400 focus:shadow-[0_0_0_4px_rgba(61,155,216,.15)] focus:outline-none max-[480px]:h-14 max-[480px]:w-11 max-[480px]:text-[22px]"
          onChange={(e) => {
            const typed = e.target.value.replace(/\D/g, '')
            if (!typed) return
            const next = (value.slice(0, i) + typed + value.slice(i + typed.length)).slice(0, length)
            onChange(next)
            focusAt(Math.min(length - 1, i + typed.length))
          }}
          onKeyDown={(e) => {
            if (e.key === 'Backspace') {
              e.preventDefault()
              const chars = value.split('')
              if (chars[i]) {
                chars[i] = ''
                onChange(chars.join('').slice(0, length))
              } else if (i > 0) {
                chars[i - 1] = ''
                onChange(chars.join(''))
                focusAt(i - 1)
              }
            } else if (e.key === 'ArrowLeft') focusAt(Math.min(length - 1, i + 1))
            else if (e.key === 'ArrowRight') focusAt(Math.max(0, i - 1))
          }}
          onPaste={(e) => {
            e.preventDefault()
            const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
            if (pasted) {
              onChange(pasted)
              focusAt(Math.min(length - 1, pasted.length))
            }
          }}
        />
      ))}
    </div>
  )
}
