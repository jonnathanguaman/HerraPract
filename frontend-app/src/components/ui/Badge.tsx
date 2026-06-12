import type { ReactNode } from 'react'

type BadgeProps = {
  tone?: 'success' | 'warning' | 'danger' | 'info' | 'neutral'
  children: ReactNode
}

export function Badge({ tone = 'neutral', children }: BadgeProps) {
  return <span className={`badge badge-${tone}`}>{children}</span>
}
