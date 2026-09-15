/**
 * Type definitions for Windows Shop Billing System
 * Indian Retail POS, SQLite Schema & GST Billing
 */

export type PaymentMethod = 'Cash' | 'UPI' | 'Card' | 'Credit';

export type ProductUnit = 'Pcs' | 'Kg' | 'Gm' | 'Ltr' | 'Ml' | 'Mtr' | 'Box' | 'Pkt' | 'Dozen';

export type GstRate = 0 | 3 | 5 | 12 | 18 | 28;

export type UserRole = 'admin' | 'employee';

export interface User {
  id: string;
  username: string;
  password: string; // Stored securely offline in SQLite
  fullName: string;
  role: UserRole;
  phone?: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

export type MembershipTier = 'Bronze' | 'Silver' | 'Gold';

export interface LoyaltySettings {
  enabled: boolean;
  pointsPerHundredSpent: number; // Points earned per ₹100 spent (e.g. 1 point)
  redemptionValuePerPoint: number; // Value in ₹ for 1 point (e.g. ₹1.00)
  minPointsToRedeem: number; // Minimum points balance required before redemption (e.g. 50 pts)
  maxRedeemPercentagePerBill: number; // Maximum % of bill total that can be paid with points (e.g. 50%)
  maxPointsPerBill: number; // Maximum points that can be redeemed in a single bill (e.g. 500)
  bronzeThreshold: number; // Points needed for Bronze (e.g. 0)
  silverThreshold: number; // Points needed for Silver (e.g. 1000)
  goldThreshold: number; // Points needed for Gold (e.g. 5000)
  silverMultiplier: number; // Point earning multiplier for Silver tier (e.g. 1.25x)
  goldMultiplier: number; // Point earning multiplier for Gold tier (e.g. 1.5x)
  pointExpiryMonths: number; // Point validity duration in months (0 = no expiry)
}

export type AppTheme = 'dark' | 'light';

export interface Category {
  id: string;
  name: string;
  code?: string;
  description?: string;
}

export interface Product {
  id: string;
  barcode: string;
  name: string;
  sku: string;
  categoryId: string;
  categoryName?: string;
  purchasePrice: number;
  sellingPrice: number;
  mrp?: number;
  gstRate: GstRate;
  hsnCode: string;
  currentStock: number;
  minStock: number;
  unit: ProductUnit;
  createdAt: string;
  updatedAt?: string;
}

export interface CartItem {
  productId: string;
  barcode: string;
  name: string;
  hsnCode: string;
  unit: ProductUnit;
  unitPrice: number; // Selling price inclusive or exclusive
  quantity: number;
  gstRate: GstRate;
  discountAmount: number; // Flat discount per item total
  taxableAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalTax: number;
  totalPrice: number;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  gstin?: string;
  address?: string;
  creditBalance: number; // Outstanding unpaid balance
  totalBills: number;
  totalSpent: number;
  loyaltyPoints: number; // Current loyalty point balance
  visitsCount: number; // Total customer visit count
  membershipTier: MembershipTier; // Bronze, Silver, Gold
  createdAt: string;
}

export interface BillItem {
  id: string;
  billId: string;
  productId: string;
  productName: string;
  barcode: string;
  hsnCode: string;
  quantity: number;
  unit: ProductUnit;
  unitPrice: number;
  gstRate: GstRate;
  discountAmount: number;
  taxableAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalTax: number;
  totalPrice: number;
}

export interface Bill {
  id: string;
  billNumber: string; // e.g. "INV-2026-0001"
  customerId?: string;
  customerName: string;
  customerPhone?: string;
  customerGstin?: string;
  items: BillItem[];
  subtotal: number; // Taxable base amount
  discountAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalTax: number;
  roundOff: number;
  grandTotal: number;
  paymentMethod: PaymentMethod;
  amountReceived: number;
  changeReturned: number;
  notes?: string;
  isInterstate: boolean;
  status: 'Completed' | 'Cancelled' | 'Returned' | 'Partially Returned';
  createdAt: string; // ISO string
  cashierName: string;
  // Customer loyalty rewards tracking
  loyaltyPointsEarned?: number;
  loyaltyPointsRedeemed?: number;
  loyaltyDiscountAmount?: number;
  customerLoyaltyBalanceAfter?: number;
}

export interface InventoryTransaction {
  id: string;
  productId: string;
  productName: string;
  type: 'Sale' | 'StockIn' | 'Adjustment' | 'Return';
  quantity: number;
  previousStock: number;
  newStock: number;
  reason: string;
  referenceId?: string; // Bill number or Stock-In memo
  createdAt: string;
}

export interface ReturnItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  taxAmount: number;
  refundTotal: number;
}

export interface SaleReturn {
  id: string;
  returnNumber: string; // e.g. "RET-2026-0001"
  originalBillNumber: string;
  customerName: string;
  customerPhone?: string;
  items: ReturnItem[];
  totalRefundAmount: number;
  refundMethod: PaymentMethod;
  reason: string;
  createdAt: string;
}

export interface ShopSettings {
  shopName: string;
  tagline: string;
  addressLine1: string;
  addressLine2: string;
  phone: string;
  email: string;
  gstin: string;
  state: string;
  stateCode: string; // e.g. "27" for Maharashtra, "07" for Delhi
  panNumber: string;
  upiId: string;
  billPrefix: string;
  nextBillNumber: number;
  printerType: 'Thermal80' | 'Thermal58' | 'LaserA4';
  autoPrintReceipt: boolean;
  invoiceFooterNote: string;
  enableSoundBeep: boolean;
  autoBackupDaily: boolean;
  backupLocation: string;
  currencySymbol: string;
  theme: AppTheme;
}

export interface HeldBill {
  id: string;
  timestamp: string;
  customerName: string;
  customerPhone?: string;
  cart: CartItem[];
  paymentMethod: PaymentMethod;
  discountAmount: number;
  notes?: string;
}

export type ActiveTab =
  | 'dashboard'
  | 'billing'
  | 'products'
  | 'inventory'
  | 'customers'
  | 'sales'
  | 'returns'
  | 'reports'
  | 'employees'
  | 'settings'
  | 'packaging';
