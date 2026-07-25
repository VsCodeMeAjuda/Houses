import { getSupabaseClient } from './supabase'
import type {
  Property,
  Tenant,
  Payment,
  Expense,
  MaintenanceTask,
  Activity,
  AppNotification,
  DocumentItem,
} from './data'

// ---------------------------------------------------------------------------
// Mappers: database rows (snake_case) <-> app types (camelCase)
// ---------------------------------------------------------------------------

const propertyFromRow = (r: any): Property => ({
  id: r.id,
  name: r.name,
  address: r.address,
  photo: r.photo ?? '',
  status: r.status,
  monthlyRent: Number(r.monthly_rent),
  purchasePrice: Number(r.purchase_price),
  totalInvestment: Number(r.total_investment),
  marketValue: Number(r.market_value),
  purchaseDate: r.purchase_date,
  purchaseMethod: r.purchase_method,
  currentTenantId: r.current_tenant_id,
  bedrooms: Number(r.bedrooms),
  bathrooms: Number(r.bathrooms),
  area: Number(r.area),
})

const propertyToRow = (p: Partial<Property>) => ({
  name: p.name,
  address: p.address,
  photo: p.photo,
  status: p.status,
  monthly_rent: p.monthlyRent,
  purchase_price: p.purchasePrice,
  total_investment: p.totalInvestment,
  market_value: p.marketValue,
  purchase_date: p.purchaseDate,
  purchase_method: p.purchaseMethod,
  current_tenant_id: p.currentTenantId,
  bedrooms: p.bedrooms,
  bathrooms: p.bathrooms,
  area: p.area,
})

const tenantFromRow = (r: any): Tenant => ({
  id: r.id,
  fullName: r.full_name,
  cpf: r.cpf ?? '',
  phone: r.phone ?? '',
  email: r.email ?? '',
  propertyId: r.property_id,
  contractStart: r.contract_start,
  contractEnd: r.contract_end,
  monthlyRent: Number(r.monthly_rent),
  securityDeposit: Number(r.security_deposit),
  paymentDueDay: Number(r.payment_due_day),
  paymentStatus: r.payment_status,
  relationship: r.relationship,
  commissionPercent: Number(r.commission_percent),
  paymentMethod: r.payment_method,
})

const tenantToRow = (t: Partial<Tenant>) => ({
  full_name: t.fullName,
  cpf: t.cpf,
  phone: t.phone,
  email: t.email,
  property_id: t.propertyId || null,
  contract_start: t.contractStart,
  contract_end: t.contractEnd,
  monthly_rent: t.monthlyRent,
  security_deposit: t.securityDeposit,
  payment_due_day: t.paymentDueDay,
  payment_status: t.paymentStatus,
  relationship: t.relationship,
  commission_percent: t.commissionPercent,
  payment_method: t.paymentMethod,
})

const paymentFromRow = (r: any): Payment => ({
  id: r.id,
  tenantId: r.tenant_id,
  propertyId: r.property_id,
  dueDate: r.due_date,
  amount: Number(r.amount),
  status: r.status,
  paidDate: r.paid_date,
  method: r.method,
  category: r.category,
})

const paymentToRow = (p: Partial<Payment>) => ({
  tenant_id: p.tenantId || null,
  property_id: p.propertyId || null,
  due_date: p.dueDate,
  amount: p.amount,
  status: p.status,
  paid_date: p.paidDate,
  method: p.method,
  category: p.category,
})

const expenseFromRow = (r: any): Expense => ({
  id: r.id,
  propertyId: r.property_id,
  category: r.category,
  description: r.description ?? '',
  amount: Number(r.amount),
  date: r.date,
})

const expenseToRow = (e: Partial<Expense>) => ({
  property_id: e.propertyId || null,
  category: e.category,
  description: e.description,
  amount: e.amount,
  date: e.date,
})

const maintenanceFromRow = (r: any): MaintenanceTask => ({
  id: r.id,
  propertyId: r.property_id,
  title: r.title,
  description: r.description ?? '',
  priority: r.priority,
  status: r.status,
  createdDate: r.created_date,
  dueDate: r.due_date,
  estimatedCost: Number(r.estimated_cost),
  actualCost: Number(r.actual_cost),
  notes: r.notes ?? '',
})

const maintenanceToRow = (m: Partial<MaintenanceTask>) => ({
  property_id: m.propertyId || null,
  title: m.title,
  description: m.description,
  priority: m.priority,
  status: m.status,
  created_date: m.createdDate,
  due_date: m.dueDate || null,
  estimated_cost: m.estimatedCost,
  actual_cost: m.actualCost,
  notes: m.notes,
})

// ---------------------------------------------------------------------------
// Bulk load
// ---------------------------------------------------------------------------

export interface LoadedData {
  properties: Property[]
  tenants: Tenant[]
  payments: Payment[]
  expenses: Expense[]
  maintenanceTasks: MaintenanceTask[]
  activities: Activity[]
  notifications: AppNotification[]
  documents: DocumentItem[]
}

export async function loadAll(): Promise<LoadedData> {
  const supabase = getSupabaseClient()
  if (!supabase) throw new Error('Supabase not configured')

  const [props, tens, pays, exps, maint, acts, notifs, docs] = await Promise.all([
    supabase.from('properties').select('*').order('created_at', { ascending: true }),
    supabase.from('tenants').select('*').order('created_at', { ascending: true }),
    supabase.from('payments').select('*').order('due_date', { ascending: false }),
    supabase.from('expenses').select('*').order('date', { ascending: false }),
    supabase.from('maintenance_tasks').select('*').order('created_date', { ascending: false }),
    supabase.from('activities').select('*').order('date', { ascending: false }),
    supabase.from('notifications').select('*').order('date', { ascending: false }),
    supabase.from('documents').select('*').order('date', { ascending: false }),
  ])

  const firstError =
    props.error || tens.error || pays.error || exps.error || maint.error || acts.error || notifs.error || docs.error
  if (firstError) throw firstError

  return {
    properties: (props.data ?? []).map(propertyFromRow),
    tenants: (tens.data ?? []).map(tenantFromRow),
    payments: (pays.data ?? []).map(paymentFromRow),
    expenses: (exps.data ?? []).map(expenseFromRow),
    maintenanceTasks: (maint.data ?? []).map(maintenanceFromRow),
    activities: (acts.data ?? []) as Activity[],
    notifications: (notifs.data ?? []) as AppNotification[],
    documents: (docs.data ?? []).map((r: any) => ({
      id: r.id,
      name: r.name,
      propertyId: r.property_id,
      category: r.category,
      size: r.size,
      date: r.date,
    })),
  }
}

// ---------------------------------------------------------------------------
// CRUD helpers — each returns the persisted row mapped to the app type
// ---------------------------------------------------------------------------

async function insert<T>(table: string, row: object, mapper: (r: any) => T): Promise<T> {
  const supabase = getSupabaseClient()
  if (!supabase) throw new Error('Supabase not configured')
  const { data, error } = await supabase.from(table).insert(row).select().single()
  if (error) throw error
  return mapper(data)
}

async function update<T>(table: string, id: string, row: object, mapper: (r: any) => T): Promise<T> {
  const supabase = getSupabaseClient()
  if (!supabase) throw new Error('Supabase not configured')
  const { data, error } = await supabase.from(table).update(row).eq('id', id).select().single()
  if (error) throw error
  return mapper(data)
}

async function remove(table: string, id: string): Promise<void> {
  const supabase = getSupabaseClient()
  if (!supabase) throw new Error('Supabase not configured')
  const { error } = await supabase.from(table).delete().eq('id', id)
  if (error) throw error
}

export const db = {
  createProperty: (p: Partial<Property>) => insert('properties', propertyToRow(p), propertyFromRow),
  updateProperty: (id: string, p: Partial<Property>) => update('properties', id, propertyToRow(p), propertyFromRow),
  deleteProperty: (id: string) => remove('properties', id),

  createTenant: (t: Partial<Tenant>) => insert('tenants', tenantToRow(t), tenantFromRow),
  updateTenant: (id: string, t: Partial<Tenant>) => update('tenants', id, tenantToRow(t), tenantFromRow),
  deleteTenant: (id: string) => remove('tenants', id),

  createPayment: (p: Partial<Payment>) => insert('payments', paymentToRow(p), paymentFromRow),
  updatePayment: (id: string, p: Partial<Payment>) => update('payments', id, paymentToRow(p), paymentFromRow),
  deletePayment: (id: string) => remove('payments', id),

  createExpense: (e: Partial<Expense>) => insert('expenses', expenseToRow(e), expenseFromRow),
  updateExpense: (id: string, e: Partial<Expense>) => update('expenses', id, expenseToRow(e), expenseFromRow),
  deleteExpense: (id: string) => remove('expenses', id),

  createMaintenance: (m: Partial<MaintenanceTask>) => insert('maintenance_tasks', maintenanceToRow(m), maintenanceFromRow),
  updateMaintenance: (id: string, m: Partial<MaintenanceTask>) =>
    update('maintenance_tasks', id, maintenanceToRow(m), maintenanceFromRow),
  deleteMaintenance: (id: string) => remove('maintenance_tasks', id),
}
