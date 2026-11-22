import { useMemo, useRef, useState } from 'react'
import { useLive } from './useLive'
import { Plus, Search, Star, Home, Pencil, Trash2, Download, Upload } from 'lucide-react'
import { listProducts, deleteProduct, toggleFlag, exportCSV, importCSV } from './productRepo'
import type { Product } from './schema'
import { formatINR } from './money'
import { DAY } from './dates'
import ProductForm from './ProductForm'
import ProductThumb from './ProductThumb'
import EmptyState from './EmptyState'

type Filter = 'all' | 'low' | 'expiring' | 'fast' | 'home'
const FILTERS: [Filter, string][] = [['all', 'All'], ['low', 'Low stock'], ['expiring', 'Expiring'], ['fast', 'Fast selling'], ['home', 'Homepage']]

export default function Inventory() {
  const { data: products, error: loadErr } = useLive(listProducts)
  const [q, setQ] = useState(''); const [filter, setFilter] = useState<Filter>('all')
  const [editing, setEditing] = useState<Product | 'new' | null>(null)
  const [msg, setMsg] = useState<string[]>([]); const fileRef = useRef<HTMLInputElement>(null)
  const now = Date.now()
  const categories = useMemo(() => [...new Set((products ?? []).map(p => p.category))].sort(), [products])
  const list = useMemo(() => (products ?? []).filter(p => {
    const t = q.trim().toLowerCase()
    if (t && ![p.name, p.barcode, p.sku, p.category].some(v => v?.toLowerCase().includes(t))) return false
    return filter === 'all' || (filter === 'low' && p.stock <= p.minStock) || (filter === 'expiring' && !!p.expiryDate && p.expiryDate < now + 30 * DAY)
      || (filter === 'fast' && p.fastSelling) || (filter === 'home' && p.onHomepage)
  }).sort((a, b) => a.name.localeCompare(b.name)), [products, q, filter, now])

  const run = async (fn: () => Promise<unknown>) => { try { await fn() } catch (e) { setMsg([(e as Error).message]) } }
  function download() {
    const url = URL.createObjectURL(new Blob([exportCSV(products ?? [])], { type: 'text/csv' }))
    const a = document.createElement('a'); a.href = url; a.download = `groceryos-products-${new Date().toISOString().slice(0, 10)}.csv`; a.click(); URL.revokeObjectURL(url)
  }
  const onImport = (file?: File) => file && run(async () => {
    const r = await importCSV(await file.text()); setMsg([`${r.added} product(s) imported, ${r.errors.length} skipped.`, ...r.errors.slice(0, 5)])
  })
  const iconBtn = 'rounded p-2 hover:bg-slate-100'
  return (<div className="space-y-3">
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative min-w-[200px] flex-1"><Search size={16} className="absolute left-3 top-3 text-slate-400" aria-hidden />
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search name, barcode, SKU" className="w-full rounded-md border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm" /></div>
      <button onClick={() => setEditing('new')} className="flex items-center gap-1 rounded-md bg-money px-3 py-2 text-sm font-medium text-white"><Plus size={16} />Add</button>
      <button onClick={download} disabled={!products?.length} className="flex items-center gap-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm disabled:opacity-40"><Download size={16} />Export</button>
      <button onClick={() => fileRef.current?.click()} className="flex items-center gap-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"><Upload size={16} />Import</button>
      <input ref={fileRef} type="file" accept=".csv,text/csv" hidden onChange={e => { void onImport(e.target.files?.[0]); e.target.value = '' }} />
    </div>
    <div className="flex gap-2 overflow-x-auto">{FILTERS.map(([k, l]) => <button key={k} onClick={() => setFilter(k)} className={`whitespace-nowrap rounded-full border px-3 py-1 text-xs ${filter === k ? 'border-navy-900 bg-navy-900 text-white' : 'border-slate-300 bg-white'}`}>{l}</button>)}</div>
    {msg.length > 0 && <div className="rounded-md border border-slate-200 bg-white p-3 text-sm" role="status">{msg.map((m, i) => <p key={i}>{m}</p>)}<button className="mt-1 text-xs text-slate-500 underline" onClick={() => setMsg([])}>Dismiss</button></div>}
    <div className="rounded-lg border border-slate-200 bg-white">
      {loadErr ? <p className="p-4 text-sm text-red-600" role="alert">Data load nahi hua: {loadErr}</p> : !products ? <p className="p-4 text-sm text-slate-500">Loading…</p> : products.length === 0 ? <EmptyState title="No products yet" hint="Tap Add, or Import a CSV (columns: name, category, barcode, sku, purchase_price, selling_price, gst_percent, stock, min_stock, expiry_date)." />
        : list.length === 0 ? <EmptyState title="No matching products" hint="Try a different search or filter." /> :
        <ul className="divide-y divide-slate-100">{list.map(p => { const low = p.stock <= p.minStock, expired = !!p.expiryDate && p.expiryDate < now, soon = !!p.expiryDate && p.expiryDate < now + 30 * DAY
          return (<li key={p.id} className="flex items-center gap-3 p-3">
            <ProductThumb blob={p.imageBlob} name={p.name} icon={p.icon} />
            <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{p.name}</p>
              <p className="truncate text-xs text-slate-500">{p.category}{p.barcode ? ` · ${p.barcode}` : ''}</p>
              <p className="text-xs"><span className="font-medium text-money">{formatINR(p.pricePaise)}</span> <span className="text-slate-400">cost {formatINR(p.costPaise)}</span>{' · '}
                <span className={low ? 'font-medium text-amber-600' : ''}>{p.stock} in stock</span>
                {p.expiryDate && <span className={expired ? ' font-medium text-red-600' : soon ? ' text-amber-600' : ' text-slate-500'}> · {expired ? 'Expired' : 'Exp'} {new Date(p.expiryDate).toLocaleDateString('en-IN')}</span>}</p></div>
            <div className="flex shrink-0">
              <button className={iconBtn} aria-label="Toggle fast-selling" aria-pressed={p.fastSelling} onClick={() => run(() => toggleFlag(p, 'fastSelling'))}><Star size={16} className={p.fastSelling ? 'fill-amber-400 text-amber-500' : 'text-slate-400'} /></button>
              <button className={iconBtn} aria-label="Toggle on POS homepage" aria-pressed={p.onHomepage} onClick={() => run(() => toggleFlag(p, 'onHomepage'))}><Home size={16} className={p.onHomepage ? 'text-money' : 'text-slate-400'} /></button>
              <button className={iconBtn} aria-label="Edit" onClick={() => setEditing(p)}><Pencil size={16} /></button>
              <button className={iconBtn} aria-label="Delete" onClick={() => { if (confirm(`Delete "${p.name}"? Past bills will keep its record.`)) void run(() => deleteProduct(p)) }}><Trash2 size={16} className="text-red-500" /></button></div></li>) })}</ul>}
    </div>
    {editing && <ProductForm product={editing === 'new' ? null : editing} categories={categories} onClose={() => setEditing(null)} />}
  </div>)
}
