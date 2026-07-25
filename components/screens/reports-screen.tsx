'use client'

import {
  Bar,
  BarChart,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts'
import { FileText, FileSpreadsheet, FileDown } from 'lucide-react'
import { Card, SectionHeader } from '../ui/primitives'
import { properties, monthlySeries } from '@/lib/data'
import { appreciation, propertyROI } from '@/lib/metrics'
import { formatCurrency, formatPercent } from '@/lib/format'

const tooltipStyle = {
  borderRadius: 16,
  border: '1px solid var(--border)',
  fontSize: 12,
  background: 'var(--card)',
  color: 'var(--card-foreground)',
}

export function ReportsScreen() {
  const returnData = properties.map((p) => ({
    name: p.name.split(' ')[0],
    roi: Number(propertyROI(p).toFixed(1)),
    appreciation: Number(appreciation(p).toFixed(1)),
  }))

  return (
    <div className="flex flex-col gap-6">
      {/* Export */}
      <section className="flex flex-col gap-3">
        <SectionHeader title="Exportar relatório" />
        <div className="grid grid-cols-3 gap-3">
          <ExportButton icon={FileText} label="PDF" />
          <ExportButton icon={FileSpreadsheet} label="Excel" />
          <ExportButton icon={FileDown} label="CSV" />
        </div>
      </section>

      {/* Monthly revenue */}
      <section className="flex flex-col gap-3">
        <SectionHeader title="Receita mensal" />
        <Card className="p-4">
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={monthlySeries} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="4 4" />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
              />
              <Tooltip
                cursor={{ fill: 'var(--muted)' }}
                contentStyle={tooltipStyle}
                formatter={(v: number) => [formatCurrency(v), 'Receita']}
              />
              <Bar dataKey="revenue" radius={[8, 8, 0, 0]} fill="var(--chart-1)" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </section>

      {/* Monthly expenses */}
      <section className="flex flex-col gap-3">
        <SectionHeader title="Despesas mensais" />
        <Card className="p-4">
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={monthlySeries} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="4 4" />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
              />
              <Tooltip
                cursor={{ fill: 'var(--muted)' }}
                contentStyle={tooltipStyle}
                formatter={(v: number) => [formatCurrency(v), 'Despesas']}
              />
              <Bar dataKey="expenses" radius={[8, 8, 0, 0]} fill="var(--chart-5)" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </section>

      {/* Profit trend */}
      <section className="flex flex-col gap-3">
        <SectionHeader title="Tendência de lucro" />
        <Card className="p-4">
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={monthlySeries} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="4 4" />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(v: number, _n, item) => [
                  formatCurrency((item.payload.revenue as number) - (v as number)),
                  'Lucro',
                ]}
              />
              <Line
                type="monotone"
                dataKey="expenses"
                stroke="var(--chart-2)"
                strokeWidth={2.5}
                dot={{ r: 3, fill: 'var(--chart-2)' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </section>

      {/* Occupancy */}
      <section className="flex flex-col gap-3">
        <SectionHeader title="Taxa de ocupação" />
        <Card className="p-4">
          <ResponsiveContainer width="100%" height={150}>
            <LineChart data={monthlySeries} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="4 4" />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(v: number) => [`${v}%`, 'Ocupação']}
              />
              <Line
                type="monotone"
                dataKey="occupancy"
                stroke="var(--chart-4)"
                strokeWidth={2.5}
                dot={{ r: 3, fill: 'var(--chart-4)' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </section>

      {/* Investment return per property */}
      <section className="flex flex-col gap-3">
        <SectionHeader title="Retorno por imóvel" />
        <Card className="p-4">
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={returnData} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="4 4" />
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
              />
              <Tooltip
                cursor={{ fill: 'var(--muted)' }}
                contentStyle={tooltipStyle}
                formatter={(v: number) => [`${v}%`, 'ROI']}
              />
              <Bar dataKey="roi" radius={[8, 8, 0, 0]}>
                {returnData.map((_, i) => (
                  <Cell key={i} fill="var(--chart-1)" />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </section>

      {/* Appreciation list */}
      <section className="flex flex-col gap-3">
        <SectionHeader title="Valorização do patrimônio" />
        <Card className="divide-y divide-border p-1">
          {properties.map((p) => (
            <div key={p.id} className="flex items-center justify-between px-3 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">{p.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(p.purchasePrice, true)} → {formatCurrency(p.marketValue, true)}
                </p>
              </div>
              <span className="text-sm font-semibold text-success">
                +{formatPercent(appreciation(p))}
              </span>
            </div>
          ))}
        </Card>
      </section>
    </div>
  )
}

function ExportButton({ icon: Icon, label }: { icon: typeof FileText; label: string }) {
  return (
    <button
      type="button"
      className="flex flex-col items-center gap-2 rounded-3xl border border-border bg-card p-4 shadow-sm transition-transform active:scale-95"
    >
      <span className="flex size-10 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
        <Icon className="size-5" />
      </span>
      <span className="text-sm font-medium text-foreground">{label}</span>
    </button>
  )
}
