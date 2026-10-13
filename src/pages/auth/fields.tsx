import { useId, useState, type InputHTMLAttributes, type ReactNode } from 'react'
import { Icon } from '@/components/ui/Icon'

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string | null
  hint?: ReactNode
  labelAside?: ReactNode
}

export function TextField({ label, error, hint, labelAside, className, ...input }: FieldProps) {
  const id = useId()
  const describedBy = error ? `${id}-err` : hint ? `${id}-hint` : undefined
  return (
    <div className="form-field">
      <div className="auth-label-row">
        <label htmlFor={id} className="form-label">
          {label}
        </label>
        {labelAside}
      </div>
      <input
        id={id}
        className={`input ${className ?? ''}`}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        {...input}
      />
      {error ? (
        <span id={`${id}-err`} className="field-error">
          {error}
        </span>
      ) : (
        hint && (
          <span id={`${id}-hint`} className="field-hint">
            {hint}
          </span>
        )
      )}
    </div>
  )
}

export function PasswordField(props: Omit<FieldProps, 'type'>) {
  const [show, setShow] = useState(false)
  const id = useId()
  const { label, error, hint, labelAside, ...input } = props
  return (
    <div className="form-field">
      <div className="auth-label-row">
        <label htmlFor={id} className="form-label">
          {label}
        </label>
        {labelAside}
      </div>
      <div className="pw-wrap">
        <input
          id={id}
          type={show ? 'text' : 'password'}
          className="input input-ltr"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-err` : undefined}
          {...input}
        />
        <button
          type="button"
          className="pw-toggle"
          aria-label={show ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
          aria-pressed={show}
          onClick={() => setShow((s) => !s)}
        >
          <Icon name={show ? 'eyeOff' : 'eye'} size={18} />
        </button>
      </div>
      {error ? (
        <span id={`${id}-err`} className="field-error">
          {error}
        </span>
      ) : (
        hint && <span className="field-hint">{hint}</span>
      )}
    </div>
  )
}

/** Six single-digit boxes that behave like one input (paste, backspace, arrows). */
export function OtpInput({ value, onChange, length = 6 }: { value: string; onChange: (v: string) => void; length?: number }) {
  const digits = Array.from({ length }, (_, i) => value[i] ?? '')

  function focusAt(i: number) {
    const el = document.querySelector<HTMLInputElement>(`[data-otp="${i}"]`)
    el?.focus()
    el?.select()
  }

  return (
    <div className="otp" role="group" aria-label="كود التفعيل">
      {digits.map((d, i) => (
        <input
          key={i}
          data-otp={i}
          inputMode="numeric"
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          aria-label={`الرقم ${i + 1}`}
          maxLength={length}
          value={d}
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
