/**
 * Main Shop & POS Context
 * State management for active billing, products, inventory, customers, sales, and settings
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  ActiveTab,
  AppTheme,
  Bill,
  CartItem,
  Category,
  Customer,
  HeldBill,
  InventoryTransaction,
  LoyaltySettings,
  PaymentMethod,
  Product,
  SaleReturn,
  ShopSettings,
  User,
} from '../types';
import { SQLiteDatabase, calculatePointsEarned, INITIAL_USERS, DEFAULT_LOYALTY_SETTINGS } from '../db/sqlite';
import { soundManager } from '../utils/audio';

interface ShopContextType {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  // Auth & RBAC
  currentUser: User | null;
  isLoggedIn: boolean;
  isAdmin: boolean;
  isEmployee: boolean;
  users: User[];
  login: (username: string, password: string) => { success: boolean; message?: string };
  logout: () => void;
  isLoginModalOpen: boolean;
  setIsLoginModalOpen: (open: boolean) => void;
  addUser: (user: User) => { success: boolean; message?: string };
  updateUser: (user: User) => { success: boolean; message?: string };
  deleteUser: (userId: string) => { success: boolean; message?: string };
  accessDeniedMessage: string | null;
  setAccessDeniedMessage: (msg: string | null) => void;
  // Theme
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  toggleTheme: () => void;
  // Loyalty Program
  loyaltySettings: LoyaltySettings;
  updateLoyaltySettings: (settings: Partial<LoyaltySettings>) => { success: boolean; message?: string };
  loyaltyPointsToRedeem: number;
  setLoyaltyPointsToRedeem: (pts: number) => void;
  isRedeemingLoyaltyPoints: boolean;
  setIsRedeemingLoyaltyPoints: (redeem: boolean) => void;
  loyaltyDiscountAmount: number;
  loyaltyPointsEarnedOnBill: number;
  maxRedeemablePointsForCurrentBill: number;
  // Database entities
  products: Product[];
  categories: Category[];
  customers: Customer[];
  bills: Bill[];
  inventoryTransactions: InventoryTransaction[];
  returns: SaleReturn[];
  settings: ShopSettings;
  // Cart & Active Billing
  cart: CartItem[];
  selectedCustomer: Customer | null;
  setSelectedCustomer: (cust: Customer | null) => void;
  paymentMethod: PaymentMethod;
  setPaymentMethod: (pm: PaymentMethod) => void;
  billDiscount: number;
  setBillDiscount: (d: number) => void;
  isInterstate: boolean;
  setIsInterstate: (v: boolean) => void;
  amountReceived: number;
  setAmountReceived: (amt: number) => void;
  billNotes: string;
  setBillNotes: (notes: string) => void;
  // Cart Actions
  addToCart: (product: Product, quantity?: number) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  // Computations
  cartSubtotal: number;
  cartTotalTax: number;
  cartCgst: number;
  cartSgst: number;
  cartIgst: number;
  cartRoundOff: number;
  cartGrandTotal: number;
  changeDue: number;
  // Bill actions
  completeCurrentBill: (printReceipt?: boolean) => { success: boolean; bill?: Bill; error?: string };
  cancelBill: (billId: string, reason: string) => boolean;
  // Held bills
  heldBills: HeldBill[];
  holdCurrentBill: () => boolean;
  recallHeldBill: (heldId: string) => void;
  removeHeldBill: (heldId: string) => void;
  // Print & Receipt Modal
  activeBillForPrint: Bill | null;
  setActiveBillForPrint: (bill: Bill | null) => void;
  isReceiptModalOpen: boolean;
  setIsReceiptModalOpen: (open: boolean) => void;
  openReceiptForBill: (bill: Bill) => void;
  // DB Operations
  saveProduct: (product: Product) => { success: boolean; message?: string };
  deleteProduct: (productId: string) => boolean;
  addCategory: (name: string) => Category;
  saveCustomer: (customer: Customer) => void;
  recordCustomerPayment: (customerId: string, amount: number) => void;
  adjustStock: (productId: string, delta: number, reason: string) => boolean;
  processReturn: (returnData: Omit<SaleReturn, 'id' | 'returnNumber' | 'createdAt'>) => SaleReturn | null;
  updateSettings: (newSettings: Partial<ShopSettings>) => { success: boolean; message?: string };
  reloadFromDB: () => void;
  barcodeInputRef: React.RefObject<HTMLInputElement | null>;
  focusBarcodeInput: () => void;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export const ShopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const db = SQLiteDatabase.getInstance();

  const [activeTab, setActiveTabState] = useState<ActiveTab>('billing');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [inventoryTransactions, setInventoryTransactions] = useState<InventoryTransaction[]>([]);
  const [returns, setReturns] = useState<SaleReturn[]>([]);
  const [settings, setSettings] = useState<ShopSettings>(db.getState().settings);
  const [users, setUsers] = useState<User[]>(() => db.getUsers());
  const [loyaltySettings, setLoyaltySettings] = useState<LoyaltySettings>(() => db.getLoyaltySettings());

  // User Authentication & Session State
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem('ShopBilling_ActiveUser');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // ignore
    }
    // Default logged in as Administrator
    return INITIAL_USERS[0];
  });
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [accessDeniedMessage, setAccessDeniedMessage] = useState<string | null>(null);

  const isLoggedIn = currentUser !== null;
  const isAdmin = currentUser?.role === 'admin';
  const isEmployee = currentUser?.role === 'employee';

  // Theme Management
  const [theme, setThemeState] = useState<AppTheme>(() => {
    return db.getState().settings.theme || 'dark';
  });

  const setTheme = (newTheme: AppTheme) => {
    setThemeState(newTheme);
    db.updateSettings({ theme: newTheme }, currentUser?.role || 'admin');
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('theme-light');
      root.classList.remove('theme-dark');
      document.body.classList.remove('bg-slate-900', 'text-slate-100');
      document.body.classList.add('bg-slate-100', 'text-slate-800');
    } else {
      root.classList.add('theme-dark');
      root.classList.remove('theme-light');
      document.body.classList.add('bg-slate-900', 'text-slate-100');
      document.body.classList.remove('bg-slate-100', 'text-slate-800');
    }
  }, [theme]);

  // Tab switching with RBAC guards
  const setActiveTab = (tab: ActiveTab) => {
    if (currentUser?.role === 'employee' && tab !== 'billing') {
      soundManager.playErrorBeep();
      setAccessDeniedMessage(`Access Restricted: Employee role is not authorized to access "${tab.toUpperCase()}". Only Billing terminal is allowed.`);
      return;
    }
    setAccessDeniedMessage(null);
    setActiveTabState(tab);
  };

  // Active Billing State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [billDiscount, setBillDiscount] = useState<number>(0);
  const [isInterstate, setIsInterstate] = useState<boolean>(false);
  const [amountReceived, setAmountReceived] = useState<number>(0);
  const [billNotes, setBillNotes] = useState<string>('');
  const [heldBills, setHeldBills] = useState<HeldBill[]>([]);

  // Customer Loyalty in Active Bill
  const [loyaltyPointsToRedeem, setLoyaltyPointsToRedeem] = useState<number>(0);
  const [isRedeemingLoyaltyPoints, setIsRedeemingLoyaltyPoints] = useState<boolean>(false);

  // Print Modal
  const [activeBillForPrint, setActiveBillForPrint] = useState<Bill | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState<boolean>(false);

  const barcodeInputRef = React.useRef<HTMLInputElement | null>(null);

  const focusBarcodeInput = useCallback(() => {
    if (barcodeInputRef.current) {
      barcodeInputRef.current.focus();
      barcodeInputRef.current.select();
    }
  }, []);

  const reloadFromDB = useCallback(() => {
    const state = db.getState();
    setProducts([...state.products]);
    setCategories([...state.categories]);
    setCustomers([...state.customers]);
    setBills([...state.bills]);
    setInventoryTransactions([...state.inventoryTransactions]);
    setReturns([...state.returns]);
    setSettings({ ...state.settings });
    setUsers([...(state.users || INITIAL_USERS)]);
    setLoyaltySettings({ ...(state.loyaltySettings || DEFAULT_LOYALTY_SETTINGS) });
    soundManager.enabled = state.settings.enableSoundBeep;

    // Refresh selected customer state if updated in DB
    if (selectedCustomer) {
      const refreshed = state.customers.find((c) => c.id === selectedCustomer.id);
      if (refreshed) {
        setSelectedCustomer(refreshed);
      }
    }
  }, [db, selectedCustomer]);

  useEffect(() => {
    reloadFromDB();
  }, [reloadFromDB]);

  // Compute Cart Financials
  let rawSubtotal = 0;
  let rawCgst = 0;
  let rawSgst = 0;
  let rawIgst = 0;

  cart.forEach((item) => {
    rawSubtotal += item.taxableAmount;
    if (isInterstate) {
      rawIgst += item.igstAmount;
    } else {
      rawCgst += item.cgstAmount;
    }
  });

  const cartSubtotal = Number(rawSubtotal.toFixed(2));
  const cartCgst = Number(rawCgst.toFixed(2));
  const cartSgst = Number(rawSgst.toFixed(2));
  const cartIgst = Number(rawIgst.toFixed(2));
  const cartTotalTax = isInterstate ? cartIgst : Number((cartCgst + cartSgst).toFixed(2));

  // Compute maximum allowable loyalty redemption for this bill
  const rawGrandBeforeLoyalty = Math.max(0, cartSubtotal + cartTotalTax - billDiscount);
  const customerBalance = selectedCustomer?.loyaltyPoints || 0;

  let maxRedeemablePointsForCurrentBill = 0;
  if (
    selectedCustomer &&
    loyaltySettings.enabled &&
    customerBalance >= loyaltySettings.minPointsToRedeem &&
    rawGrandBeforeLoyalty > 0
  ) {
    const maxDiscountAllowed = rawGrandBeforeLoyalty * (loyaltySettings.maxRedeemPercentagePerBill / 100);
    const maxPtsFromDiscount = Math.floor(maxDiscountAllowed / (loyaltySettings.redemptionValuePerPoint || 1));
    maxRedeemablePointsForCurrentBill = Math.min(
      customerBalance,
      loyaltySettings.maxPointsPerBill,
      maxPtsFromDiscount
    );
  }

  // Adjust redeemed points if it exceeds allowable
  useEffect(() => {
    if (loyaltyPointsToRedeem > maxRedeemablePointsForCurrentBill) {
      setLoyaltyPointsToRedeem(maxRedeemablePointsForCurrentBill);
    }
  }, [loyaltyPointsToRedeem, maxRedeemablePointsForCurrentBill]);

  // Reset redemption when customer removed
  useEffect(() => {
    if (!selectedCustomer) {
      setIsRedeemingLoyaltyPoints(false);
      setLoyaltyPointsToRedeem(0);
    }
  }, [selectedCustomer]);

  const loyaltyDiscountAmount = isRedeemingLoyaltyPoints
    ? Number((loyaltyPointsToRedeem * loyaltySettings.redemptionValuePerPoint).toFixed(2))
    : 0;

  const rawGrand = Math.max(0, rawGrandBeforeLoyalty - loyaltyDiscountAmount);
  const roundedGrand = Math.round(rawGrand);
  const cartRoundOff = Number((roundedGrand - rawGrand).toFixed(2));
  const cartGrandTotal = roundedGrand;

  const changeDue = amountReceived > 0 ? Math.max(0, amountReceived - cartGrandTotal) : 0;

  // Calculate points to be earned by customer on this purchase
  const customerTier = selectedCustomer?.membershipTier || 'Bronze';
  const loyaltyPointsEarnedOnBill =
    selectedCustomer && loyaltySettings.enabled
      ? calculatePointsEarned(cartGrandTotal, customerTier, loyaltySettings)
      : 0;

  const addToCart = (product: Product, qtyToAdd: number = 1) => {
    soundManager.playBarcodeBeep();

    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((i) => i.productId === product.id);
      const newCart = [...prevCart];

      let newQty = qtyToAdd;
      if (existingIndex >= 0) {
        newQty = prevCart[existingIndex].quantity + qtyToAdd;
      }

      // Calculate unit economics
      const rate = product.sellingPrice;
      const gstRate = product.gstRate;
      const taxable = Number((rate * newQty).toFixed(2));
      const taxRateHalf = gstRate / 2 / 100;
      const cgst = Number((taxable * taxRateHalf).toFixed(2));
      const sgst = Number((taxable * taxRateHalf).toFixed(2));
      const igst = Number((taxable * (gstRate / 100)).toFixed(2));
      const totalTax = isInterstate ? igst : cgst + sgst;
      const total = Number((taxable + totalTax).toFixed(2));

      const updatedItem: CartItem = {
        productId: product.id,
        barcode: product.barcode,
        name: product.name,
        hsnCode: product.hsnCode,
        unit: product.unit,
        unitPrice: rate,
        quantity: newQty,
        gstRate: product.gstRate,
        discountAmount: 0,
        taxableAmount: taxable,
        cgstAmount: cgst,
        sgstAmount: sgst,
        igstAmount: igst,
        totalTax: totalTax,
        totalPrice: total,
      };

      if (existingIndex >= 0) {
        newCart[existingIndex] = updatedItem;
      } else {
        newCart.push(updatedItem);
      }
      return newCart;
    });
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart((prev) =>
      prev.map((item) => {
        if (item.productId !== productId) return item;
        const taxable = Number((item.unitPrice * quantity - item.discountAmount).toFixed(2));
        const halfRate = item.gstRate / 2 / 100;
        const cgst = Number((taxable * halfRate).toFixed(2));
        const sgst = Number((taxable * halfRate).toFixed(2));
        const igst = Number((taxable * (item.gstRate / 100)).toFixed(2));
        const totalTax = isInterstate ? igst : cgst + sgst;
        return {
          ...item,
          quantity,
          taxableAmount: taxable,
          cgstAmount: cgst,
          sgstAmount: sgst,
          igstAmount: igst,
          totalTax,
          totalPrice: Number((taxable + totalTax).toFixed(2)),
        };
      })
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setSelectedCustomer(null);
    setBillDiscount(0);
    setAmountReceived(0);
    setBillNotes('');
    setPaymentMethod('Cash');
    setIsRedeemingLoyaltyPoints(false);
    setLoyaltyPointsToRedeem(0);
    focusBarcodeInput();
  };

  const holdCurrentBill = (): boolean => {
    if (cart.length === 0) return false;
    const newHeld: HeldBill = {
      id: `hold-${Date.now()}`,
      timestamp: new Date().toISOString(),
      customerName: selectedCustomer?.name || 'Walk-in Customer',
      customerPhone: selectedCustomer?.phone,
      cart: [...cart],
      paymentMethod,
      discountAmount: billDiscount,
      notes: billNotes,
    };
    setHeldBills((prev) => [newHeld, ...prev]);
    clearCart();
    return true;
  };

  const recallHeldBill = (heldId: string) => {
    const held = heldBills.find((h) => h.id === heldId);
    if (!held) return;
    setCart(held.cart);
    setPaymentMethod(held.paymentMethod);
    setBillDiscount(held.discountAmount);
    setBillNotes(held.notes || '');
    if (held.customerPhone) {
      const found = customers.find((c) => c.phone === held.customerPhone);
      if (found) setSelectedCustomer(found);
    }
    setHeldBills((prev) => prev.filter((h) => h.id !== heldId));
    setActiveTab('billing');
  };

  const removeHeldBill = (heldId: string) => {
    setHeldBills((prev) => prev.filter((h) => h.id !== heldId));
  };

  const completeCurrentBill = (printReceipt: boolean = true) => {
    if (cart.length === 0) {
      soundManager.playErrorBeep();
      return { success: false, error: 'Shopping cart is empty' };
    }

    const billItems = cart.map((item, index) => ({
      id: `bi-${Date.now()}-${index}`,
      billId: '',
      productId: item.productId,
      productName: item.name,
      barcode: item.barcode,
      hsnCode: item.hsnCode,
      quantity: item.quantity,
      unit: item.unit,
      unitPrice: item.unitPrice,
      gstRate: item.gstRate,
      discountAmount: item.discountAmount,
      taxableAmount: item.taxableAmount,
      cgstAmount: isInterstate ? 0 : item.cgstAmount,
      sgstAmount: isInterstate ? 0 : item.sgstAmount,
      igstAmount: isInterstate ? item.igstAmount : 0,
      totalTax: item.totalTax,
      totalPrice: item.totalPrice,
    }));

    const cashierTitle = currentUser
      ? `${currentUser.fullName} (${currentUser.role === 'admin' ? 'Admin' : 'Cashier'})`
      : 'Admin (POS-01)';

    const result = db.createBill({
      customerId: selectedCustomer?.id,
      customerName: selectedCustomer?.name || 'Walk-in Customer',
      customerPhone: selectedCustomer?.phone,
      customerGstin: selectedCustomer?.gstin,
      items: billItems,
      subtotal: cartSubtotal,
      discountAmount: billDiscount,
      cgstAmount: isInterstate ? 0 : cartCgst,
      sgstAmount: isInterstate ? 0 : cartSgst,
      igstAmount: isInterstate ? cartIgst : 0,
      totalTax: cartTotalTax,
      roundOff: cartRoundOff,
      grandTotal: cartGrandTotal,
      paymentMethod,
      amountReceived: paymentMethod === 'Cash' ? (amountReceived || cartGrandTotal) : cartGrandTotal,
      changeReturned: changeDue,
      notes: billNotes,
      isInterstate,
      status: 'Completed',
      cashierName: cashierTitle,
      loyaltyPointsEarned: loyaltyPointsEarnedOnBill,
      loyaltyPointsRedeemed: isRedeemingLoyaltyPoints ? loyaltyPointsToRedeem : 0,
      loyaltyDiscountAmount,
    });

    if (result.success && result.bill) {
      soundManager.playCashRegisterChime();
      reloadFromDB();
      const savedBill = result.bill;
      clearCart();

      if (printReceipt || settings.autoPrintReceipt) {
        setActiveBillForPrint(savedBill);
        setIsReceiptModalOpen(true);
      }
      return { success: true, bill: savedBill };
    }

    soundManager.playErrorBeep();
    return { success: false, error: result.error || 'Transaction failed' };
  };

  const cancelBill = (billId: string, reason: string): boolean => {
    const ok = db.cancelBill(billId, reason, currentUser?.role || 'employee');
    if (ok) {
      reloadFromDB();
    } else {
      soundManager.playErrorBeep();
    }
    return ok;
  };

  const openReceiptForBill = (bill: Bill) => {
    setActiveBillForPrint(bill);
    setIsReceiptModalOpen(true);
  };

  // Auth Operations
  const login = (username: string, password: string) => {
    const user = db.authenticate(username, password);
    if (!user) {
      soundManager.playErrorBeep();
      return { success: false, message: 'Invalid credentials or inactive user account.' };
    }
    setCurrentUser(user);
    try {
      localStorage.setItem('ShopBilling_ActiveUser', JSON.stringify(user));
    } catch {
      // ignore
    }
    setIsLoginModalOpen(false);
    setAccessDeniedMessage(null);
    return { success: true };
  };

  const logout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('ShopBilling_ActiveUser');
    } catch {
      // ignore
    }
    setIsLoginModalOpen(true);
  };

  // Keyboard shortcut listener across entire app
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Switch User shortcut: Ctrl+L or Shift+F12
      if ((e.ctrlKey && e.key.toLowerCase() === 'l') || e.key === 'F12') {
        e.preventDefault();
        setIsLoginModalOpen(true);
        return;
      }

      if (e.key === 'F1') {
        e.preventDefault();
        setActiveTab('billing');
        focusBarcodeInput();
      } else if (e.key === 'F2') {
        e.preventDefault();
        setActiveTab('billing');
        focusBarcodeInput();
      } else if (e.key === 'F3') {
        e.preventDefault();
        if (cart.length > 0 && activeTab === 'billing') {
          completeCurrentBill(true);
        }
      } else if (e.key === 'F4') {
        e.preventDefault();
        if (bills.length > 0) {
          openReceiptForBill(bills[0]);
        }
      } else if (e.key === 'F9') {
        e.preventDefault();
        if (activeTab === 'billing' && cart.length > 0) {
          holdCurrentBill();
        }
      } else if (e.key === 'Escape') {
        if (isReceiptModalOpen) {
          setIsReceiptModalOpen(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cart, activeTab, isReceiptModalOpen, bills, focusBarcodeInput]);

  const value: ShopContextType = {
    activeTab,
    setActiveTab,
    // Auth
    currentUser,
    isLoggedIn,
    isAdmin,
    isEmployee,
    users,
    login,
    logout,
    isLoginModalOpen,
    setIsLoginModalOpen,
    addUser: (u) => {
      const res = db.saveUser(u, currentUser?.role || 'employee');
      reloadFromDB();
      return res;
    },
    updateUser: (u) => {
      const res = db.saveUser(u, currentUser?.role || 'employee');
      reloadFromDB();
      return res;
    },
    deleteUser: (id) => {
      const res = db.deleteUser(id, currentUser?.role || 'employee');
      reloadFromDB();
      return res;
    },
    accessDeniedMessage,
    setAccessDeniedMessage,
    // Theme
    theme,
    setTheme,
    toggleTheme,
    // Loyalty
    loyaltySettings,
    updateLoyaltySettings: (s) => {
      const res = db.updateLoyaltySettings(s, currentUser?.role || 'employee');
      reloadFromDB();
      return res;
    },
    loyaltyPointsToRedeem,
    setLoyaltyPointsToRedeem,
    isRedeemingLoyaltyPoints,
    setIsRedeemingLoyaltyPoints,
    loyaltyDiscountAmount,
    loyaltyPointsEarnedOnBill,
    maxRedeemablePointsForCurrentBill,
    // Database entities
    products,
    categories,
    customers,
    bills,
    inventoryTransactions,
    returns,
    settings,
    cart,
    selectedCustomer,
    setSelectedCustomer,
    paymentMethod,
    setPaymentMethod,
    billDiscount,
    setBillDiscount,
    isInterstate,
    setIsInterstate,
    amountReceived,
    setAmountReceived,
    billNotes,
    setBillNotes,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    cartSubtotal,
    cartTotalTax,
    cartCgst,
    cartSgst,
    cartIgst,
    cartRoundOff,
    cartGrandTotal,
    changeDue,
    completeCurrentBill,
    cancelBill,
    heldBills,
    holdCurrentBill,
    recallHeldBill,
    removeHeldBill,
    activeBillForPrint,
    setActiveBillForPrint,
    isReceiptModalOpen,
    setIsReceiptModalOpen,
    openReceiptForBill,
    saveProduct: (p) => {
      const res = db.saveProduct(p, currentUser?.role || 'employee');
      reloadFromDB();
      return res;
    },
    deleteProduct: (id) => {
      const res = db.deleteProduct(id, currentUser?.role || 'employee');
      reloadFromDB();
      return res;
    },
    addCategory: (name) => {
      const cat = db.addCategory(name);
      reloadFromDB();
      return cat;
    },
    saveCustomer: (c) => {
      db.saveCustomer(c);
      reloadFromDB();
    },
    recordCustomerPayment: (id, amt) => {
      db.recordCustomerPayment(id, amt);
      reloadFromDB();
    },
    adjustStock: (id, delta, reason) => {
      const res = db.adjustStock(id, delta, reason, currentUser?.role || 'employee');
      reloadFromDB();
      return res;
    },
    processReturn: (ret) => {
      const res = db.processReturn(ret, currentUser?.role || 'employee');
      reloadFromDB();
      return res;
    },
    updateSettings: (newSettings) => {
      const res = db.updateSettings(newSettings, currentUser?.role || 'employee');
      reloadFromDB();
      return res;
    },
    reloadFromDB,
    barcodeInputRef,
    focusBarcodeInput,
  };

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
};

