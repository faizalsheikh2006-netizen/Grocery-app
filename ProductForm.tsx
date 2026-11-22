import { useState } from 'react'
import { X } from 'lucide-react'
import type { Product } from './schema'
import { saveProduct } from './productRepo'
import { rupeesToPaise } from './money'
import { resizeImage } from './image'
import ProductThumb from './ProductThumb'

const inp = 'mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm'
const Field = ({ label, children }: { label: string; children: React.ReactNode }) => <label className="block text-sm font-medium text-slate-700">{label}{children}</label>
const dateStr = (t?: number) => (t ? new Date(t).toISOString().slice(0, 10) : '')

export default function ProductForm({ product, categories, onClose }: { product: Product | null; categories: string[]; onClose: () => void }) {
  const p = product
  const [f, setF] = useState({ name: p?.name ?? '', category: p?.category ?? '', barcode: p?.barcode ?? '', sku: p?.sku ?? '',
    cost: p ? String(p.costPaise / 100) : '', price: p ? String(p.pricePaise / 100) : '', gst: String(p?.gstRate ?? 5),
    stock: String(p?.stock ?? 0), minStock: String(p?.minStock ?? 0), expiry: dateStr(p?.expiryDate), fast: p?.fastSelling ?? false, home: p?.onHomepage ?? false })
  const [image, setImage] = useState<Blob | undefined>(p?.imageBlob)
  const [error, setError] = useState(''); const [busy, setBusy] = useState(false)
  const set = (k: keyof typeof f, v: string | boolean) => setF(s => ({ ...s, [k]: v }))
  const money = (s: string, label: string) => { const n = Number(s); if (s.trim() === '' || !Number.isFinite(n) || n < 0) throw new Error(`${label} must be a valid amount`); return rupeesToPaise(n) }

  async function submit(e: React.SyntheticEvent) {
    e.preventDefault(); setError(''); setBusy(true)
    try {
      await saveProduct({ name: f.name, category: f.category, barcode: f.barcode, sku: f.sku, costPaise: money(f.cost, 'Purchase price'), pricePaise: money(f.price, 'Selling price'),
        gstRate: Number(f.gst), stock: Number(f.stock), minStock: Number(f.minStock), expiryDate: f.expiry ? new Date(f.expiry + 'T00:00:00').getTime() : undefined,
        fastSelling: f.fast, onHomepage: f.home, imageBlob: image }, p?.id)
      onClose()
    } catch (err) { setError((err as Error).message); setBusy(false) }
  }
  const warn = Number(f.price) < Number(f.cost) && f.price !== '' && f.cost !== ''
  return (<div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center">
    <form onSubmit={submit} className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-xl bg-white p-4 sm:rounded-xl">
      <div className="mb-3 flex items-center justify-between"><h2 className="text-base font-semibold">{p ? 'Edit product' : 'Add product'}</h2><button type="button" onClick={onClose} aria-label="Close"><X size={20} /></button></div>
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2"><Field label="Name *"><input className={inp} value={f.name} onChange={e => set('name', e.target.value)} autoFocus /></Field></div>
        <Field label="Category *"><input className={inp} list="cats" value={f.category} onChange={e => set('category', e.target.value)} /></Field>
        <Field label="GST %"><select className={inp} value={f.gst} onChange={e => set('gst', e.target.value)}>{[0, 5, 12, 18, 28].map(g => <option key={g}>{g}</option>)}</select></Field>
        <Field label="Barcode"><input className={inp} value={f.barcode} onChange={e => set('barcode', e.target.value)} inputMode="numeric" /></Field>
        <Field label="SKU"><input className={inp} value={f.sku} onChange={e => set('sku', e.target.value)} /></Field>
        <Field label="Purchase price (₹) *"><input className={inp} inputMode="decimal" value={f.cost} onChange={e => set('cost', e.target.value)} /></Field>
        <Field label="Selling price (₹) *"><input className={inp} inputMode="decimal" value={f.price} onChange={e => set('price', e.target.value)} /></Field>
        <Field label="Stock"><input className={inp} inputMode="decimal" value={f.stock} onChange={e => set('stock', e.target.value)} /></Field>
        <Field label="Minimum stock"><input className={inp} inputMode="decimal" value={f.minStock} onChange={e => set('minStock', e.target.value)} /></Field>
        <div className="col-span-2"><Field label="Expiry date"><input type="date" className={inp} value={f.expiry} onChange={e => set('expiry', e.target.value)} /></Field></div>
        <div className="col-span-2 flex items-center gap-3"><ProductThumb blob={image} name={f.name || '?'} />
          <label className="text-sm text-slate-700">Photo<input type="file" accept="image/*" className="mt-1 block text-xs" onChange={async e => { const file = e.target.files?.[0]; if (file) try { setImage(await resizeImage(file)) } catch { setError('Could not read that image') } }} /></label>
          {image && <button type="button" className="text-xs text-red-600" onClick={() => setImage(undefined)}>Remove</button>}</div>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.fast} onChange={e => set('fast', e.target.checked)} />Fast-selling</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.home} onChange={e => set('home', e.target.checked)} />Show on POS homepage</label>
      </div>
      <datalist id="cats">{categories.map(c => <option key={c} value={c} />)}</datalist>
      {warn && <p className="mt-3 text-sm text-amber-700">Selling price is below purchase price: this product will sell at a loss.</p>}
      {error && <p className="mt-3 text-sm text-red-600" role="alert">{error}</p>}
      <button disabled={busy} className="mt-4 w-full rounded-md bg-navy-900 py-2.5 text-sm font-medium text-white disabled:opacity-50">{busy ? 'Saving…' : 'Save product'}</button>
    </form></div>)
}
