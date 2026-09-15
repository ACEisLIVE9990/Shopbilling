/**
 * Customers & Khata Ledger Management Screen
 * Manages regular customers, B2B GSTINs, and Udhaar / Credit Balance settlement
 */

import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Phone,
  IndianRupee,
  ReceiptText,
  AlertCircle,
  X,
  CreditCard,
  Building,
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { Customer } from '../../types';
import { formatINR, formatIndianDate } from '../../utils/formatters';

export const CustomersScreen: React.FC = () => {
  const { customers, saveCustomer, recordCustomerPayment, bills, openReceiptForBill } = useShop();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [onlyCreditDue, setOnlyCreditDue] = useState<boolean>(false);

  // Add / Edit Modal
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [gstin, setGstin] = useState<string>('');
  const [address, setAddress] = useState<string>('');

  // Payment Settlement Modal
  const [settleCustomer, setSettleCustomer] = useState<Customer | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);

  const openAddModal = () => {
    setEditingCustomer(null);
    setName('');
    setPhone('');
    setEmail('');
    setGstin('');
    setAddress('');
    setIsModalOpen(true);
  };

  const openEditModal = (c: Customer) => {
    setEditingCustomer(c);
    setName(c.name);
    setPhone(c.phone);
    setEmail(c.email || '');
    setGstin(c.gstin || '');
    setAddress(c.address || '');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    const payload: Customer = {
      id: editingCustomer ? editingCustomer.id : `cust-${Date.now()}`,
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      gstin: gstin.trim() || undefined,
      address: address.trim() || undefined,
      creditBalance: editingCustomer ? editingCustomer.creditBalance : 0,
      totalBills: editingCustomer ? editingCustomer.totalBills : 0,
      totalSpent: editingCustomer ? editingCustomer.totalSpent : 0,
      loyaltyPoints: editingCustomer ? (editingCustomer.loyaltyPoints || 0) : 0,
      visitsCount: editingCustomer ? (editingCustomer.visitsCount || 0) : 0,
      membershipTier: editingCustomer ? (editingCustomer.membershipTier || 'Bronze') : 'Bronze',
      createdAt: editingCustomer ? editingCustomer.createdAt : new Date().toISOString(),
    };

    saveCustomer(payload);
    setIsModalOpen(false);
  };

  const handleSettlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!settleCustomer || paymentAmount <= 0) return;
    recordCustomerPayment(settleCustomer.id, paymentAmount);
    setSettleCustomer(null);
  };

  const filtered = customers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      (c.gstin && c.gstin.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCredit = !onlyCreditDue || c.creditBalance > 0;
    return matchesSearch && matchesCredit;
  });

  const totalCreditOutstanding = customers.reduce((sum, c) => sum + c.creditBalance, 0);

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-hidden text-slate-100">
      {/* Top Header */}
      <div className="p-4 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Users size={18} className="text-sky-400" />
            Customer Directory & Khata Book ({customers.length})
          </h2>
          <p className="text-xs text-slate-400">
            Track frequent buyers, B2B GSTIN registrations, and credit balances.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {totalCreditOutstanding > 0 && (
            <div className="bg-amber-950/60 border border-amber-800/60 px-3 py-1.5 rounded text-xs text-amber-300 font-medium">
              Total Outstanding Khata:{' '}
              <b className="font-mono text-amber-400">{formatINR(totalCreditOutstanding)}</b>
            </div>
          )}

          <button
            onClick={openAddModal}
            className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded text-xs font-bold flex items-center gap-1.5 shadow"
          >
            <UserPlus size={15} /> Add Customer
          </button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="p-3 bg-slate-900/60 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
            <Search size={14} />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by customer name, mobile number, or GSTIN..."
            className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded text-xs text-slate-200 focus:outline-none focus:border-sky-500 font-mono"
          />
        </div>

        <label className="flex items-center gap-1.5 text-slate-400 cursor-pointer hover:text-slate-200">
          <input
            type="checkbox"
            checked={onlyCreditDue}
            onChange={(e) => setOnlyCreditDue(e.target.checked)}
            className="rounded border-slate-700 text-amber-600 focus:ring-0"
          />
          <span className="text-amber-400 font-medium">Pending Khata / Credit Only</span>
        </label>
      </div>

      {/* Customers List */}
      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-900/90 text-slate-400 font-semibold sticky top-0 border-b border-slate-800 z-10">
            <tr>
              <th className="py-2.5 px-3">Customer ID / Name</th>
              <th className="py-2.5 px-3">Mobile Number</th>
              <th className="py-2.5 px-3">Membership Tier</th>
              <th className="py-2.5 px-3 text-right">Loyalty Points</th>
              <th className="py-2.5 px-3 text-center">Visits</th>
              <th className="py-2.5 px-3">GSTIN (B2B)</th>
              <th className="py-2.5 px-3 text-center">Bills</th>
              <th className="py-2.5 px-3 text-right">Total Spent</th>
              <th className="py-2.5 px-3 text-right">Khata Due (₹)</th>
              <th className="py-2.5 px-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-sans">
            {filtered.map((c) => {
              const tier = c.membershipTier || 'Bronze';
              const tierBadgeClass =
                tier === 'Platinum'
                  ? 'bg-purple-950/70 text-purple-300 border-purple-700'
                  : tier === 'Gold'
                  ? 'bg-yellow-950/70 text-yellow-300 border-yellow-600'
                  : tier === 'Silver'
                  ? 'bg-slate-800 text-slate-200 border-slate-600'
                  : 'bg-amber-950/60 text-amber-400 border-amber-800';

              return (
                <tr key={c.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-2 px-3">
                    <div className="font-semibold text-slate-100">{c.name}</div>
                    <div className="text-[10px] font-mono text-slate-500">{c.id}</div>
                  </td>
                  <td className="py-2 px-3 font-mono text-slate-300">{c.phone}</td>
                  <td className="py-2 px-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[11px] font-bold ${tierBadgeClass}`}>
                      {tier}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-right font-mono font-bold">
                    <span className="text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/50">
                      ★ {c.loyaltyPoints || 0} pts
                    </span>
                  </td>
                  <td className="py-2 px-3 text-center font-mono text-slate-300">
                    {c.visitsCount || c.totalBills || 1}
                  </td>
                  <td className="py-2 px-3 font-mono text-slate-400">
                    {c.gstin ? (
                      <span className="text-amber-300 font-semibold">{c.gstin}</span>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="py-2 px-3 text-center font-mono text-slate-300">{c.totalBills}</td>
                  <td className="py-2 px-3 text-right font-mono text-slate-300">
                    {formatINR(c.totalSpent)}
                  </td>
                  <td className="py-2 px-3 text-right font-mono font-bold">
                    {c.creditBalance > 0 ? (
                      <span className="text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800">
                        {formatINR(c.creditBalance)}
                      </span>
                    ) : (
                      <span className="text-emerald-400 font-normal">₹ 0.00</span>
                    )}
                  </td>
                  <td className="py-2 px-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {c.creditBalance > 0 && (
                        <button
                          onClick={() => {
                            setSettleCustomer(c);
                            setPaymentAmount(c.creditBalance);
                          }}
                          className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-semibold"
                          title="Collect payment / settle khata balance"
                        >
                          Receive Pay
                        </button>
                      )}
                      <button
                        onClick={() => openEditModal(c)}
                        className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px]"
                      >
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Customer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Users size={16} className="text-sky-400" />
                {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ramesh Patel"
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded text-xs text-slate-100"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Mobile Number *</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="10-digit mobile number"
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded text-xs text-slate-100 font-mono"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">GSTIN (Optional, for B2B buyers)</label>
                <input
                  type="text"
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value.toUpperCase())}
                  placeholder="e.g. 27AAACA1234F1Z5"
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded text-xs text-amber-300 font-mono"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Billing Address</label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Shop / House No, Street, Landmark..."
                  rows={2}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded text-xs text-slate-100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded text-xs font-bold"
                >
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Settle Khata Payment Modal */}
      {settleCustomer && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-sm w-full p-5 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <CreditCard size={16} className="text-emerald-400" />
              Collect Customer Payment
            </h3>

            <div className="bg-slate-950 p-3 rounded border border-slate-800 text-xs space-y-1">
              <div className="font-semibold text-slate-200">{settleCustomer.name}</div>
              <div className="text-slate-400 font-mono">{settleCustomer.phone}</div>
              <div className="text-amber-400 font-bold mt-2">
                Outstanding Balance: {formatINR(settleCustomer.creditBalance)}
              </div>
            </div>

            <form onSubmit={handleSettlePayment} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Payment Received (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  min="1"
                  max={settleCustomer.creditBalance}
                  value={paymentAmount || ''}
                  onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded font-mono text-base font-bold text-emerald-400"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSettleCustomer(null)}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold"
                >
                  Record Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
