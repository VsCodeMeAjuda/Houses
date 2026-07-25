'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'

export type View =
  | 'dashboard'
  | 'properties'
  | 'tenants'
  | 'finance'
  | 'reports'
  | 'contracts'
  | 'expenses'
  | 'future-revenue'
  | 'payment-history'
  | 'calendar'
  | 'notifications'
  | 'documents'
  | 'backup'
  | 'settings'

interface AppState {
  view: View
  setView: (v: View) => void
  selectedPropertyId: string | null
  openProperty: (id: string) => void
  closeProperty: () => void
  menuOpen: boolean
  setMenuOpen: (open: boolean) => void
}

const AppContext = createContext<AppState | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [view, setViewState] = useState<View>('dashboard')
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)

  function setView(v: View) {
    setSelectedPropertyId(null)
    setViewState(v)
    setMenuOpen(false)
  }

  function openProperty(id: string) {
    setSelectedPropertyId(id)
  }

  function closeProperty() {
    setSelectedPropertyId(null)
  }

  return (
    <AppContext.Provider
      value={{
        view,
        setView,
        selectedPropertyId,
        openProperty,
        closeProperty,
        menuOpen,
        setMenuOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}

export const viewTitles: Record<View, string> = {
  dashboard: 'Painel',
  properties: 'Imóveis',
  tenants: 'Inquilinos',
  finance: 'Finanças',
  reports: 'Relatórios',
  contracts: 'Contratos',
  expenses: 'Despesas',
  'future-revenue': 'Receita Futura',
  'payment-history': 'Histórico de Pagamentos',
  calendar: 'Calendário',
  notifications: 'Notificações',
  documents: 'Documentos',
  backup: 'Backup & Exportação',
  settings: 'Configurações',
}
