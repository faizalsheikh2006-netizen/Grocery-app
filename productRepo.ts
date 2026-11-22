import { db, uid } from './database'
import type { Product } from './schema'
import { rupeesToPaise } from './money'
import { csvCell, parseCSV } from './csv'

export type ProductInput = Omit<Product, 'id' | 'uid' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'dirty'>
export const listProducts = () => db.products.filter(p => !p.deletedAt).toArray()

export function validate(p: ProductInput): string | null {
  if (!p.name.trim()) return 'Product name is required'
  if (!p.category.trim()) return 'Category is required'
  for (const [label, v] of [['Purchase price', p.costPaise], ['Selling price', p.pricePaise]] as const)
    if (!Number.isSafeInteger(v) || v < 0) return `${label} must be a valid amount`
  for (const [label, v] of [['Stock', p.stock], ['Minimum stock', p.minStock]] as const)
    if (!Number.isFinite(v) || v < 0) return `${label} must be 0 or more`
  if (![0, 5, 12, 18, 28].includes(p.gstRate)) return 'GST rate must be 0, 5, 12, 18 or 28'
  if (p.expiryDate !== undefined && !Number.isFinite(p.expiryDate)) return 'Expiry date is invalid'
  return null
}
async function assertUnique(p: ProductInput, selfId?: number) {
  for (const f of ['barcode', 'sku'] as const) {
    const v = p[f]?.trim(); if (!v) continue
    const dup = await db.products.where(f).equals(v).filter(x => !x.deletedAt && x.id !== selfId).first()
    if (dup) throw new Error(`${f === 'sku' ? 'SKU' : 'Barcode'} "${v}" is already used by ${dup.name}`)
  }
}
const log = (action: string, id: number, detail: string) => db.audit.add({ at: Date.now(), action, entity: 'product', entityId: id, detail })

export async function saveProduct(input: ProductInput, id?: number): Promise<void> {
  const err = validate(input); if (err) throw new Error(err)
  const clean = { ...input, name: input.name.trim(), category: input.category.trim(), barcode: input.barcode?.trim() || undefined, sku: input.sku?.trim() || undefined }
  await db.transaction('rw', db.products, db.audit, async () => {
    await assertUnique(clean, id); const now = Date.now()
    if (id) { await db.products.update(id, { ...clean, updatedAt: now, dirty: 1 }); await log('update', id, clean.name) }
    else { const nid = await db.products.add({ ...clean, uid: uid(), createdAt: now, updatedAt: now, dirty: 1 }); await log('create', nid, clean.name) }
  })
}
/** Soft delete only: sales history keeps referencing the product. */
export async function deleteProduct(p: Product) {
  await db.transaction('rw', db.products, db.audit, async () => { await db.products.update(p.id!, { deletedAt: Date.now(), updatedAt: Date.now(), dirty: 1 }); await log('delete', p.id!, p.name) })
}
export const toggleFlag = (p: Product, f: 'fastSelling' | 'onHomepage') => db.products.update(p.id!, { [f]: !p[f], updatedAt: Date.now(), dirty: 1 })

const COLS = ['name', 'category', 'barcode', 'sku', 'purchase_price', 'selling_price', 'gst_percent', 'stock', 'min_stock', 'expiry_date', 'fast_selling', 'on_homepage']
const iso = (t?: number) => (t ? new Date(t).toISOString().slice(0, 10) : '')
export function exportCSV(ps: Product[]): string {
  const rows = ps.map(p => [csvCell(p.name, true), csvCell(p.category, true), csvCell(p.barcode ?? '', true), csvCell(p.sku ?? '', true), p.costPaise / 100, p.pricePaise / 100, p.gstRate, p.stock, p.minStock, iso(p.expiryDate), p.fastSelling ? 'yes' : 'no', p.onHomepage ? 'yes' : 'no'].join(','))
  return [COLS.join(','), ...rows].join('\n')
}
export async function importCSV(text: string): Promise<{ added: number; errors: string[] }> {
  const [head, ...rows] = parseCSV(text); const errors: string[] = []; let added = 0
  if (!head) return { added, errors: ['File is empty'] }
  const idx = (c: string) => head.map(h => h.trim().toLowerCase()).indexOf(c)
  if (idx('name') < 0 || idx('selling_price') < 0) return { added, errors: ['Header must include at least: name, selling_price'] }
  const get = (r: string[], c: string) => (idx(c) >= 0 ? (r[idx(c)] ?? '').trim() : '')
  for (const [n, r] of rows.entries()) {
    try {
      const num = (c: string, d = 0) => { const s = get(r, c); if (s === '') return d; const v = Number(s); if (!Number.isFinite(v)) throw new Error(`${c} is not a number`); return v }
      const exp = get(r, 'expiry_date'); const expiryDate = exp ? new Date(exp + 'T00:00:00').getTime() : undefined
      await saveProduct({ name: get(r, 'name'), category: get(r, 'category') || 'General', barcode: get(r, 'barcode') || undefined, sku: get(r, 'sku') || undefined,
        costPaise: rupeesToPaise(num('purchase_price')), pricePaise: rupeesToPaise(num('selling_price')), gstRate: num('gst_percent', 0), stock: num('stock'), minStock: num('min_stock'),
        expiryDate, fastSelling: get(r, 'fast_selling').toLowerCase() === 'yes', onHomepage: get(r, 'on_homepage').toLowerCase() === 'yes' })
      added++
    } catch (e) { errors.push(`Row ${n + 2}: ${(e as Error).message}`) }
  }
  return { added, errors }
}
