import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

export function Card({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-3xl border border-border bg-card text-card-foreground shadow-sm',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

type StatusVariant = 'success' | 'warning' | 'danger' | 'neutral' | 'info'

const statusStyles: Record<StatusVariant, string> = {
  success: 'bg-success/12 text-success',
  warning: 'bg-warning/20 text-warning-foreground',
  danger: 'bg-danger/12 text-danger',
  neutral: 'bg-muted text-muted-foreground',
  info: 'bg-accent text-accent-foreground',
}

export function StatusBadge({
  variant = 'neutral',
  children,
  className,
  dot = true,
}: {
  variant?: StatusVariant
  children: ReactNode
  className?: string
  dot?: boolean
}) {
  const dotColor: Record<StatusVariant, string> = {
    success: 'bg-success',
    warning: 'bg-warning',
    danger: 'bg-danger',
    neutral: 'bg-muted-foreground',
    info: 'bg-primary',
  }
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
        statusStyles[variant],
        className,
      )}
    >
      {dot && <span className={cn('size-1.5 rounded-full', dotColor[variant])} />}
      {children}
    </span>
  )
}

export function SectionHeader({
  title,
  action,
  className,
}: {
  title: string
  action?: ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex items-center justify-between px-1', className)}>
      <h2 className="text-base font-semibold tracking-tight text-foreground">{title}</h2>
      {action}
    </div>
  )
}

export function IconTile({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex size-10 items-center justify-center rounded-2xl bg-accent text-accent-foreground',
        className,
      )}
    >
      {children}
    </span>
  )
}
