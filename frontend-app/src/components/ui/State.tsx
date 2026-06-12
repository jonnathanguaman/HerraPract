import { AlertCircle, Inbox } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button } from './Button'

export function LoadingState({ label = 'Cargando datos...' }: { label?: string }) {
  return (
    <div className="state-box">
      <span className="spinner" />
      <p>{label}</p>
    </div>
  )
}

export function EmptyState({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="state-box">
      <Inbox size={28} />
      <p>{title}</p>
      {action}
    </div>
  )
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="state-box state-error">
      <AlertCircle size={28} />
      <p>{message}</p>
      {onRetry ? <Button variant="secondary" onClick={onRetry}>Reintentar</Button> : null}
    </div>
  )
}
