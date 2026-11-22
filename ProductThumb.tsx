import { useEffect, useState } from 'react'
export default function ProductThumb({ blob, name }: { blob?: Blob; name: string }) {
  const [url, setUrl] = useState<string>()
  useEffect(() => { if (!blob) { setUrl(undefined); return } const u = URL.createObjectURL(blob); setUrl(u); return () => URL.revokeObjectURL(u) }, [blob])
  return url ? <img src={url} alt={name} className="h-12 w-12 shrink-0 rounded object-cover" />
    : <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded bg-slate-100 font-semibold text-slate-400">{name.slice(0, 1).toUpperCase()}</div>
}
