import {
  properties,
  tenants,
  payments,
  expenses,
  type Property,
} from './data'

export function monthlyRentalIncome(): number {
  return properties
    .filter((p) => p.status === 'occupied')
    .reduce((sum, p) => sum + p.monthlyRent, 0)
}

export function expectedFutureRevenue(): number {
  // remaining rent until contract end for active tenants
  return tenants.reduce((sum, t) => {
    const end = new Date(t.contractEnd).getTime()
    const now = Date.now()
    const months = Math.max(0, Math.round((end - now) / (1000 * 60 * 60 * 24 * 30)))
    return sum + t.monthlyRent * months
  }, 0)
}

export function outstandingRent(): number {
  return payments
    .filter((p) => p.status === 'overdue' || p.status === 'due-soon')
    .reduce((sum, p) => sum + p.amount, 0)
}

export function securityDepositsHeld(): number {
  return tenants.reduce((sum, t) => sum + t.securityDeposit, 0)
}

export function occupancyRate(): number {
  const occupied = properties.filter((p) => p.status === 'occupied').length
  return properties.length ? (occupied / properties.length) * 100 : 0
}

export function totalPropertyValue(): number {
  return properties.reduce((sum, p) => sum + p.marketValue, 0)
}

export function totalInvested(): number {
  return properties.reduce((sum, p) => sum + p.totalInvestment, 0)
}

export function totalMonthlyExpenses(): number {
  // average of last recorded expenses normalized to a month
  const total = expenses.reduce((sum, e) => sum + e.amount, 0)
  return Math.round(total / 2)
}

export function monthlyCashFlow(): number {
  return monthlyRentalIncome() - totalMonthlyExpenses()
}

export function annualROI(): number {
  const annualProfit = monthlyCashFlow() * 12
  const invested = totalInvested()
  return invested ? (annualProfit / invested) * 100 : 0
}

export function paybackYears(): number {
  const annualProfit = monthlyCashFlow() * 12
  return annualProfit > 0 ? totalInvested() / annualProfit : 0
}

export function totalExpenses(): number {
  return expenses.reduce((sum, e) => sum + e.amount, 0)
}

export function netIncome(): number {
  const income = payments
    .filter((p) => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0)
  return income - totalExpenses()
}

export function propertyROI(p: Property): number {
  const annualProfit = p.monthlyRent * 12
  return p.totalInvestment ? (annualProfit / p.totalInvestment) * 100 : 0
}

export function appreciation(p: Property): number {
  return p.purchasePrice ? ((p.marketValue - p.purchasePrice) / p.purchasePrice) * 100 : 0
}

export function expensesByCategory() {
  const map = new Map<string, number>()
  expenses.forEach((e) => {
    map.set(e.category, (map.get(e.category) ?? 0) + e.amount)
  })
  return map
}
