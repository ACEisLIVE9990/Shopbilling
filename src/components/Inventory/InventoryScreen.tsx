/**
 * Inventory Management & Transactions Screen
 * Stock-In from suppliers, manual adjustments, audit ledger, and low-stock monitor
 */

import React, { useState } from 'react';
import {
  Boxes,
  PlusCircle,
  ArrowDownCircle,
  ArrowUpCircle,
  History,
  AlertTriangle,
  Search,
  CheckCircle2,
  X,
  FileSpreadsheet,
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { formatIndianDate } from '../../utils/formatters';

export const InventoryScreen: React.FC = () => {
  const { products, inventoryTransactions, adjustStock } = useShop();

  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'ledger'>('overview');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Stock In / Adjust Modal
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [adjustQty, setAdjustQty] = useState<number>(10);
  const [adjustReason, setAdjustReason] = useState<string>('');
  const [adjustType, setAdjustType] = useState<'StockIn' | 'Reduce'>('StockIn');
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState<boolean>(false);

  const lowStockItems = products.filter((p) => p.currentStock <= p.minStock);

  const handleOpenStockIn = (productId?: string) => {
    setSelectedProductId(productId || (products[0]?.id || ''));
    setAdjustType('StockIn');
    setAdjustQty(10);
    setAdjustReason('Purchase from Distributor / Fresh Stock Delivery');
    setIsAdjustModalOpen(true);
  };

  const handleOpenAdjustment = (productId?: string) => {
    setSelectedProductId(productId || (products[0]?.id || ''));
    setAdjustType('Reduce');
    setAdjustQty(1);
    setAdjustReason('Damaged / Expired / Count Correction');
    setIsAdjustModalOpen(true);
  };

  const handleSubmitAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || adjustQty <= 0) return;

    const delta = adjustType === 'StockIn' ? adjustQty : -adjustQty;
    adjustStock(selectedProductId, delta, adjustReason);
    setIsAdjustModalOpen(false);
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.barcode.includes(searchQuery) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-hidden text-slate-100">
      {/* Top Header */}
      <div className="p-4 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Boxes size={18} className="text-amber-400" />
            Inventory & Stock Transactions
          </h2>
          <p className="text-xs text-slate-400">
            Real-time stock tracking with automatic sale deductions and complete audit trail.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="inv-btn-stockin"
            onClick={() => handleOpenStockIn()}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold flex items-center gap-1.5 shadow"
          >
            <ArrowDownCircle size={15} /> Stock In (Purchase)
          </button>
          <button
            id="inv-btn-adjust"
            onClick={() => handleOpenAdjustment()}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded text-xs flex items-center gap-1.5 font-medium"
          >
            <ArrowUpCircle size={15} /> Adjust Stock
          </button>
        </div>
      </div>

      {/* Sub-Tab Navigation */}
      <div className="px-4 pt-2 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between gap-3 text-xs shrink-0">
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveSubTab('overview')}
            className={`py-2 px-3 border-b-2 font-semibold transition-colors ${
              activeSubTab === 'overview'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Stock Overview & Alerts ({products.length})
          </button>
          <button
            onClick={() => setActiveSubTab('ledger')}
            className={`py-2 px-3 border-b-2 font-semibold transition-colors ${
              activeSubTab === 'ledger'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Transactions Audit Ledger ({inventoryTransactions.length})
          </button>
        </div>

        {activeSubTab === 'overview' && (
          <div className="relative w-64 pb-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search product stock..."
              className="w-full px-2.5 py-1 bg-slate-950 border border-slate-700 rounded text-xs text-slate-200"
            />
          </div>
        )}
      </div>

      {/* Main Content View */}
      <div className="flex-1 overflow-y-auto">
        {/* SUBTAB 1: STOCK OVERVIEW */}
        {activeSubTab === 'overview' && (
          <div>
            {/* Low stock alert banner */}
            {lowStockItems.length > 0 && (
              <div className="m-4 p-3 bg-rose-950/40 border border-rose-800/60 rounded-lg flex items-center justify-between text-xs text-rose-300">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={16} className="text-rose-400 shrink-0" />
                  <span>
                    <b>{lowStockItems.length} items</b> have fallen below their minimum stock alert
                    level. Restock soon to prevent billing disruption.
                  </span>
                </div>
              </div>
            )}

            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-900/90 text-slate-400 font-semibold sticky top-0 border-b border-slate-800 z-10">
                <tr>
                  <th className="py-2.5 px-3">Item Name</th>
                  <th className="py-2.5 px-3">Barcode / SKU</th>
                  <th className="py-2.5 px-3 text-center">Unit</th>
                  <th className="py-2.5 px-3 text-right">Min Alert</th>
                  <th className="py-2.5 px-3 text-right">Current Stock</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3 text-center">Quick Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {filteredProducts.map((p) => {
                  const isLow = p.currentStock <= p.minStock;
                  return (
                    <tr key={p.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-2 px-3 font-semibold text-slate-100">{p.name}</td>
                      <td className="py-2 px-3 font-mono text-slate-400">
                        <div>{p.barcode}</div>
                        <div className="text-[10px] text-slate-500">{p.sku}</div>
                      </td>
                      <td className="py-2 px-3 text-center text-slate-300">{p.unit}</td>
                      <td className="py-2 px-3 text-right font-mono text-slate-400">
                        {p.minStock} {p.unit}
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-sm">
                        <span className={isLow ? 'text-rose-400' : 'text-emerald-400'}>
                          {p.currentStock} {p.unit}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            isLow
                              ? 'bg-rose-950 text-rose-300 border border-rose-800'
                              : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          }`}
                        >
                          {isLow ? 'LOW STOCK' : 'IN STOCK'}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenStockIn(p.id)}
                            className="px-2 py-1 bg-emerald-950/60 hover:bg-emerald-800/60 text-emerald-300 border border-emerald-700/60 rounded text-[11px] flex items-center gap-1"
                            title="Add purchase stock"
                          >
                            <ArrowDownCircle size={12} /> Stock In
                          </button>
                          <button
                            onClick={() => handleOpenAdjustment(p.id)}
                            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px]"
                            title="Adjust quantity"
                          >
                            Adjust
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* SUBTAB 2: TRANSACTIONS LEDGER */}
        {activeSubTab === 'ledger' && (
          <div className="p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Date & Time</th>
                    <th className="py-2.5 px-3">Product Name</th>
                    <th className="py-2.5 px-2 text-center">Type</th>
                    <th className="py-2.5 px-3 text-right">Qty</th>
                    <th className="py-2.5 px-3 text-right">Prev Stock</th>
                    <th className="py-2.5 px-3 text-right">New Stock</th>
                    <th className="py-2.5 px-3">Reason / Reference</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {inventoryTransactions.map((tx) => {
                    const isPositive = tx.type === 'StockIn' || tx.type === 'Return';
                    return (
                      <tr key={tx.id} className="hover:bg-slate-850 transition-colors">
                        <td className="py-2 px-3 text-slate-400 font-mono text-[11px]">
                          {formatIndianDate(tx.createdAt)}
                        </td>
                        <td className="py-2 px-3 font-semibold text-slate-200">
                          {tx.productName}
                        </td>
                        <td className="py-2 px-2 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                              tx.type === 'Sale'
                                ? 'bg-blue-950 text-blue-300 border border-blue-800'
                                : tx.type === 'StockIn'
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                : tx.type === 'Return'
                                ? 'bg-purple-950 text-purple-300 border border-purple-800'
                                : 'bg-amber-950 text-amber-300 border border-amber-800'
                            }`}
                          >
                            {tx.type}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold">
                          <span className={isPositive ? 'text-emerald-400' : 'text-rose-400'}>
                            {isPositive ? `+${tx.quantity}` : `-${tx.quantity}`}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-right font-mono text-slate-400">
                          {tx.previousStock}
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-semibold text-slate-200">
                          {tx.newStock}
                        </td>
                        <td className="py-2 px-3 text-slate-400 text-[11px]">
                          {tx.reason}{' '}
                          {tx.referenceId && (
                            <span className="font-mono text-sky-400">[{tx.referenceId}]</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Stock In / Adjustment Modal */}
      {isAdjustModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Boxes size={16} className="text-amber-400" />
                {adjustType === 'StockIn' ? 'Stock In (Purchase Receipt)' : 'Adjust Stock'}
              </h3>
              <button
                onClick={() => setIsAdjustModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitAdjustment} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Select Product *</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded text-slate-100"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Current: {p.currentStock} {p.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Operation Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustType('StockIn')}
                    className={`py-1.5 rounded font-bold ${
                      adjustType === 'StockIn'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    + Add Stock (In)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustType('Reduce')}
                    className={`py-1.5 rounded font-bold ${
                      adjustType === 'Reduce'
                        ? 'bg-rose-600 text-white'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    - Reduce Stock (Out)
                  </button>
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Quantity *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={adjustQty || ''}
                  onChange={(e) => setAdjustQty(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded font-mono text-sm text-emerald-400 font-bold"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Reason / Invoice Note</label>
                <input
                  type="text"
                  required
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="e.g. Purchase Inv #PO-4091 or Damaged stock"
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded text-xs text-slate-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAdjustModalOpen(false)}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold"
                >
                  Confirm & Update Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
