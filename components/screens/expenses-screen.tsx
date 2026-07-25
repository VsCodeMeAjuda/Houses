'use client'

import { Wrench, Filter } from 'lucide-react'
import { useState } from 'react'
import {
  expenses,
  properties,
  expenseCategoryLabels,
  type ExpenseCategory,
} from '@/lib/data'
import { totalExpenses, expensesByCategory } from '@/lib/metrics'
import { formatCurrency, formatDate } from '@/lib/format'
import { Card, SectionHeader, IconTile } from '@/components/ui/primitives'
import { cn } from '@/lib/utils'

const categoryColors: Record<string, string> = {
  maintenance: 'bg-chart-1',
  repairs: 'bg-chart-2',
  renovations: 'bg-chart-3',
  taxes: 'bg-chart-4',
  insurance: 'bg-chart-5',
  utilities: 'bg-primary',
  hoa: 'bg-success',
  'other-expense': 'bg-muted-foreground',
}

export function ExpensesScreen() {
  const [filter, setFilter] = useState<ExpenseCategory | 'all'>('all')

  const total = totalExpenses()
  const byCategory = Array.from(expensesByCategory().entries()).sort(
    (a, b) => b[1] - a[1],
  )

  const filtered =
    filter === 'all' ? expenses : expenses.filter((e) => e.category === filter)
  const sorted = [...filtered].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )

  return (
    <div className="space-y-6 px-4 pb-4 pt-2">
      <Card className="p-5">
        <p className="text-sm text-muted-foreground">Total de despesas registradas</p>
        <p className="mt-1 text-3xl font-bold tracking-tight text-foreground">
          {formatCurrency(total)}
        </p>
        <div className="mt-5 space-y-3">
          {byCategory.map(([cat, amount]) => {
            const pct = total ? (amount / total) * 100 : 0
            return (
              <div key={cat}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="font-medium text-foreground">
                    {expenseCategoryLabels[cat as ExpenseCategory]}
                  </span>
                  <span className="text-muted-foreground">
                    {formatCurrency(amount)}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn('h-full rounded-full', categoryColors[cat])}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      <div>
        <SectionHeader title="Lançamentos" className="mb-3" />
        <div className="-mx-4 mb-3 flex gap-2 overflow-x-auto px-4 no-scrollbar">
          <FilterChip active={filter === 'all'} onClick={() => setFilter('all')}>
            Todas
          </FilterChip>
          {Object.entries(expenseCategoryLabels).map(([cat, label]) => (
            <FilterChip
              key={cat}
              active={filter === cat}
              onClick={() => setFilter(cat as ExpenseCategory)}
            >
              {label}
            </FilterChip>
          ))}
        </div>

        <div className="space-y-2.5">
          {sorted.map((e) => {
            const property = properties.find((p) => p.id === e.propertyId)
            return (
              <Card key={e.id} className="flex items-center gap-3 p-3.5">
                <IconTile className="bg-danger/10 text-danger">
                  <Wrench className="size-5" />
                </IconTile>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {e.description}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {property?.name} • {expenseCategoryLabels[e.category]}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-danger">
                    -{formatCurrency(e.amount)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(e.date)}
                  </p>
                </div>
              </Card>
            )
          })}
          {sorted.length === 0 && (
            <Card className="flex flex-col items-center gap-2 p-8 text-center">
              <Filter className="size-6 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Nenhuma despesa nesta categoria.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors',
        active
          ? 'bg-primary text-primary-foreground'
          : 'bg-secondary text-secondary-foreground',
      )}
    >
      {children}
    </button>
  )
}
