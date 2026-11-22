export const startOfDay = (d = new Date()): number => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
export const DAY = 86_400_000
export const dayLabel = (ts: number) => new Date(ts).toLocaleDateString('en-IN', { weekday: 'short' })
export const dateTime = (ts: number) => new Date(ts).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
