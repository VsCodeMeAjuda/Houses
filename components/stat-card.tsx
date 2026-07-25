import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'

export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  accent = false,
  hint,
  className,
}: {
  label: string
  value: string
  icon: LucideIcon
  trend?: { value: string; positive: boolean }
  accent?: boolean
  hint?: string
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex flex-col justify-between gap-3 rounded-3xl border p-4 shadow-sm transition-colors',
        accent
          ? 'border-transparent bg-primary text-primary-foreground'
          : 'border-border bg-card text-card-foreground',
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <span
          className={cn(
            'flex size-9 items-center justify-center rounded-xl',
            accent ? 'bg-primary-foreground/15 text-primary-foreground' : 'bg-accent text-accent-foreground',
          )}
        >
          <Icon className="size-[18px]" />
        </span>
        {trend && (
          <span
            className={cn(
              'inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-semibold',
              accent
                ? 'bg-primary-foreground/15 text-primary-foreground'
                : trend.positive
                  ? 'bg-success/12 text-success'
                  : 'bg-danger/12 text-danger',
            )}
          >
            {trend.positive ? (
              <ArrowUpRight className="size-3" />
            ) : (
              <ArrowDownRight className="size-3" />
            )}
            {trend.value}
          </span>
        )}
      </div>
      <div>
        <p
          className={cn(
            'text-xl font-semibold tracking-tight',
            accent ? 'text-primary-foreground' : 'text-foreground',
          )}
        >
          {value}
        </p>
        <p
          className={cn(
            'mt-0.5 text-xs font-medium',
            accent ? 'text-primary-foreground/80' : 'text-muted-foreground',
          )}
        >
          {label}
        </p>
        {hint && (
          <p
            className={cn(
              'mt-1 text-[11px]',
              accent ? 'text-primary-foreground/70' : 'text-muted-foreground/80',
            )}
          >
            {hint}
          </p>
        )}
      </div>
    </div>
  )
}
