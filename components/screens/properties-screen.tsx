'use client'

import { useState } from 'react'
import { MapPin, Bed, Bath, Ruler, Plus, Search, Percent } from 'lucide-react'
import { Card, StatusBadge } from '../ui/primitives'
import { useApp } from '../app-context'
import { properties, tenants } from '@/lib/data'
import { propertyROI } from '@/lib/metrics'
import { formatCurrency, formatPercent } from '@/lib/format'

export function PropertiesScreen() {
  const { openProperty } = useApp()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'occupied' | 'vacant'>('all')

  const filtered = properties.filter((p) => {
    const matchesQuery =
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.address.toLowerCase().includes(query.toLowerCase())
    const matchesFilter = filter === 'all' || p.status === filter
    return matchesQuery && matchesFilter
  })

  const filters: { key: typeof filter; label: string }[] = [
    { key: 'all', label: 'Todos' },
    { key: 'occupied', label: 'Alugados' },
    { key: 'vacant', label: 'Vagos' },
  ]

  return (
    <div className="flex flex-col gap-4">
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar imóvel ou endereço"
          className="h-12 w-full rounded-2xl border border-border bg-card pl-10 pr-4 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30"
        />
      </div>

      <div className="flex gap-2">
        {filters.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              filter === f.key
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-accent'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-4">
        {filtered.map((p) => {
          const tenant = tenants.find((t) => t.id === p.currentTenantId)
          return (
            <button key={p.id} type="button" onClick={() => openProperty(p.id)} className="text-left">
              <Card className="overflow-hidden p-0 transition-transform active:scale-[0.99]">
                <div className="relative h-44 w-full overflow-hidden">
                  <img
                    src={p.photo || '/placeholder.svg'}
                    alt={p.name}
                    className="size-full object-cover"
                  />
                  <div className="absolute left-3 top-3">
                    <StatusBadge variant={p.status === 'occupied' ? 'success' : 'warning'}>
                      {p.status === 'occupied' ? 'Alugado' : 'Vago'}
                    </StatusBadge>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="truncate text-base font-semibold text-foreground">{p.name}</h3>
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="size-3 shrink-0" />
                        <span className="truncate">{p.address}</span>
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-base font-semibold text-foreground">
                        {formatCurrency(p.monthlyRent)}
                      </p>
                      <p className="text-[11px] text-muted-foreground">por mês</p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Bed className="size-3.5" /> {p.bedrooms}
                    </span>
                    <span className="flex items-center gap-1">
                      <Bath className="size-3.5" /> {p.bathrooms}
                    </span>
                    <span className="flex items-center gap-1">
                      <Ruler className="size-3.5" /> {p.area} m²
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-2 rounded-2xl bg-muted/60 p-3">
                    <div>
                      <p className="text-[11px] text-muted-foreground">Compra</p>
                      <p className="text-sm font-semibold text-foreground">
                        {formatCurrency(p.purchasePrice, true)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] text-muted-foreground">Investido</p>
                      <p className="text-sm font-semibold text-foreground">
                        {formatCurrency(p.totalInvestment, true)}
                      </p>
                    </div>
                    <div>
                      <p className="flex items-center gap-0.5 text-[11px] text-muted-foreground">
                        <Percent className="size-3" /> ROI
                      </p>
                      <p className="text-sm font-semibold text-success">
                        {formatPercent(propertyROI(p))}
                      </p>
                    </div>
                  </div>

                  <p className="mt-3 text-xs text-muted-foreground">
                    Inquilino atual:{' '}
                    <span className="font-medium text-foreground">
                      {tenant ? tenant.fullName : 'Nenhum'}
                    </span>
                  </p>
                </div>
              </Card>
            </button>
          )
        })}
      </div>

      <button
        type="button"
        className="fixed bottom-24 right-4 z-20 flex items-center gap-2 rounded-full bg-primary px-5 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-transform active:scale-95"
      >
        <Plus className="size-5" />
        Novo imóvel
      </button>
    </div>
  )
}
