import { formatINR } from './money'
import { dayLabel } from './dates'
import EmptyState from './EmptyState'
export default function SalesChart({ data }: { data: { label: number; total: number }[] }) {
  const max = Math.max(...data.map(d => d.total), 0)
  if (max === 0) return <EmptyState title="No sales in the last 7 days" hint="Completed bills will appear here." />
  return (<div className="flex h-44 items-end gap-2 px-1" role="img" aria-label="Sales for the last 7 days">
    {data.map(d => (<div key={d.label} className="flex flex-1 flex-col items-center gap-1">
      <div className="flex h-36 w-full items-end"><div className="w-full rounded-t bg-money" style={{ height: `${Math.max((d.total / max) * 100, 2)}%` }} title={formatINR(d.total)} /></div>
      <span className="text-xs text-slate-500">{dayLabel(d.label)}</span></div>))}</div>)
}
