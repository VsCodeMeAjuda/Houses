'use client'

import { useState } from 'react'
import { ArrowDownLeft, CircleCheck, TriangleAlert, Clock } from 'lucide-react'
import {
  payments,
  tenants,
  properties,
  paymentStatusLabels,
  paymentMethodLabels,
  type PaymentStatus,
} from '@/lib/data'
import { formatCurrency, formatDate } from '@/lib/format'
import { Card, StatusBadge, IconTile } from '@/components/ui/primitives'
import { cn } from '@/lib/utils'

const statusVariant: Record<PaymentStatus, 'success' | 'warning' | 'danger' | 'neutral'> = {
  paid: 'success',
  'due-soon': 'warning',
  overdue: 'danger',
  pending: 'neutral',
}

const statusIcon: Record<PaymentStatus, typeof CircleCheck> = {
  paid: CircleCheck,
  'due-soon': Clock,
  overdue: TriangleAlert,
  pending: Clock,
}

export function PaymentHistoryScreen() {
  const [filter, setFilter] = useState<PaymentStatus | 'all'>('all')

  const totalReceived = payments
    .filter((p) => p.status === 'paid')
    .reduce((s, p) => s + p.amount, 0)

  const filtered =
    filter === 'all' ? payments : payments.filter((p) => p.status === filter)
  const sorted = [...filtered].sort(
    (a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime(),
  )

  return (
    <div className="space-y-6 px-4 pb-4 pt-2">
      <Card className="p-5">
        <p className="text-sm text-muted-foreground">Total recebido</p>
        <p className="mt-1 text-3xl font-bold tracking-tight text-success">
          {formatCurrency(totalReceived)}
        </p>
      </Card>

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 no-scrollbar">
        {(['all', 'paid', 'due-soon', 'overdue'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={cn(
              'shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors',
              filter === s
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground',
            )}
          >
            {s === 'all' ? 'Todos' : paymentStatusLabels[s]}
          </button>
        ))}
      </div>

      <div className="space-y-2.5">
        {sorted.map((p) => {
          const tenant = tenants.find((t) => t.id === p.tenantId)
          const property = properties.find((pr) => pr.id === p.propertyId)
          const Icon = statusIcon[p.status]
          return (
            <Card key={p.id} className="flex items-center gap-3 p-3.5">
              <IconTile
                className={cn(
                  p.status === 'paid'
                    ? 'bg-success/12 text-success'
                    : p.status === 'overdue'
                      ? 'bg-danger/12 text-danger'
                      : 'bg-warning/20 text-warning-foreground',
                )}
              >
                <Icon className="size-5" />
              </IconTile>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">
                  {tenant?.fullName}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {property?.name} • {paymentMethodLabels[p.method]}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-foreground">
                  {formatCurrency(p.amount)}
                </p>
                <StatusBadge variant={statusVariant[p.status]} dot={false}>
                  {p.status === 'paid' && p.paidDate
                    ? formatDate(p.paidDate)
                    : paymentStatusLabels[p.status]}
                </StatusBadge>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
