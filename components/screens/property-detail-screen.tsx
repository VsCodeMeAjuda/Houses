'use client'

import { useState } from 'react'
import {
  ChevronLeft,
  MapPin,
  Bed,
  Bath,
  Ruler,
  Wrench,
  FileText,
  CircleCheck,
  Clock,
} from 'lucide-react'
import { Card, StatusBadge } from '../ui/primitives'
import { useApp } from '../app-context'
import {
  properties,
  tenants,
  expenses,
  payments,
  expenseCategoryLabels,
  purchaseMethodLabels,
  paymentStatusLabels,
} from '@/lib/data'
import { propertyROI, appreciation } from '@/lib/metrics'
import { formatCurrency, formatPercent, formatDate } from '@/lib/format'

type Tab = 'overview' | 'financial' | 'maintenance' | 'documents' | 'history'

const tabs: { key: Tab; label: string }[] = [
  { key: 'overview', label: 'Visão geral' },
  { key: 'financial', label: 'Financeiro' },
  { key: 'maintenance', label: 'Manutenção' },
  { key: 'documents', label: 'Documentos' },
  { key: 'history', label: 'Histórico' },
]

export function PropertyDetailScreen({ propertyId }: { propertyId: string }) {
  const { closeProperty } = useApp()
  const [tab, setTab] = useState<Tab>('overview')
  const property = properties.find((p) => p.id === propertyId)

  if (!property) return null

  const tenant = tenants.find((t) => t.id === property.currentTenantId)
  const propertyExpenses = expenses.filter((e) => e.propertyId === propertyId)
  const propertyPayments = payments.filter((e) => e.propertyId === propertyId)

  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        onClick={closeProperty}
        className="flex w-fit items-center gap-1 text-sm font-medium text-primary"
      >
        <ChevronLeft className="size-4" /> Imóveis
      </button>

      <div className="relative h-52 w-full overflow-hidden rounded-3xl">
        <img src={property.photo || '/placeholder.svg'} alt={property.name} className="size-full object-cover" />
        <div className="absolute left-3 top-3">
          <StatusBadge variant={property.status === 'occupied' ? 'success' : 'warning'}>
            {property.status === 'occupied' ? 'Alugado' : 'Vago'}
          </StatusBadge>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold tracking-tight text-foreground">{property.name}</h2>
        <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="size-3.5 shrink-0" /> {property.address}
        </p>
        <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Bed className="size-4" /> {property.bedrooms} quartos
          </span>
          <span className="flex items-center gap-1">
            <Bath className="size-4" /> {property.bathrooms} banh.
          </span>
          <span className="flex items-center gap-1">
            <Ruler className="size-4" /> {property.area} m²
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              tab === t.key
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-accent'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <Info label="Aluguel mensal" value={formatCurrency(property.monthlyRent)} />
            <Info label="Valor de mercado" value={formatCurrency(property.marketValue, true)} />
            <Info label="Preço de compra" value={formatCurrency(property.purchasePrice, true)} />
            <Info label="Total investido" value={formatCurrency(property.totalInvestment, true)} />
            <Info label="ROI atual" value={formatPercent(propertyROI(property))} accent />
            <Info label="Valorização" value={formatPercent(appreciation(property))} accent />
          </div>
          <Card className="p-4">
            <p className="text-sm font-semibold text-foreground">Forma de aquisição</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {purchaseMethodLabels[property.purchaseMethod]} • Adquirido em{' '}
              {formatDate(property.purchaseDate)}
            </p>
          </Card>
          {tenant && (
            <Card className="flex items-center gap-3 p-4">
              <span className="flex size-11 items-center justify-center rounded-2xl bg-accent text-sm font-semibold text-accent-foreground">
                {tenant.fullName.charAt(0)}
              </span>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{tenant.fullName}</p>
                <p className="text-xs text-muted-foreground">
                  Contrato até {formatDate(tenant.contractEnd)}
                </p>
              </div>
              <StatusBadge
                variant={
                  tenant.paymentStatus === 'paid'
                    ? 'success'
                    : tenant.paymentStatus === 'overdue'
                      ? 'danger'
                      : 'warning'
                }
              >
                {paymentStatusLabels[tenant.paymentStatus]}
              </StatusBadge>
            </Card>
          )}
        </div>
      )}

      {tab === 'financial' && (
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <Info label="Receita anual" value={formatCurrency(property.monthlyRent * 12, true)} />
            <Info
              label="Despesas do imóvel"
              value={formatCurrency(propertyExpenses.reduce((s, e) => s + e.amount, 0))}
            />
            <Info
              label="Lucro líquido/ano"
              value={formatCurrency(property.monthlyRent * 12 - propertyExpenses.reduce((s, e) => s + e.amount, 0), true)}
              accent
            />
            <Info label="Payback" value={`${(property.totalInvestment / (property.monthlyRent * 12)).toFixed(1)} anos`} />
          </div>
          <Card className="divide-y divide-border p-1">
            {propertyExpenses.map((e) => (
              <div key={e.id} className="flex items-center justify-between px-3 py-3">
                <div>
                  <p className="text-sm font-medium text-foreground">{e.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {expenseCategoryLabels[e.category]} • {formatDate(e.date)}
                  </p>
                </div>
                <span className="text-sm font-semibold text-danger">-{formatCurrency(e.amount)}</span>
              </div>
            ))}
          </Card>
        </div>
      )}

      {tab === 'maintenance' && (
        <Card className="flex flex-col items-center gap-3 p-8 text-center">
          <span className="flex size-14 items-center justify-center rounded-3xl bg-accent text-accent-foreground">
            <Wrench className="size-6" />
          </span>
          <div>
            <p className="text-sm font-semibold text-foreground">Sem chamados abertos</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Registre solicitações de manutenção e acompanhe o status por aqui.
            </p>
          </div>
          <button className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
            Registrar manutenção
          </button>
        </Card>
      )}

      {tab === 'documents' && (
        <Card className="divide-y divide-border p-1">
          {['Contrato de locação.pdf', 'Escritura do imóvel.pdf', 'Laudo de vistoria.pdf'].map(
            (doc) => (
              <div key={doc} className="flex items-center gap-3 px-3 py-3">
                <span className="flex size-10 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                  <FileText className="size-[18px]" />
                </span>
                <p className="flex-1 text-sm font-medium text-foreground">{doc}</p>
              </div>
            ),
          )}
        </Card>
      )}

      {tab === 'history' && (
        <Card className="p-4">
          <ol className="flex flex-col gap-4">
            {propertyPayments.map((p) => (
              <li key={p.id} className="flex items-center gap-3">
                <span
                  className={`flex size-9 items-center justify-center rounded-full ${
                    p.status === 'paid' ? 'bg-success/12 text-success' : 'bg-warning/20 text-warning-foreground'
                  }`}
                >
                  {p.status === 'paid' ? <CircleCheck className="size-[18px]" /> : <Clock className="size-[18px]" />}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">
                    {p.status === 'paid' ? 'Aluguel recebido' : 'Aluguel previsto'}
                  </p>
                  <p className="text-xs text-muted-foreground">{formatDate(p.dueDate)}</p>
                </div>
                <span className="text-sm font-semibold text-foreground">{formatCurrency(p.amount)}</span>
              </li>
            ))}
          </ol>
        </Card>
      )}
    </div>
  )
}

function Info({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <Card className="p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`mt-1 text-lg font-semibold tracking-tight ${accent ? 'text-primary' : 'text-foreground'}`}>
        {value}
      </p>
    </Card>
  )
}
