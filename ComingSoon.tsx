import { useLocation } from 'react-router-dom'
import { NAV } from './nav'
import EmptyState from './EmptyState'
export default function ComingSoon() {
  const item = NAV.find(n => n.to === useLocation().pathname)
  return <div className="rounded-lg border border-slate-200 bg-white"><EmptyState title={`${item?.label ?? 'This module'} is not built yet`} hint={`Planned for Phase ${item?.phase ?? '?'}.`} /></div>
}
