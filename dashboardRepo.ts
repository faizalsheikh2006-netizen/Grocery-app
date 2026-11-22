import { db } from './database'
import { sumPaise } from '../lib/money'
import { DAY, startOfDay } from '../lib/dates'
import type { Sale } from './schema'

export interface DashboardStats {
  todaySales: number; totalPurchases: number; totalProfit: number; outstandingUdhar: number
  customers: number; products: number; lowStock: { id?: number; name: string; stock: number; minStock: number }[]
  recent: Sale[]; daily: { label: number; total: number }[]
}
/** Read-only aggregation. Financial rows are never mutated here. */
export async function getDashboardStats(): Promise<DashboardStats> {
  const today = startOfDay(), from = today - 6 * DAY
  const [sales, purchases, customers, products] = await Promise.all([
    db.sales.where('status').equals('completed').toArray(), db.purchases.toArray(),
    db.customers.filter(c => !c.deletedAt).toArray(), db.products.filter(p => !p.deletedAt).toArray()])
  const daily = Array.from({ length: 7 }, (_, i) => ({ label: from + i * DAY, total: 0 }))
  for (const s of sales) { const i = Math.round((startOfDay(new Date(s.at)) - from) / DAY); if (i >= 0 && i < 7) daily[i].total += s.totalPaise }
  const recent = await db.sales.orderBy('at').reverse().limit(8).toArray()
  return {
    todaySales: sumPaise(sales.filter(s => s.at >= today).map(s => s.totalPaise)),
    totalPurchases: sumPaise(purchases.map(p => p.totalPaise)),
    totalProfit: sumPaise(sales.map(s => s.profitPaise)),
    outstandingUdhar: sumPaise(customers.map(c => c.balancePaise)),
    customers: customers.length, products: products.length,
    lowStock: products.filter(p => p.stock <= p.minStock).sort((a, b) => a.stock - b.stock).slice(0, 6),
    recent, daily }
}
