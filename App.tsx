import { useEffect, useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import AppLayout from './AppLayout'
import Dashboard from './Dashboard'
import ComingSoon from './ComingSoon'
import Inventory from './Inventory'
import Billing from './Billing'
import Catalog from './Catalog'
import { NAV } from './nav'
import { db, requestPersistence } from './database'
const BUILT = ['/', '/inventory', '/billing', '/catalog']
export default function App() {
  const [err, setErr] = useState('')
  useEffect(() => {
    void requestPersistence()
    const a = (e: PromiseRejectionEvent) => setErr(String((e.reason as Error)?.message ?? e.reason)), b = (e: ErrorEvent) => setErr(e.message)
    window.addEventListener('unhandledrejection', a); window.addEventListener('error', b)
    const t = setTimeout(() => setErr('Database 8 second me nahi khula. App ke saare tab band karke dobara kholo.'), 8000)
    db.open().then(() => clearTimeout(t)).catch(e => { clearTimeout(t); setErr('Database error: ' + ((e as Error)?.message ?? e)) })
    return () => { clearTimeout(t); window.removeEventListener('unhandledrejection', a); window.removeEventListener('error', b) }
  }, [])
  return (<>
    {err && <div role="alert" className="fixed inset-x-0 top-0 z-[60] bg-red-600 p-3 text-sm text-white">{err} <button className="ml-2 underline" onClick={() => setErr('')}>Hatao</button></div>}
    <Routes><Route element={<AppLayout />}><Route index element={<Dashboard />} />
      <Route path="/inventory" element={<Inventory />} /><Route path="/billing" element={<Billing />} /><Route path="/catalog" element={<Catalog />} />
      {NAV.filter(n => !BUILT.includes(n.to)).map(n => <Route key={n.to} path={n.to} element={<ComingSoon />} />)}</Route></Routes></>)
}
