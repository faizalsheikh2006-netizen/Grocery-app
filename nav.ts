import { LayoutDashboard, Package, ReceiptText, BookUser, Truck, BarChart3, Settings, Library, type LucideIcon } from 'lucide-react'
export interface NavItem { to: string; label: string; icon: LucideIcon; phase: number }
export const NAV: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, phase: 1 },
  { to: '/inventory', label: 'Inventory', icon: Package, phase: 2 },
  { to: '/catalog', label: 'Saman Catalog', icon: Library, phase: 2 },
  { to: '/billing', label: 'Billing', icon: ReceiptText, phase: 3 },
  { to: '/udhar', label: 'Udhar', icon: BookUser, phase: 4 },
  { to: '/purchases', label: 'Purchases & Expenses', icon: Truck, phase: 5 },
  { to: '/reports', label: 'Reports', icon: BarChart3, phase: 6 },
  { to: '/settings', label: 'Settings', icon: Settings, phase: 6 },
]
