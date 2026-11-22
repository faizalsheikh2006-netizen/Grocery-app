export default function EmptyState({ title, hint }: { title: string; hint: string }) {
  return (<div className="px-4 py-8 text-center"><p className="font-medium text-slate-700">{title}</p><p className="mt-1 text-sm text-slate-500">{hint}</p></div>)
}
