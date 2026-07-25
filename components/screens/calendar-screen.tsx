'use client'

import { CalendarDays, CircleDollarSign, FileText, Wrench } from 'lucide-react'
import { payments, tenants, properties, expenses } from '@/lib/data'
import { formatCurrency, formatDate, relativeTime, daysUntil } from '@/lib/format'
import { Card, IconTile, StatusBadge } from '@/components/ui/primitives'

type EventKind = 'payment' | 'contract' | 'expense'

interface CalEvent {
  id: string
  kind: EventKind
  title: string
  subtitle: string
  date: string
  amount?: number
}

export function CalendarScreen() {
  const events: CalEvent[] = []

  payments
    .filter((p) => p.status !== 'paid')
    .forEach((p) => {
      const tenant = tenants.find((t) => t.id === p.tenantId)
      const property = properties.find((pr) => pr.id === p.propertyId)
      events.push({
        id: `pay-${p.id}`,
        kind: 'payment',
        title: `Aluguel — ${tenant?.fullName ?? ''}`,
        subtitle: property?.name ?? '',
        date: p.dueDate,
        amount: p.amount,
      })
    })

  tenants.forEach((t) => {
    const property = properties.find((pr) => pr.id === t.propertyId)
    events.push({
      id: `con-${t.id}`,
      kind: 'contract',
      title: `Fim do contrato — ${t.fullName}`,
      subtitle: property?.name ?? '',
      date: t.contractEnd,
    })
  })

  expenses.slice(0, 3).forEach((e) => {
    const property = properties.find((pr) => pr.id === e.propertyId)
    events.push({
      id: `exp-${e.id}`,
      kind: 'expense',
      title: e.description,
      subtitle: property?.name ?? '',
      date: e.date,
      amount: e.amount,
    })
  })

  const sorted = events.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  )

  const upcoming = sorted.filter((e) => daysUntil(e.date) >= 0)
  const past = sorted.filter((e) => daysUntil(e.date) < 0).reverse()

  return (
    <div className="space-y-6 px-4 pb-4 pt-2">
      <Card className="flex items-center gap-3 p-4">
        <IconTile>
          <CalendarDays className="size-5" />
        </IconTile>
        <div>
          <p className="text-sm font-semibold text-foreground">
            {upcoming.length} eventos próximos
          </p>
          <p className="text-xs text-muted-foreground">
            Vencimentos, contratos e despesas
          </p>
        </div>
      </Card>

      <EventGroup title="Próximos" events={upcoming} />
      <EventGroup title="Anteriores" events={past} muted />
    </div>
  )
}

function EventGroup({
  title,
  events,
  muted = false,
}: {
  title: string
  events: {
    id: string
    kind: EventKind
    title: string
    subtitle: string
    date: string
    amount?: number
  }[]
  muted?: boolean
}) {
  if (events.length === 0) return null

  const config = {
    payment: { icon: CircleDollarSign, cls: 'bg-primary/10 text-primary' },
    contract: { icon: FileText, cls: 'bg-warning/20 text-warning-foreground' },
    expense: { icon: Wrench, cls: 'bg-danger/10 text-danger' },
  }

  return (
    <div>
      <h2 className="mb-3 px-1 text-base font-semibold tracking-tight text-foreground">
        {title}
      </h2>
      <div className="space-y-2.5">
        {events.map((e) => {
          const { icon: Icon, cls } = config[e.kind]
          const days = daysUntil(e.date)
          return (
            <Card
              key={e.id}
              className={muted ? 'flex items-center gap-3 p-3.5 opacity-70' : 'flex items-center gap-3 p-3.5'}
            >
              <IconTile className={cls}>
                <Icon className="size-5" />
              </IconTile>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">
                  {e.title}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {e.subtitle} • {formatDate(e.date)}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                {e.amount !== undefined && (
                  <p className="text-sm font-semibold text-foreground">
                    {formatCurrency(e.amount)}
                  </p>
                )}
                {!muted && (
                  <StatusBadge
                    variant={days <= 3 ? 'danger' : days <= 14 ? 'warning' : 'neutral'}
                    dot={false}
                  >
                    {relativeTime(e.date)}
                  </StatusBadge>
                )}
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
