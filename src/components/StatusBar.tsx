/**
 * Native Windows Desktop Status Bar
 * Displays offline connectivity status, local SQLite connection, active terminal,
 * live Indian date/time clock, and keyboard shortcut legend
 */

import React, { useState, useEffect } from 'react';
import {
  WifiOff,
  Database,
  Printer,
  User,
  Clock,
  Keyboard,
  HardDrive,
  ShieldCheck,
} from 'lucide-react';
import { formatIndianDate } from '../utils/formatters';
import { useShop } from '../context/ShopContext';

export const StatusBar: React.FC = () => {
  const { currentUser } = useShop();
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <footer className="h-7 bg-slate-950 border-t border-slate-800 px-3 flex items-center justify-between text-[11px] text-slate-400 select-none z-20">
      {/* Left: System Status & Offline Verification */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center gap-1.5 text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
          <WifiOff size={11} className="text-emerald-400" />
          <span className="font-semibold tracking-wide">100% OFFLINE</span>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-sky-400">
          <Database size={11} />
          <span>SQLite:</span>
          <span className="font-mono text-slate-200">ShopBilling.db</span>
        </div>

        <div className="hidden md:flex items-center gap-1 text-slate-400">
          <Printer size={11} className="text-slate-400" />
          <span>Printer:</span>
          <span className="text-slate-200">Thermal 80mm / A4</span>
        </div>

        <div className="hidden lg:flex items-center gap-1 text-slate-400">
          <User size={11} className={currentUser?.role === 'admin' ? 'text-blue-400' : 'text-emerald-400'} />
          <span>User:</span>
          <span className="text-slate-200 font-medium">
            {currentUser ? `${currentUser.fullName} [${currentUser.role.toUpperCase()}]` : 'Guest'}
          </span>
        </div>
      </div>

      {/* Center: Key Shortcuts Legend */}
      <div className="hidden xl:flex items-center gap-2 text-[10px] text-slate-400">
        <span className="flex items-center gap-1 bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded text-slate-300">
          <b className="text-emerald-400 font-mono">[F1]</b> New Bill
        </span>
        <span className="flex items-center gap-1 bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded text-slate-300">
          <b className="text-sky-400 font-mono">[F2]</b> Scan / Search
        </span>
        <span className="flex items-center gap-1 bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded text-slate-300">
          <b className="text-amber-400 font-mono">[F3]</b> Complete & Pay
        </span>
        <span className="flex items-center gap-1 bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded text-slate-300">
          <b className="text-purple-400 font-mono">[F9]</b> Hold Bill
        </span>
        <span className="flex items-center gap-1 bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded text-slate-300">
          <b className="text-rose-400 font-mono">[Esc]</b> Clear
        </span>
      </div>

      {/* Right: Indian Clock & Safe Sync Indicator */}
      <div className="flex items-center space-x-3 font-mono">
        <div className="flex items-center gap-1 text-emerald-400">
          <ShieldCheck size={11} />
          <span className="hidden sm:inline">Encrypted Local DB</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-200 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
          <Clock size={11} className="text-amber-400" />
          <span>{formatIndianDate(currentTime)}</span>
        </div>
      </div>
    </footer>
  );
};
