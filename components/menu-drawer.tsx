'use client'

import {
  X,
  FileText,
  Receipt,
  TrendingUp,
  History,
  Calendar,
  Bell,
  FolderClosed,
  DatabaseBackup,
  Settings,
  ChevronRight,
  Building2,
  Wrench,
} from 'lucide-react'
import { useApp, type View } from './app-context'
import { useData } from './data-context'

const items: { view: View; label: string; icon: typeof FileText }[] = [
  { view: 'contracts', label: 'Contratos', icon: FileText },
  { view: 'expenses', label: 'Despesas', icon: Receipt },
  { view: 'maintenance', label: 'Manutenção', icon: Wrench },
  { view: 'future-revenue', label: 'Receita Futura', icon: TrendingUp },
  { view: 'payment-history', label: 'Histórico de Pagamentos', icon: History },
  { view: 'calendar', label: 'Calendário', icon: Calendar },
  { view: 'notifications', label: 'Notificações', icon: Bell },
  { view: 'documents', label: 'Documentos', icon: FolderClosed },
  { view: 'backup', label: 'Backup & Exportação', icon: DatabaseBackup },
  { view: 'settings', label: 'Configurações', icon: Settings },
]

export function MenuDrawer() {
  const { menuOpen, setMenuOpen, setView } = useApp()
  const { notifications } = useData()
  const unread = notifications.filter((n) => !n.read).length

  if (!menuOpen) return null

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Fechar menu"
        onClick={() => setMenuOpen(false)}
        className="absolute inset-0 animate-fade-in bg-foreground/40 backdrop-blur-sm"
      />
      <div className="animate-sheet-in absolute inset-y-0 left-0 flex w-[84%] max-w-sm flex-col bg-background shadow-2xl">
        <div className="flex items-center justify-between px-5 pb-4 pt-6">
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <Building2 className="size-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-foreground">Property Manager</p>
              <p className="text-xs text-muted-foreground">Portfólio pessoal</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            aria-label="Fechar"
            className="flex size-9 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="mx-4 mb-2 h-px bg-border" />

        <nav className="flex-1 overflow-y-auto px-3 pb-6">
          <p className="px-3 pb-2 pt-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Seções
          </p>
          {items.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.view}
                type="button"
                onClick={() => setView(item.view)}
                className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-colors hover:bg-muted active:scale-[0.99]"
              >
                <span className="flex size-9 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                  <Icon className="size-[18px]" />
                </span>
                <span className="flex-1 text-sm font-medium text-foreground">{item.label}</span>
                {item.view === 'notifications' && unread > 0 && (
                  <span className="flex size-5 items-center justify-center rounded-full bg-danger text-[11px] font-semibold text-danger-foreground">
                    {unread}
                  </span>
                )}
                <ChevronRight className="size-4 text-muted-foreground" />
              </button>
            )
          })}
        </nav>

        <div className="border-t border-border px-5 py-4 text-xs text-muted-foreground safe-bottom">
          Versão 1.0 • Sincronizado agora
        </div>
      </div>
    </div>
  )
}
