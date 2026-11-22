/** All money is stored as integer paise to avoid floating-point errors. */
const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 })
export type Paise = number
export const rupeesToPaise = (r: number): Paise => Math.round(r * 100)
export const formatINR = (p: Paise): string => inr.format(p / 100)
/** GST on a tax-exclusive amount (paise), rate in percent. */
export const gstOn = (amount: Paise, ratePct: number): Paise => Math.round((amount * ratePct) / 100)
/** Sum integers safely; throws if any value is not a safe integer. */
export const sumPaise = (xs: Paise[]): Paise => xs.reduce((a, b) => {
  if (!Number.isSafeInteger(b)) throw new Error(`Invalid paise value: ${b}`)
  return a + b }, 0)
