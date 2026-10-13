import type { ReactNode } from 'react'
import { Icon, type IconName } from './Icon'
import './states.css'

interface StateProps {
  icon?: IconName
  title: string
  body?: ReactNode
  action?: ReactNode
  compact?: boolean
}

export function EmptyState({ icon = 'sparkle', title, body, action, compact }: StateProps) {
  return (
    <div className={`state${compact ? ' compact' : ''}`} role="status">
      <span className="state-icon">
        <Icon name={icon} size={26} />
      </span>
      <b className="state-title">{title}</b>
      {body && <p className="state-body">{body}</p>}
      {action}
    </div>
  )
}

export function ErrorState({
  message,
  onRetry,
  compact,
}: {
  message?: string
  onRetry?: () => void
  compact?: boolean
}) {
  return (
    <div className={`state is-error${compact ? ' compact' : ''}`} role="alert">
      <span className="state-icon">
        <Icon name="alert" size={26} />
      </span>
      <b className="state-title">مقدرناش نحمّل البيانات</b>
      <p className="state-body">{message ?? 'حصلت مشكلة في الاتصال. حاول تاني بعد شوية.'}</p>
      {onRetry && (
        <button type="button" className="btn btn-outline btn-sm" onClick={onRetry}>
          <Icon name="refresh" size={16} />
          حاول تاني
        </button>
      )}
    </div>
  )
}

export function Spinner({ label = 'جاري التحميل' }: { label?: string }) {
  return (
    <span className="spinner" role="status">
      <span className="sr-only">{label}</span>
    </span>
  )
}
