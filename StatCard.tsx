import type { LucideIcon } from 'lucide-react'
interface Props { label: string; value: string; icon: LucideIcon; tone?: 'positive' | 'warning' | 'neutral' }
export default function StatCard({ label, value, icon: Icon, tone = 'neutral' }: Props) {
  const color = tone === 'positive' ? 'text-money' : tone === 'warning' ? 'text-amber-600' : 'text-slate-900'
  return (<div className="rounded-lg border border-slate-200 bg-white p-4">
    <div className="flex items-center justify-between text-sm text-slate-500"><span>{label}</span><Icon size={16} aria-hidden /></div>
    <div className={`mt-2 truncate text-xl font-semibold ${color}`}>{value}</div></div>)
}
