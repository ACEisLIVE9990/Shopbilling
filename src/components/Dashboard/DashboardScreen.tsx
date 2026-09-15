/**
 * POS Dashboard Screen
 * Overview for the shopkeeper: Today's sales, payment modes, low stock alerts,
 * quick action buttons, and recent transactions.
 */

import React from 'react';
import {
  ReceiptText,
  IndianRupee,
  Package,
  AlertTriangle,
  Boxes,
  Users,
  HardDrive,
  Printer,
  TrendingUp,
  PlusCircle,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { formatINR, formatIndianDate } from '../../utils/formatters';

export const DashboardScreen: React.FC = () => {
  const {
    bills,
    products,
    customers,
    settings,
    setActiveTab,
    openReceiptForBill,
    focusBarcodeInput,
  } = useShop();

  const todayStr = new Date().toISOString().split('T')[0];
  const todayBills = bills.filter(
    (b) => b.createdAt.startsWith(todayStr) && b.status === 'Completed'
  );

  const todaySalesTotal = todayBills.reduce((sum, b) => sum + b.grandTotal, 0);
  const todayTaxTotal = todayBills.reduce((sum, b) => sum + b.totalTax, 0);
  const todayItemsSold = todayBills.reduce(
    (sum, b) => sum + b.items.reduce((s, i) => s + i.quantity, 0),
    0
  );

  // Payment Breakdown for Today
  const cashSales = todayBills
    .filter((b) => b.paymentMethod === 'Cash')
    .reduce((s, b) => s + b.grandTotal, 0);
  const upiSales = todayBills
    .filter((b) => b.paymentMethod === 'UPI')
    .reduce((s, b) => s + b.grandTotal, 0);
  const cardSales = todayBills
    .filter((b) => b.paymentMethod === 'Card')
    .reduce((s, b) => s + b.grandTotal, 0);
  const creditSales = todayBills
    .filter((b) => b.paymentMethod === 'Credit')
    .reduce((s, b) => s + b.grandTotal, 0);

  // Low Stock Items
  const lowStockItems = products.filter((p) => p.currentStock <= p.minStock);

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-950 text-slate-100 space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800/90 border border-slate-700/80 rounded-xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-white">{settings.shopName}</h1>
            <span className="bg-emerald-950/80 text-emerald-400 border border-emerald-800 text-[10px] font-mono font-bold px-2 py-0.5 rounded">
              OFFLINE POS
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            GSTIN: <span className="font-mono text-amber-300 font-semibold">{settings.gstin}</span> |
            Terminal: <span className="text-slate-200">POS-01 (Windows Desktop)</span> | Database:{' '}
            <span className="font-mono text-sky-300">ShopBilling.db</span>
          </p>
        </div>

        {/* Big New Bill Button */}
        <button
          id="dash-btn-new-bill"
          onClick={() => {
            setActiveTab('billing');
            setTimeout(focusBarcodeInput, 100);
          }}
          className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-sm shadow-xl shadow-emerald-950/50 flex items-center justify-center gap-2 transition-all transform active:scale-95 shrink-0"
        >
          <ReceiptText size={18} />
          <span>Open Billing Terminal [F1]</span>
        </button>
      </div>

      {/* KPI Cards: Today's Financials */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Today's Total Sales */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 shadow">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Today's Total Sales</span>
            <div className="p-1.5 bg-emerald-950 text-emerald-400 rounded">
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-emerald-400 tracking-tight">
            {formatINR(todaySalesTotal)}
          </div>
          <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
            <span>GST Collected:</span>
            <span className="font-mono text-slate-300">{formatINR(todayTaxTotal)}</span>
          </div>
        </div>

        {/* Card 2: Today's Invoices */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 shadow">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Bills Generated Today</span>
            <div className="p-1.5 bg-blue-950 text-blue-400 rounded">
              <ReceiptText size={16} />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-blue-400 tracking-tight">
            {todayBills.length}{' '}
            <span className="text-xs font-normal text-slate-400 font-sans">bills</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
            <span>Items Sold:</span>
            <span className="font-mono text-slate-300">{todayItemsSold} units</span>
          </div>
        </div>

        {/* Card 3: Cash in Register */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 shadow">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Cash Tendered Today</span>
            <div className="p-1.5 bg-amber-950 text-amber-400 rounded">
              <IndianRupee size={16} />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-amber-400 tracking-tight">
            {formatINR(cashSales)}
          </div>
          <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
            <span>UPI Collections:</span>
            <span className="font-mono text-sky-300">{formatINR(upiSales)}</span>
          </div>
        </div>

        {/* Card 4: Inventory Health */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 shadow">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Low Stock Alerts</span>
            <div
              className={`p-1.5 rounded ${
                lowStockItems.length > 0
                  ? 'bg-rose-950 text-rose-400 animate-pulse'
                  : 'bg-emerald-950 text-emerald-400'
              }`}
            >
              <AlertTriangle size={16} />
            </div>
          </div>
          <div
            className={`text-2xl font-black font-mono tracking-tight ${
              lowStockItems.length > 0 ? 'text-rose-400' : 'text-emerald-400'
            }`}
          >
            {lowStockItems.length}{' '}
            <span className="text-xs font-normal text-slate-400 font-sans">items below minimum</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
            <span>Catalog Size:</span>
            <span className="font-mono text-slate-300">{products.length} Products</span>
          </div>
        </div>
      </div>

      {/* Split Section: Low Stock Warnings + Today's Payment Modes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Payment Modes Split */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 shadow">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            Today's Payment Collections
          </h3>
          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800">
              <span className="font-medium text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Cash
              </span>
              <span className="font-mono font-bold">{formatINR(cashSales)}</span>
            </div>

            <div className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800">
              <span className="font-medium text-sky-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-sky-400"></span> UPI / QR
              </span>
              <span className="font-mono font-bold">{formatINR(upiSales)}</span>
            </div>

            <div className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800">
              <span className="font-medium text-purple-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-400"></span> Card / POS
              </span>
              <span className="font-mono font-bold">{formatINR(cardSales)}</span>
            </div>

            <div className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800">
              <span className="font-medium text-amber-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span> Credit (Udhaar)
              </span>
              <span className="font-mono font-bold">{formatINR(creditSales)}</span>
            </div>
          </div>
        </div>

        {/* Low Stock Alerts Box */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-lg p-4 shadow">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <AlertTriangle size={14} className="text-rose-400" />
              Low Stock Inventory Alerts
            </h3>
            <button
              onClick={() => setActiveTab('inventory')}
              className="text-xs text-sky-400 hover:underline flex items-center gap-0.5"
            >
              Manage Stock <ArrowUpRight size={13} />
            </button>
          </div>

          {lowStockItems.length === 0 ? (
            <div className="p-4 bg-slate-950 rounded border border-slate-800 text-center text-xs text-emerald-400 flex items-center justify-center gap-2">
              <CheckCircle2 size={16} />
              <span>All product inventory levels are healthy!</span>
            </div>
          ) : (
            <div className="space-y-2">
              {lowStockItems.slice(0, 4).map((item) => (
                <div
                  key={item.id}
                  className="p-2.5 bg-slate-950 border border-rose-900/40 rounded flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-semibold text-slate-200">{item.name}</div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      Barcode: {item.barcode} | HSN: {item.hsnCode}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold text-rose-400">
                      Stock: {item.currentStock} {item.unit}
                    </div>
                    <div className="text-[10px] text-slate-500">Min: {item.minStock} {item.unit}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Bills Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 shadow">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Recent Sales Transactions
          </h3>
          <button
            onClick={() => setActiveTab('sales')}
            className="text-xs text-sky-400 hover:underline flex items-center gap-0.5"
          >
            View All Bills <ArrowUpRight size={13} />
          </button>
        </div>

        {bills.length === 0 ? (
          <div className="p-6 text-center text-slate-500 text-xs">No bills created yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-2 px-3">Invoice No</th>
                  <th className="py-2 px-3">Customer</th>
                  <th className="py-2 px-3">Date & Time</th>
                  <th className="py-2 px-3">Payment</th>
                  <th className="py-2 px-3 text-right">Items</th>
                  <th className="py-2 px-3 text-right">Grand Total</th>
                  <th className="py-2 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {bills.slice(0, 5).map((b) => (
                  <tr key={b.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2 px-3 font-mono font-bold text-sky-400">{b.billNumber}</td>
                    <td className="py-2 px-3 font-medium text-slate-200">{b.customerName}</td>
                    <td className="py-2 px-3 text-slate-400">{formatIndianDate(b.createdAt)}</td>
                    <td className="py-2 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                        {b.paymentMethod}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right font-mono text-slate-400">
                      {b.items.length}
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-emerald-400">
                      {formatINR(b.grandTotal)}
                    </td>
                    <td className="py-2 px-3 text-center">
                      <button
                        onClick={() => openReceiptForBill(b)}
                        className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] flex items-center gap-1 mx-auto"
                        title="Reprint Bill"
                      >
                        <Printer size={12} /> Reprint
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
