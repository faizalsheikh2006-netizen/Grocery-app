import type { Sale } from './schema'
const rs = (p: number) => 'Rs. ' + (p / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const MODE: Record<string, string> = { cash: 'Cash', upi: 'UPI', card: 'Card', other: 'Other', udhar: 'Udhar' }

export async function buildInvoicePdf(s: Sale, shop: string): Promise<Blob> {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ unit: 'mm', format: 'a5' })
  let y = 14
  doc.setFontSize(15); doc.text(shop || 'Grocery Store', 10, y); y += 6
  doc.setFontSize(9); doc.text(`Invoice: ${s.invoiceNo}`, 10, y); doc.text(new Date(s.at).toLocaleString('en-IN'), 138, y, { align: 'right' }); y += 5
  if (s.customerName || s.customerPhone) { doc.text(`Customer: ${[s.customerName, s.customerPhone].filter(Boolean).join(' / ')}`, 10, y); y += 5 }
  doc.line(10, y, 138, y); y += 5
  doc.setFont('helvetica', 'bold'); doc.text('Item', 10, y); doc.text('Qty', 88, y, { align: 'right' }); doc.text('Rate', 110, y, { align: 'right' }); doc.text('Amount', 138, y, { align: 'right' }); doc.setFont('helvetica', 'normal'); y += 5
  for (const it of s.items) {
    if (y > 185) { doc.addPage(); y = 14 }
    doc.text(doc.splitTextToSize(it.name, 62)[0], 10, y); doc.text(String(it.qty), 88, y, { align: 'right' })
    doc.text((it.unitPricePaise / 100).toFixed(2), 110, y, { align: 'right' }); doc.text(((Math.round(it.unitPricePaise * it.qty)) / 100).toFixed(2), 138, y, { align: 'right' }); y += 5
  }
  doc.line(10, y, 138, y); y += 5
  const row = (l: string, v: string, bold = false) => { doc.setFont('helvetica', bold ? 'bold' : 'normal'); doc.text(l, 90, y); doc.text(v, 138, y, { align: 'right' }); y += 5 }
  row('Subtotal', rs(s.subtotalPaise)); if (s.discountPaise) row('Discount', '- ' + rs(s.discountPaise))
  row('GST included', rs(s.gstPaise)); doc.setFontSize(11); row('TOTAL', rs(s.totalPaise), true); doc.setFontSize(9)
  doc.setFont('helvetica', 'normal'); doc.text(`Paid by: ${s.payments.map(p => MODE[p.mode] ?? p.mode).join(', ')}`, 10, y + 2)
  doc.text('Thank you! Visit again.', 74, y + 12, { align: 'center' })
  return doc.output('blob')
}
export function downloadBlob(b: Blob, name: string) {
  const url = URL.createObjectURL(b), a = document.createElement('a'); a.href = url; a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(url), 5000)
}
/** Android: opens the share sheet with the PDF attached (pick WhatsApp). Otherwise downloads the PDF and opens WhatsApp with a text. */
export async function shareInvoice(s: Sale, shop: string) {
  const blob = await buildInvoicePdf(s, shop), name = `${s.invoiceNo}.pdf`, file = new File([blob], name, { type: 'application/pdf' })
  const text = `${shop || 'Grocery Store'} - Bill ${s.invoiceNo}\nTotal: ${rs(s.totalPaise)}\nDhanyavaad!`
  if (navigator.canShare?.({ files: [file] })) { await navigator.share({ files: [file], title: name, text }); return }
  downloadBlob(blob, name)
  let ph = (s.customerPhone ?? '').replace(/\D/g, ''); if (ph.length === 10) ph = '91' + ph
  window.open(`https://wa.me/${ph}?text=${encodeURIComponent(text)}`, '_blank')
}
