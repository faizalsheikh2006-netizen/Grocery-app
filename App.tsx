import { useEffect } from 'react'
import { Route, Routes } from 'react-router-dom'
import AppLayout from './AppLayout'
import Dashboard from './Dashboard'
import ComingSoon from './ComingSoon'
import Inventory from './Inventory'
import Billing from './Billing'
import { NAV } from './nav'
import { requestPersistence } from './database'
export default function App() {
  useEffect(() => { void requestPersistence() }, [])
  return (<Routes><Route element={<AppLayout />}><Route index element={<Dashboard />} />
    <Route path="/inventory" element={<Inventory />} />
    <Route path="/billing" element={<Billing />} />
    {NAV.filter(n => n.to !== '/' && n.to !== '/inventory' && n.to !== '/billing').map(n => <Route key={n.to} path={n.to} element={<ComingSoon />} />)}</Route></Routes>)
}
