import { db, getMode, uid } from './database'
import { rupeesToPaise as rp } from './money'
/** Only callable in demo mode (separate database). */
export async function seedDemoData() {
  if (getMode() !== 'demo') throw new Error('Demo data can only be loaded in demo mode')
  if ((await db.products.count()) > 0) return
  const now = Date.now(), m = { createdAt: now, updatedAt: now }
  const items = [['Basmati Rice 5kg','Staples',420,520,3,10],['Toor Dal 1kg','Staples',130,160,24,10],['Amul Butter 500g','Dairy',255,285,6,8],['Tata Salt 1kg','Staples',22,28,60,20],['Parle-G','Snacks',8,10,4,30]] as const
  const ids = await db.products.bulkAdd(items.map(([name,category,c,p,stock,minStock]) => ({ ...m, uid: uid(), name, category, costPaise: rp(c), pricePaise: rp(p), gstRate: 5, stock, minStock, fastSelling: false, onHomepage: true })), { allKeys: true })
  await db.customers.add({ ...m, uid: uid(), name: 'Demo Customer', balancePaise: rp(350) })
  for (let d = 0; d < 7; d++) {
    const at = now - d * 86_400_000, total = rp(900 + d * 230)
    await db.sales.add({ ...m, uid: uid(), invoiceNo: `DEMO-${d + 1}`, items: [{ productId: ids[0], name: items[0][0], qty: 1, unitPricePaise: total, costPaise: Math.round(total * .8), discountPaise: 0, gstRate: 5 }], subtotalPaise: total, discountPaise: 0, gstPaise: 0, totalPaise: total, profitPaise: Math.round(total * .2), payments: [{ mode: 'cash', amountPaise: total }], status: 'completed', at })
  }
}
