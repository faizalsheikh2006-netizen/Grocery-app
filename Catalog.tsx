import { useState } from 'react'
import { useLive } from './useLive'
import { Search, Check } from 'lucide-react'
import { CATALOG, CATEGORIES, itemKey, type CatalogItem } from './catalogData'
import { listProducts, bulkCreate, type ProductInput } from './productRepo'
import { rupeesToPaise } from './money'

type Sel = Record<string, { price: string; cost: string; stock: string }>
const mini = 'w-full rounded border border-slate-300 px-2 py-1.5 text-sm'

export default function Catalog() {
  const { data: products } = useLive(listProducts)
  const [q, setQ] = useState(''); const [cat, setCat] = useState('All'); const [sel, setSel] = useState<Sel>({})
  const [busy, setBusy] = useState(false); const [msg, setMsg] = useState<string[]>([])
  const have = new Set((products ?? []).map(p => p.name.toLowerCase()))
  const t = q.trim().toLowerCase()
  const list = CATALOG.filter(i => (cat === 'All' || i.category === cat) && (!t || i.name.toLowerCase().includes(t)))
  const keys = Object.keys(sel)
  const toggle = (i: CatalogItem) => setSel(s => { const k = itemKey(i); if (s[k]) { const { [k]: _x, ...rest } = s; void _x; return rest } return { ...s, [k]: { price: '', cost: '', stock: '' } } })
  const patch = (k: string, f: 'price' | 'cost' | 'stock', v: string) => setSel(s => ({ ...s, [k]: { ...s[k], [f]: v } }))

  async function addAll() {
    setBusy(true); const errs: string[] = [], left: Sel = {}, inputs: ProductInput[] = []
    for (const k of keys) {
      const item = CATALOG.find(i => itemKey(i) === k)!, v = sel[k]
      const price = Number(v.price), cost = v.cost === '' ? 0 : Number(v.cost), stock = v.stock === '' ? 0 : Number(v.stock)
      const bad = v.price.trim() === '' || !Number.isFinite(price) || price <= 0 ? 'selling price daalo' : !Number.isFinite(cost) || cost < 0 ? 'kharid rate galat hai' : !Number.isFinite(stock) || stock < 0 ? 'stock galat hai' : ''
      if (bad) { errs.push(`${k}: ${bad}`); left[k] = v; continue }
      inputs.push({ name: k, category: item.category, costPaise: rupeesToPaise(cost), pricePaise: rupeesToPaise(price), gstRate: item.gst, stock, minStock: 0, fastSelling: false, onHomepage: false, icon: item.icon })
    }
    try { const r = await bulkCreate(inputs); errs.push(...r.errors); setMsg([`${r.added} saman aapki dukaan me add ho gaya.`, ...errs.slice(0, 6)]) }
    catch (e) { setMsg([(e as Error).message]); inputs.forEach(i => { left[i.name] = sel[i.name] }) }
    setSel(left); setBusy(false)
  }
  return (<div className="space-y-3 pb-24">
    <p className="text-sm text-slate-600">Jo saman aapke paas hai uspe tap karo, apna rate aur stock likho, phir neeche <b>Add</b> dabao.</p>
    <div className="relative"><Search size={16} className="absolute left-3 top-3 text-slate-400" aria-hidden />
      <input value={q} onChange={e => setQ(e.target.value)} placeholder="Saman dhundo" className="w-full rounded-md border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm" /></div>
    <div className="flex gap-2 overflow-x-auto">{['All', ...CATEGORIES].map(c => <button key={c} onClick={() => setCat(c)} className={`whitespace-nowrap rounded-full border px-3 py-1 text-xs ${cat === c ? 'border-navy-900 bg-navy-900 text-white' : 'border-slate-300 bg-white'}`}>{c}</button>)}</div>
    {msg.length > 0 && <div className="rounded-md border border-slate-200 bg-white p-3 text-sm" role="status">{msg.map((m, i) => <p key={i}>{m}</p>)}<button className="mt-1 text-xs underline" onClick={() => setMsg([])}>Dismiss</button></div>}
    <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">{list.map(i => { const k = itemKey(i), added = have.has(k.toLowerCase()), s = sel[k]
      return (<li key={k} className={`p-3 ${added ? 'opacity-50' : ''}`}>
        <button disabled={added} onClick={() => toggle(i)} className="flex w-full items-center gap-3 text-left">
          <span className="flex h-10 w-10 items-center justify-center rounded bg-slate-100 text-2xl">{i.icon}</span>
          <span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium">{i.name}</span><span className="text-xs text-slate-500">{i.unit}</span></span>
          {added ? <span className="text-xs text-money">Added</span> : <span className={`flex h-6 w-6 items-center justify-center rounded-full border ${s ? 'border-money bg-money text-white' : 'border-slate-300'}`}>{s && <Check size={14} />}</span>}</button>
        {s && <div className="mt-2 grid grid-cols-3 gap-2">
          <input className={mini} placeholder="Bechne ka ₹ *" inputMode="decimal" value={s.price} onChange={e => patch(k, 'price', e.target.value)} aria-label="Selling price" />
          <input className={mini} placeholder="Kharid ₹" inputMode="decimal" value={s.cost} onChange={e => patch(k, 'cost', e.target.value)} aria-label="Purchase price" />
          <input className={mini} placeholder="Stock" inputMode="decimal" value={s.stock} onChange={e => patch(k, 'stock', e.target.value)} aria-label="Stock" /></div>}</li>) })}
      {list.length === 0 && <li className="p-6 text-center text-sm text-slate-500">Kuch nahi mila. Naya saman Inventory me add karo.</li>}</ul>
    {keys.length > 0 && <button disabled={busy} onClick={addAll} className="fixed inset-x-3 bottom-3 z-30 rounded-lg bg-money py-3 text-sm font-medium text-white shadow-lg disabled:opacity-50 lg:left-72">{busy ? 'Add ho raha hai…' : `${keys.length} saman dukaan me Add karo`}</button>}
  </div>)
}
