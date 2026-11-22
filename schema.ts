import type { Paise } from './money'
/** Every row carries sync metadata so cloud sync can be added later without migrations. */
export interface SyncMeta { id?: number; uid: string; createdAt: number; updatedAt: number; deletedAt?: number | null; dirty?: 0 | 1 }
export interface Product extends SyncMeta { name: string; category: string; barcode?: string; sku?: string; costPaise: Paise; pricePaise: Paise; gstRate: number; stock: number; minStock: number; imageBlob?: Blob; expiryDate?: number; fastSelling: boolean; onHomepage: boolean; icon?: string }
export interface Customer extends SyncMeta { name: string; phone?: string; address?: string; creditLimitPaise?: Paise; balancePaise: Paise }
export interface LedgerEntry extends SyncMeta { customerId: number; kind: 'credit_sale' | 'payment' | 'adjustment' | 'return'; amountPaise: Paise; saleId?: number; note?: string; at: number }
export interface SaleItem { productId: number; name: string; qty: number; unitPricePaise: Paise; costPaise: Paise; discountPaise: Paise; gstRate: number }
export interface Payment { mode: 'cash' | 'upi' | 'card' | 'other' | 'udhar'; amountPaise: Paise; ref?: string }
export interface Sale extends SyncMeta { invoiceNo: string; items: SaleItem[]; subtotalPaise: Paise; discountPaise: Paise; gstPaise: Paise; totalPaise: Paise; profitPaise: Paise; payments: Payment[]; customerId?: number; customerName?: string; customerPhone?: string; status: 'completed' | 'cancelled' | 'returned'; staffId?: number; at: number }
export interface Supplier extends SyncMeta { name: string; phone?: string; balancePaise: Paise }
export interface Purchase extends SyncMeta { supplierId?: number; items: { productId: number; qty: number; costPaise: Paise }[]; totalPaise: Paise; paidPaise: Paise; at: number }
export interface Expense extends SyncMeta { category: string; amountPaise: Paise; note?: string; at: number }
export interface StockAdjustment extends SyncMeta { productId: number; delta: number; reason: string; at: number }
export interface CashbookEntry extends SyncMeta { type: 'in' | 'out'; amountPaise: Paise; source: string; refId?: number; at: number }
export interface Staff extends SyncMeta { name: string; pinHash: string; role: 'owner' | 'manager' | 'cashier'; active: boolean }
export interface AuditLog { id?: number; at: number; staffId?: number; action: string; entity: string; entityId?: number; detail?: string }
export interface Setting { key: string; value: unknown }
