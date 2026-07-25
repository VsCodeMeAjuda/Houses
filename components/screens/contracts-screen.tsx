'use client'

import { FileText, Calendar, Percent } from 'lucide-react'
import { Card, StatusBadge } from '../ui/primitives'
import { tenants, properties, relationshipLabels } from '@/lib/data'
import { formatCurrency, formatDate, daysUntil } from '@/lib/format'

export function ContractsScreen() {
  return (
    <div className="flex flex-col gap-4">
      <p className="px-1 text-sm text-muted-foreground">
        {tenants.length} contratos ativos no seu portfólio.
      </p>
      {tenants.map((t) => {
        const property = properties.find((p) => p.id === t.propertyId)
        const days = daysUntil(t.contractEnd)
        const ending = days <= 30
        return (
          <Card key={t.id} className="p-4">
            <div className="flex items-start gap-3">
              <span className="flex size-11 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
                <FileText className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">{property?.name}</p>
                <p className="truncate text-xs text-muted-foreground">{t.fullName}</p>
              </div>
              <StatusBadge variant={ending ? 'danger' : 'success'}>
                {days <= 0 ? 'Vencido' : ending ? `${days}d restantes` : 'Vigente'}
              </StatusBadge>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="size-4 text-muted-foreground" />
                <div>
                  <p className="text-[11px] text-muted-foreground">Período</p>
                  <p className="font-medium text-foreground">
                    {formatDate(t.contractStart)} — {formatDate(t.contractEnd)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Percent className="size-4 text-muted-foreground" />
                <div>
                  <p className="text-[11px] text-muted-foreground">Comissão</p>
                  <p className="font-medium text-foreground">
                    {t.commissionPercent > 0 ? `${t.commissionPercent}%` : 'Sem comissão'}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between rounded-2xl bg-muted/60 px-3 py-2.5 text-sm">
              <span className="text-muted-foreground">{relationshipLabels[t.relationship]}</span>
              <span className="font-semibold text-foreground">{formatCurrency(t.monthlyRent)}/mês</span>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
