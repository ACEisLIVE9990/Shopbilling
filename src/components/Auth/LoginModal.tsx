/**
 * Windows Desktop Offline Authentication & Role Switcher Modal
 * Supports Admin vs. Employee roles with secure local SQLite authentication
 */

import React, { useState } from 'react';
import { Shield, ShieldAlert, User, Lock, KeyRound, CheckCircle2, X } from 'lucide-react';
import { useShop } from '../../context/ShopContext';

export const LoginModal: React.FC = () => {
  const { isLoginModalOpen, setIsLoginModalOpen, login, currentUser, users } = useShop();

  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isLoginModalOpen && currentUser) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    const res = login(username, password);
    if (!res.success) {
      setErrorMessage(res.message || 'Invalid username or password');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full shadow-2xl overflow-hidden text-slate-100 animate-in fade-in zoom-in-95 duration-150">
        {/* Windows Header */}
        <div className="bg-slate-800/80 px-5 py-3.5 border-b border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-blue-600/30 border border-blue-500/40 rounded-lg text-blue-400">
              <Shield size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">
                Windows POS Security Login
              </h3>
              <p className="text-[11px] text-slate-400">Role-Based Access Control</p>
            </div>
          </div>
          {currentUser && (
            <button
              onClick={() => setIsLoginModalOpen(false)}
              className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-700/50"
              title="Close"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Form Body */}
        <div className="p-5 space-y-4 text-xs">
          {errorMessage && (
            <div className="p-3 bg-rose-950/70 border border-rose-800/80 rounded-lg text-rose-300 flex items-start gap-2">
              <ShieldAlert size={16} className="shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-slate-300 font-semibold block mb-1 flex items-center gap-1.5">
                <User size={13} className="text-slate-400" /> Username
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 font-mono focus:outline-none focus:border-blue-500 text-xs"
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1 flex items-center gap-1.5">
                <Lock size={13} className="text-slate-400" /> Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 font-mono focus:outline-none focus:border-blue-500 text-xs"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-900/40 text-xs transition-colors mt-2"
            >
              <KeyRound size={15} /> Authenticate & Open Session
            </button>
          </form>

          {/* Role Access Matrix Summary */}
          <div className="pt-3 border-t border-slate-800 space-y-1.5 text-[11px] text-slate-400">
            <div className="flex items-center justify-between font-semibold text-slate-300">
              <span>Offline RBAC Security:</span>
              <span className="text-emerald-400 flex items-center gap-1 text-[10px]">
                <CheckCircle2 size={12} /> Local SQLite Guard
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div className="bg-slate-950 p-2 rounded border border-slate-800">
                <span className="font-bold text-blue-400 block mb-0.5">Admin Role:</span>
                Full control: Inventory, Products, Sales history, Khata, Returns, Reports, Employee accounts, Settings, Loyalty rules.
              </div>
              <div className="bg-slate-950 p-2 rounded border border-slate-800">
                <span className="font-bold text-emerald-400 block mb-0.5">Employee Role:</span>
                Access ONLY to Billing terminal, barcode scanning, customer selection, and loyalty rewards redemption.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
