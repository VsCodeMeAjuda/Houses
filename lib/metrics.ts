import type { Property, Tenant, Payment, Expense } from './data'

export interface MetricsInput {
  properties: Property[]
  tenants: Tenant[]
  payments: Payment[]
  expenses: Expense[]
}

/**
 * Builds a set of derived financial metrics bound to the provided data.
 * Function signatures match the original call sites so screens can keep
 * calling e.g. `monthlyRentalIncome()`.
 */
export function buildMetrics({ properties, tenants, payments, expenses }: MetricsInput) {
  function monthlyRentalIncome(): number {
    return properties
      .filter((p) => p.status === 'occupied')
      .reduce((sum, p) => sum + p.monthlyRent, 0)
  }

  function expectedFutureRevenue(): number {
    return tenants.reduce((sum, t) => {
      const end = new Date(t.contractEnd).getTime()
      const now = Date.now()
      const months = Math.max(0, Math.round((end - now) / (1000 * 60 * 60 * 24 * 30)))
      return sum + t.monthlyRent * months
    }, 0)
  }

  function outstandingRent(): number {
    return payments
      .filter((p) => p.status === 'overdue' || p.status === 'due-soon')
      .reduce((sum, p) => sum + p.amount, 0)
  }

  function securityDepositsHeld(): number {
    return tenants.reduce((sum, t) => sum + t.securityDeposit, 0)
  }

  function occupancyRate(): number {
    const occupied = properties.filter((p) => p.status === 'occupied').length
    return properties.length ? (occupied / properties.length) * 100 : 0
  }

  function totalPropertyValue(): number {
    return properties.reduce((sum, p) => sum + p.marketValue, 0)
  }

  function totalInvested(): number {
    return properties.reduce((sum, p) => sum + p.totalInvestment, 0)
  }

  function totalMonthlyExpenses(): number {
    const total = expenses.reduce((sum, e) => sum + e.amount, 0)
    return Math.round(total / 2)
  }

  function monthlyCashFlow(): number {
    return monthlyRentalIncome() - totalMonthlyExpenses()
  }

  function annualROI(): number {
    const annualProfit = monthlyCashFlow() * 12
    const invested = totalInvested()
    return invested ? (annualProfit / invested) * 100 : 0
  }

  function paybackYears(): number {
    const annualProfit = monthlyCashFlow() * 12
    return annualProfit > 0 ? totalInvested() / annualProfit : 0
  }

  function totalExpenses(): number {
    return expenses.reduce((sum, e) => sum + e.amount, 0)
  }

  function netIncome(): number {
    const income = payments
      .filter((p) => p.status === 'paid')
      .reduce((sum, p) => sum + p.amount, 0)
    return income - totalExpenses()
  }

  function expensesByCategory() {
    const map = new Map<string, number>()
    expenses.forEach((e) => {
      map.set(e.category, (map.get(e.category) ?? 0) + e.amount)
    })
    return map
  }

  return {
    monthlyRentalIncome,
    expectedFutureRevenue,
    outstandingRent,
    securityDepositsHeld,
    occupancyRate,
    totalPropertyValue,
    totalInvested,
    totalMonthlyExpenses,
    monthlyCashFlow,
    annualROI,
    paybackYears,
    totalExpenses,
    netIncome,
    expensesByCategory,
  }
}

export type Metrics = ReturnType<typeof buildMetrics>

// Per-property helpers (independent of the global store)
export function propertyROI(p: Property): number {
  const annualProfit = p.monthlyRent * 12
  return p.totalInvestment ? (annualProfit / p.totalInvestment) * 100 : 0
}

export function appreciation(p: Property): number {
  return p.purchasePrice ? ((p.marketValue - p.purchasePrice) / p.purchasePrice) * 100 : 0
}
