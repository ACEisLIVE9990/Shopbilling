/**
 * Shop Settings, Hardware, Customer Loyalty & Offline SQLite Backup/Restore Screen
 * Restricted to Administrator role.
 */

import React, { useState } from 'react';
import {
  Settings,
  Store,
  Printer,
  Volume2,
  HardDrive,
  Download,
  Upload,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  FolderOpen,
  Monitor,
  ShieldCheck,
  ShieldAlert,
  Award,
  Star,
  Sun,
  Moon,
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { ShopSettings, LoyaltySettings } from '../../types';
import { soundManager } from '../../utils/audio';

export const SettingsScreen: React.FC = () => {
  const {
    settings,
    updateSettings,
    exportDatabaseBackup,
    restoreDatabaseBackup,
    resetToDemoData,
    db,
    loyaltySettings,
    updateLoyaltySettings,
    isAdmin,
    theme,
    setTheme,
  } = useShop();

  const [formData, setFormData] = useState<ShopSettings>(settings);
  const [loyaltyForm, setLoyaltyForm] = useState<LoyaltySettings>(loyaltySettings);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [loyaltySaveSuccess, setLoyaltySaveSuccess] = useState<boolean>(false);
  const [restoreStatus, setRestoreStatus] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);

  if (!isAdmin) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-950 text-slate-300">
        <div className="p-5 bg-rose-950/60 border border-rose-800/80 rounded-2xl max-w-md space-y-3">
          <ShieldAlert size={48} className="mx-auto text-rose-400" />
          <h2 className="text-lg font-bold text-white">Access Denied: Admin Rights Required</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Employee and Cashier terminals cannot change shop settings, modify loyalty point rules,
            or export/restore the SQLite database. Please login as Administrator.
          </p>
        </div>
      </div>
    );
  }

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
    soundManager.setEnabled(formData.soundEffectsEnabled);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleSaveLoyalty = (e: React.FormEvent) => {
    e.preventDefault();
    updateLoyaltySettings(loyaltyForm);
    setLoyaltySaveSuccess(true);
    setTimeout(() => setLoyaltySaveSuccess(false), 3000);
  };

  const handleFileRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = restoreDatabaseBackup(content);
        if (success) {
          setRestoreStatus('Database restored successfully from local backup file!');
        } else {
          setRestoreStatus('Failed to parse backup file. Please check format.');
        }
      }
    };
    reader.readAsText(file);
  };

  const handleDownloadSQLDump = () => {
    const sql = db.generateSQLDump();
    const blob = new Blob([sql], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ShopBilling_Schema_Dump_${new Date().toISOString().split('T')[0]}.sql`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-hidden text-slate-100">
      {/* Top Header */}
      <div className="p-4 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Settings size={18} className="text-slate-400" />
            Shop Configuration, Loyalty Rules & SQLite Database
          </h2>
          <p className="text-xs text-slate-400">
            Customize invoice letterhead, GSTIN, hardware printers, customer loyalty rules, and offline backups.
          </p>
        </div>

        {saveSuccess && (
          <div className="p-2 bg-emerald-950 border border-emerald-800 text-emerald-300 rounded text-xs flex items-center gap-1.5 animate-fade-in">
            <CheckCircle size={14} /> Settings saved successfully!
          </div>
        )}
      </div>

      {/* Main Settings Form Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 max-w-5xl">
        {/* SECTION 1: SHOP PROFILE & GST TAX */}
        <form onSubmit={handleSaveSettings} className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800 text-sm font-bold text-white">
              <Store size={16} className="text-emerald-400" />
              Shop Identity & GST Details (Printed on Invoices)
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Shop / Business Name *</label>
                <input
                  type="text"
                  required
                  value={formData.shopName}
                  onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded text-slate-200"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Tagline / Sub-heading</label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded text-slate-200"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-slate-300 font-semibold block mb-1">Store Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded text-slate-200"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Phone / Helpline</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded text-slate-200 font-mono"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded text-slate-200"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">GSTIN (15 Digits)</label>
                <input
                  type="text"
                  maxLength={15}
                  value={formData.gstin}
                  onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded text-amber-300 font-mono font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">State Name</label>
                  <input
                    type="text"
                    value={formData.stateName}
                    onChange={(e) => setFormData({ ...formData, stateName: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">State Code</label>
                  <input
                    type="text"
                    value={formData.stateCode}
                    onChange={(e) => setFormData({ ...formData, stateCode: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded text-slate-200 font-mono"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="text-slate-300 font-semibold block mb-1">Receipt Footer Note / Return Policy</label>
                <input
                  type="text"
                  value={formData.invoiceFooterNote}
                  onChange={(e) => setFormData({ ...formData, invoiceFooterNote: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded text-slate-200"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: HARDWARE, PRINTER & THEME PREFERENCES */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800 text-sm font-bold text-white">
              <Printer size={16} className="text-sky-400" />
              Windows POS Hardware, Theme & Printing
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Default Printer Paper</label>
                <select
                  value={formData.defaultPrinterType}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      defaultPrinterType: e.target.value as '80mm' | '58mm' | 'A4',
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded text-slate-200"
                >
                  <option value="80mm">Thermal Receipt 80mm (3-Inch Standard ESC/POS)</option>
                  <option value="58mm">Thermal Receipt 58mm (2-Inch Mini Thermal)</option>
                  <option value="A4">Standard A4 / Letter Tax Invoice</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Application UI Theme</label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setTheme('dark');
                      setFormData({ ...formData, theme: 'dark' });
                    }}
                    className={`flex-1 py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      theme === 'dark'
                        ? 'bg-blue-600 text-white border-blue-500 shadow'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Moon size={14} /> Dark Theme (Recommended for POS)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTheme('light');
                      setFormData({ ...formData, theme: 'light' });
                    }}
                    className={`flex-1 py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      theme === 'light'
                        ? 'bg-blue-600 text-white border-blue-500 shadow'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Sun size={14} /> Light Theme
                  </button>
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Bill Number Prefix</label>
                <input
                  type="text"
                  value={formData.billPrefix}
                  onChange={(e) => setFormData({ ...formData, billPrefix: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded font-mono text-slate-200"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-950 rounded border border-slate-800">
                <div>
                  <div className="font-semibold text-slate-200">Auto-Print On Bill Completion</div>
                  <div className="text-[11px] text-slate-500">
                    Automatically trigger Windows print dialog after saving invoice
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.autoPrintReceipt}
                  onChange={(e) =>
                    setFormData({ ...formData, autoPrintReceipt: e.target.checked })
                  }
                  className="w-4 h-4 rounded text-emerald-600 bg-slate-900 border-slate-700 focus:ring-0"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-950 rounded border border-slate-800 sm:col-span-2">
                <div>
                  <div className="font-semibold text-slate-200">POS Audio Sound Effects</div>
                  <div className="text-[11px] text-slate-500">
                    Play scanner beeps, error bells, and cash register chimes
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.soundEffectsEnabled}
                  onChange={(e) => {
                    const val = e.target.checked;
                    setFormData({ ...formData, soundEffectsEnabled: val });
                    soundManager.setEnabled(val);
                    if (val) soundManager.playCashRegister();
                  }}
                  className="w-4 h-4 rounded text-emerald-600 bg-slate-900 border-slate-700 focus:ring-0"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold shadow"
              >
                Save Shop & Hardware Preferences
              </button>
            </div>
          </div>
        </form>

        {/* SECTION 3: CUSTOMER LOYALTY PROGRAM SETTINGS */}
        <form onSubmit={handleSaveLoyalty} className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <Award size={16} className="text-amber-400" />
                Customer Loyalty & Rewards Program Rules
              </div>
              {loyaltySaveSuccess && (
                <div className="text-emerald-400 text-xs font-bold flex items-center gap-1">
                  <CheckCircle size={14} /> Loyalty rules updated!
                </div>
              )}
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-950 rounded border border-slate-800">
              <div>
                <div className="font-semibold text-slate-200">Enable Customer Loyalty Program</div>
                <div className="text-[11px] text-slate-500">
                  Allow cashiers to award and redeem points during POS billing
                </div>
              </div>
              <input
                type="checkbox"
                checked={loyaltyForm.enabled}
                onChange={(e) => setLoyaltyForm({ ...loyaltyForm, enabled: e.target.checked })}
                className="w-4 h-4 rounded text-amber-500 bg-slate-900 border-slate-700 focus:ring-0"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Spend Requirement per Point (₹)
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 text-xs">1 Point awarded per every ₹</span>
                  <input
                    type="number"
                    min="1"
                    value={loyaltyForm.pointsPerRupeeSpent}
                    onChange={(e) =>
                      setLoyaltyForm({
                        ...loyaltyForm,
                        pointsPerRupeeSpent: Math.max(1, parseInt(e.target.value) || 100),
                      })
                    }
                    className="w-24 px-3 py-1.5 bg-slate-950 border border-slate-700 rounded text-amber-400 font-mono font-bold text-right"
                  />
                  <span className="text-slate-400 text-xs">spent</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Example: Bill of ₹850 awards +8 points at ₹100 per point.
                </p>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Redemption Monetary Value (₹ per Point)
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 text-xs">1 Point = ₹</span>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={loyaltyForm.rupeeValuePerPoint}
                    onChange={(e) =>
                      setLoyaltyForm({
                        ...loyaltyForm,
                        rupeeValuePerPoint: Math.max(0.1, parseFloat(e.target.value) || 1),
                      })
                    }
                    className="w-24 px-3 py-1.5 bg-slate-950 border border-slate-700 rounded text-emerald-400 font-mono font-bold text-right"
                  />
                  <span className="text-slate-400 text-xs">discount</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Example: Redeeming 100 points grants ₹100 discount.
                </p>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Minimum Points Required to Redeem
                </label>
                <input
                  type="number"
                  min="0"
                  value={loyaltyForm.minPointsToRedeem}
                  onChange={(e) =>
                    setLoyaltyForm({
                      ...loyaltyForm,
                      minPointsToRedeem: Math.max(0, parseInt(e.target.value) || 0),
                    })
                  }
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded font-mono text-slate-200"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Customers cannot redeem until their balance reaches this minimum threshold.
                </p>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Max Redeemable Points per Bill
                </label>
                <input
                  type="number"
                  min="1"
                  value={loyaltyForm.maxPointsRedeemablePerBill}
                  onChange={(e) =>
                    setLoyaltyForm({
                      ...loyaltyForm,
                      maxPointsRedeemablePerBill: Math.max(1, parseInt(e.target.value) || 500),
                    })
                  }
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded font-mono text-slate-200"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Limits maximum points a customer can burn in a single purchase.
                </p>
              </div>
            </div>

            {/* Loyalty Tier Matrix Table */}
            <div className="pt-2">
              <label className="text-slate-300 font-semibold block mb-1.5 text-xs">
                Membership Tier Requirements & Multipliers
              </label>
              <div className="overflow-hidden border border-slate-800 rounded-lg">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                    <tr>
                      <th className="py-2 px-3">Membership Level</th>
                      <th className="py-2 px-3">Points Requirement</th>
                      <th className="py-2 px-3">Multiplier Rate</th>
                      <th className="py-2 px-3">Member Benefit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-sans">
                    <tr>
                      <td className="py-2 px-3 font-bold text-amber-400 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-600"></span> Bronze
                      </td>
                      <td className="py-2 px-3 font-mono text-slate-300">0 – 999 points</td>
                      <td className="py-2 px-3 font-mono text-slate-300">1.0x (Standard)</td>
                      <td className="py-2 px-3 text-slate-400">Standard reward points on all bills</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-bold text-slate-200 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-slate-400"></span> Silver
                      </td>
                      <td className="py-2 px-3 font-mono text-slate-300">1,000 – 4,999 points</td>
                      <td className="py-2 px-3 font-mono text-sky-400 font-bold">1.25x (+25%)</td>
                      <td className="py-2 px-3 text-slate-400">Earn 25% bonus points on every purchase</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-bold text-yellow-300 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-yellow-400"></span> Gold
                      </td>
                      <td className="py-2 px-3 font-mono text-slate-300">5,000 – 9,999 points</td>
                      <td className="py-2 px-3 font-mono text-amber-400 font-bold">1.5x (+50%)</td>
                      <td className="py-2 px-3 text-slate-400">Earn 50% bonus points on all purchases</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-bold text-purple-300 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-purple-400"></span> Platinum
                      </td>
                      <td className="py-2 px-3 font-mono text-slate-300">10,000+ points</td>
                      <td className="py-2 px-3 font-mono text-purple-400 font-bold">2.0x (Double)</td>
                      <td className="py-2 px-3 text-slate-400">Double loyalty points on every bill</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 rounded text-xs font-bold shadow"
              >
                Save Loyalty Rules
              </button>
            </div>
          </div>
        </form>

        {/* SECTION 4: 100% OFFLINE LOCAL SQLITE DATA & BACKUPS */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <HardDrive size={16} className="text-amber-400" />
              Local SQLite Database & Offline Backups
            </div>
            <span className="text-[11px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
              C:\ProgramData\ShopBilling\ShopBilling.db
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Your data is stored <b>100% locally</b> in your local SQLite database with atomic transactions.
            No cloud servers or third-party APIs are contacted. Keep regular backups onto a USB pen drive
            or local folder to protect against hardware failure.
          </p>

          {restoreStatus && (
            <div className="p-3 bg-blue-950 border border-blue-800 text-blue-200 rounded text-xs flex items-center gap-2">
              <CheckCircle size={14} />
              <span>{restoreStatus}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            {/* 1. Export JSON Backup */}
            <button
              onClick={exportDatabaseBackup}
              className="p-3 bg-slate-950 hover:bg-slate-850 border border-slate-700 rounded-lg text-left transition-colors flex flex-col justify-between"
            >
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold mb-1">
                <Download size={15} />
                <span>Export Backup (.json)</span>
              </div>
              <div className="text-[11px] text-slate-400">
                Download complete shop database including all products, users, loyalty rules, bills, and customers.
              </div>
            </button>

            {/* 2. Export SQL Schema & Dump */}
            <button
              onClick={handleDownloadSQLDump}
              className="p-3 bg-slate-950 hover:bg-slate-850 border border-slate-700 rounded-lg text-left transition-colors flex flex-col justify-between"
            >
              <div className="flex items-center gap-2 text-sky-400 text-xs font-bold mb-1">
                <Download size={15} />
                <span>Export SQLite Dump (.sql)</span>
              </div>
              <div className="text-[11px] text-slate-400">
                Generate pure SQL DDL and INSERT statements compatible with standard SQLite3 CLI.
              </div>
            </button>

            {/* 3. Restore Database from File */}
            <label className="p-3 bg-slate-950 hover:bg-slate-850 border border-slate-700 rounded-lg text-left transition-colors flex flex-col justify-between cursor-pointer">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold mb-1">
                <Upload size={15} />
                <span>Restore From File</span>
              </div>
              <div className="text-[11px] text-slate-400">
                Import and restore all tables from a previously exported .db.json backup file.
              </div>
              <input
                type="file"
                accept=".json"
                onChange={handleFileRestore}
                className="hidden"
              />
            </label>
          </div>

          {/* Reset / Demo seed */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-300">Reset Demo Catalog</div>
              <div className="text-[11px] text-slate-500">
                Reload sample Indian grocery items, default users, loyalty rules, and demo bills.
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded text-xs flex items-center gap-1 font-medium"
            >
              <RefreshCw size={13} /> Reset Demo Data
            </button>
          </div>
        </div>
      </div>

      {/* Reset Demo Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-950/80 border border-amber-800 flex items-center justify-center shrink-0 text-amber-400">
                <RefreshCw size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-white">Reset Demo Database</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Reload sample Indian grocery items, demo users, and loyalty rules?
                </p>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 bg-slate-950 p-3 rounded border border-slate-800">
              This will restore the standard initial dataset into your local SQLite store. Any newly added unsaved test items will be reset.
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  resetToDemoData();
                  setShowResetConfirm(false);
                  setRestoreStatus('Reset to demo sample data successfully!');
                }}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 rounded text-xs font-bold shadow flex items-center gap-1.5"
              >
                <RefreshCw size={13} /> Yes, Reset Database
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
