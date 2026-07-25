'use client'

import { LayoutDashboard, Building2, Users, Wallet, ChartColumnBig } from 'lucide-react'
import { useApp, type View } from './app-context'
import { cn } from '@/lib/utils'

const tabs: { view: View; label: string; icon: typeof LayoutDashboard }[] = [
  { view: 'dashboard', label: 'Painel', icon: LayoutDashboard },
  { view: 'properties', label: 'Imóveis', icon: Building2 },
  { view: 'tenants', label: 'Inquilinos', icon: Users },
  { view: 'finance', label: 'Finanças', icon: Wallet },
  { view: 'reports', label: 'Relatórios', icon: ChartColumnBig },
]

export function BottomNav() {
  const { view, setView, selectedPropertyId } = useApp()

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border/70 bg-background/90 backdrop-blur-xl safe-bottom">
      <div className="mx-auto flex max-w-2xl items-stretch justify-around px-2">
        {tabs.map((tab) => {
          const active = view === tab.view && !selectedPropertyId
          const Icon = tab.icon
          return (
            <button
              key={tab.view}
              type="button"
              onClick={() => setView(tab.view)}
              className="group flex flex-1 flex-col items-center gap-1 py-2.5"
              aria-current={active ? 'page' : undefined}
            >
              <span
                className={cn(
                  'flex h-8 w-14 items-center justify-center rounded-full transition-all duration-200',
                  active ? 'bg-primary/10 text-primary' : 'text-muted-foreground group-active:scale-90',
                )}
              >
                <Icon className={cn('size-5', active && 'scale-105')} />
              </span>
              <span
                className={cn(
                  'text-[11px] font-medium transition-colors',
                  active ? 'text-primary' : 'text-muted-foreground',
                )}
              >
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
