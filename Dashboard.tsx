import { useLive } from './useLive'
import { IndianRupee, Truck, TrendingUp, BookUser, Users, Package, AlertTriangle } from 'lucide-react'
import { getDashboardStats } from './dashboardRepo'
import { getMode } from './database'
import { seedDemoData } from './demo'
import { formatINR } from './money'
import { dateTime } from './dates'
import StatCard from './StatCard'
import EmptyState from './EmptyState'
import SalesChart from './SalesChart'

const Panel = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="rounded-lg border border-slate-200 bg-white"><h2 className="border-b border-slate-100 px-4 py-3 text-sm font-semibold">{title}</h2><div className="p-4">{children}</div></section>)

export default function Dashboard() {
  const { data: s, error } = useLive(getDashboardStats)
  if (error) return <p className="text-sm text-red-600" role="alert">Data load nahi hua: {error}</p>
  if (!s) return <p className="text-sm text-slate-500">Loading…</p>
  return (<div className="space-y-4">
    {getMode() === 'demo' && s.products === 0 && <button className="rounded-md bg-navy-900 px-4 py-2 text-sm text-white" onClick={() => void seedDemoData()}>Load demo data</button>}
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <StatCard label="Today's sales" value={formatINR(s.todaySales)} icon={IndianRupee} tone="positive" />
      <StatCard label="Total purchases" value={formatINR(s.totalPurchases)} icon={Truck} />
      <StatCard label="Total profit" value={formatINR(s.totalProfit)} icon={TrendingUp} tone="positive" />
      <StatCard label="Outstanding udhar" value={formatINR(s.outstandingUdhar)} icon={BookUser} tone={s.outstandingUdhar > 0 ? 'warning' : 'neutral'} />
      <StatCard label="Customers" value={String(s.customers)} icon={Users} />
      <StatCard label="Products" value={String(s.products)} icon={Package} />
      <StatCard label="Low stock" value={String(s.lowStock.length)} icon={AlertTriangle} tone={s.lowStock.length ? 'warning' : 'neutral'} />
    </div>
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="lg:col-span-2"><Panel title="Sales, last 7 days"><SalesChart data={s.daily} /></Panel></div>
      <Panel title="Low-stock products">{s.lowStock.length === 0 ? <EmptyState title="Stock levels are fine" hint="Products at or below minimum stock show here." /> :
        <ul className="divide-y divide-slate-100 text-sm">{s.lowStock.map(p => <li key={p.id} className="flex justify-between py-2"><span className="truncate">{p.name}</span><span className="font-medium text-amber-600">{p.stock} left</span></li>)}</ul>}</Panel>
    </div>
    <Panel title="Recent transactions">{s.recent.length === 0 ? <EmptyState title="No transactions yet" hint="Bills you create in Billing will appear here." /> :
      <div className="overflow-x-auto"><table className="w-full text-sm"><thead className="text-left text-slate-500"><tr><th className="pb-2 font-medium">Invoice</th><th className="pb-2 font-medium">Time</th><th className="pb-2 font-medium">Status</th><th className="pb-2 text-right font-medium">Amount</th></tr></thead>
        <tbody className="divide-y divide-slate-100">{s.recent.map(t => <tr key={t.id}><td className="py-2">{t.invoiceNo}</td><td>{dateTime(t.at)}</td><td className="capitalize">{t.status}</td><td className="text-right font-medium text-money">{formatINR(t.totalPaise)}</td></tr>)}</tbody></table></div>}</Panel>
  </div>)
}
