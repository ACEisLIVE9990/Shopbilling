/**
 * Sales History & Invoices Management Screen
 * Search bills, itemized review, instant reprint (thermal/A4), bill cancellation, and return trigger
 */

import React, { useState } from 'react';
import {
  BadgePercent,
  Search,
  Printer,
  Ban,
  RotateCcw,
  Eye,
  FileSpreadsheet,
  Filter,
  Calendar,
  X,
  AlertTriangle,
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { Bill } from '../../types';
import { formatINR, formatIndianDate } from '../../utils/formatters';

export const SalesScreen: React.FC = () => {
  const { bills, openReceiptForBill, cancelBill, setActiveTab } = useShop();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [selectedBillForDetails, setSelectedBillForDetails] = useState<Bill | null>(null);

  // Cancellation Modal
  const [cancellingBill, setCancellingBill] = useState<Bill | null>(null);
  const [cancelReason, setCancelReason] = useState<string>('Customer requested cancellation / Bill error');

  const handleConfirmCancel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancellingBill) return;
    cancelBill(cancellingBill.id, cancelReason);
    setCancellingBill(null);
    if (selectedBillForDetails?.id === cancellingBill.id) {
      setSelectedBillForDetails(null);
    }
  };

  const filteredBills = bills.filter((b) => {
    const matchesSearch =
      b.billNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.customerPhone && b.customerPhone.includes(searchQuery));

    const matchesPayment = paymentFilter === 'all' || b.paymentMethod === paymentFilter;
    return matchesSearch && matchesPayment;
  });

  const totalSalesVolume = filteredBills
    .filter((b) => b.status === 'Completed')
    .reduce((sum, b) => sum + b.grandTotal, 0);

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-hidden text-slate-100">
      {/* Top Header */}
      <div className="p-4 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <BadgePercent size={18} className="text-emerald-400" />
            Sales History & Invoices ({bills.length})
          </h2>
          <p className="text-xs text-slate-400">
            View completed bills, reprint thermal receipts, and audit transactions.
          </p>
        </div>

        <div className="bg-slate-800 border border-slate-700 px-3 py-1.5 rounded text-xs">
          <span className="text-slate-400">Filtered Sales: </span>
          <b className="font-mono text-emerald-400 text-sm">{formatINR(totalSalesVolume)}</b>
        </div>
      </div>

      {/* Filter and Search Ribbon */}
      <div className="p-3 bg-slate-900/60 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
            <Search size={14} />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Bill Number (e.g. INV-2026-...), Customer Name, or Phone..."
            className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
          />
        </div>

        {/* Payment Filter */}
        <div className="flex items-center gap-2 text-slate-400">
          <span>Payment:</span>
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-slate-200 rounded px-2 py-1 text-xs focus:outline-none"
          >
            <option value="all">All Methods</option>
            <option value="Cash">Cash</option>
            <option value="UPI">UPI</option>
            <option value="Card">Card</option>
            <option value="Credit">Credit</option>
          </select>
        </div>
      </div>

      {/* Bills Table */}
      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-900/90 text-slate-400 font-semibold sticky top-0 border-b border-slate-800 z-10">
            <tr>
              <th className="py-2.5 px-3">Invoice No</th>
              <th className="py-2.5 px-3">Date & Time</th>
              <th className="py-2.5 px-3">Customer</th>
              <th className="py-2.5 px-2 text-center">Payment</th>
              <th className="py-2.5 px-3 text-right">Taxable</th>
              <th className="py-2.5 px-3 text-right">Total Tax</th>
              <th className="py-2.5 px-3 text-right">Grand Total</th>
              <th className="py-2.5 px-2 text-center">Status</th>
              <th className="py-2.5 px-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-sans">
            {filteredBills.map((b) => (
              <tr key={b.id} className="hover:bg-slate-900/40 transition-colors">
                <td className="py-2 px-3 font-mono font-bold text-sky-400">{b.billNumber}</td>
                <td className="py-2 px-3 text-slate-400 font-mono text-[11px]">
                  {formatIndianDate(b.createdAt)}
                </td>
                <td className="py-2 px-3">
                  <div className="font-semibold text-slate-200">{b.customerName}</div>
                  {b.customerPhone && (
                    <div className="text-[10px] text-slate-500 font-mono">{b.customerPhone}</div>
                  )}
                </td>
                <td className="py-2 px-2 text-center">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                    {b.paymentMethod}
                  </span>
                </td>
                <td className="py-2 px-3 text-right font-mono text-slate-300">
                  {formatINR(b.subtotal)}
                </td>
                <td className="py-2 px-3 text-right font-mono text-slate-400">
                  {formatINR(b.totalTax)}
                </td>
                <td className="py-2 px-3 text-right font-mono font-bold text-emerald-400 text-sm">
                  {formatINR(b.grandTotal)}
                </td>
                <td className="py-2 px-2 text-center">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                      b.status === 'Completed'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : b.status === 'Cancelled'
                        ? 'bg-rose-950 text-rose-300 border border-rose-800'
                        : 'bg-amber-950 text-amber-300 border border-amber-800'
                    }`}
                  >
                    {b.status}
                  </span>
                </td>
                <td className="py-2 px-3 text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <button
                      onClick={() => setSelectedBillForDetails(b)}
                      className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded"
                      title="View Bill Items"
                    >
                      <Eye size={14} />
                    </button>
                    <button
                      onClick={() => openReceiptForBill(b)}
                      className="p-1 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded"
                      title="Reprint Bill"
                    >
                      <Printer size={14} />
                    </button>
                    {b.status === 'Completed' && (
                      <button
                        onClick={() => setCancellingBill(b)}
                        className="p-1 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded"
                        title="Cancel Bill & Restock"
                      >
                        <Ban size={14} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bill Itemized Details Modal */}
      {selectedBillForDetails && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-2xl w-full p-5 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Bill Details:</span>
                  <span className="font-mono text-sky-400">{selectedBillForDetails.billNumber}</span>
                </h3>
                <div className="text-[11px] text-slate-400">
                  {formatIndianDate(selectedBillForDetails.createdAt)} | Customer:{' '}
                  <b>{selectedBillForDetails.customerName}</b>
                </div>
              </div>
              <button
                onClick={() => setSelectedBillForDetails(null)}
                className="text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {/* Items List */}
            <div className="flex-1 overflow-y-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="p-2">Item Name</th>
                    <th className="p-2 text-center">HSN</th>
                    <th className="p-2 text-center">Qty</th>
                    <th className="p-2 text-right">Rate</th>
                    <th className="p-2 text-center">GST%</th>
                    <th className="p-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {selectedBillForDetails.items.map((it, idx) => (
                    <tr key={idx}>
                      <td className="p-2">
                        <div className="font-medium text-slate-200">{it.productName}</div>
                        <div className="text-[10px] text-slate-500 font-mono">Code: {it.barcode}</div>
                      </td>
                      <td className="p-2 text-center font-mono text-slate-400">{it.hsnCode}</td>
                      <td className="p-2 text-center font-mono font-bold text-slate-200">
                        {it.quantity} {it.unit}
                      </td>
                      <td className="p-2 text-right font-mono text-slate-300">
                        {it.unitPrice.toFixed(2)}
                      </td>
                      <td className="p-2 text-center font-mono text-amber-400">{it.gstRate}%</td>
                      <td className="p-2 text-right font-mono font-bold text-emerald-400">
                        {it.totalPrice.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer Summary */}
            <div className="p-3 bg-slate-950 rounded border border-slate-800 text-xs flex justify-between items-center">
              <div className="text-slate-400 space-y-0.5">
                <div>Payment Mode: <b className="text-white uppercase">{selectedBillForDetails.paymentMethod}</b></div>
                <div>Taxable: <b>{formatINR(selectedBillForDetails.subtotal)}</b> | Total Tax: <b>{formatINR(selectedBillForDetails.totalTax)}</b></div>
              </div>
              <div className="text-right">
                <div className="text-slate-400 text-[11px]">Grand Total:</div>
                <div className="text-xl font-bold font-mono text-emerald-400">
                  {formatINR(selectedBillForDetails.grandTotal)}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => {
                  openReceiptForBill(selectedBillForDetails);
                  setSelectedBillForDetails(null);
                }}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold flex items-center gap-1.5"
              >
                <Printer size={13} /> Print Receipt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Bill Confirmation Modal */}
      {cancellingBill && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-rose-400">
              <AlertTriangle size={20} />
              <h3 className="text-sm font-bold text-white">Cancel Invoice #{cancellingBill.billNumber}?</h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Cancelling this bill will automatically restore all{' '}
              <b className="text-emerald-400">{cancellingBill.items.length} product items</b> back
              into your local SQLite inventory and reverse any credit balance.
            </p>

            <form onSubmit={handleConfirmCancel} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Reason for Cancellation *</label>
                <input
                  type="text"
                  required
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded text-slate-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCancellingBill(null)}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded text-xs"
                >
                  Keep Active
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded text-xs font-bold"
                >
                  Confirm Cancellation & Restock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
