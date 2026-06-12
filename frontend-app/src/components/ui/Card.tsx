import type { HTMLAttributes, ReactNode } from 'react'

export function Card({ children, className = '', ...props }: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return (
    <section className={`card ${className}`} {...props}>
      {children}
    </section>
  )
}

export function MetricCard({
  label,
  value,
  detail,
  icon,
  tone = 'info',
}: {
  label: string
  value: string | number
  detail?: string
  icon: ReactNode
  tone?: 'success' | 'warning' | 'danger' | 'info'
}) {
  return (
    <Card className="metric-card">
      <div className={`metric-icon metric-${tone}`}>{icon}</div>
      <div>
        <p>{label}</p>
        <strong>{value}</strong>
        {detail ? <span>{detail}</span> : null}
      </div>
    </Card>
  )
}
