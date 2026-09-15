/**
 * Sales Returns & Customer Refund Management Screen
 * Look up original bills, process item returns, refund cash/UPI, and restock inventory.
 */

import React, { useState } from 'react';
import {
  RotateCcw,
  Search,
  CheckCircle,
  AlertTriangle,
  ReceiptText,
  IndianRupee,
  Plus,
  Minus,
  Check,
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { Bill, ReturnItem, PaymentMethod } from '../../types';
import { formatINR, formatIndianDate } from '../../utils/formatters';

export const ReturnsScreen: React.FC = () => {
  const { bills, returns, processReturn } = useShop();

  const [billSearchQuery, setBillSearchQuery] = useState<string>('');
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [returnQuantities, setReturnQuantities] = useState<Record<string, number>>({});
  const [refundMethod, setRefundMethod] = useState<PaymentMethod>('Cash');
  const [returnReason, setReturnReason] = useState<string>('Customer returned goods');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSearchBill = (e: React.FormEvent) => {
    e.preventDefault();
    const query = billSearchQuery.trim().toLowerCase();
    if (!query) return;

    setErrorMessage(null);
    const found = bills.find(
      (b) => b.billNumber.toLowerCase() === query || b.customerPhone === query
    );
    if (found) {
      setSelectedBill(found);
      // Initialize return quantities to 0
      const initialQty: Record<string, number> = {};
      found.items.forEach((it) => {
        initialQty[it.productId] = 0;
      });
      setReturnQuantities(initialQty);
      setSuccessMessage(null);
    } else {
      setErrorMessage(`No completed bill found matching: "${billSearchQuery}"`);
    }
  };

  const handleQuantityChange = (productId: string, qty: number, maxQty: number) => {
    const clamped = Math.max(0, Math.min(qty, maxQty));
    setReturnQuantities((prev) => ({ ...prev, [productId]: clamped }));
  };

  const handleProcessReturn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBill) return;
    setErrorMessage(null);

    const itemsToReturn: ReturnItem[] = [];
    let totalRefund = 0;

    selectedBill.items.forEach((it) => {
      const q = returnQuantities[it.productId] || 0;
      if (q > 0) {
        const itemRefund = (it.totalPrice / it.quantity) * q;
        totalRefund += itemRefund;
        itemsToReturn.push({
          id: `ri-${Date.now()}-${it.productId}`,
          productId: it.productId,
          productName: it.productName,
          quantity: q,
          unitPrice: it.unitPrice,
          taxAmount: (it.totalTax / it.quantity) * q,
          refundTotal: itemRefund,
        });
      }
    });

    if (itemsToReturn.length === 0) {
      setErrorMessage('Please select at least 1 item with quantity > 0 to return.');
      return;
    }

    const newRet = processReturn({
      originalBillNumber: selectedBill.billNumber,
      customerName: selectedBill.customerName,
      customerPhone: selectedBill.customerPhone,
      items: itemsToReturn,
      totalRefundAmount: totalRefund,
      refundMethod,
      reason: returnReason,
    });

    setSuccessMessage(`Return #${newRet.returnNumber} processed! ${formatINR(totalRefund)} refunded via ${refundMethod}. Inventory has been automatically restocked.`);
    setSelectedBill(null);
    setBillSearchQuery('');
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-hidden text-slate-100">
      {/* Top Header */}
      <div className="p-4 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <RotateCcw size={18} className="text-purple-400" />
            Customer Sales Returns & Refunds
          </h2>
          <p className="text-xs text-slate-400">
            Process item returns from previous bills, refund cash/UPI, and restock goods safely.
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {/* Success message */}
        {successMessage && (
          <div className="p-3.5 bg-emerald-950 border border-emerald-800 text-emerald-300 rounded-lg text-xs flex items-center gap-2">
            <CheckCircle size={16} />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Error message */}
        {errorMessage && (
          <div className="p-3.5 bg-rose-950 border border-rose-800 text-rose-300 rounded-lg text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <RotateCcw size={16} className="shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-rose-400 hover:text-rose-200"
            >
              ✕
            </button>
          </div>
        )}

        {/* Look up Bill Form */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Step 1: Look Up Original Customer Invoice
          </h3>
          <form onSubmit={handleSearchBill} className="flex gap-2 max-w-lg">
            <input
              type="text"
              value={billSearchQuery}
              onChange={(e) => setBillSearchQuery(e.target.value)}
              placeholder="Enter Bill Number (e.g. INV-2026-1039) or Customer Mobile..."
              className="flex-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-md text-xs text-slate-200 font-mono focus:outline-none focus:border-purple-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-md text-xs font-bold flex items-center gap-1.5"
            >
              <Search size={14} /> Find Bill
            </button>
          </form>
        </div>

        {/* Selected Bill Return Items Form */}
        {selectedBill && (
          <form onSubmit={handleProcessReturn} className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow space-y-4">
            <div className="flex flex-wrap items-center justify-between pb-3 border-b border-slate-800 text-xs">
              <div>
                <span className="text-slate-400">Invoice: </span>
                <b className="text-sky-400 font-mono text-sm">{selectedBill.billNumber}</b>
                <span className="text-slate-500 ml-2">({formatIndianDate(selectedBill.createdAt)})</span>
              </div>
              <div>
                <span className="text-slate-400">Customer: </span>
                <b className="text-slate-200">{selectedBill.customerName}</b>
              </div>
            </div>

            {/* Items selection */}
            <div>
              <div className="text-xs font-bold text-slate-300 mb-2">
                Step 2: Select Items and Quantity to Return
              </div>
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-2">Item Name</th>
                    <th className="p-2 text-center">Billed Qty</th>
                    <th className="p-2 text-right">Unit Rate</th>
                    <th className="p-2 text-center w-36">Return Qty</th>
                    <th className="p-2 text-right">Refund Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {selectedBill.items.map((it) => {
                    const currentReturnQty = returnQuantities[it.productId] || 0;
                    const refundAmt = (it.totalPrice / it.quantity) * currentReturnQty;
                    return (
                      <tr key={it.productId}>
                        <td className="p-2 font-medium text-slate-200">{it.productName}</td>
                        <td className="p-2 text-center font-mono">
                          {it.quantity} {it.unit}
                        </td>
                        <td className="p-2 text-right font-mono text-slate-300">
                          {formatINR(it.unitPrice)}
                        </td>
                        <td className="p-2 text-center">
                          <div className="inline-flex items-center border border-slate-700 bg-slate-950 rounded">
                            <button
                              type="button"
                              onClick={() =>
                                handleQuantityChange(
                                  it.productId,
                                  currentReturnQty - 1,
                                  it.quantity
                                )
                              }
                              className="p-1 text-slate-400 hover:text-white"
                            >
                              <Minus size={12} />
                            </button>
                            <input
                              type="number"
                              min="0"
                              max={it.quantity}
                              value={currentReturnQty}
                              onChange={(e) =>
                                handleQuantityChange(
                                  it.productId,
                                  parseInt(e.target.value, 10) || 0,
                                  it.quantity
                                )
                              }
                              className="w-12 text-center bg-transparent text-xs font-bold text-purple-400 focus:outline-none font-mono"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                handleQuantityChange(
                                  it.productId,
                                  currentReturnQty + 1,
                                  it.quantity
                                )
                              }
                              className="p-1 text-slate-400 hover:text-white"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                        </td>
                        <td className="p-2 text-right font-mono font-bold text-emerald-400">
                          {formatINR(refundAmt)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Refund Method & Reason */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-slate-800 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Refund Payment Mode</label>
                <select
                  value={refundMethod}
                  onChange={(e) => setRefundMethod(e.target.value as PaymentMethod)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded text-slate-200"
                >
                  <option value="Cash">Cash Refund</option>
                  <option value="UPI">UPI Refund</option>
                  <option value="Credit">Credit / Khata Adjustment</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Return Reason</label>
                <input
                  type="text"
                  required
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  placeholder="e.g. Expired, Customer ordered wrong brand, etc."
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded text-slate-200"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedBill(null)}
                className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded text-xs font-bold shadow"
              >
                Confirm Return & Restock Inventory
              </button>
            </div>
          </form>
        )}

        {/* Previous Returns History */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            Returns & Refund History ({returns.length})
          </h3>

          {returns.length === 0 ? (
            <div className="text-center py-6 text-slate-500 text-xs">
              No product returns recorded yet.
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-2">Return No</th>
                  <th className="p-2">Original Bill</th>
                  <th className="p-2">Customer</th>
                  <th className="p-2">Date & Time</th>
                  <th className="p-2">Refund Mode</th>
                  <th className="p-2 text-right">Refund Amount</th>
                  <th className="p-2">Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {returns.map((ret) => (
                  <tr key={ret.id}>
                    <td className="p-2 font-mono font-bold text-purple-400">{ret.returnNumber}</td>
                    <td className="p-2 font-mono text-sky-400">{ret.originalBillNumber}</td>
                    <td className="p-2 font-semibold text-slate-200">{ret.customerName}</td>
                    <td className="p-2 text-slate-400 font-mono text-[11px]">
                      {formatIndianDate(ret.createdAt)}
                    </td>
                    <td className="p-2 font-mono">{ret.refundMethod}</td>
                    <td className="p-2 text-right font-mono font-bold text-rose-400">
                      -{formatINR(ret.totalRefundAmount)}
                    </td>
                    <td className="p-2 text-slate-400">{ret.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
