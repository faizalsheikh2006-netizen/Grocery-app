import { useEffect, useState } from 'react'
import { liveQuery } from 'dexie'
/** Like useLiveQuery, but a failing query returns its error so the screen can show it instead of loading forever. */
export function useLive<T>(query: () => Promise<T>): { data?: T; error?: string } {
  const [s, setS] = useState<{ data?: T; error?: string }>({})
  useEffect(() => {
    const sub = liveQuery(query).subscribe({ next: data => setS({ data }), error: e => setS({ error: String((e as Error)?.message ?? e) }) })
    return () => sub.unsubscribe()
  }, [query])
  return s
}
