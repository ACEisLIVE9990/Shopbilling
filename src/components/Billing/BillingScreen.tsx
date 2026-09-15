/**
 * High-Speed POS Billing Screen
 * Engineered for Indian retail shopkeepers with barcode scanner support,
 * keyboard shortcuts, GST tax breakdown, multiple payment modes, and instant printing.
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Barcode,
  Search,
  Plus,
  Minus,
  Trash2,
  Printer,
  CheckCircle,
  Pause,
  Play,
  RotateCcw,
  UserPlus,
  IndianRupee,
  CreditCard,
  QrCode,
  Banknote,
  BookOpen,
  ArrowRight,
  AlertCircle,
  Percent,
  Award,
  Star,
  Sparkles,
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { formatINR } from '../../utils/formatters';
import { Product, PaymentMethod } from '../../types';
import { soundManager } from '../../utils/audio';

export const BillingScreen: React.FC = () => {
  const {
    products,
    customers,
    cart,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    cartSubtotal,
    cartCgst,
    cartSgst,
    cartIgst,
    cartTotalTax,
    cartRoundOff,
    cartGrandTotal,
    changeDue,
    paymentMethod,
    setPaymentMethod,
    billDiscount,
    setBillDiscount,
    isInterstate,
    setIsInterstate,
    amountReceived,
    setAmountReceived,
    selectedCustomer,
    setSelectedCustomer,
    billNotes,
    setBillNotes,
    completeCurrentBill,
    holdCurrentBill,
    heldBills,
    recallHeldBill,
    removeHeldBill,
    barcodeInputRef,
    focusBarcodeInput,
    saveCustomer,
    // Loyalty
    loyaltySettings,
    loyaltyPointsToRedeem,
    setLoyaltyPointsToRedeem,
    isRedeemingLoyaltyPoints,
    setIsRedeemingLoyaltyPoints,
    loyaltyDiscountAmount,
    loyaltyPointsEarnedOnBill,
    maxRedeemablePointsForCurrentBill,
  } = useShop();

  // Barcode / Search input state
  const [barcodeInput, setBarcodeInput] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState<boolean>(false);
  const [customerPhoneInput, setCustomerPhoneInput] = useState<string>('');
  const [customerNameInput, setCustomerNameInput] = useState<string>('');
  const [showAddCustomerModal, setShowAddCustomerModal] = useState<boolean>(false);
  const [showHeldBillsModal, setShowHeldBillsModal] = useState<boolean>(false);
  const [scanMessage, setScanMessage] = useState<{ text: string; isError?: boolean } | null>(null);

  // Auto-focus barcode input on mount
  useEffect(() => {
    focusBarcodeInput();
  }, [focusBarcodeInput]);

  // Handle Barcode Submission (from hardware USB scanner or manual entry)
  const handleBarcodeSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = barcodeInput.trim();
    if (!query) return;

    // Search by exact barcode or SKU or name match
    const matched = products.find(
      (p) =>
        p.barcode.toLowerCase() === query.toLowerCase() ||
        p.sku.toLowerCase() === query.toLowerCase() ||
        p.name.toLowerCase().includes(query.toLowerCase())
    );

    if (matched) {
      if (matched.currentStock <= 0) {
        setScanMessage({ text: `Warning: ${matched.name} is OUT OF STOCK!`, isError: true });
        soundManager.playErrorBeep();
      } else {
        addToCart(matched, 1);
        setScanMessage({ text: `Added: ${matched.name}` });
      }
      setBarcodeInput('');
    } else {
      soundManager.playErrorBeep();
      setScanMessage({ text: `Product not found for: "${query}"`, isError: true });
    }

    // Clear status message after 3 seconds
    setTimeout(() => {
      setScanMessage(null);
    }, 3000);
  };

  // Quick Customer Phone lookup
  const handleCustomerPhoneChange = (val: string) => {
    setCustomerPhoneInput(val);
    if (val.length >= 4) {
      const found = customers.find((c) => c.phone.includes(val) || c.name.toLowerCase().includes(val.toLowerCase()));
      if (found) {
        setSelectedCustomer(found);
      }
    } else if (val.length === 0) {
      setSelectedCustomer(null);
    }
  };

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerPhoneInput.trim() || !customerNameInput.trim()) return;

    const newCust = {
      id: `cust-${Date.now()}`,
      name: customerNameInput.trim(),
      phone: customerPhoneInput.trim(),
      creditBalance: 0,
      totalBills: 0,
      totalSpent: 0,
      createdAt: new Date().toISOString(),
    };
    saveCustomer(newCust);
    setSelectedCustomer(newCust);
    setShowAddCustomerModal(false);
    setCustomerNameInput('');
  };

  // Filtered products for quick search dropdown
  const filteredProducts = searchQuery.trim()
    ? products
        .filter(
          (p) =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.barcode.includes(searchQuery) ||
            p.sku.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 8)
    : [];

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-hidden text-slate-100">
      {/* Top POS Action Toolbar */}
      <header className="bg-slate-900 border-b border-slate-800 p-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0">
        {/* Left: Barcode Scanner Input */}
        <div className="flex items-center gap-2 flex-1 max-w-xl">
          <form onSubmit={handleBarcodeSubmit} className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-emerald-400">
              <Barcode size={20} />
            </div>
            <input
              ref={barcodeInputRef}
              id="pos-barcode-input"
              type="text"
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              placeholder="Scan Barcode or Type SKU / Enter [F2]..."
              className="w-full pl-10 pr-20 py-2 bg-slate-950 border-2 border-emerald-500/70 focus:border-emerald-400 rounded-md text-sm font-mono text-emerald-300 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-400 shadow-inner"
              autoComplete="off"
            />
            <button
              type="submit"
              id="btn-barcode-add"
              className="absolute inset-y-1 right-1 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              Add Item
            </button>
          </form>

          {/* Product Search by Name */}
          <div className="relative w-64 hidden md:block">
            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
              <Search size={15} />
            </div>
            <input
              type="text"
              id="pos-search-product"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchDropdownOpen(true);
              }}
              onFocus={() => setIsSearchDropdownOpen(true)}
              placeholder="Search product name..."
              className="w-full pl-8 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-md text-xs text-slate-200 focus:outline-none focus:border-sky-500"
            />

            {/* Autocomplete Dropdown */}
            {isSearchDropdownOpen && filteredProducts.length > 0 && (
              <div
                className="absolute left-0 top-full mt-1 w-80 bg-slate-900 border border-slate-700 rounded-md shadow-2xl z-50 overflow-hidden"
                onMouseLeave={() => setIsSearchDropdownOpen(false)}
              >
                <div className="bg-slate-800 px-3 py-1.5 text-[11px] text-slate-400 font-semibold">
                  Select Item (Click or Press to Add):
                </div>
                {filteredProducts.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      addToCart(p, 1);
                      setSearchQuery('');
                      setIsSearchDropdownOpen(false);
                      focusBarcodeInput();
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-800 border-b border-slate-800/80 flex items-center justify-between text-xs transition-colors"
                  >
                    <div>
                      <div className="font-medium text-slate-100">{p.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        Barcode: {p.barcode} | Stock: {p.currentStock} {p.unit}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-emerald-400">{formatINR(p.sellingPrice)}</div>
                      <div className="text-[10px] text-slate-400">GST {p.gstRate}%</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Center: Scan Feedback Notification */}
        {scanMessage && (
          <div
            className={`px-3 py-1 rounded text-xs font-medium animate-fade-in ${
              scanMessage.isError
                ? 'bg-rose-950/80 text-rose-300 border border-rose-800'
                : 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
            }`}
          >
            {scanMessage.text}
          </div>
        )}

        {/* Right: Quick Action Controls */}
        <div className="flex items-center gap-2">
          {/* Held Bills button */}
          {heldBills.length > 0 && (
            <button
              id="pos-btn-held-bills"
              onClick={() => setShowHeldBillsModal(true)}
              className="px-3 py-1.5 bg-amber-600/20 border border-amber-500/50 hover:bg-amber-600/30 text-amber-300 rounded text-xs flex items-center gap-1.5 font-medium transition-colors"
            >
              <Pause size={13} />
              <span>{heldBills.length} Held Bill(s)</span>
            </button>
          )}

          <button
            id="pos-btn-hold"
            onClick={holdCurrentBill}
            disabled={cart.length === 0}
            title="Hold current cart to serve next customer [F9]"
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 border border-slate-700 rounded text-xs flex items-center gap-1 transition-colors"
          >
            <Pause size={13} />
            <span>Hold [F9]</span>
          </button>

          <button
            id="pos-btn-clear"
            onClick={clearCart}
            title="Clear Cart [Esc]"
            className="px-3 py-1.5 bg-slate-800 hover:bg-rose-900/60 text-slate-200 hover:text-rose-300 border border-slate-700 rounded text-xs flex items-center gap-1 transition-colors"
          >
            <RotateCcw size={13} />
            <span>New / Clear [F1]</span>
          </button>
        </div>
      </header>

      {/* Main Billing Canvas */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Side: Shopping Cart Items Table (65%) */}
        <section className="flex-1 flex flex-col bg-slate-950 border-r border-slate-800 overflow-hidden">
          {/* Cart Header */}
          <div className="bg-slate-900/60 border-b border-slate-800 px-4 py-2 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-200">Current Items</span>
              <span className="bg-blue-600/20 text-blue-300 border border-blue-500/40 text-[11px] px-2 py-0.2 rounded-full font-mono">
                {cart.length} item{cart.length !== 1 ? 's' : ''} (
                {cart.reduce((s, i) => s + i.quantity, 0)} units)
              </span>
            </div>

            {/* Interstate Tax Toggle */}
            <div className="flex items-center gap-2 text-xs">
              <label className="flex items-center gap-1.5 cursor-pointer text-slate-400 hover:text-slate-200">
                <input
                  type="checkbox"
                  checked={isInterstate}
                  onChange={(e) => setIsInterstate(e.target.checked)}
                  className="rounded border-slate-700 text-blue-600 focus:ring-0"
                />
                <span>Interstate (IGST)</span>
              </label>
            </div>
          </div>

          {/* Cart Items Table */}
          <div className="flex-1 overflow-y-auto">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-6 text-center text-slate-500">
                <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-emerald-500 mb-3 shadow-inner">
                  <Barcode size={32} />
                </div>
                <h3 className="text-base font-semibold text-slate-300 mb-1">
                  Ready to Scan Barcode or Search
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mb-6">
                  Scan any barcode with your USB scanner, or click any fast-moving grocery item below
                  to add it immediately to the bill.
                </p>

                {/* Fast-Moving Items Quick Chips */}
                <div className="w-full max-w-xl text-left">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Quick Add Essentials:
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {products.slice(0, 6).map((p) => (
                      <button
                        key={p.id}
                        onClick={() => addToCart(p, 1)}
                        className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/50 rounded text-left transition-all group"
                      >
                        <div className="text-xs font-medium text-slate-200 group-hover:text-emerald-300 truncate">
                          {p.name}
                        </div>
                        <div className="flex items-center justify-between text-[11px] mt-1">
                          <span className="font-bold text-emerald-400">{formatINR(p.sellingPrice)}</span>
                          <span className="text-[10px] text-slate-500">{p.unit}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-slate-900/90 text-slate-400 font-semibold sticky top-0 border-b border-slate-800 z-10">
                  <tr>
                    <th className="py-2.5 px-3 w-10 text-center">#</th>
                    <th className="py-2.5 px-3">Item Description</th>
                    <th className="py-2.5 px-2 text-center w-20">HSN</th>
                    <th className="py-2.5 px-3 text-right w-24">Rate (₹)</th>
                    <th className="py-2.5 px-2 text-center w-32">Qty</th>
                    <th className="py-2.5 px-2 text-center w-16">GST%</th>
                    <th className="py-2.5 px-3 text-right w-24">Tax (₹)</th>
                    <th className="py-2.5 px-3 text-right w-28">Total (₹)</th>
                    <th className="py-2.5 px-2 w-10 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {cart.map((item, idx) => (
                    <tr key={item.productId} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-2 px-3 text-center text-slate-500 font-mono">{idx + 1}</td>
                      <td className="py-2 px-3">
                        <div className="font-medium text-slate-100 text-xs">{item.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono flex items-center gap-2">
                          <span>Code: {item.barcode}</span>
                          <span>Unit: {item.unit}</span>
                        </div>
                      </td>
                      <td className="py-2 px-2 text-center text-slate-400 font-mono text-[11px]">
                        {item.hsnCode}
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-slate-300">
                        {item.unitPrice.toFixed(2)}
                      </td>
                      {/* Quantity Modifier */}
                      <td className="py-2 px-2 text-center">
                        <div className="inline-flex items-center border border-slate-700 bg-slate-900 rounded overflow-hidden">
                          <button
                            onClick={() => updateCartQuantity(item.productId, item.quantity - 1)}
                            className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white"
                            title="Decrease quantity"
                          >
                            <Minus size={12} />
                          </button>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) =>
                              updateCartQuantity(item.productId, parseInt(e.target.value, 10) || 1)
                            }
                            className="w-12 text-center bg-transparent text-xs font-bold text-emerald-400 focus:outline-none"
                          />
                          <button
                            onClick={() => updateCartQuantity(item.productId, item.quantity + 1)}
                            className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white"
                            title="Increase quantity"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      </td>
                      <td className="py-2 px-2 text-center font-mono text-slate-400">
                        {item.gstRate}%
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-slate-400">
                        {item.totalTax.toFixed(2)}
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-emerald-300 text-sm">
                        {item.totalPrice.toFixed(2)}
                      </td>
                      <td className="py-2 px-2 text-center">
                        <button
                          onClick={() => removeFromCart(item.productId)}
                          className="p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 rounded transition-colors"
                          title="Remove item"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Quick Footer Summary Bar */}
          {cart.length > 0 && (
            <div className="bg-slate-900/80 border-t border-slate-800 px-4 py-2 flex items-center justify-between text-xs text-slate-400">
              <div>
                Taxable: <b className="text-slate-200 font-mono">{formatINR(cartSubtotal)}</b> | Total
                GST: <b className="text-slate-200 font-mono">{formatINR(cartTotalTax)}</b>
              </div>
              <button
                onClick={focusBarcodeInput}
                className="text-emerald-400 hover:underline flex items-center gap-1"
              >
                Scan Next [F2]
              </button>
            </div>
          )}
        </section>

        {/* Right Side: Billing Calculator & Payment Section (35%) */}
        <section className="w-full lg:w-96 bg-slate-900/50 flex flex-col justify-between overflow-y-auto shrink-0 border-t lg:border-t-0">
          <div className="p-4 space-y-4">
            {/* Customer Details Box */}
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">
                  Customer
                </span>
                {selectedCustomer ? (
                  <button
                    onClick={() => {
                      setSelectedCustomer(null);
                      setCustomerPhoneInput('');
                    }}
                    className="text-[11px] text-rose-400 hover:underline"
                  >
                    Change / Clear
                  </button>
                ) : (
                  <button
                    onClick={() => setShowAddCustomerModal(true)}
                    className="text-[11px] text-sky-400 hover:underline flex items-center gap-1"
                  >
                    <UserPlus size={11} /> New Customer
                  </button>
                )}
              </div>

              {selectedCustomer ? (
                <div className="bg-slate-950/90 p-3 rounded-lg border border-amber-500/30 text-xs space-y-2.5">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-bold text-slate-100 flex items-center gap-1.5">
                        <Award size={14} className="text-amber-400" />
                        <span>{selectedCustomer.name}</span>
                      </div>
                      <div className="text-slate-400 text-[11px] font-mono">
                        Phone: {selectedCustomer.phone}
                      </div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                        selectedCustomer.membershipTier === 'Platinum'
                          ? 'bg-purple-950/70 text-purple-300 border-purple-700'
                          : selectedCustomer.membershipTier === 'Gold'
                          ? 'bg-yellow-950/70 text-yellow-300 border-yellow-600'
                          : selectedCustomer.membershipTier === 'Silver'
                          ? 'bg-slate-800 text-slate-200 border-slate-600'
                          : 'bg-amber-950/60 text-amber-400 border-amber-800'
                      }`}
                    >
                      {selectedCustomer.membershipTier || 'Bronze'} Member
                    </span>
                  </div>

                  {/* Points Balance & Earned Banner */}
                  <div className="grid grid-cols-2 gap-2 bg-slate-900/80 p-2 rounded border border-slate-800 text-[11px]">
                    <div>
                      <div className="text-slate-400">Points Balance:</div>
                      <div className="font-mono font-bold text-amber-400 text-xs">
                        ★ {selectedCustomer.loyaltyPoints || 0} pts
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400">Points Earned on Bill:</div>
                      <div className="font-mono font-bold text-emerald-400 text-xs">
                        +{loyaltyPointsEarnedOnBill} pts
                      </div>
                    </div>
                  </div>

                  {/* Loyalty Point Redemption */}
                  {loyaltySettings.enabled && (
                    <div className="pt-2 border-t border-slate-800/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-300 font-medium text-[11px]">
                          Use Points?
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setIsRedeemingLoyaltyPoints(true);
                              if (loyaltyPointsToRedeem === 0) {
                                setLoyaltyPointsToRedeem(maxRedeemablePointsForCurrentBill);
                              }
                            }}
                            disabled={maxRedeemablePointsForCurrentBill <= 0}
                            className={`px-2.5 py-0.5 rounded text-[11px] font-bold transition-all ${
                              isRedeemingLoyaltyPoints
                                ? 'bg-amber-500 text-slate-950 shadow'
                                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-40'
                            }`}
                          >
                            Yes
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setIsRedeemingLoyaltyPoints(false);
                              setLoyaltyPointsToRedeem(0);
                            }}
                            className={`px-2.5 py-0.5 rounded text-[11px] font-bold transition-all ${
                              !isRedeemingLoyaltyPoints
                                ? 'bg-slate-700 text-white'
                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                            }`}
                          >
                            No
                          </button>
                        </div>
                      </div>

                      {isRedeemingLoyaltyPoints && (
                        <div className="bg-amber-950/30 p-2 rounded border border-amber-800/50 space-y-1.5">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-amber-300">Points to Redeem:</span>
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                min="1"
                                max={maxRedeemablePointsForCurrentBill}
                                value={loyaltyPointsToRedeem || ''}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value) || 0;
                                  setLoyaltyPointsToRedeem(
                                    Math.min(maxRedeemablePointsForCurrentBill, Math.max(0, val))
                                  );
                                }}
                                className="w-16 px-1.5 py-0.5 bg-slate-950 border border-amber-700 rounded text-right font-mono text-amber-300 text-xs focus:outline-none"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  setLoyaltyPointsToRedeem(maxRedeemablePointsForCurrentBill)
                                }
                                className="px-1.5 py-0.5 bg-amber-600/40 hover:bg-amber-600/60 border border-amber-500/60 rounded text-[10px] text-amber-200 font-bold"
                              >
                                Max
                              </button>
                            </div>
                          </div>
                          <div className="flex justify-between text-[11px] text-emerald-400 font-semibold">
                            <span>Points Value (Discount):</span>
                            <span className="font-mono">- {formatINR(loyaltyDiscountAmount)}</span>
                          </div>
                        </div>
                      )}

                      {/* New Balance Preview */}
                      <div className="flex justify-between items-center text-[11px] text-slate-400 pt-0.5">
                        <span>New Balance:</span>
                        <span className="font-mono font-bold text-amber-300">
                          {Math.max(
                            0,
                            (selectedCustomer.loyaltyPoints || 0) -
                              (isRedeemingLoyaltyPoints ? loyaltyPointsToRedeem : 0) +
                              loyaltyPointsEarnedOnBill
                          )}{' '}
                          pts
                        </span>
                      </div>
                    </div>
                  )}

                  {selectedCustomer.creditBalance > 0 && (
                    <div className="pt-1.5 border-t border-slate-800 text-amber-400 font-medium text-[11px] flex items-center justify-between">
                      <span>Previous Khata Balance:</span>
                      <span className="font-mono">{formatINR(selectedCustomer.creditBalance)}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-1.5">
                  <input
                    type="text"
                    id="pos-customer-phone"
                    value={customerPhoneInput}
                    onChange={(e) => handleCustomerPhoneChange(e.target.value)}
                    placeholder="Enter Phone Number or Search Customer..."
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500 font-mono"
                  />
                  <div className="text-[10px] text-slate-500">
                    Default: Walk-in Cash Customer
                  </div>
                </div>
              )}
            </div>

            {/* Bill Summary & GST Breakdown */}
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Taxable Amount (Subtotal):</span>
                <span className="font-mono text-slate-200">{formatINR(cartSubtotal)}</span>
              </div>

              {/* GST Breakdown */}
              {isInterstate ? (
                <div className="flex justify-between text-slate-400 text-[11px]">
                  <span>IGST:</span>
                  <span className="font-mono text-slate-300">{formatINR(cartIgst)}</span>
                </div>
              ) : (
                <div className="space-y-1 text-[11px] text-slate-400 bg-slate-950/50 p-2 rounded border border-slate-800/80">
                  <div className="flex justify-between">
                    <span>CGST (Central Tax):</span>
                    <span className="font-mono text-slate-300">{formatINR(cartCgst)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>SGST (State Tax):</span>
                    <span className="font-mono text-slate-300">{formatINR(cartSgst)}</span>
                  </div>
                </div>
              )}

              {/* Discount Input */}
              <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-slate-400">
                <span>Direct Discount (₹):</span>
                <div className="w-24">
                  <input
                    type="number"
                    min="0"
                    id="pos-bill-discount"
                    value={billDiscount || ''}
                    onChange={(e) => setBillDiscount(parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    className="w-full px-2 py-1 bg-slate-950 border border-slate-700 rounded text-right font-mono text-xs text-amber-300 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {loyaltyDiscountAmount > 0 && (
                <div className="flex justify-between text-[11px] text-amber-300 font-semibold bg-amber-950/30 px-2 py-1 rounded border border-amber-800/40">
                  <span className="flex items-center gap-1">
                    <Award size={12} /> Loyalty Points Discount:
                  </span>
                  <span className="font-mono">- {formatINR(loyaltyDiscountAmount)}</span>
                </div>
              )}

              {cartRoundOff !== 0 && (
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Round Off:</span>
                  <span className="font-mono text-slate-300">
                    {cartRoundOff > 0 ? `+${cartRoundOff.toFixed(2)}` : cartRoundOff.toFixed(2)}
                  </span>
                </div>
              )}

              {/* GRAND TOTAL - Big, High Contrast */}
              <div className="pt-2 border-t-2 border-slate-700 flex items-center justify-between">
                <div>
                  <span className="text-xs uppercase tracking-wider font-bold text-slate-300">
                    Grand Total
                  </span>
                  <div className="text-[10px] text-slate-500 font-mono">Net Payable</div>
                </div>
                <div className="text-2xl font-black font-mono text-emerald-400 tracking-tight">
                  {formatINR(cartGrandTotal)}
                </div>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 space-y-3">
              <div className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">
                Payment Method
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  id="pay-method-cash"
                  onClick={() => {
                    setPaymentMethod('Cash');
                    setAmountReceived(cartGrandTotal);
                  }}
                  className={`py-2 px-3 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    paymentMethod === 'Cash'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <Banknote size={15} />
                  <span>Cash [C]</span>
                </button>

                <button
                  id="pay-method-upi"
                  onClick={() => {
                    setPaymentMethod('UPI');
                    setAmountReceived(cartGrandTotal);
                  }}
                  className={`py-2 px-3 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    paymentMethod === 'UPI'
                      ? 'bg-sky-600 text-white shadow-md'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <QrCode size={15} />
                  <span>UPI [U]</span>
                </button>

                <button
                  id="pay-method-card"
                  onClick={() => {
                    setPaymentMethod('Card');
                    setAmountReceived(cartGrandTotal);
                  }}
                  className={`py-2 px-3 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    paymentMethod === 'Card'
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <CreditCard size={15} />
                  <span>Card [D]</span>
                </button>

                <button
                  id="pay-method-credit"
                  onClick={() => {
                    setPaymentMethod('Credit');
                    setAmountReceived(0);
                  }}
                  className={`py-2 px-3 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    paymentMethod === 'Credit'
                      ? 'bg-amber-600 text-white shadow-md'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <BookOpen size={15} />
                  <span>Credit / Khata [K]</span>
                </button>
              </div>

              {/* Cash Tendered & Change Return Calculation */}
              {paymentMethod === 'Cash' && (
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span>Cash Received:</span>
                    <input
                      type="number"
                      id="pos-amount-received"
                      value={amountReceived || ''}
                      onChange={(e) => setAmountReceived(parseFloat(e.target.value) || 0)}
                      placeholder={cartGrandTotal.toString()}
                      className="w-28 px-2 py-1 bg-slate-950 border border-slate-700 rounded text-right font-mono font-bold text-emerald-400 focus:outline-none focus:border-emerald-500 text-sm"
                    />
                  </div>

                  {/* Fast Tender Cash Buttons */}
                  <div className="flex flex-wrap gap-1">
                    {[cartGrandTotal, 100, 200, 500, 2000].map((amt, idx) => {
                      if (amt < cartGrandTotal && idx !== 0) return null;
                      return (
                        <button
                          key={amt + '-' + idx}
                          onClick={() => setAmountReceived(amt)}
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] font-mono font-medium"
                        >
                          {idx === 0 ? 'Exact' : `₹${amt}`}
                        </button>
                      );
                    })}
                  </div>

                  {/* Change Due Display */}
                  <div className="bg-slate-950 p-2.5 rounded-md border border-slate-800 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-400">Change to Return:</span>
                    <span className="text-lg font-mono font-bold text-amber-400">
                      {formatINR(changeDue)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons: Complete & Print */}
          <div className="p-4 bg-slate-900 border-t border-slate-800 space-y-2">
            <button
              id="pos-btn-complete-print"
              onClick={() => completeCurrentBill(true)}
              disabled={cart.length === 0}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:pointer-events-none text-white rounded-lg font-bold text-sm shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 transition-all"
            >
              <Printer size={18} />
              <span>Complete & Print Receipt [F3]</span>
            </button>

            <div className="flex gap-2">
              <button
                id="pos-btn-complete-noprint"
                onClick={() => completeCurrentBill(false)}
                disabled={cart.length === 0}
                className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 rounded text-xs font-semibold border border-slate-700 transition-colors"
              >
                Complete without Print
              </button>

              <button
                id="pos-btn-hold-alt"
                onClick={holdCurrentBill}
                disabled={cart.length === 0}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 rounded text-xs border border-slate-700 transition-colors"
                title="Hold Bill [F9]"
              >
                Hold
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Quick Add Customer Modal */}
      {showAddCustomerModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-lg max-w-md w-full p-5 shadow-2xl">
            <h3 className="text-sm font-bold text-slate-100 mb-3 flex items-center gap-2">
              <UserPlus size={16} className="text-sky-400" />
              Add Customer
            </h3>
            <form onSubmit={handleCreateCustomer} className="space-y-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Customer Name *</label>
                <input
                  type="text"
                  required
                  id="new-cust-name"
                  value={customerNameInput}
                  onChange={(e) => setCustomerNameInput(e.target.value)}
                  placeholder="e.g. Suresh Gupta"
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded text-xs text-slate-100"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Mobile Number *</label>
                <input
                  type="tel"
                  required
                  id="new-cust-phone"
                  value={customerPhoneInput}
                  onChange={(e) => setCustomerPhoneInput(e.target.value)}
                  placeholder="10-digit mobile number"
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded text-xs text-slate-100 font-mono"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddCustomerModal(false)}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded text-xs font-semibold"
                >
                  Save & Select
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Held Bills Modal */}
      {showHeldBillsModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-lg max-w-lg w-full p-5 shadow-2xl">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Pause size={16} className="text-amber-400" />
                Held Bills ({heldBills.length})
              </h3>
              <button
                onClick={() => setShowHeldBillsModal(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                Close [Esc]
              </button>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto">
              {heldBills.map((held) => {
                const total = held.cart.reduce((s, i) => s + i.totalPrice, 0);
                return (
                  <div
                    key={held.id}
                    className="p-3 bg-slate-950 border border-slate-800 rounded flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-slate-200 text-xs">
                        {held.customerName}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {held.cart.length} items | {formatINR(total)} | {held.paymentMethod}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          recallHeldBill(held.id);
                          setShowHeldBillsModal(false);
                        }}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold flex items-center gap-1"
                      >
                        <Play size={11} /> Recall
                      </button>
                      <button
                        onClick={() => removeHeldBill(held.id)}
                        className="p-1 bg-slate-800 hover:bg-rose-900/50 text-slate-400 hover:text-rose-300 rounded"
                        title="Delete held bill"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
