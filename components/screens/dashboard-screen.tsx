'use client'

import {
  Banknote,
  TrendingUp,
  CircleAlert,
  ShieldCheck,
  ChartPie,
  Building2,
  Wallet,
  Percent,
  CircleDollarSign,
  ChevronRight,
  CircleCheck,
  UserPlus,
  Receipt,
  RotateCcw,
  FileText,
} from 'lucide-react'
import { StatCard } from '../stat-card'
import { Card, SectionHeader, StatusBadge } from '../ui/primitives'
import { useApp } from '../app-context'
import {
  payments,
  tenants,
  properties,
  activities,
  type ActivityType,
} from '@/lib/data'
import {
  monthlyRentalIncome,
  expectedFutureRevenue,
  outstandingRent,
  securityDepositsHeld,
  occupancyRate,
  totalPropertyValue,
  totalInvested,
  monthlyCashFlow,
  annualROI,
} from '@/lib/metrics'
import { formatCurrency, formatPercent, formatDate, daysUntil, relativeTime } from '@/lib/format'

const activityIcons: Record<ActivityType, typeof CircleCheck> = {
  payment: CircleCheck,
  tenant: UserPlus,
  expense: Receipt,
  deposit: RotateCcw,
  contract: FileText,
}

const activityColors: Record<ActivityType, string> = {
  payment: 'bg-success/12 text-success',
  tenant: 'bg-primary/10 text-primary',
  expense: 'bg-warning/20 text-warning-foreground',
  deposit: 'bg-accent text-accent-foreground',
  contract: 'bg-muted text-muted-foreground',
}

export function DashboardScreen() {
  const { setView, openProperty } = useApp()

  const upcoming = [...payments]
    .filter((p) => p.status !== 'paid')
    .sort((a, b) => daysUntil(a.dueDate) - daysUntil(b.dueDate))

  return (
    <div className="flex flex-col gap-6">
      {/* Hero cash flow */}
      <Card className="overflow-hidden border-transparent bg-primary p-5 text-primary-foreground">
        <p className="text-sm font-medium text-primary-foreground/80">Fluxo de caixa mensal</p>
        <p className="mt-1 text-4xl font-semibold tracking-tight">
          {formatCurrency(monthlyCashFlow())}
        </p>
        <div className="mt-4 flex items-center gap-4 text-sm">
          <div>
            <p className="text-primary-foreground/70">Receita</p>
            <p className="font-semibold">{formatCurrency(monthlyRentalIncome())}</p>
          </div>
          <div className="h-8 w-px bg-primary-foreground/20" />
          <div>
            <p className="text-primary-foreground/70">ROI anual</p>
            <p className="font-semibold">{formatPercent(annualROI())}</p>
          </div>
          <div className="h-8 w-px bg-primary-foreground/20" />
          <div>
            <p className="text-primary-foreground/70">Ocupação</p>
            <p className="font-semibold">{formatPercent(occupancyRate(), 0)}</p>
          </div>
        </div>
      </Card>

      {/* Stat grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label="Renda mensal"
          value={formatCurrency(monthlyRentalIncome())}
          icon={Banknote}
          trend={{ value: '4,2%', positive: true }}
        />
        <StatCard
          label="Receita futura prevista"
          value={formatCurrency(expectedFutureRevenue(), true)}
          icon={TrendingUp}
        />
        <StatCard
          label="Aluguéis em aberto"
          value={formatCurrency(outstandingRent())}
          icon={CircleAlert}
          trend={{ value: '2 pend.', positive: false }}
        />
        <StatCard
          label="Cauções retidas"
          value={formatCurrency(securityDepositsHeld())}
          icon={ShieldCheck}
        />
        <StatCard
          label="Valor do portfólio"
          value={formatCurrency(totalPropertyValue(), true)}
          icon={Building2}
          trend={{ value: '18%', positive: true }}
        />
        <StatCard
          label="Total investido"
          value={formatCurrency(totalInvested(), true)}
          icon={Wallet}
        />
        <StatCard
          label="Taxa de ocupação"
          value={formatPercent(occupancyRate(), 0)}
          icon={ChartPie}
        />
        <StatCard
          label="ROI anual"
          value={formatPercent(annualROI())}
          icon={Percent}
        />
      </div>

      {/* Upcoming payments */}
      <section className="flex flex-col gap-3">
        <SectionHeader
          title="Próximos pagamentos"
          action={
            <button
              type="button"
              onClick={() => setView('payment-history')}
              className="flex items-center gap-0.5 text-sm font-medium text-primary"
            >
              Ver tudo <ChevronRight className="size-4" />
            </button>
          }
        />
        <Card className="divide-y divide-border p-1">
          {upcoming.map((p) => {
            const tenant = tenants.find((t) => t.id === p.tenantId)
            const property = properties.find((pr) => pr.id === p.propertyId)
            const days = daysUntil(p.dueDate)
            const variant =
              p.status === 'overdue' ? 'danger' : p.status === 'due-soon' ? 'warning' : 'neutral'
            const statusLabel =
              p.status === 'overdue'
                ? 'Em atraso'
                : p.status === 'due-soon'
                  ? 'A vencer'
                  : 'Pendente'
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => property && openProperty(property.id)}
                className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-colors hover:bg-muted"
              >
                <span className="flex size-11 items-center justify-center rounded-2xl bg-accent text-sm font-semibold text-accent-foreground">
                  {tenant?.fullName.charAt(0)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{tenant?.fullName}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {property?.name} • {formatDate(p.dueDate)}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-sm font-semibold text-foreground">
                    {formatCurrency(p.amount)}
                  </span>
                  <StatusBadge variant={variant}>
                    {statusLabel} • {days < 0 ? `${Math.abs(days)}d` : `${days}d`}
                  </StatusBadge>
                </div>
              </button>
            )
          })}
        </Card>
      </section>

      {/* Recent activity */}
      <section className="flex flex-col gap-3">
        <SectionHeader title="Atividade recente" />
        <Card className="p-4">
          <ol className="relative flex flex-col gap-5">
            {activities.map((activity, i) => {
              const Icon = activityIcons[activity.type]
              return (
                <li key={activity.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <span
                      className={`flex size-9 items-center justify-center rounded-full ${activityColors[activity.type]}`}
                    >
                      <Icon className="size-[18px]" />
                    </span>
                    {i < activities.length - 1 && <span className="mt-1 w-px flex-1 bg-border" />}
                  </div>
                  <div className="pb-1">
                    <p className="text-sm font-medium text-foreground">{activity.title}</p>
                    <p className="text-xs text-muted-foreground">{activity.description}</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground/70">
                      {relativeTime(activity.date)}
                    </p>
                  </div>
                </li>
              )
            })}
          </ol>
        </Card>
      </section>
    </div>
  )
}
