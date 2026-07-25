// ---------- Types ----------

export type PropertyStatus = 'occupied' | 'vacant'
export type PaymentStatus = 'paid' | 'due-soon' | 'overdue' | 'pending'
export type RelationshipType = 'direct' | 'agency' | 'commissioned'
export type TenantPaymentMethod = 'pix' | 'transfer' | 'cash' | 'credit' | 'debit'
export type PurchaseMethod = 'cash' | 'financing' | 'mortgage' | 'installments'

export type IncomeCategory = 'rent' | 'deposit' | 'other-income'
export type ExpenseCategory =
  | 'maintenance'
  | 'repairs'
  | 'renovations'
  | 'taxes'
  | 'insurance'
  | 'utilities'
  | 'hoa'
  | 'other-expense'

export interface Property {
  id: string
  name: string
  address: string
  photo: string
  status: PropertyStatus
  monthlyRent: number
  purchasePrice: number
  totalInvestment: number
  marketValue: number
  purchaseDate: string
  purchaseMethod: PurchaseMethod
  currentTenantId: string | null
  bedrooms: number
  bathrooms: number
  area: number
}

export interface Tenant {
  id: string
  fullName: string
  cpf: string
  phone: string
  email: string
  propertyId: string
  contractStart: string
  contractEnd: string
  monthlyRent: number
  securityDeposit: number
  paymentDueDay: number
  paymentStatus: PaymentStatus
  relationship: RelationshipType
  commissionPercent: number
  paymentMethod: TenantPaymentMethod
}

export interface Payment {
  id: string
  tenantId: string
  propertyId: string
  dueDate: string
  amount: number
  status: PaymentStatus
  paidDate: string | null
  method: TenantPaymentMethod
  category: IncomeCategory
}

export interface Expense {
  id: string
  propertyId: string
  category: ExpenseCategory
  description: string
  amount: number
  date: string
}

export type MaintenancePriority = 'low' | 'medium' | 'high' | 'urgent'
export type MaintenanceStatus = 'pending' | 'in-progress' | 'completed'

export interface MaintenanceTask {
  id: string
  propertyId: string
  title: string
  description: string
  priority: MaintenancePriority
  status: MaintenanceStatus
  createdDate: string
  dueDate: string | null
  estimatedCost: number
  actualCost: number
  notes: string
}

export type ActivityType =
  | 'payment'
  | 'tenant'
  | 'expense'
  | 'deposit'
  | 'contract'

export interface Activity {
  id: string
  type: ActivityType
  title: string
  description: string
  date: string
}

export interface AppNotification {
  id: string
  title: string
  description: string
  date: string
  read: boolean
  kind: 'payment' | 'contract' | 'maintenance' | 'system'
}

export interface DocumentItem {
  id: string
  name: string
  propertyId: string | null
  category: string
  size: string
  date: string
}

// ---------- Date helpers ----------

function d(offsetDays: number): string {
  const date = new Date()
  date.setDate(date.getDate() + offsetDays)
  return date.toISOString()
}

function monthsAgo(m: number): string {
  const date = new Date()
  date.setMonth(date.getMonth() - m)
  return date.toISOString()
}

// ---------- Mock data ----------

export const properties: Property[] = [
  {
    id: 'p1',
    name: 'Edifício Aurora 402',
    address: 'Rua das Palmeiras, 402 — Jardins, São Paulo',
    photo: '/images/property-1.png',
    status: 'occupied',
    monthlyRent: 3800,
    purchasePrice: 520000,
    totalInvestment: 565000,
    marketValue: 690000,
    purchaseDate: monthsAgo(38),
    purchaseMethod: 'financing',
    currentTenantId: 't1',
    bedrooms: 2,
    bathrooms: 2,
    area: 78,
  },
  {
    id: 'p2',
    name: 'Casa Vila Verde',
    address: 'Alameda dos Ipês, 87 — Granja Viana, Cotia',
    photo: '/images/property-2.png',
    status: 'occupied',
    monthlyRent: 4500,
    purchasePrice: 610000,
    totalInvestment: 648000,
    marketValue: 780000,
    purchaseDate: monthsAgo(54),
    purchaseMethod: 'cash',
    currentTenantId: 't2',
    bedrooms: 3,
    bathrooms: 3,
    area: 140,
  },
  {
    id: 'p3',
    name: 'Condomínio Skyline 1201',
    address: 'Av. Faria Lima, 1201 — Itaim Bibi, São Paulo',
    photo: '/images/property-3.png',
    status: 'occupied',
    monthlyRent: 6200,
    purchasePrice: 890000,
    totalInvestment: 940000,
    marketValue: 1120000,
    purchaseDate: monthsAgo(26),
    purchaseMethod: 'mortgage',
    currentTenantId: 't3',
    bedrooms: 3,
    bathrooms: 2,
    area: 96,
  },
  {
    id: 'p4',
    name: 'Studio Central',
    address: 'Rua Augusta, 1500 — Consolação, São Paulo',
    photo: '/images/property-4.png',
    status: 'vacant',
    monthlyRent: 2400,
    purchasePrice: 340000,
    totalInvestment: 360000,
    marketValue: 430000,
    purchaseDate: monthsAgo(18),
    purchaseMethod: 'installments',
    currentTenantId: null,
    bedrooms: 1,
    bathrooms: 1,
    area: 38,
  },
]

export const tenants: Tenant[] = [
  {
    id: 't1',
    fullName: 'Mariana Costa',
    cpf: '123.456.789-01',
    phone: '(11) 98765-4321',
    email: 'mariana.costa@email.com',
    propertyId: 'p1',
    contractStart: monthsAgo(10),
    contractEnd: d(60),
    monthlyRent: 3800,
    securityDeposit: 7600,
    paymentDueDay: 5,
    paymentStatus: 'paid',
    relationship: 'direct',
    commissionPercent: 0,
    paymentMethod: 'pix',
  },
  {
    id: 't2',
    fullName: 'Rafael Almeida',
    cpf: '987.654.321-09',
    phone: '(11) 91234-5678',
    email: 'rafael.almeida@email.com',
    propertyId: 'p2',
    contractStart: monthsAgo(22),
    contractEnd: d(4),
    monthlyRent: 4500,
    securityDeposit: 9000,
    paymentDueDay: 10,
    paymentStatus: 'due-soon',
    relationship: 'agency',
    commissionPercent: 8,
    paymentMethod: 'transfer',
  },
  {
    id: 't3',
    fullName: 'Juliana Santos',
    cpf: '456.789.123-45',
    phone: '(11) 99876-5432',
    email: 'juliana.santos@email.com',
    propertyId: 'p3',
    contractStart: monthsAgo(6),
    contractEnd: d(180),
    monthlyRent: 6200,
    securityDeposit: 12400,
    paymentDueDay: 1,
    paymentStatus: 'overdue',
    relationship: 'commissioned',
    commissionPercent: 5,
    paymentMethod: 'pix',
  },
]

export const payments: Payment[] = [
  {
    id: 'pay1',
    tenantId: 't1',
    propertyId: 'p1',
    dueDate: d(3),
    amount: 3800,
    status: 'due-soon',
    paidDate: null,
    method: 'pix',
    category: 'rent',
  },
  {
    id: 'pay2',
    tenantId: 't2',
    propertyId: 'p2',
    dueDate: d(7),
    amount: 4500,
    status: 'due-soon',
    paidDate: null,
    method: 'transfer',
    category: 'rent',
  },
  {
    id: 'pay3',
    tenantId: 't3',
    propertyId: 'p3',
    dueDate: d(-5),
    amount: 6200,
    status: 'overdue',
    paidDate: null,
    method: 'pix',
    category: 'rent',
  },
  {
    id: 'pay4',
    tenantId: 't1',
    propertyId: 'p1',
    dueDate: d(-27),
    amount: 3800,
    status: 'paid',
    paidDate: d(-27),
    method: 'pix',
    category: 'rent',
  },
  {
    id: 'pay5',
    tenantId: 't2',
    propertyId: 'p2',
    dueDate: d(-23),
    amount: 4500,
    status: 'paid',
    paidDate: d(-22),
    method: 'transfer',
    category: 'rent',
  },
  {
    id: 'pay6',
    tenantId: 't3',
    propertyId: 'p3',
    dueDate: d(-35),
    amount: 6200,
    status: 'paid',
    paidDate: d(-35),
    method: 'pix',
    category: 'rent',
  },
]

export const expenses: Expense[] = [
  {
    id: 'e1',
    propertyId: 'p1',
    category: 'hoa',
    description: 'Condomínio Edifício Aurora',
    amount: 650,
    date: d(-12),
  },
  {
    id: 'e2',
    propertyId: 'p2',
    category: 'maintenance',
    description: 'Manutenção do jardim',
    amount: 320,
    date: d(-18),
  },
  {
    id: 'e3',
    propertyId: 'p3',
    category: 'repairs',
    description: 'Reparo hidráulico banheiro',
    amount: 890,
    date: d(-6),
  },
  {
    id: 'e4',
    propertyId: 'p1',
    category: 'taxes',
    description: 'IPTU parcela 8/10',
    amount: 420,
    date: d(-9),
  },
  {
    id: 'e5',
    propertyId: 'p4',
    category: 'renovations',
    description: 'Pintura completa do studio',
    amount: 2800,
    date: d(-30),
  },
  {
    id: 'e6',
    propertyId: 'p2',
    category: 'insurance',
    description: 'Seguro residencial anual',
    amount: 1200,
    date: d(-40),
  },
  {
    id: 'e7',
    propertyId: 'p3',
    category: 'utilities',
    description: 'Energia área comum',
    amount: 180,
    date: d(-4),
  },
]

export const maintenanceTasks: MaintenanceTask[] = [
  {
    id: 'm1',
    propertyId: 'p3',
    title: 'Reparo hidráulico no banheiro',
    description: 'Vazamento na tubulação do banheiro social precisa de reparo imediato.',
    priority: 'high',
    status: 'completed',
    createdDate: d(-12),
    dueDate: d(-6),
    estimatedCost: 800,
    actualCost: 890,
    notes: 'Substituída a conexão do registro. Garantia de 6 meses.',
  },
  {
    id: 'm2',
    propertyId: 'p2',
    title: 'Manutenção do jardim',
    description: 'Poda das árvores e limpeza geral da área externa.',
    priority: 'low',
    status: 'in-progress',
    createdDate: d(-8),
    dueDate: d(2),
    estimatedCost: 350,
    actualCost: 0,
    notes: '',
  },
  {
    id: 'm3',
    propertyId: 'p4',
    title: 'Pintura completa do studio',
    description: 'Repintura de todas as paredes antes de nova locação.',
    priority: 'medium',
    status: 'pending',
    createdDate: d(-3),
    dueDate: d(14),
    estimatedCost: 2800,
    actualCost: 0,
    notes: 'Aguardando orçamento do fornecedor.',
  },
  {
    id: 'm4',
    propertyId: 'p1',
    title: 'Troca do disjuntor geral',
    description: 'Quadro de energia apresentando falhas intermitentes.',
    priority: 'urgent',
    status: 'pending',
    createdDate: d(-1),
    dueDate: d(3),
    estimatedCost: 450,
    actualCost: 0,
    notes: '',
  },
]

export const activities: Activity[] = [
  {
    id: 'a1',
    type: 'payment',
    title: 'Pagamento recebido',
    description: 'Mariana Costa • Edifício Aurora 402 • R$ 3.800',
    date: d(-1),
  },
  {
    id: 'a2',
    type: 'expense',
    title: 'Despesa adicionada',
    description: 'Reparo hidráulico • Skyline 1201 • R$ 890',
    date: d(-6),
  },
  {
    id: 'a3',
    type: 'tenant',
    title: 'Novo inquilino',
    description: 'Juliana Santos • Condomínio Skyline 1201',
    date: monthsAgo(6),
  },
  {
    id: 'a4',
    type: 'contract',
    title: 'Contrato atualizado',
    description: 'Reajuste anual • Casa Vila Verde',
    date: d(-14),
  },
  {
    id: 'a5',
    type: 'deposit',
    title: 'Caução devolvida',
    description: 'Ex-inquilino • Studio Central • R$ 4.800',
    date: d(-20),
  },
]

export const notifications: AppNotification[] = [
  {
    id: 'n1',
    title: 'Aluguel vencendo em breve',
    description: 'Mariana Costa vence em 3 dias (R$ 3.800)',
    date: d(0),
    read: false,
    kind: 'payment',
  },
  {
    id: 'n2',
    title: 'Pagamento em atraso',
    description: 'Juliana Santos está 5 dias atrasada (R$ 6.200)',
    date: d(-5),
    read: false,
    kind: 'payment',
  },
  {
    id: 'n3',
    title: 'Contrato encerrando',
    description: 'Contrato de Rafael Almeida termina em 4 dias',
    date: d(-1),
    read: false,
    kind: 'contract',
  },
  {
    id: 'n4',
    title: 'Manutenção concluída',
    description: 'Reparo hidráulico no Skyline 1201 finalizado',
    date: d(-6),
    read: true,
    kind: 'maintenance',
  },
]

export const documents: DocumentItem[] = [
  {
    id: 'doc1',
    name: 'Contrato de Locação — Aurora 402.pdf',
    propertyId: 'p1',
    category: 'Contrato',
    size: '1,2 MB',
    date: monthsAgo(10),
  },
  {
    id: 'doc2',
    name: 'Escritura — Casa Vila Verde.pdf',
    propertyId: 'p2',
    category: 'Escritura',
    size: '2,8 MB',
    date: monthsAgo(54),
  },
  {
    id: 'doc3',
    name: 'IPTU 2025 — Skyline 1201.pdf',
    propertyId: 'p3',
    category: 'Imposto',
    size: '640 KB',
    date: d(-40),
  },
  {
    id: 'doc4',
    name: 'Apólice de Seguro — Vila Verde.pdf',
    propertyId: 'p2',
    category: 'Seguro',
    size: '910 KB',
    date: d(-40),
  },
  {
    id: 'doc5',
    name: 'Laudo de Vistoria — Studio Central.pdf',
    propertyId: 'p4',
    category: 'Vistoria',
    size: '3,1 MB',
    date: d(-30),
  },
]

// ---------- Labels ----------

export const expenseCategoryLabels: Record<ExpenseCategory, string> = {
  maintenance: 'Manutenção',
  repairs: 'Reparos',
  renovations: 'Reformas',
  taxes: 'Impostos',
  insurance: 'Seguro',
  utilities: 'Serviços',
  hoa: 'Condomínio',
  'other-expense': 'Outras',
}

export const incomeCategoryLabels: Record<IncomeCategory, string> = {
  rent: 'Aluguel',
  deposit: 'Caução',
  'other-income': 'Outras receitas',
}

export const relationshipLabels: Record<RelationshipType, string> = {
  direct: 'Direto com proprietário',
  agency: 'Imobiliária',
  commissioned: 'Locação comissionada',
}

export const paymentMethodLabels: Record<TenantPaymentMethod, string> = {
  pix: 'PIX',
  transfer: 'Transferência',
  cash: 'Dinheiro',
  credit: 'Cartão de crédito',
  debit: 'Cartão de débito',
}

export const purchaseMethodLabels: Record<PurchaseMethod, string> = {
  cash: 'À vista',
  financing: 'Financiamento',
  mortgage: 'Hipoteca',
  installments: 'Parcelado',
}

export const paymentStatusLabels: Record<PaymentStatus, string> = {
  paid: 'Pago',
  'due-soon': 'A vencer',
  overdue: 'Em atraso',
  pending: 'Pendente',
}

export const maintenancePriorityLabels: Record<MaintenancePriority, string> = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
  urgent: 'Urgente',
}

export const maintenanceStatusLabels: Record<MaintenanceStatus, string> = {
  pending: 'Pendente',
  'in-progress': 'Em andamento',
  completed: 'Concluída',
}

// ---------- Monthly series (last 8 months) ----------

export interface MonthlySeries {
  month: string
  revenue: number
  expenses: number
  occupancy: number
  value: number
}

const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

export const monthlySeries: MonthlySeries[] = Array.from({ length: 8 }).map((_, i) => {
  const date = new Date()
  date.setMonth(date.getMonth() - (7 - i))
  const base = 12500 + i * 480
  return {
    month: monthNames[date.getMonth()],
    revenue: Math.round(base + Math.sin(i) * 900),
    expenses: Math.round(2600 + Math.cos(i) * 700 + i * 90),
    occupancy: Math.min(100, 68 + i * 4 + (i % 2 === 0 ? 3 : -2)),
    value: Math.round(2850000 + i * 42000),
  }
})
