'use client'

import { Loader2, CircleAlert } from 'lucide-react'
import { AppProvider, useApp } from './app-context'
import { DataProvider, useData } from './data-context'
import { ToastProvider } from './ui/toast'
import { TopHeader } from './top-header'
import { BottomNav } from './bottom-nav'
import { MenuDrawer } from './menu-drawer'
import { DashboardScreen } from './screens/dashboard-screen'
import { MaintenanceScreen } from './screens/maintenance-screen'
import { PropertiesScreen } from './screens/properties-screen'
import { PropertyDetailScreen } from './screens/property-detail-screen'
import { TenantsScreen } from './screens/tenants-screen'
import { FinanceScreen } from './screens/finance-screen'
import { ReportsScreen } from './screens/reports-screen'
import { ContractsScreen } from './screens/contracts-screen'
import { ExpensesScreen } from './screens/expenses-screen'
import { FutureRevenueScreen } from './screens/future-revenue-screen'
import { PaymentHistoryScreen } from './screens/payment-history-screen'
import { CalendarScreen } from './screens/calendar-screen'
import { NotificationsScreen } from './screens/notifications-screen'
import { DocumentsScreen } from './screens/documents-screen'
import { BackupScreen } from './screens/backup-screen'
import { SettingsScreen } from './screens/settings-screen'

function Screens() {
  const { view, selectedPropertyId } = useApp()

  if (selectedPropertyId) {
    return <PropertyDetailScreen propertyId={selectedPropertyId} />
  }

  switch (view) {
    case 'dashboard':
      return <DashboardScreen />
    case 'properties':
      return <PropertiesScreen />
    case 'tenants':
      return <TenantsScreen />
    case 'finance':
      return <FinanceScreen />
    case 'reports':
      return <ReportsScreen />
    case 'contracts':
      return <ContractsScreen />
    case 'expenses':
      return <ExpensesScreen />
    case 'future-revenue':
      return <FutureRevenueScreen />
    case 'payment-history':
      return <PaymentHistoryScreen />
    case 'calendar':
      return <CalendarScreen />
    case 'notifications':
      return <NotificationsScreen />
    case 'documents':
      return <DocumentsScreen />
    case 'maintenance':
      return <MaintenanceScreen />
    case 'backup':
      return <BackupScreen />
    case 'settings':
      return <SettingsScreen />
    default:
      return <DashboardScreen />
  }
}

function AppShell() {
  const { loading, error } = useData()

  return (
    <div className="min-h-dvh bg-background">
      <TopHeader />
      <main className="mx-auto max-w-2xl px-4 pb-28 pt-5">
        {error && (
          <div className="mb-4 flex items-start gap-2 rounded-2xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
            <CircleAlert className="mt-0.5 size-4 shrink-0" />
            <p>{error}</p>
          </div>
        )}
        {loading ? (
          <div className="flex min-h-[60dvh] flex-col items-center justify-center gap-3 text-muted-foreground">
            <Loader2 className="size-7 animate-spin text-primary" />
            <p className="text-sm">Carregando dados…</p>
          </div>
        ) : (
          <div key="screen" className="animate-fade-in">
            <Screens />
          </div>
        )}
      </main>
      <BottomNav />
      <MenuDrawer />
    </div>
  )
}

export function PropertyApp() {
  return (
    <ToastProvider>
      <DataProvider>
        <AppProvider>
          <AppShell />
        </AppProvider>
      </DataProvider>
    </ToastProvider>
  )
}
