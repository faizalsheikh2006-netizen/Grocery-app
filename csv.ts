export function parseCSV(input: string): string[][] {
  const text = input.replace(/^\uFEFF/, '')
  const rows: string[][] = []; let row: string[] = [], cell = '', q = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (q) { if (c === '"') { if (text[i + 1] === '"') { cell += '"'; i++ } else q = false } else cell += c }
    else if (c === '"') q = true
    else if (c === ',') { row.push(cell); cell = '' }
    else if (c === '\n' || c === '\r') { if (c === '\r' && text[i + 1] === '\n') i++; row.push(cell); rows.push(row); row = []; cell = '' }
    else cell += c
  }
  if (cell !== '' || row.length) { row.push(cell); rows.push(row) }
  return rows.filter(r => r.some(x => x.trim() !== ''))
}
/** Text cells starting with = + @ are prefixed so spreadsheets never run them as formulas. */
export const csvCell = (v: string | number | boolean, text = false): string => {
  let s = String(v); if (text && /^[=+@]/.test(s)) s = "'" + s
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}
