'use client'

import { useState } from 'react'
import {
  Phone,
  Mail,
  Plus,
  ChevronDown,
  Calendar,
  Banknote,
  ShieldCheck,
  Percent,
  CreditCard,
  Handshake,
  IdCard,
} from 'lucide-react'
import { Card, StatusBadge } from '../ui/primitives'
import {
  tenants,
  properties,
  relationshipLabels,
  paymentMethodLabels,
  paymentStatusLabels,
} from '@/lib/data'
import { formatCurrency, formatDate, daysUntil } from '@/lib/format'

export function TenantsScreen() {
  const [expanded, setExpanded] = useState<string | null>(tenants[0]?.id ?? null)

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-3">
        <MiniStat label="Ativos" value={String(tenants.length)} />
        <MiniStat
          label="Em dia"
          value={String(tenants.filter((t) => t.paymentStatus === 'paid').length)}
        />
        <MiniStat
          label="Pendentes"
          value={String(tenants.filter((t) => t.paymentStatus !== 'paid').length)}
        />
      </div>

      <div className="flex flex-col gap-3">
        {tenants.map((t) => {
          const property = properties.find((p) => p.id === t.propertyId)
          const isOpen = expanded === t.id
          const daysLeft = daysUntil(t.contractEnd)
          return (
            <Card key={t.id} className="overflow-hidden">
              <button
                type="button"
                onClick={() => setExpanded(isOpen ? null : t.id)}
                className="flex w-full items-center gap-3 p-4 text-left"
              >
                <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-base font-semibold text-primary">
                  {t.fullName.charAt(0)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">{t.fullName}</p>
                  <p className="truncate text-xs text-muted-foreground">{property?.name}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <StatusBadge
                    variant={
                      t.paymentStatus === 'paid'
                        ? 'success'
                        : t.paymentStatus === 'overdue'
                          ? 'danger'
                          : 'warning'
                    }
                  >
                    {paymentStatusLabels[t.paymentStatus]}
                  </StatusBadge>
                  <ChevronDown
                    className={`size-4 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`}
                  />
                </div>
              </button>

              {isOpen && (
                <div className="animate-slide-up border-t border-border px-4 pb-4 pt-4">
                  <div className="flex gap-2">
                    <a
                      href={`tel:${t.phone}`}
                      className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-muted py-2.5 text-sm font-medium text-foreground"
                    >
                      <Phone className="size-4" /> Ligar
                    </a>
                    <a
                      href={`mailto:${t.email}`}
                      className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-muted py-2.5 text-sm font-medium text-foreground"
                    >
                      <Mail className="size-4" /> E-mail
                    </a>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-4">
                    <Detail icon={IdCard} label="CPF" value={t.cpf} />
                    <Detail icon={Calendar} label="Dia de vencimento" value={`Dia ${t.paymentDueDay}`} />
                    <Detail icon={Banknote} label="Aluguel" value={formatCurrency(t.monthlyRent)} />
                    <Detail icon={ShieldCheck} label="Caução" value={formatCurrency(t.securityDeposit)} />
                    <Detail
                      icon={CreditCard}
                      label="Forma de pagamento"
                      value={paymentMethodLabels[t.paymentMethod]}
                    />
                    <Detail
                      icon={Handshake}
                      label="Relação"
                      value={relationshipLabels[t.relationship]}
                    />
                    {t.commissionPercent > 0 && (
                      <Detail icon={Percent} label="Comissão" value={`${t.commissionPercent}%`} />
                    )}
                  </div>

                  <div className="mt-4 rounded-2xl bg-muted/60 p-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Vigência do contrato</span>
                      <span
                        className={`font-medium ${daysLeft <= 30 ? 'text-danger' : 'text-foreground'}`}
                      >
                        {daysLeft <= 0 ? 'Vencido' : `${daysLeft} dias restantes`}
                      </span>
                    </div>
                    <p className="mt-1 text-sm font-medium text-foreground">
                      {formatDate(t.contractStart)} — {formatDate(t.contractEnd)}
                    </p>
                  </div>
                </div>
              )}
            </Card>
          )
        })}
      </div>

      <button
        type="button"
        className="fixed bottom-24 right-4 z-20 flex items-center gap-2 rounded-full bg-primary px-5 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-transform active:scale-95"
      >
        <Plus className="size-5" />
        Novo inquilino
      </button>
    </div>
  )
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-3 text-center">
      <p className="text-2xl font-semibold tracking-tight text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </Card>
  )
}

function Detail({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Phone
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <p className="text-[11px] text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  )
}
