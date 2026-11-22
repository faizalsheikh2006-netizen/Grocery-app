import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { Menu, X, WifiOff } from 'lucide-react'
import { NAV } from './nav'
import { getMode, setMode } from './database'
import { useOnline } from './useOnline'

export default function AppLayout() {
  const [open, setOpen] = useState(false)
  const online = useOnline(), demo = getMode() === 'demo'
  const link = ({ isActive }: { isActive: boolean }) => `flex items-center gap-3 rounded-md px-3 py-2.5 text-sm ${isActive ? 'bg-navy-700 text-white' : 'text-slate-300 hover:bg-navy-800'}`
  return (<div className="min-h-screen lg:flex">
    {open && <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setOpen(false)} />}
    <aside className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-navy-900 p-3 transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${open ? '' : '-translate-x-full'}`}>
      <div className="flex items-center justify-between px-3 py-4"><span className="text-lg font-semibold text-white">Grocery<span className="text-green-400">OS</span></span>
        <button className="text-slate-300 lg:hidden" onClick={() => setOpen(false)} aria-label="Close menu"><X size={20} /></button></div>
      <nav className="flex-1 space-y-1" aria-label="Main">{NAV.map(n => (<NavLink key={n.to} to={n.to} end={n.to === '/'} className={link} onClick={() => setOpen(false)}><n.icon size={18} aria-hidden />{n.label}</NavLink>))}</nav>
      <button onClick={() => setMode(demo ? 'live' : 'demo')} className="mt-2 rounded-md border border-navy-700 px-3 py-2 text-left text-xs text-slate-300 hover:bg-navy-800">{demo ? 'Switch to live data' : 'Open demo mode'}</button>
    </aside>
    <div className="min-w-0 flex-1">
      <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3">
        <button className="lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu"><Menu size={22} /></button>
        <h1 className="text-base font-semibold text-slate-900">Your store</h1>
        <div className="ml-auto flex items-center gap-2 text-xs">
          {demo && <span className="rounded bg-amber-100 px-2 py-1 font-medium text-amber-800">Demo data</span>}
          {!online && <span className="flex items-center gap-1 rounded bg-slate-100 px-2 py-1 text-slate-700"><WifiOff size={12} />Offline: billing still works</span>}
        </div></header>
      <main className="mx-auto max-w-6xl p-4 lg:p-6"><Outlet /></main>
    </div></div>)
}
