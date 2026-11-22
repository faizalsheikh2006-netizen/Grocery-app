import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Search, Plus, Minus, X, ShoppingCart, Download, MessageCircle } from 'lucide-react'
import { listProducts } from './productRepo'
import type { Product, Sale, Payment } from './schema'
import { computeBill, type Line } from './billMath'
import { createSale } from './saleRepo'
import { buildInvoicePdf, downloadBlob, shareInvoice } from './invoicePdf'
import { formatINR, rupeesToPaise } from './money'
import ProductThumb from './ProductThumb'
import EmptyState from './EmptyState'

type Cart = Record<number, { p: Product; qty: string }>
const MODES: Payment['mode'][] = ['cash', 'upi', 'card', 'other']
const inp = 'w-full rounded-md border border-slate-300 px-3 py-2 text-sm'

export default function Billing() {
  const products = useLiveQuery(listProducts, [])
  const [q, setQ] = useState(''); const [cart, setCart] = useState<Cart>({}); const [open, setOpen] = useState(false)
  const [discount, setDiscount] = useState(''); const [mode, setMode] = useState<Payment['mode']>('cash')
  const [cName, setCName] = useState(''); const [cPhone, setCPhone] = useState('')
  const [shop, setShop] = useState(localStorage.getItem('groceryos.shopName') ?? '')
  const [error, setError] = useState(''); const [busy, setBusy] = useState(false); const [done, setDone] = useState<Sale | null>(null)

  const add = (p: Product) => setCart(c => ({ ...c, [p.id!]: { p, qty: String(Number(c[p.id!]?.qty ?? 0) + 1) } }))
  const dec = (id: number) => setCart(c => { const n = Number(c[id].qty) - 1; const { [id]: cur, ...rest } = c; return n > 0 ? { ...c, [id]: { ...cur, qty: String(n) } } : rest })
  const remove = (id: number) => setCart(c => { const { [id]: _x, ...rest } = c; void _x; return rest })
  const lines: Line[] = Object.values(cart).map(({ p, qty }) => ({ productId: p.id!, name: p.name, qty: Number(qty), unitPricePaise: p.pricePaise, costPaise: p.costPaise, gstRate: p.gstRate }))
  const count = lines.length

  let bill: ReturnType<typeof computeBill> | null = null, calcError = ''
  if (count) try {
    const d = discount === '' ? 0 : Number(discount); if (!Number.isFinite(d) || d < 0) throw new Error('Discount galat hai')
    for (const l of lines) if (!(l.qty > 0)) throw new Error(`${l.name}: quantity 0 se zyada honi chahiye`)
    bill = computeBill(lines, rupeesToPaise(d))
  } catch (e) { calcError = (e as Error).message }

  const t = q.trim().toLowerCase()
  const list = (products ?? []).filter(p => !t || [p.name, p.barcode, p.sku].some(v => v?.toLowerCase().includes(t)))
    .sort((a, b) => Number(b.onHomepage) - Number(a.onHomepage) || Number(b.fastSelling) - Number(a.fastSelling) || a.name.localeCompare(b.name))

  async function save() {
    if (!bill) return; setBusy(true); setError('')
    try { const s = await createSale({ lines, discountPaise: bill.discountPaise, mode, customerName: cName, customerPhone: cPhone }); setDone(s); setCart({}); setDiscount('') }
    catch (e) { setError((e as Error).message) } finally { setBusy(false) }
  }
  const act = (fn: () => Promise<unknown>) => async () => { try { await fn() } catch (e) { if ((e as Error).name !== 'AbortError') setError((e as Error).message) } }
  function closeAll() { setOpen(false); setDone(null); setCName(''); setCPhone(''); setError('') }

  return (<div className="space-y-3 pb-24">
    <div className="relative"><Search size={16} className="absolute left-3 top-3 text-slate-400" aria-hidden />
      <input value={q} onChange={e => setQ(e.target.value)} placeholder="Saman ka naam ya barcode" className="w-full rounded-md border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm"
        onKeyDown={e => { if (e.key === 'Enter') { const m = (products ?? []).find(p => p.barcode && p.barcode === q.trim()); if (m) { add(m); setQ('') } } }} /></div>
    <div className="rounded-lg border border-slate-200 bg-white">
      {!products ? <p className="p-4 text-sm text-slate-500">Loading…</p> : products.length === 0 ? <EmptyState title="Abhi koi saman nahi hai" hint="Pehle Inventory me saman add karo ya CSV import karo." />
        : list.length === 0 ? <EmptyState title="Kuch nahi mila" hint="Dusra naam ya barcode try karo." /> :
        <ul className="divide-y divide-slate-100">{list.map(p => { const n = cart[p.id!]?.qty
          return (<li key={p.id}><button onClick={() => add(p)} className="flex w-full items-center gap-3 p-3 text-left hover:bg-slate-50">
            <ProductThumb blob={p.imageBlob} name={p.name} />
            <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{p.name}</p><p className="text-xs text-slate-500">{p.stock} stock</p></div>
            <span className="text-sm font-semibold text-money">{formatINR(p.pricePaise)}</span>
            {n ? <span className="rounded-full bg-navy-900 px-2 py-0.5 text-xs text-white">{n}</span> : <Plus size={18} className="text-slate-400" />}</button></li>) })}</ul>}
    </div>
    {count > 0 && !open && <button onClick={() => setOpen(true)} className="fixed inset-x-3 bottom-3 z-30 flex items-center justify-between rounded-lg bg-navy-900 px-4 py-3 text-white shadow-lg lg:left-72">
      <span className="flex items-center gap-2 text-sm"><ShoppingCart size={18} />{count} saman</span><span className="font-semibold">{bill ? formatINR(bill.totalPaise) : '—'} · Checkout</span></button>}

    {(open || done) && <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center"><div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-xl bg-white p-4 sm:rounded-xl">
      {done ? (<div className="space-y-3 text-center"><h2 className="text-lg font-semibold text-money">Bill ban gaya</h2>
        <p className="text-sm text-slate-600">{done.invoiceNo} · <b>{formatINR(done.totalPaise)}</b></p>
        {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
        <button onClick={act(async () => downloadBlob(await buildInvoicePdf(done, shop), `${done.invoiceNo}.pdf`))} className="flex w-full items-center justify-center gap-2 rounded-md border border-slate-300 py-2.5 text-sm"><Download size={16} />PDF download</button>
        <button onClick={act(() => shareInvoice(done, shop))} className="flex w-full items-center justify-center gap-2 rounded-md bg-money py-2.5 text-sm font-medium text-white"><MessageCircle size={16} />WhatsApp par bhejo</button>
        <button onClick={closeAll} className="w-full py-2 text-sm text-slate-600">Naya bill</button></div>) : (<>
        <div className="mb-3 flex items-center justify-between"><h2 className="font-semibold">Checkout</h2><button onClick={() => setOpen(false)} aria-label="Close"><X size={20} /></button></div>
        <ul className="divide-y divide-slate-100">{Object.entries(cart).map(([id, { p, qty }]) => (<li key={id} className="py-2">
          <div className="flex items-center gap-2"><p className="min-w-0 flex-1 truncate text-sm">{p.name}<span className="block text-xs text-slate-500">{formatINR(p.pricePaise)}</span></p>
            <button className="rounded border p-1" onClick={() => dec(Number(id))} aria-label="Kam karo"><Minus size={14} /></button>
            <input className="w-16 rounded border px-1 py-1 text-center text-sm" inputMode="decimal" value={qty} onChange={e => setCart(c => ({ ...c, [Number(id)]: { p, qty: e.target.value } }))} aria-label={`${p.name} quantity`} />
            <button className="rounded border p-1" onClick={() => add(p)} aria-label="Badhao"><Plus size={14} /></button>
            <button onClick={() => remove(Number(id))} aria-label="Hatao"><X size={16} className="text-red-500" /></button></div>
          {Number(qty) > p.stock && <p className="text-xs text-amber-600">Stock me sirf {p.stock} hai</p>}</li>))}</ul>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <input className={inp} placeholder="Customer ka naam" value={cName} onChange={e => setCName(e.target.value)} />
          <input className={inp} placeholder="WhatsApp number" inputMode="tel" value={cPhone} onChange={e => setCPhone(e.target.value)} />
          <input className={inp} placeholder="Discount (₹)" inputMode="decimal" value={discount} onChange={e => setDiscount(e.target.value)} />
          <input className={inp} placeholder="Dukaan ka naam (PDF ke liye)" value={shop} onChange={e => { setShop(e.target.value); localStorage.setItem('groceryos.shopName', e.target.value) }} /></div>
        <div className="mt-3 flex gap-2">{MODES.map(m => <button key={m} onClick={() => setMode(m)} className={`flex-1 rounded-md border py-2 text-sm capitalize ${mode === m ? 'border-navy-900 bg-navy-900 text-white' : 'border-slate-300'}`}>{m}</button>)}</div>
        {bill && <div className="mt-3 space-y-1 text-sm"><div className="flex justify-between text-slate-600"><span>Subtotal</span><span>{formatINR(bill.subtotalPaise)}</span></div>
          {bill.discountPaise > 0 && <div className="flex justify-between text-slate-600"><span>Discount</span><span>- {formatINR(bill.discountPaise)}</span></div>}
          <div className="flex justify-between text-slate-600"><span>GST (included)</span><span>{formatINR(bill.gstPaise)}</span></div>
          <div className="flex justify-between text-lg font-semibold text-money"><span>Total</span><span>{formatINR(bill.totalPaise)}</span></div></div>}
        {(calcError || error) && <p className="mt-2 text-sm text-red-600" role="alert">{calcError || error}</p>}
        <button disabled={!bill || busy} onClick={save} className="mt-3 w-full rounded-md bg-money py-3 text-sm font-medium text-white disabled:opacity-50">{busy ? 'Save ho raha hai…' : 'Bill banao'}</button></>)}
    </div></div>}
  </div>)
}
