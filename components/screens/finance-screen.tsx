'use client'

import { useMemo } from 'react'
import { ArrowUpRight, ArrowDownRight, Plus } from 'lucide-react'
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  XAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'
import { Card, SectionHeader } from '../ui/primitives'
import {
  expenses,
  monthlySeries,
  expenseCategoryLabels,
  type ExpenseCategory,
} from '@/lib/data'
import {
  monthlyCashFlow,
  annualROI,
  paybackYears,
  totalExpenses,
  netIncome,
  expectedFutureRevenue,
  outstandingRent,
  monthlyRentalIncome,
} from '@/lib/metrics'
import { formatCurrency, formatPercent, formatDate } from '@/lib/format'

export function FinanceScreen() {
  const annualProfit = monthlyCashFlow() * 12
  const catData = useMemo(() => {
    const map = new Map<ExpenseCategory, number>()
    expenses.forEach((e) => map.set(e.category, (map.get(e.category) ?? 0) + e.amount))
    const total = [...map.values()].reduce((s, v) => s + v, 0)
    return [...map.entries()]
      .map(([cat, amount]) => ({ cat, amount, pct: (amount / total) * 100 }))
      .sort((a, b) => b.amount - a.amount)
  }, [])

  return (
    <div className="flex flex-col gap-6">
      {/* Profit summary */}
      <Card className="bg-primary p-5 text-primary-foreground">
        <p className="text-sm text-primary-foreground/80">Lucro anual estimado</p>
        <p className="mt-1 text-4xl font-semibold tracking-tight">
          {formatCurrency(annualProfit)}
        </p>
        <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
          <div>
            <p className="text-primary-foreground/70">Lucro mensal</p>
            <p className="font-semibold">{formatCurrency(monthlyCashFlow())}</p>
          </div>
          <div>
            <p className="text-primary-foreground/70">ROI</p>
            <p className="font-semibold">{formatPercent(annualROI())}</p>
          </div>
          <div>
            <p className="text-primary-foreground/70">Payback</p>
            <p className="font-semibold">{paybackYears().toFixed(1)} anos</p>
          </div>
        </div>
      </Card>

      {/* Cash flow chart */}
      <section className="flex flex-col gap-3">
        <SectionHeader title="Fluxo de caixa" />
        <Card className="p-4">
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={monthlySeries} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="4 4" />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 16,
                  border: '1px solid var(--border)',
                  fontSize: 12,
                  background: 'var(--card)',
                  color: 'var(--card-foreground)',
                }}
                formatter={(v: number) => [formatCurrency(v), 'Receita']}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="var(--chart-1)"
                strokeWidth={2.5}
                fill="url(#rev)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      </section>

      {/* Income vs expenses */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="p-4">
          <span className="flex size-9 items-center justify-center rounded-xl bg-success/12 text-success">
            <ArrowUpRight className="size-[18px]" />
          </span>
          <p className="mt-3 text-lg font-semibold text-foreground">
            {formatCurrency(monthlyRentalIncome())}
          </p>
          <p className="text-xs text-muted-foreground">Receita mensal</p>
        </Card>
        <Card className="p-4">
          <span className="flex size-9 items-center justify-center rounded-xl bg-danger/12 text-danger">
            <ArrowDownRight className="size-[18px]" />
          </span>
          <p className="mt-3 text-lg font-semibold text-foreground">
            {formatCurrency(totalExpenses())}
          </p>
          <p className="text-xs text-muted-foreground">Despesas totais</p>
        </Card>
      </div>

      {/* Calculated metrics */}
      <section className="flex flex-col gap-3">
        <SectionHeader title="Indicadores calculados" />
        <Card className="divide-y divide-border p-1">
          <Row label="Receita futura prevista" value={formatCurrency(expectedFutureRevenue())} />
          <Row label="Receita em aberto" value={formatCurrency(outstandingRent())} danger />
          <Row label="Despesas totais" value={formatCurrency(totalExpenses())} />
          <Row label="Renda líquida" value={formatCurrency(netIncome())} positive />
        </Card>
      </section>

      {/* Expense breakdown */}
      <section className="flex flex-col gap-3">
        <SectionHeader title="Despesas por categoria" />
        <Card className="flex flex-col gap-4 p-4">
          {catData.map((c) => (
            <div key={c.cat}>
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="font-medium text-foreground">{expenseCategoryLabels[c.cat]}</span>
                <span className="text-muted-foreground">{formatCurrency(c.amount)}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary" style={{ width: `${c.pct}%` }} />
              </div>
            </div>
          ))}
        </Card>
      </section>

      {/* Recent transactions */}
      <section className="flex flex-col gap-3">
        <SectionHeader title="Lançamentos recentes" />
        <Card className="divide-y divide-border p-1">
          {[...expenses]
            .sort((a, b) => +new Date(b.date) - +new Date(a.date))
            .slice(0, 5)
            .map((e) => (
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
      </section>

      <button
        type="button"
        className="fixed bottom-24 right-4 z-20 flex items-center gap-2 rounded-full bg-primary px-5 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-transform active:scale-95"
      >
        <Plus className="size-5" />
        Novo lançamento
      </button>
    </div>
  )
}

function Row({
  label,
  value,
  positive,
  danger,
}: {
  label: string
  value: string
  positive?: boolean
  danger?: boolean
}) {
  return (
    <div className="flex items-center justify-between px-3 py-3.5">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span
        className={`text-sm font-semibold ${
          positive ? 'text-success' : danger ? 'text-danger' : 'text-foreground'
        }`}
      >
        {value}
      </span>
    </div>
  )
}
