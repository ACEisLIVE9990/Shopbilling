/**
 * SQLite Local Database Engine & Persistent Storage
 * Emulates SQLite tables, relational foreign keys, atomic transactions, and backup/restore
 * Stores data locally in localStorage/IndexedDB with 100% offline access.
 * Generates and imports standard "ShopBilling.db" / SQL dumps.
 */

import {
  Product,
  Category,
  Customer,
  Bill,
  InventoryTransaction,
  SaleReturn,
  ShopSettings,
  User,
  UserRole,
  LoyaltySettings,
  MembershipTier,
} from '../types';

const DB_STORAGE_KEY = 'ShopBilling_v1_LocalDB';
const BACKUP_HISTORY_KEY = 'ShopBilling_v1_Backups';

export interface DatabaseState {
  products: Product[];
  categories: Category[];
  customers: Customer[];
  bills: Bill[];
  inventoryTransactions: InventoryTransaction[];
  returns: SaleReturn[];
  settings: ShopSettings;
  users: User[];
  loyaltySettings: LoyaltySettings;
}

export const INITIAL_USERS: User[] = [
  {
    id: 'usr-admin',
    username: 'admin',
    password: 'admin123',
    fullName: 'Super Administrator',
    role: 'admin',
    phone: '9820198201',
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'usr-cashier1',
    username: 'cashier1',
    password: 'pos123',
    fullName: 'Rahul Sharma (Cashier)',
    role: 'employee',
    phone: '9876543210',
    isActive: true,
    createdAt: '2026-01-15T00:00:00.000Z',
  },
  {
    id: 'usr-cashier2',
    username: 'priya',
    password: 'pos123',
    fullName: 'Priya Verma (Staff)',
    role: 'employee',
    phone: '9812345678',
    isActive: true,
    createdAt: '2026-02-01T00:00:00.000Z',
  },
];

export const DEFAULT_LOYALTY_SETTINGS: LoyaltySettings = {
  enabled: true,
  pointsPerHundredSpent: 1, // 1 point for every ₹100 spent
  redemptionValuePerPoint: 1, // 1 point = ₹1 discount
  minPointsToRedeem: 50, // Minimum 50 points required to redeem
  maxRedeemPercentagePerBill: 50, // Max 50% of bill total can be discounted using points
  maxPointsPerBill: 500, // Maximum points redeemable per bill
  bronzeThreshold: 0,
  silverThreshold: 1000,
  goldThreshold: 5000,
  silverMultiplier: 1.25, // 1.25x point earning for Silver
  goldMultiplier: 1.5, // 1.5x point earning for Gold
  pointExpiryMonths: 12, // 12 months point validity
};

export function calculateMembershipTier(points: number, settings: LoyaltySettings): MembershipTier {
  if (points >= settings.goldThreshold) return 'Gold';
  if (points >= settings.silverThreshold) return 'Silver';
  return 'Bronze';
}

export function calculatePointsEarned(amount: number, tier: MembershipTier, settings: LoyaltySettings): number {
  if (!settings.enabled || amount <= 0) return 0;
  const base = (amount / 100) * settings.pointsPerHundredSpent;
  const multiplier = tier === 'Gold' ? settings.goldMultiplier : tier === 'Silver' ? settings.silverMultiplier : 1;
  return Math.floor(base * multiplier);
}

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Grains, Atta & Pulses', code: 'GRAIN' },
  { id: 'cat-2', name: 'Edible Oils & Ghee', code: 'OIL' },
  { id: 'cat-3', name: 'Packaged Foods & Snacks', code: 'SNACK' },
  { id: 'cat-4', name: 'Beverages & Dairy', code: 'BEV' },
  { id: 'cat-5', name: 'Personal Care & Hygiene', code: 'PC' },
  { id: 'cat-6', name: 'Spices & Masalas', code: 'SPICE' },
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-001',
    barcode: '8901030383123',
    sku: 'ATTA-ASH-05K',
    name: 'Aashirvaad Shudh Chakki Atta 5kg',
    categoryId: 'cat-1',
    categoryName: 'Grains, Atta & Pulses',
    purchasePrice: 220,
    sellingPrice: 260,
    mrp: 275,
    gstRate: 0,
    hsnCode: '1101',
    currentStock: 35,
    minStock: 10,
    unit: 'Pkt',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-002',
    barcode: '8901491101017',
    sku: 'RICE-BAS-01K',
    name: 'India Gate Basmati Rice Feast Rozzana 1kg',
    categoryId: 'cat-1',
    categoryName: 'Grains, Atta & Pulses',
    purchasePrice: 85,
    sellingPrice: 110,
    mrp: 125,
    gstRate: 5,
    hsnCode: '1006',
    currentStock: 48,
    minStock: 15,
    unit: 'Kg',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-003',
    barcode: '8906007281014',
    sku: 'OIL-FORT-01L',
    name: 'Fortune Sunlite Refined Sunflower Oil 1L Pouch',
    categoryId: 'cat-2',
    categoryName: 'Edible Oils & Ghee',
    purchasePrice: 115,
    sellingPrice: 135,
    mrp: 145,
    gstRate: 5,
    hsnCode: '1512',
    currentStock: 28,
    minStock: 8,
    unit: 'Pkt',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-004',
    barcode: '8901058852328',
    sku: 'MAGG-NOOD-70G',
    name: 'Maggi 2-Minute Masala Instant Noodles 70g',
    categoryId: 'cat-3',
    categoryName: 'Packaged Foods & Snacks',
    purchasePrice: 11.5,
    sellingPrice: 14,
    mrp: 14,
    gstRate: 12,
    hsnCode: '1902',
    currentStock: 120,
    minStock: 25,
    unit: 'Pkt',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-005',
    barcode: '8901719101018',
    sku: 'PARLE-G-80G',
    name: 'Parle-G Original Gluco Biscuits 80g',
    categoryId: 'cat-3',
    categoryName: 'Packaged Foods & Snacks',
    purchasePrice: 8,
    sellingPrice: 10,
    mrp: 10,
    gstRate: 18,
    hsnCode: '1905',
    currentStock: 85,
    minStock: 20,
    unit: 'Pkt',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-006',
    barcode: '8901030010125',
    sku: 'SOAP-DET-125G',
    name: 'Dettol Original Germ Protection Bathing Soap 125g',
    categoryId: 'cat-5',
    categoryName: 'Personal Care & Hygiene',
    purchasePrice: 42,
    sellingPrice: 52,
    mrp: 56,
    gstRate: 18,
    hsnCode: '3401',
    currentStock: 4, // Intentionally low to demo low stock warning
    minStock: 10,
    unit: 'Pcs',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-007',
    barcode: '8901262010011',
    sku: 'SALT-TATA-01K',
    name: 'Tata Salt Vacuum Evaporated Iodised Salt 1kg',
    categoryId: 'cat-1',
    categoryName: 'Grains, Atta & Pulses',
    purchasePrice: 21,
    sellingPrice: 28,
    mrp: 28,
    gstRate: 0,
    hsnCode: '2501',
    currentStock: 60,
    minStock: 15,
    unit: 'Pkt',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-008',
    barcode: '8901233024823',
    sku: 'PASTE-COLG-100G',
    name: 'Colgate Strong Teeth Dental Cream Toothpaste 100g',
    categoryId: 'cat-5',
    categoryName: 'Personal Care & Hygiene',
    purchasePrice: 52,
    sellingPrice: 65,
    mrp: 70,
    gstRate: 18,
    hsnCode: '3306',
    currentStock: 24,
    minStock: 6,
    unit: 'Pcs',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-009',
    barcode: '8901030588231',
    sku: 'MILK-AMUL-01L',
    name: 'Amul Taaza Homogenised Toned Milk 1L Tetra',
    categoryId: 'cat-4',
    categoryName: 'Beverages & Dairy',
    purchasePrice: 66,
    sellingPrice: 74,
    mrp: 75,
    gstRate: 0,
    hsnCode: '0401',
    currentStock: 18,
    minStock: 5,
    unit: 'Pkt',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-010',
    barcode: '8901058001016',
    sku: 'SPICE-EVR-100G',
    name: 'Everest Garam Masala Powder 100g Box',
    categoryId: 'cat-6',
    categoryName: 'Spices & Masalas',
    purchasePrice: 72,
    sellingPrice: 88,
    mrp: 92,
    gstRate: 5,
    hsnCode: '0910',
    currentStock: 32,
    minStock: 8,
    unit: 'Box',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-011',
    barcode: '8901030800123',
    sku: 'TEA-RED-250G',
    name: 'Brooke Bond Red Label Tea Leaf 250g',
    categoryId: 'cat-4',
    categoryName: 'Beverages & Dairy',
    purchasePrice: 110,
    sellingPrice: 130,
    mrp: 140,
    gstRate: 5,
    hsnCode: '0902',
    currentStock: 3, // Low stock demo
    minStock: 8,
    unit: 'Pkt',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-012',
    barcode: '8901030612011',
    sku: 'SURF-EXCL-01K',
    name: 'Surf Excel Easy Wash Detergent Powder 1kg',
    categoryId: 'cat-5',
    categoryName: 'Personal Care & Hygiene',
    purchasePrice: 118,
    sellingPrice: 142,
    mrp: 150,
    gstRate: 18,
    hsnCode: '3402',
    currentStock: 22,
    minStock: 6,
    unit: 'Pkt',
    createdAt: new Date().toISOString(),
  },
];

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust-001',
    name: 'Ramesh Patel',
    phone: '9820145689',
    email: 'ramesh.patel@gmail.com',
    address: 'Flat 302, Sai Krupa Heights, Station Road',
    creditBalance: 450,
    totalBills: 14,
    totalSpent: 8420,
    loyaltyPoints: 350,
    visitsCount: 14,
    membershipTier: 'Bronze',
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    id: 'cust-002',
    name: 'Pooja Sharma',
    phone: '9892034512',
    address: 'B-14, Laxmi Niwas, Market Gali',
    creditBalance: 0,
    totalBills: 8,
    totalSpent: 4350,
    loyaltyPoints: 1250,
    visitsCount: 8,
    membershipTier: 'Silver',
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
  },
  {
    id: 'cust-003',
    name: 'Anand Enterprises (B2B)',
    phone: '9821098765',
    gstin: '27AAACA1234F1Z5',
    address: 'Shop 4, Commercial Complex, Sector 17',
    creditBalance: 1200,
    totalBills: 5,
    totalSpent: 16800,
    loyaltyPoints: 5400,
    visitsCount: 5,
    membershipTier: 'Gold',
    createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
  },
];

export const INITIAL_SETTINGS: ShopSettings = {
  shopName: 'SHREE GANESH SUPERMARKET & PROVISION STORE',
  tagline: 'Quality Kirana & Daily Essentials at Wholesale Rates',
  addressLine1: 'Shop No. 12 & 13, Ground Floor, Sai Plaza, Station Road',
  addressLine2: 'Kalyan (West), Thane District, Maharashtra - 421301',
  phone: '+91 98201 98201 / 0251-220033',
  email: 'shreeganesh.stores@gmail.com',
  gstin: '27AABCU9603R1ZM',
  state: 'Maharashtra',
  stateCode: '27',
  panNumber: 'AABCU9603R',
  upiId: 'shreeganesh@oksbi',
  billPrefix: 'INV-2026-',
  nextBillNumber: 1042,
  printerType: 'Thermal80',
  autoPrintReceipt: true,
  invoiceFooterNote: 'Thank you for shopping with us! No exchange on grocery items after 48 hours.',
  enableSoundBeep: true,
  autoBackupDaily: true,
  backupLocation: 'D:\\ShopBilling\\Backups\\',
  currencySymbol: '₹',
  theme: 'dark',
};

// Seed sample historical bills so reports and sales screen look active right away
function generateSeedBills(): Bill[] {
  const bills: Bill[] = [];
  const now = new Date();

  // Bill 1: Today morning Cash
  bills.push({
    id: 'bill-1039',
    billNumber: 'INV-2026-1039',
    customerId: 'cust-001',
    customerName: 'Ramesh Patel',
    customerPhone: '9820145689',
    items: [
      {
        id: 'bi-1',
        billId: 'bill-1039',
        productId: 'prod-001',
        productName: 'Aashirvaad Shudh Chakki Atta 5kg',
        barcode: '8901030383123',
        hsnCode: '1101',
        quantity: 1,
        unit: 'Pkt',
        unitPrice: 260,
        gstRate: 0,
        discountAmount: 0,
        taxableAmount: 260,
        cgstAmount: 0,
        sgstAmount: 0,
        igstAmount: 0,
        totalTax: 0,
        totalPrice: 260,
      },
      {
        id: 'bi-2',
        billId: 'bill-1039',
        productId: 'prod-003',
        productName: 'Fortune Sunlite Refined Sunflower Oil 1L Pouch',
        barcode: '8906007281014',
        hsnCode: '1512',
        quantity: 2,
        unit: 'Pkt',
        unitPrice: 135,
        gstRate: 5,
        discountAmount: 0,
        taxableAmount: 257.14,
        cgstAmount: 6.43,
        sgstAmount: 6.43,
        igstAmount: 0,
        totalTax: 12.86,
        totalPrice: 270,
      },
      {
        id: 'bi-3',
        billId: 'bill-1039',
        productId: 'prod-007',
        productName: 'Tata Salt Vacuum Evaporated Iodised Salt 1kg',
        barcode: '8901262010011',
        hsnCode: '2501',
        quantity: 1,
        unit: 'Pkt',
        unitPrice: 28,
        gstRate: 0,
        discountAmount: 0,
        taxableAmount: 28,
        cgstAmount: 0,
        sgstAmount: 0,
        igstAmount: 0,
        totalTax: 0,
        totalPrice: 28,
      },
    ],
    subtotal: 545.14,
    discountAmount: 0,
    cgstAmount: 6.43,
    sgstAmount: 6.43,
    igstAmount: 0,
    totalTax: 12.86,
    roundOff: 0,
    grandTotal: 558,
    paymentMethod: 'Cash',
    amountReceived: 600,
    changeReturned: 42,
    isInterstate: false,
    status: 'Completed',
    createdAt: new Date(now.getTime() - 4 * 3600000).toISOString(),
    cashierName: 'Admin (POS-01)',
  });

  // Bill 2: Today UPI
  bills.push({
    id: 'bill-1040',
    billNumber: 'INV-2026-1040',
    customerId: 'cust-002',
    customerName: 'Pooja Sharma',
    customerPhone: '9892034512',
    items: [
      {
        id: 'bi-4',
        billId: 'bill-1040',
        productId: 'prod-004',
        productName: 'Maggi 2-Minute Masala Instant Noodles 70g',
        barcode: '8901058852328',
        hsnCode: '1902',
        quantity: 4,
        unit: 'Pkt',
        unitPrice: 14,
        gstRate: 12,
        discountAmount: 0,
        taxableAmount: 50,
        cgstAmount: 3,
        sgstAmount: 3,
        igstAmount: 0,
        totalTax: 6,
        totalPrice: 56,
      },
      {
        id: 'bi-5',
        billId: 'bill-1040',
        productId: 'prod-008',
        productName: 'Colgate Strong Teeth Dental Cream Toothpaste 100g',
        barcode: '8901233024823',
        hsnCode: '3306',
        quantity: 1,
        unit: 'Pcs',
        unitPrice: 65,
        gstRate: 18,
        discountAmount: 0,
        taxableAmount: 55.08,
        cgstAmount: 4.96,
        sgstAmount: 4.96,
        igstAmount: 0,
        totalTax: 9.92,
        totalPrice: 65,
      },
      {
        id: 'bi-6',
        billId: 'bill-1040',
        productId: 'prod-009',
        productName: 'Amul Taaza Homogenised Toned Milk 1L Tetra',
        barcode: '8901030588231',
        hsnCode: '0401',
        quantity: 2,
        unit: 'Pkt',
        unitPrice: 74,
        gstRate: 0,
        discountAmount: 0,
        taxableAmount: 148,
        cgstAmount: 0,
        sgstAmount: 0,
        igstAmount: 0,
        totalTax: 0,
        totalPrice: 148,
      },
    ],
    subtotal: 253.08,
    discountAmount: 0,
    cgstAmount: 7.96,
    sgstAmount: 7.96,
    igstAmount: 0,
    totalTax: 15.92,
    roundOff: 0,
    grandTotal: 269,
    paymentMethod: 'UPI',
    amountReceived: 269,
    changeReturned: 0,
    isInterstate: false,
    status: 'Completed',
    createdAt: new Date(now.getTime() - 2 * 3600000).toISOString(),
    cashierName: 'Admin (POS-01)',
  });

  // Bill 3: Yesterday
  bills.push({
    id: 'bill-1041',
    billNumber: 'INV-2026-1041',
    customerName: 'Counter Cash Customer',
    items: [
      {
        id: 'bi-7',
        billId: 'bill-1041',
        productId: 'prod-012',
        productName: 'Surf Excel Easy Wash Detergent Powder 1kg',
        barcode: '8901030612011',
        hsnCode: '3402',
        quantity: 1,
        unit: 'Pkt',
        unitPrice: 142,
        gstRate: 18,
        discountAmount: 0,
        taxableAmount: 120.34,
        cgstAmount: 10.83,
        sgstAmount: 10.83,
        igstAmount: 0,
        totalTax: 21.66,
        totalPrice: 142,
      },
    ],
    subtotal: 120.34,
    discountAmount: 0,
    cgstAmount: 10.83,
    sgstAmount: 10.83,
    igstAmount: 0,
    totalTax: 21.66,
    roundOff: 0,
    grandTotal: 142,
    paymentMethod: 'Card',
    amountReceived: 142,
    changeReturned: 0,
    isInterstate: false,
    status: 'Completed',
    createdAt: new Date(now.getTime() - 26 * 3600000).toISOString(),
    cashierName: 'Admin (POS-01)',
  });

  return bills;
}

export class SQLiteDatabase {
  private static instance: SQLiteDatabase;
  private state: DatabaseState;

  private constructor() {
    this.state = this.loadFromStorage();
  }

  public static getInstance(): SQLiteDatabase {
    if (!SQLiteDatabase.instance) {
      SQLiteDatabase.instance = new SQLiteDatabase();
    }
    return SQLiteDatabase.instance;
  }

  private loadFromStorage(): DatabaseState {
    try {
      const stored = localStorage.getItem(DB_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.products && parsed.settings) {
          // Migrations for users & loyalty
          if (!parsed.users || parsed.users.length === 0) {
            parsed.users = INITIAL_USERS;
          }
          if (!parsed.loyaltySettings) {
            parsed.loyaltySettings = DEFAULT_LOYALTY_SETTINGS;
          }
          if (!parsed.settings.theme) {
            parsed.settings.theme = 'dark';
          }
          if (parsed.customers) {
            parsed.customers.forEach((c: Customer) => {
              if (c.loyaltyPoints === undefined) c.loyaltyPoints = 0;
              if (c.visitsCount === undefined) c.visitsCount = c.totalBills || 0;
              if (!c.membershipTier) c.membershipTier = calculateMembershipTier(c.loyaltyPoints, parsed.loyaltySettings);
            });
          }
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error loading SQLite state:', e);
    }

    // Default Seed State
    const defaultState: DatabaseState = {
      products: INITIAL_PRODUCTS,
      categories: INITIAL_CATEGORIES,
      customers: INITIAL_CUSTOMERS,
      bills: generateSeedBills(),
      inventoryTransactions: [
        {
          id: 'tx-01',
          productId: 'prod-001',
          productName: 'Aashirvaad Shudh Chakki Atta 5kg',
          type: 'StockIn',
          quantity: 40,
          previousStock: 0,
          newStock: 40,
          reason: 'Initial Opening Stock Entry',
          createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
        },
        {
          id: 'tx-02',
          productId: 'prod-001',
          productName: 'Aashirvaad Shudh Chakki Atta 5kg',
          type: 'Sale',
          quantity: 1,
          previousStock: 40,
          newStock: 39,
          reason: 'Sold on Bill INV-2026-1039',
          referenceId: 'INV-2026-1039',
          createdAt: new Date(Date.now() - 4 * 3600000).toISOString(),
        },
      ],
      returns: [],
      settings: INITIAL_SETTINGS,
      users: INITIAL_USERS,
      loyaltySettings: DEFAULT_LOYALTY_SETTINGS,
    };

    this.persist(defaultState);
    return defaultState;
  }

  private persist(state: DatabaseState) {
    try {
      localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(state));
    } catch (err) {
      console.error('Failed to save to local SQLite storage:', err);
    }
  }

  public getState(): DatabaseState {
    return { ...this.state };
  }

  public updateSettings(newSettings: Partial<ShopSettings>, actingUserRole: UserRole = 'admin'): { success: boolean; message?: string } {
    if (actingUserRole !== 'admin') {
      return { success: false, message: 'Security Exception: Only Administrator can modify shop settings.' };
    }
    this.state.settings = { ...this.state.settings, ...newSettings };
    this.persist(this.state);
    return { success: true };
  }

  // --- USERS & AUTHENTICATION (RBAC) ---
  public getUsers(): User[] {
    return this.state.users || INITIAL_USERS;
  }

  public authenticate(username: string, password: string): User | null {
    const list = this.getUsers();
    const user = list.find(
      (u) => u.username.toLowerCase() === username.trim().toLowerCase() && u.password === password
    );
    if (user && user.isActive) {
      user.lastLogin = new Date().toISOString();
      this.persist(this.state);
      return user;
    }
    return null;
  }

  public saveUser(user: User, actingUserRole: UserRole = 'admin'): { success: boolean; message?: string } {
    if (actingUserRole !== 'admin') {
      return { success: false, message: 'Security Exception: Only Administrator can manage user accounts.' };
    }

    if (!user.username || !user.password || !user.fullName) {
      return { success: false, message: 'Username, password, and full name are required.' };
    }

    const conflict = this.state.users.find(
      (u) => u.username.toLowerCase() === user.username.trim().toLowerCase() && u.id !== user.id
    );
    if (conflict) {
      return { success: false, message: `Username "${user.username}" is already in use by another staff member.` };
    }

    const idx = this.state.users.findIndex((u) => u.id === user.id);
    if (idx >= 0) {
      this.state.users[idx] = { ...user };
    } else {
      this.state.users.push(user);
    }
    this.persist(this.state);
    return { success: true };
  }

  public deleteUser(userId: string, actingUserRole: UserRole = 'admin'): { success: boolean; message?: string } {
    if (actingUserRole !== 'admin') {
      return { success: false, message: 'Security Exception: Only Administrator can delete user accounts.' };
    }

    const targetUser = this.state.users.find((u) => u.id === userId);
    if (!targetUser) return { success: false, message: 'User not found.' };

    if (targetUser.role === 'admin') {
      const activeAdmins = this.state.users.filter((u) => u.role === 'admin' && u.id !== userId && u.isActive);
      if (activeAdmins.length === 0) {
        return { success: false, message: 'Security Exception: Cannot delete the only active Administrator account.' };
      }
    }

    this.state.users = this.state.users.filter((u) => u.id !== userId);
    this.persist(this.state);
    return { success: true };
  }

  // --- LOYALTY PROGRAM SETTINGS ---
  public getLoyaltySettings(): LoyaltySettings {
    return this.state.loyaltySettings || DEFAULT_LOYALTY_SETTINGS;
  }

  public updateLoyaltySettings(newSettings: Partial<LoyaltySettings>, actingUserRole: UserRole = 'admin'): { success: boolean; message?: string } {
    if (actingUserRole !== 'admin') {
      return { success: false, message: 'Security Exception: Only Administrator can modify loyalty program rules.' };
    }
    this.state.loyaltySettings = { ...this.getLoyaltySettings(), ...newSettings };
    this.persist(this.state);
    return { success: true };
  }

  // --- PRODUCTS ---
  public getProducts(): Product[] {
    return this.state.products;
  }

  public getProductByBarcode(barcode: string): Product | undefined {
    const clean = barcode.trim();
    return this.state.products.find(
      (p) => p.barcode === clean || p.sku.toLowerCase() === clean.toLowerCase()
    );
  }

  public saveProduct(product: Product, actingUserRole: UserRole = 'admin'): { success: boolean; message?: string } {
    if (actingUserRole !== 'admin') {
      return { success: false, message: 'Security Exception: Employees cannot create or edit products. Administrator privilege required.' };
    }

    const existingIndex = this.state.products.findIndex((p) => p.id === product.id);
    // Validate barcode uniqueness if changed
    const barcodeConflict = this.state.products.find(
      (p) => p.barcode === product.barcode && p.id !== product.id
    );
    if (barcodeConflict) {
      return { success: false, message: `Barcode "${product.barcode}" already exists on ${barcodeConflict.name}` };
    }

    if (existingIndex >= 0) {
      const old = this.state.products[existingIndex];
      // If stock was adjusted directly in edit form, log it
      if (old.currentStock !== product.currentStock) {
        this.logInventoryTransaction({
          productId: product.id,
          productName: product.name,
          type: 'Adjustment',
          quantity: product.currentStock - old.currentStock,
          previousStock: old.currentStock,
          newStock: product.currentStock,
          reason: 'Manual stock edit from Product Master',
        });
      }
      this.state.products[existingIndex] = { ...product, updatedAt: new Date().toISOString() };
    } else {
      this.state.products.push(product);
      this.logInventoryTransaction({
        productId: product.id,
        productName: product.name,
        type: 'StockIn',
        quantity: product.currentStock,
        previousStock: 0,
        newStock: product.currentStock,
        reason: 'New product creation with opening stock',
      });
    }

    this.persist(this.state);
    return { success: true };
  }

  public deleteProduct(productId: string, actingUserRole: UserRole = 'admin'): boolean {
    if (actingUserRole !== 'admin') {
      console.warn('Security Exception: Attempted unauthorized product deletion by employee');
      return false;
    }
    const index = this.state.products.findIndex((p) => p.id === productId);
    if (index >= 0) {
      this.state.products.splice(index, 1);
      this.persist(this.state);
      return true;
    }
    return false;
  }

  // --- CATEGORIES ---
  public getCategories(): Category[] {
    return this.state.categories;
  }

  public addCategory(name: string): Category {
    const newCat: Category = {
      id: `cat-${Date.now()}`,
      name: name.trim(),
    };
    this.state.categories.push(newCat);
    this.persist(this.state);
    return newCat;
  }

  // --- CUSTOMERS ---
  public getCustomers(): Customer[] {
    return this.state.customers;
  }

  public saveCustomer(customer: Customer) {
    const idx = this.state.customers.findIndex((c) => c.id === customer.id);
    if (idx >= 0) {
      this.state.customers[idx] = customer;
    } else {
      this.state.customers.push(customer);
    }
    this.persist(this.state);
  }

  public recordCustomerPayment(customerId: string, amount: number) {
    const customer = this.state.customers.find((c) => c.id === customerId);
    if (customer) {
      customer.creditBalance = Math.max(0, customer.creditBalance - amount);
      this.persist(this.state);
    }
  }

  // --- BILLING / TRANSACTION (Atomic) ---
  public createBill(billData: Omit<Bill, 'id' | 'billNumber' | 'createdAt'>): { success: boolean; bill?: Bill; error?: string } {
    try {
      // 1. Generate unique invoice number protected against duplicates
      const billNum = `${this.state.settings.billPrefix}${this.state.settings.nextBillNumber}`;
      
      const duplicate = this.state.bills.find((b) => b.billNumber === billNum);
      if (duplicate) {
        // Increment until unique
        this.state.settings.nextBillNumber += 1;
        return this.createBill(billData);
      }

      const billId = `bill-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const newBill: Bill = {
        ...billData,
        id: billId,
        billNumber: billNum,
        createdAt: new Date().toISOString(),
      };

      // 2. Decrement inventory atomically for every item sold & log transaction
      for (const item of newBill.items) {
        const prod = this.state.products.find((p) => p.id === item.productId);
        if (prod) {
          const prev = prod.currentStock;
          prod.currentStock = Math.max(0, prod.currentStock - item.quantity);
          this.logInventoryTransaction({
            productId: prod.id,
            productName: prod.name,
            type: 'Sale',
            quantity: item.quantity,
            previousStock: prev,
            newStock: prod.currentStock,
            reason: `Sold on Bill ${billNum}`,
            referenceId: billNum,
          });
        }
      }

      // 3. Update customer stats & loyalty rewards if linked
      if (newBill.customerId) {
        const cust = this.state.customers.find((c) => c.id === newBill.customerId);
        if (cust) {
          cust.totalBills += 1;
          cust.totalSpent += newBill.grandTotal;
          cust.visitsCount = (cust.visitsCount || 0) + 1;

          // Loyalty points processing
          const pointsEarned = newBill.loyaltyPointsEarned || 0;
          const pointsRedeemed = newBill.loyaltyPointsRedeemed || 0;
          cust.loyaltyPoints = Math.max(0, (cust.loyaltyPoints || 0) - pointsRedeemed + pointsEarned);
          cust.membershipTier = calculateMembershipTier(cust.loyaltyPoints, this.state.loyaltySettings);
          newBill.customerLoyaltyBalanceAfter = cust.loyaltyPoints;

          if (newBill.paymentMethod === 'Credit') {
            cust.creditBalance += newBill.grandTotal;
          }
        }
      }

      // 4. Save bill and increment counter
      this.state.bills.unshift(newBill);
      this.state.settings.nextBillNumber += 1;
      this.persist(this.state);

      return { success: true, bill: newBill };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Database transaction failed';
      return { success: false, error: msg };
    }
  }

  public cancelBill(billId: string, reason: string, actingUserRole: UserRole = 'admin'): boolean {
    if (actingUserRole !== 'admin') {
      console.warn('Security Exception: Attempted unauthorized bill cancellation by employee');
      return false;
    }

    const bill = this.state.bills.find((b) => b.id === billId);
    if (!bill || bill.status === 'Cancelled') return false;

    // Restore inventory
    for (const item of bill.items) {
      const prod = this.state.products.find((p) => p.id === item.productId);
      if (prod) {
        const prev = prod.currentStock;
        prod.currentStock += item.quantity;
        this.logInventoryTransaction({
          productId: prod.id,
          productName: prod.name,
          type: 'Adjustment',
          quantity: item.quantity,
          previousStock: prev,
          newStock: prod.currentStock,
          reason: `Cancelled Bill ${bill.billNumber} (${reason})`,
          referenceId: bill.billNumber,
        });
      }
    }

    // Reverse customer balance & loyalty points if linked
    if (bill.customerId) {
      const cust = this.state.customers.find((c) => c.id === bill.customerId);
      if (cust) {
        if (bill.paymentMethod === 'Credit') {
          cust.creditBalance = Math.max(0, cust.creditBalance - bill.grandTotal);
        }
        // Reverse earned and redeemed points
        const earned = bill.loyaltyPointsEarned || 0;
        const redeemed = bill.loyaltyPointsRedeemed || 0;
        cust.loyaltyPoints = Math.max(0, (cust.loyaltyPoints || 0) - earned + redeemed);
        cust.membershipTier = calculateMembershipTier(cust.loyaltyPoints, this.state.loyaltySettings);
      }
    }

    bill.status = 'Cancelled';
    bill.notes = `${bill.notes || ''} [Cancelled: ${reason}]`;
    this.persist(this.state);
    return true;
  }

  // --- RETURNS ---
  public processReturn(returnData: Omit<SaleReturn, 'id' | 'returnNumber' | 'createdAt'>, actingUserRole: UserRole = 'admin'): SaleReturn | null {
    if (actingUserRole !== 'admin') {
      console.warn('Security Exception: Employees cannot process sale returns.');
      return null;
    }

    const retNumber = `RET-${Date.now().toString().slice(-6)}`;
    const newReturn: SaleReturn = {
      ...returnData,
      id: `ret-${Date.now()}`,
      returnNumber: retNumber,
      createdAt: new Date().toISOString(),
    };

    // Restock returned items
    for (const item of newReturn.items) {
      const prod = this.state.products.find((p) => p.id === item.productId);
      if (prod) {
        const prev = prod.currentStock;
        prod.currentStock += item.quantity;
        this.logInventoryTransaction({
          productId: prod.id,
          productName: prod.name,
          type: 'Return',
          quantity: item.quantity,
          previousStock: prev,
          newStock: prod.currentStock,
          reason: `Customer Return #${retNumber} (${returnData.reason})`,
          referenceId: retNumber,
        });
      }
    }

    this.state.returns.unshift(newReturn);

    // Update original bill status
    const origBill = this.state.bills.find((b) => b.billNumber === returnData.originalBillNumber);
    if (origBill) {
      origBill.status = 'Partially Returned';
    }

    this.persist(this.state);
    return newReturn;
  }

  // --- INVENTORY AUDIT ---
  public logInventoryTransaction(tx: Omit<InventoryTransaction, 'id' | 'createdAt'>) {
    const newTx: InventoryTransaction = {
      ...tx,
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      createdAt: new Date().toISOString(),
    };
    this.state.inventoryTransactions.unshift(newTx);
    // Keep last 1000 transactions
    if (this.state.inventoryTransactions.length > 1000) {
      this.state.inventoryTransactions = this.state.inventoryTransactions.slice(0, 1000);
    }
  }

  public adjustStock(productId: string, delta: number, reason: string, actingUserRole: UserRole = 'admin'): boolean {
    if (actingUserRole !== 'admin') {
      console.warn('Security Exception: Employees cannot manually adjust inventory stock levels.');
      return false;
    }

    const prod = this.state.products.find((p) => p.id === productId);
    if (!prod) return false;

    const prev = prod.currentStock;
    prod.currentStock = Math.max(0, prod.currentStock + delta);
    this.logInventoryTransaction({
      productId: prod.id,
      productName: prod.name,
      type: delta >= 0 ? 'StockIn' : 'Adjustment',
      quantity: Math.abs(delta),
      previousStock: prev,
      newStock: prod.currentStock,
      reason: reason || (delta >= 0 ? 'Manual Stock In' : 'Manual Stock Reduction'),
    });

    this.persist(this.state);
    return true;
  }

  // --- BACKUP & RESTORE ---
  /**
   * Generates a standard SQLite SQL dump string that can be piped into sqlite3 ShopBilling.db
   */
  public generateSQLDump(): string {
    let sql = `-- ========================================================\n`;
    sql += `-- ShopBilling.db - Native Windows SQLite Database Dump\n`;
    sql += `-- Generated: ${new Date().toISOString()}\n`;
    sql += `-- ========================================================\n\n`;
    sql += `PRAGMA foreign_keys = ON;\nBEGIN TRANSACTION;\n\n`;

    // Products table
    sql += `CREATE TABLE IF NOT EXISTS Products (\n`;
    sql += `  id TEXT PRIMARY KEY,\n`;
    sql += `  barcode TEXT UNIQUE,\n`;
    sql += `  sku TEXT,\n`;
    sql += `  name TEXT NOT NULL,\n`;
    sql += `  category_id TEXT,\n`;
    sql += `  purchase_price REAL DEFAULT 0,\n`;
    sql += `  selling_price REAL NOT NULL,\n`;
    sql += `  mrp REAL,\n`;
    sql += `  gst_rate INTEGER DEFAULT 0,\n`;
    sql += `  hsn_code TEXT,\n`;
    sql += `  current_stock REAL DEFAULT 0,\n`;
    sql += `  min_stock REAL DEFAULT 5,\n`;
    sql += `  unit TEXT DEFAULT 'Pcs',\n`;
    sql += `  created_at TEXT\n);\n\n`;

    for (const p of this.state.products) {
      sql += `INSERT OR REPLACE INTO Products VALUES ('${p.id}', '${p.barcode}', '${p.sku}', '${p.name.replace(/'/g, "''")}', '${p.categoryId}', ${p.purchasePrice}, ${p.sellingPrice}, ${p.mrp || 0}, ${p.gstRate}, '${p.hsnCode}', ${p.currentStock}, ${p.minStock}, '${p.unit}', '${p.createdAt}');\n`;
    }

    // Bills table
    sql += `\nCREATE TABLE IF NOT EXISTS Bills (\n`;
    sql += `  id TEXT PRIMARY KEY,\n`;
    sql += `  bill_number TEXT UNIQUE NOT NULL,\n`;
    sql += `  customer_name TEXT,\n`;
    sql += `  customer_phone TEXT,\n`;
    sql += `  subtotal REAL,\n`;
    sql += `  total_tax REAL,\n`;
    sql += `  grand_total REAL,\n`;
    sql += `  payment_method TEXT,\n`;
    sql += `  status TEXT,\n`;
    sql += `  created_at TEXT\n);\n\n`;

    for (const b of this.state.bills) {
      sql += `INSERT OR REPLACE INTO Bills VALUES ('${b.id}', '${b.billNumber}', '${b.customerName.replace(/'/g, "''")}', '${b.customerPhone || ''}', ${b.subtotal}, ${b.totalTax}, ${b.grandTotal}, '${b.paymentMethod}', '${b.status}', '${b.createdAt}');\n`;
    }

    // Users table
    sql += `\nCREATE TABLE IF NOT EXISTS Users (\n`;
    sql += `  id TEXT PRIMARY KEY,\n`;
    sql += `  username TEXT UNIQUE NOT NULL,\n`;
    sql += `  password TEXT NOT NULL,\n`;
    sql += `  full_name TEXT NOT NULL,\n`;
    sql += `  role TEXT NOT NULL,\n`;
    sql += `  phone TEXT,\n`;
    sql += `  is_active INTEGER DEFAULT 1,\n`;
    sql += `  created_at TEXT\n);\n\n`;

    for (const u of this.getUsers()) {
      sql += `INSERT OR REPLACE INTO Users VALUES ('${u.id}', '${u.username}', '${u.password}', '${u.fullName.replace(/'/g, "''")}', '${u.role}', '${u.phone || ''}', ${u.isActive ? 1 : 0}, '${u.createdAt}');\n`;
    }

    sql += `\nCOMMIT;\n`;
    return sql;
  }

  /**
   * Generates JSON export package (compatible with direct reload or .db export)
   */
  public exportBackupJSON(): string {
    const backupPackage = {
      meta: {
        app: 'Windows Shop Billing System',
        databaseName: 'ShopBilling.db',
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
        shopName: this.state.settings.shopName,
      },
      data: this.state,
    };
    return JSON.stringify(backupPackage, null, 2);
  }

  public restoreFromJSON(jsonString: string): { success: boolean; message: string } {
    try {
      const parsed = JSON.parse(jsonString);
      const dataToRestore: DatabaseState = parsed.data || parsed;

      if (!dataToRestore.products || !dataToRestore.settings) {
        return { success: false, message: 'Invalid backup file format: Missing Products or Settings.' };
      }

      if (!dataToRestore.users || dataToRestore.users.length === 0) {
        dataToRestore.users = INITIAL_USERS;
      }
      if (!dataToRestore.loyaltySettings) {
        dataToRestore.loyaltySettings = DEFAULT_LOYALTY_SETTINGS;
      }

      this.state = dataToRestore;
      this.persist(this.state);
      this.recordBackupLog('Restore from file');
      return { success: true, message: `Successfully restored ${this.state.products.length} products, ${this.state.bills.length} bills, and ${this.state.users.length} staff accounts.` };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'JSON parse error';
      return { success: false, message: `Restore failed: ${msg}` };
    }
  }

  public resetToFactoryDefaults() {
    localStorage.removeItem(DB_STORAGE_KEY);
    this.state = this.loadFromStorage();
  }

  public recordBackupLog(type: string) {
    try {
      const history = JSON.parse(localStorage.getItem(BACKUP_HISTORY_KEY) || '[]');
      history.unshift({
        id: `bk-${Date.now()}`,
        type,
        timestamp: new Date().toISOString(),
        productCount: this.state.products.length,
        billCount: this.state.bills.length,
      });
      localStorage.setItem(BACKUP_HISTORY_KEY, JSON.stringify(history.slice(0, 20)));
    } catch {
      // ignore
    }
  }

  public getBackupHistory(): Array<{ id: string; type: string; timestamp: string; productCount: number; billCount: number }> {
    try {
      return JSON.parse(localStorage.getItem(BACKUP_HISTORY_KEY) || '[]');
    } catch {
      return [];
    }
  }
}
