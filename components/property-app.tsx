'use client'

import { AppProvider, useApp } from './app-context'
import { TopHeader } from './top-header'
import { BottomNav } from './bottom-nav'
import { MenuDrawer } from './menu-drawer'
import { DashboardScreen } from './screens/dashboard-screen'
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
    case 'backup':
      return <BackupScreen />
    case 'settings':
      return <SettingsScreen />
    default:
      return <DashboardScreen />
  }
}

export function PropertyApp() {
  return (
    <AppProvider>
      <div className="min-h-dvh bg-background">
        <TopHeader />
        <main className="mx-auto max-w-2xl px-4 pb-28 pt-5">
          <div key="screen" className="animate-fade-in">
            <Screens />
          </div>
        </main>
        <BottomNav />
        <MenuDrawer />
      </div>
    </AppProvider>
  )
}
