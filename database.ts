import Dexie, { type Table } from 'dexie'
import type * as S from './schema'
export type DataMode = 'live' | 'demo'
const MODE_KEY = 'groceryos.mode'
export const getMode = (): DataMode => (localStorage.getItem(MODE_KEY) === 'demo' ? 'demo' : 'live')
/** Demo data lives in a physically separate database so it can never mix with real records. */
export function setMode(m: DataMode) { localStorage.setItem(MODE_KEY, m); location.reload() }

class GroceryDB extends Dexie {
  products!: Table<S.Product, number>; customers!: Table<S.Customer, number>; ledger!: Table<S.LedgerEntry, number>
  sales!: Table<S.Sale, number>; suppliers!: Table<S.Supplier, number>; purchases!: Table<S.Purchase, number>
  expenses!: Table<S.Expense, number>; adjustments!: Table<S.StockAdjustment, number>; cashbook!: Table<S.CashbookEntry, number>
  staff!: Table<S.Staff, number>; audit!: Table<S.AuditLog, number>; settings!: Table<S.Setting, string>
  constructor(name: string) {
    super(name)
    this.version(1).stores({
      products: '++id, &uid, name, category, barcode, sku, fastSelling, onHomepage, stock, expiryDate, dirty',
      customers: '++id, &uid, name, phone, dirty',
      ledger: '++id, &uid, customerId, kind, at, [customerId+at]',
      sales: '++id, &uid, &invoiceNo, customerId, status, at, dirty',
      suppliers: '++id, &uid, name', purchases: '++id, &uid, supplierId, at',
      expenses: '++id, &uid, category, at', adjustments: '++id, &uid, productId, at',
      cashbook: '++id, &uid, at', staff: '++id, &uid, role', audit: '++id, at, entity, action', settings: 'key',
    })
  }
}
export const db = new GroceryDB(getMode() === 'demo' ? 'groceryos-demo' : 'groceryos')
db.on('versionchange', () => { db.close(); location.reload(); return false })
export const uid = () => crypto.randomUUID()
/** Ask the browser not to evict our data. */
export const requestPersistence = async () => (navigator.storage?.persist ? navigator.storage.persist() : false)
