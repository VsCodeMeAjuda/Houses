'use client'

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  properties as seedProperties,
  tenants as seedTenants,
  payments as seedPayments,
  expenses as seedExpenses,
  maintenanceTasks as seedMaintenance,
  activities as seedActivities,
  notifications as seedNotifications,
  documents as seedDocuments,
  type Property,
  type Tenant,
  type Payment,
  type Expense,
  type MaintenanceTask,
  type Activity,
  type AppNotification,
  type DocumentItem,
} from '@/lib/data'
import { buildMetrics, type Metrics } from '@/lib/metrics'
import { isSupabaseConfigured } from '@/lib/supabase'
import { db, loadAll } from '@/lib/db'

function uid() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return `id-${Math.random().toString(36).slice(2)}-${Date.now()}`
}

interface DataContextValue {
  loading: boolean
  error: string | null
  usingSupabase: boolean

  properties: Property[]
  tenants: Tenant[]
  payments: Payment[]
  expenses: Expense[]
  maintenanceTasks: MaintenanceTask[]
  activities: Activity[]
  notifications: AppNotification[]
  documents: DocumentItem[]

  metrics: Metrics

  createProperty: (p: Omit<Property, 'id'>) => Promise<Property>
  updateProperty: (id: string, p: Partial<Property>) => Promise<void>
  deleteProperty: (id: string) => Promise<void>

  createTenant: (t: Omit<Tenant, 'id'>) => Promise<Tenant>
  updateTenant: (id: string, t: Partial<Tenant>) => Promise<void>
  deleteTenant: (id: string) => Promise<void>

  createPayment: (p: Omit<Payment, 'id'>) => Promise<Payment>
  updatePayment: (id: string, p: Partial<Payment>) => Promise<void>
  deletePayment: (id: string) => Promise<void>

  createExpense: (e: Omit<Expense, 'id'>) => Promise<Expense>
  updateExpense: (id: string, e: Partial<Expense>) => Promise<void>
  deleteExpense: (id: string) => Promise<void>

  createMaintenance: (m: Omit<MaintenanceTask, 'id'>) => Promise<MaintenanceTask>
  updateMaintenance: (id: string, m: Partial<MaintenanceTask>) => Promise<void>
  deleteMaintenance: (id: string) => Promise<void>
}

const DataContext = createContext<DataContextValue | null>(null)

export function DataProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(isSupabaseConfigured)
  const [error, setError] = useState<string | null>(null)

  const [properties, setProperties] = useState<Property[]>(seedProperties)
  const [tenants, setTenants] = useState<Tenant[]>(seedTenants)
  const [payments, setPayments] = useState<Payment[]>(seedPayments)
  const [expenses, setExpenses] = useState<Expense[]>(seedExpenses)
  const [maintenanceTasks, setMaintenanceTasks] = useState<MaintenanceTask[]>(seedMaintenance)
  const [activities, setActivities] = useState<Activity[]>(seedActivities)
  const [notifications, setNotifications] = useState<AppNotification[]>(seedNotifications)
  const [documents, setDocuments] = useState<DocumentItem[]>(seedDocuments)

  useEffect(() => {
    if (!isSupabaseConfigured) return
    let active = true
    setLoading(true)
    loadAll()
      .then((data) => {
        if (!active) return
        setProperties(data.properties)
        setTenants(data.tenants)
        setPayments(data.payments)
        setExpenses(data.expenses)
        setMaintenanceTasks(data.maintenanceTasks)
        if (data.activities.length) setActivities(data.activities)
        if (data.notifications.length) setNotifications(data.notifications)
        if (data.documents.length) setDocuments(data.documents)
        setError(null)
      })
      .catch((err) => {
        if (!active) return
        console.log('[v0] Supabase load error:', err?.message)
        setError('Não foi possível carregar os dados do Supabase. Verifique suas credenciais e o schema.')
      })
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [])

  const metrics = useMemo(
    () => buildMetrics({ properties, tenants, payments, expenses }),
    [properties, tenants, payments, expenses],
  )

  // ----- Properties -----
  async function createProperty(p: Omit<Property, 'id'>) {
    const created = isSupabaseConfigured ? await db.createProperty(p) : { ...p, id: uid() }
    setProperties((prev) => [...prev, created])
    return created
  }
  async function updateProperty(id: string, patch: Partial<Property>) {
    if (isSupabaseConfigured) await db.updateProperty(id, patch)
    setProperties((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)))
  }
  async function deleteProperty(id: string) {
    if (isSupabaseConfigured) await db.deleteProperty(id)
    setProperties((prev) => prev.filter((p) => p.id !== id))
    setTenants((prev) => prev.map((t) => (t.propertyId === id ? { ...t, propertyId: '' } : t)))
    setExpenses((prev) => prev.filter((e) => e.propertyId !== id))
    setMaintenanceTasks((prev) => prev.filter((m) => m.propertyId !== id))
    setPayments((prev) => prev.filter((pay) => pay.propertyId !== id))
  }

  // ----- Tenants -----
  async function syncCurrentTenant(propertyId: string | undefined | null, tenantId: string | null) {
    if (!propertyId) return
    await updateProperty(propertyId, { currentTenantId: tenantId, status: tenantId ? 'occupied' : 'vacant' })
  }
  async function createTenant(t: Omit<Tenant, 'id'>) {
    const created = isSupabaseConfigured ? await db.createTenant(t) : { ...t, id: uid() }
    setTenants((prev) => [...prev, created])
    await syncCurrentTenant(created.propertyId, created.id)
    return created
  }
  async function updateTenant(id: string, patch: Partial<Tenant>) {
    if (isSupabaseConfigured) await db.updateTenant(id, patch)
    setTenants((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)))
    if (patch.propertyId !== undefined) await syncCurrentTenant(patch.propertyId, id)
  }
  async function deleteTenant(id: string) {
    const tenant = tenants.find((t) => t.id === id)
    if (isSupabaseConfigured) await db.deleteTenant(id)
    setTenants((prev) => prev.filter((t) => t.id !== id))
    if (tenant?.propertyId) await syncCurrentTenant(tenant.propertyId, null)
  }

  // ----- Payments -----
  async function createPayment(p: Omit<Payment, 'id'>) {
    const created = isSupabaseConfigured ? await db.createPayment(p) : { ...p, id: uid() }
    setPayments((prev) => [created, ...prev])
    return created
  }
  async function updatePayment(id: string, patch: Partial<Payment>) {
    if (isSupabaseConfigured) await db.updatePayment(id, patch)
    setPayments((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)))
  }
  async function deletePayment(id: string) {
    if (isSupabaseConfigured) await db.deletePayment(id)
    setPayments((prev) => prev.filter((p) => p.id !== id))
  }

  // ----- Expenses -----
  async function createExpense(e: Omit<Expense, 'id'>) {
    const created = isSupabaseConfigured ? await db.createExpense(e) : { ...e, id: uid() }
    setExpenses((prev) => [created, ...prev])
    return created
  }
  async function updateExpense(id: string, patch: Partial<Expense>) {
    if (isSupabaseConfigured) await db.updateExpense(id, patch)
    setExpenses((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)))
  }
  async function deleteExpense(id: string) {
    if (isSupabaseConfigured) await db.deleteExpense(id)
    setExpenses((prev) => prev.filter((e) => e.id !== id))
  }

  // ----- Maintenance -----
  async function createMaintenance(m: Omit<MaintenanceTask, 'id'>) {
    const created = isSupabaseConfigured ? await db.createMaintenance(m) : { ...m, id: uid() }
    setMaintenanceTasks((prev) => [created, ...prev])
    return created
  }
  async function updateMaintenance(id: string, patch: Partial<MaintenanceTask>) {
    if (isSupabaseConfigured) await db.updateMaintenance(id, patch)
    setMaintenanceTasks((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)))
  }
  async function deleteMaintenance(id: string) {
    if (isSupabaseConfigured) await db.deleteMaintenance(id)
    setMaintenanceTasks((prev) => prev.filter((m) => m.id !== id))
  }

  const value: DataContextValue = {
    loading,
    error,
    usingSupabase: isSupabaseConfigured,
    properties,
    tenants,
    payments,
    expenses,
    maintenanceTasks,
    activities,
    notifications,
    documents,
    metrics,
    createProperty,
    updateProperty,
    deleteProperty,
    createTenant,
    updateTenant,
    deleteTenant,
    createPayment,
    updatePayment,
    deletePayment,
    createExpense,
    updateExpense,
    deleteExpense,
    createMaintenance,
    updateMaintenance,
    deleteMaintenance,
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used within DataProvider')
  return ctx
}
