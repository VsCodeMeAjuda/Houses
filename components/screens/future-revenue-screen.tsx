'use client'

import { TrendingUp, CalendarClock } from 'lucide-react'
import { tenants, properties } from '@/lib/data'
import { expectedFutureRevenue, monthlyRentalIncome } from '@/lib/metrics'
import { formatCurrency, formatDate, daysUntil } from '@/lib/format'
import { Card, StatusBadge, IconTile, SectionHeader } from '@/components/ui/primitives'

export function FutureRevenueScreen() {
  const projected = expectedFutureRevenue()
  const monthly = monthlyRentalIncome()

  const rows = tenants
    .map((t) => {
      const property = properties.find((p) => p.id === t.propertyId)
      const end = new Date(t.contractEnd).getTime()
      const months = Math.max(
        0,
        Math.round((end - Date.now()) / (1000 * 60 * 60 * 24 * 30)),
      )
      return { t, property, months, remaining: t.monthlyRent * months }
    })
    .sort((a, b) => b.remaining - a.remaining)

  return (
    <div className="space-y-6 px-4 pb-4 pt-2">
      <Card className="overflow-hidden">
        <div className="bg-primary p-5 text-primary-foreground">
          <div className="flex items-center gap-2 text-sm opacity-90">
            <TrendingUp className="size-4" />
            Receita futura projetada
          </div>
          <p className="mt-2 text-3xl font-bold tracking-tight">
            {formatCurrency(projected)}
          </p>
          <p className="mt-1 text-sm opacity-80">
            Com base nos contratos ativos até o vencimento
          </p>
        </div>
        <div className="grid grid-cols-2 divide-x divide-border">
          <div className="p-4">
            <p className="text-xs text-muted-foreground">Receita mensal atual</p>
            <p className="mt-1 text-lg font-semibold text-foreground">
              {formatCurrency(monthly)}
            </p>
          </div>
          <div className="p-4">
            <p className="text-xs text-muted-foreground">Contratos ativos</p>
            <p className="mt-1 text-lg font-semibold text-foreground">
              {tenants.length}
            </p>
          </div>
        </div>
      </Card>

      <div>
        <SectionHeader title="Projeção por contrato" className="mb-3" />
        <div className="space-y-2.5">
          {rows.map(({ t, property, months, remaining }) => {
            const days = daysUntil(t.contractEnd)
            const ending = days <= 30
            return (
              <Card key={t.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <IconTile>
                      <CalendarClock className="size-5" />
                    </IconTile>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {t.fullName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {property?.name}
                      </p>
                    </div>
                  </div>
                  <StatusBadge variant={ending ? 'warning' : 'success'}>
                    {months} {months === 1 ? 'mês' : 'meses'}
                  </StatusBadge>
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Encerra em {formatDate(t.contractEnd)}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-success">
                    {formatCurrency(remaining)}
                  </p>
                </div>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
