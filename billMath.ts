import { sumPaise } from './money'
import type { SaleItem } from './schema'
export interface Line { productId: number; name: string; qty: number; unitPricePaise: number; costPaise: number; gstRate: number }
/** Prices are GST-inclusive (MRP style). The discount is spread across lines in proportion; the last line absorbs rounding. */
export function computeBill(lines: Line[], discountPaise: number) {
  const gross = lines.map(l => Math.round(l.unitPricePaise * l.qty))
  const subtotal = sumPaise(gross)
  if (!Number.isSafeInteger(discountPaise) || discountPaise < 0 || discountPaise > subtotal) throw new Error('Discount bill ke amount se zyada nahi ho sakta')
  let left = discountPaise, gst = 0, cost = 0
  const items: SaleItem[] = lines.map((l, i) => {
    const d = Math.min(gross[i], i === lines.length - 1 ? left : Math.round((discountPaise * gross[i]) / (subtotal || 1))); left -= d
    gst += Math.round(((gross[i] - d) * l.gstRate) / (100 + l.gstRate)); cost += Math.round(l.costPaise * l.qty)
    return { productId: l.productId, name: l.name, qty: l.qty, unitPricePaise: l.unitPricePaise, costPaise: l.costPaise, discountPaise: d, gstRate: l.gstRate }
  })
  const total = subtotal - discountPaise
  return { items, subtotalPaise: subtotal, discountPaise, gstPaise: gst, totalPaise: total, profitPaise: total - gst - cost }
}
