import { db, uid } from './database'
import { computeBill, type Line } from './billMath'
import type { Payment, Sale } from './schema'
interface Input { lines: Line[]; discountPaise: number; mode: Payment['mode']; customerName?: string; customerPhone?: string }
/** One atomic transaction: invoice number, sale record, stock deduction and audit entry all succeed or none do. */
export async function createSale(i: Input): Promise<Sale> {
  if (!i.lines.length) throw new Error('Cart khali hai')
  for (const l of i.lines) if (!Number.isFinite(l.qty) || l.qty <= 0) throw new Error(`${l.name}: quantity 0 se zyada honi chahiye`)
  const bill = computeBill(i.lines, i.discountPaise)
  return db.transaction('rw', db.sales, db.products, db.settings, db.audit, async () => {
    const seq = (((await db.settings.get('invoiceSeq'))?.value as number | undefined) ?? 0) + 1
    await db.settings.put({ key: 'invoiceSeq', value: seq })
    const now = Date.now(), d = new Date(now)
    const invoiceNo = `INV-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}-${String(seq).padStart(4, '0')}`
    const sale: Sale = { ...bill, uid: uid(), invoiceNo, payments: [{ mode: i.mode, amountPaise: bill.totalPaise }], customerName: i.customerName?.trim() || undefined,
      customerPhone: i.customerPhone?.trim() || undefined, status: 'completed', at: now, createdAt: now, updatedAt: now, dirty: 1 }
    sale.id = await db.sales.add(sale)
    for (const l of i.lines) {
      const p = await db.products.get(l.productId); if (!p) throw new Error(`${l.name} ab inventory me nahi hai`)
      await db.products.update(p.id!, { stock: Math.round((p.stock - l.qty) * 1000) / 1000, updatedAt: now, dirty: 1 })
    }
    await db.audit.add({ at: now, action: 'create', entity: 'sale', entityId: sale.id, detail: invoiceNo })
    return sale
  })
}
