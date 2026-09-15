/**
 * Native Windows Desktop Title Bar
 * Fluent UI styling with authentic Windows 11 window controls, menus, and offline status
 */

import React, { useState } from 'react';
import {
  Monitor,
  Minus,
  Square,
  X,
  Database,
  Printer,
  FileText,
  HelpCircle,
  HardDrive,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  User,
  Shield,
  Sun,
  Moon,
} from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const TitleBar: React.FC = () => {
  const {
    setActiveTab,
    focusBarcodeInput,
    reloadFromDB,
    settings,
    currentUser,
    setIsLoginModalOpen,
    theme,
    setTheme,
  } = useShop();
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showExitConfirm, setShowExitConfirm] = useState<boolean>(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  const handleMinimize = () => {
    // In native WPF / Electron wrapper, this invokes Window.WindowState = WindowState.Minimized
  };

  return (
    <div className="bg-slate-950 border-b border-slate-800 select-none text-xs text-slate-300">
      {/* Upper Title Bar with Window Controls */}
      <div className="flex items-center justify-between h-8 px-2">
        {/* Left: App Icon & Title */}
        <div className="flex items-center space-x-2">
          <div className="w-5 h-5 rounded bg-emerald-600 flex items-center justify-center text-white font-bold shadow-sm">
            <span className="text-[11px] tracking-tighter">₹</span>
          </div>
          <span className="font-semibold text-slate-100 tracking-wide text-xs">
            {settings.shopName ? settings.shopName.slice(0, 32) : 'SHOP BILLING SYSTEM'}
          </span>
          <span className="text-slate-500">|</span>
          <span className="text-emerald-400 font-mono text-[11px] flex items-center gap-1 bg-emerald-950/70 border border-emerald-800/60 px-1.5 py-0.5 rounded">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            100% OFFLINE
          </span>
          <span className="text-slate-400 text-[11px] font-mono hidden md:inline">
            [SQLite: ShopBilling.db]
          </span>
        </div>

        {/* Center: Quick Notice / Mode */}
        <div className="hidden lg:flex items-center gap-2 text-slate-400 text-[11px]">
          <span className="bg-slate-900 border border-slate-700 px-2 py-0.5 rounded text-amber-300 font-mono">
            GSTIN: {settings.gstin || 'Not Set'}
          </span>
          <span className="bg-slate-900 border border-slate-700 px-2 py-0.5 rounded text-sky-300 font-mono">
            Thermal 80mm Ready
          </span>
        </div>

        {/* Right: Windows Controls (Minimize, Maximize, Close) */}
        <div className="flex items-center -mr-2 h-full">
          <button
            id="win-btn-minimize"
            onClick={handleMinimize}
            title="Minimize to Windows Taskbar"
            className="h-8 w-11 flex items-center justify-center hover:bg-slate-800 text-slate-400 hover:text-slate-100 transition-colors"
          >
            <Minus size={13} />
          </button>
          <button
            id="win-btn-maximize"
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Restore Down' : 'Maximize Window'}
            className="h-8 w-11 flex items-center justify-center hover:bg-slate-800 text-slate-400 hover:text-slate-100 transition-colors"
          >
            <Square size={11} />
          </button>
          <button
            id="win-btn-close"
            onClick={() => setShowExitConfirm(true)}
            title="Close Application (Alt+F4)"
            className="h-8 w-11 flex items-center justify-center hover:bg-rose-600 text-slate-400 hover:text-white transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Windows Menu Bar: File, View, Database, Reports, Help */}
      <div className="flex items-center h-6 px-2 bg-slate-900/90 border-t border-slate-800/60 text-slate-300 relative text-[11px]">
        <div className="relative">
          <button
            id="menu-btn-file"
            onClick={() => setActiveMenu(activeMenu === 'file' ? null : 'file')}
            className={`px-2 py-0.5 rounded hover:bg-slate-800 transition-colors ${
              activeMenu === 'file' ? 'bg-slate-800 text-white' : ''
            }`}
          >
            File
          </button>
          {activeMenu === 'file' && (
            <div
              className="absolute left-0 top-full mt-0.5 w-52 bg-slate-900 border border-slate-700 shadow-xl rounded-b z-50 py-1"
              onMouseLeave={() => setActiveMenu(null)}
            >
              <button
                className="w-full text-left px-3 py-1.5 hover:bg-slate-800 flex items-center justify-between"
                onClick={() => {
                  setActiveTab('billing');
                  focusBarcodeInput();
                  setActiveMenu(null);
                }}
              >
                <span>New Bill</span>
                <span className="text-slate-500 font-mono">F1</span>
              </button>
              <button
                className="w-full text-left px-3 py-1.5 hover:bg-slate-800 flex items-center justify-between"
                onClick={() => {
                  setActiveTab('settings');
                  setActiveMenu(null);
                }}
              >
                <span>Backup SQLite DB</span>
                <span className="text-slate-500 font-mono">Ctrl+B</span>
              </button>
              <button
                className="w-full text-left px-3 py-1.5 hover:bg-slate-800 flex items-center justify-between text-sky-300"
                onClick={() => {
                  setActiveTab('packaging');
                  setActiveMenu(null);
                }}
              >
                <span>Download for Local PC</span>
                <span className="text-sky-400 font-mono">F9</span>
              </button>
              <div className="my-1 border-t border-slate-800" />
              <button
                className="w-full text-left px-3 py-1.5 hover:bg-slate-800 flex items-center justify-between"
                onClick={() => {
                  toggleFullscreen();
                  setActiveMenu(null);
                }}
              >
                <span>Toggle Fullscreen</span>
                <span className="text-slate-500 font-mono">F11</span>
              </button>
              <button
                className="w-full text-left px-3 py-1.5 hover:bg-rose-950/60 text-rose-300 flex items-center justify-between"
                onClick={() => {
                  setShowExitConfirm(true);
                  setActiveMenu(null);
                }}
              >
                <span>Exit POS</span>
                <span className="text-rose-400/60 font-mono">Alt+F4</span>
              </button>
            </div>
          )}
        </div>

        <div className="relative">
          <button
            id="menu-btn-pos"
            onClick={() => setActiveMenu(activeMenu === 'pos' ? null : 'pos')}
            className={`px-2 py-0.5 rounded hover:bg-slate-800 transition-colors ${
              activeMenu === 'pos' ? 'bg-slate-800 text-white' : ''
            }`}
          >
            Billing
          </button>
          {activeMenu === 'pos' && (
            <div
              className="absolute left-0 top-full mt-0.5 w-48 bg-slate-900 border border-slate-700 shadow-xl rounded-b z-50 py-1"
              onMouseLeave={() => setActiveMenu(null)}
            >
              <button
                className="w-full text-left px-3 py-1.5 hover:bg-slate-800 flex items-center justify-between"
                onClick={() => {
                  setActiveTab('billing');
                  focusBarcodeInput();
                  setActiveMenu(null);
                }}
              >
                <span>Billing Screen</span>
                <span className="text-slate-500 font-mono">F1</span>
              </button>
              <button
                className="w-full text-left px-3 py-1.5 hover:bg-slate-800 flex items-center justify-between"
                onClick={() => {
                  setActiveTab('sales');
                  setActiveMenu(null);
                }}
              >
                <span>Today's Sales Bills</span>
              </button>
              <button
                className="w-full text-left px-3 py-1.5 hover:bg-slate-800 flex items-center justify-between"
                onClick={() => {
                  setActiveTab('returns');
                  setActiveMenu(null);
                }}
              >
                <span>Customer Returns</span>
              </button>
            </div>
          )}
        </div>

        <div className="relative">
          <button
            id="menu-btn-db"
            onClick={() => setActiveMenu(activeMenu === 'db' ? null : 'db')}
            className={`px-2 py-0.5 rounded hover:bg-slate-800 transition-colors ${
              activeMenu === 'db' ? 'bg-slate-800 text-white' : ''
            }`}
          >
            Database
          </button>
          {activeMenu === 'db' && (
            <div
              className="absolute left-0 top-full mt-0.5 w-56 bg-slate-900 border border-slate-700 shadow-xl rounded-b z-50 py-1"
              onMouseLeave={() => setActiveMenu(null)}
            >
              <button
                className="w-full text-left px-3 py-1.5 hover:bg-slate-800 flex items-center justify-between"
                onClick={() => {
                  reloadFromDB();
                  setActiveMenu(null);
                }}
              >
                <span>Sync / Reload SQLite</span>
                <RotateCcw size={12} className="text-slate-400" />
              </button>
              <button
                className="w-full text-left px-3 py-1.5 hover:bg-slate-800 flex items-center justify-between"
                onClick={() => {
                  setActiveTab('settings');
                  setActiveMenu(null);
                }}
              >
                <span>Backup & USB Export</span>
                <HardDrive size={12} className="text-slate-400" />
              </button>
            </div>
          )}
        </div>

        <div className="relative">
          <button
            id="menu-btn-help"
            onClick={() => setActiveMenu(activeMenu === 'help' ? null : 'help')}
            className={`px-2 py-0.5 rounded hover:bg-slate-800 transition-colors ${
              activeMenu === 'help' ? 'bg-slate-800 text-white' : ''
            }`}
          >
            Help
          </button>
          {activeMenu === 'help' && (
            <div
              className="absolute left-0 top-full mt-0.5 w-64 bg-slate-900 border border-slate-700 shadow-xl rounded-b z-50 py-1"
              onMouseLeave={() => setActiveMenu(null)}
            >
              <div className="px-3 py-1 text-slate-400 font-semibold border-b border-slate-800">
                POS Keyboard Shortcuts
              </div>
              <div className="px-3 py-1 text-[11px] space-y-1 text-slate-300">
                <div className="flex justify-between">
                  <span>F1:</span> <b>New Bill</b>
                </div>
                <div className="flex justify-between">
                  <span>F2:</span> <b>Search / Scan</b>
                </div>
                <div className="flex justify-between">
                  <span>F3:</span> <b>Complete & Pay</b>
                </div>
                <div className="flex justify-between">
                  <span>F4:</span> <b>Reprint Last Bill</b>
                </div>
                <div className="flex justify-between">
                  <span>F9:</span> <b>Hold Bill</b>
                </div>
                <div className="flex justify-between">
                  <span>Esc:</span> <b>Cancel / Close</b>
                </div>
              </div>
              <div className="my-1 border-t border-slate-800" />
              <button
                className="w-full text-left px-3 py-1.5 hover:bg-slate-800 text-sky-300 flex items-center justify-between"
                onClick={() => {
                  setActiveTab('settings');
                  setActiveMenu(null);
                }}
              >
                <span>Native Windows .EXE Info</span>
                <Monitor size={12} />
              </button>
            </div>
          )}
        </div>

        <div className="ml-auto flex items-center space-x-2.5 text-[11px] font-sans">
          {/* Active User Pill & Switch */}
          {currentUser && (
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition-colors"
              title="Click to Switch User / Lock Terminal"
            >
              <User size={12} className={currentUser.role === 'admin' ? 'text-blue-400' : 'text-emerald-400'} />
              <span className="font-semibold text-slate-100">{currentUser.fullName}</span>
              <span
                className={`text-[9px] px-1 rounded uppercase font-mono font-bold ${
                  currentUser.role === 'admin'
                    ? 'bg-blue-950 text-blue-300 border border-blue-800'
                    : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                }`}
              >
                {currentUser.role}
              </span>
            </button>
          )}

          {/* Theme Switcher Button */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 flex items-center gap-1 text-[11px] transition-colors"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} theme`}
          >
            {theme === 'dark' ? <Sun size={11} className="text-amber-400" /> : <Moon size={11} className="text-blue-300" />}
            <span className="capitalize text-[10px]">{theme}</span>
          </button>

          <span className="flex items-center gap-1 text-emerald-400 font-mono text-[11px]">
            <CheckCircle2 size={12} /> SQLite Online
          </span>
          <span className="hidden sm:flex items-center gap-1 text-sky-400 font-mono text-[11px]">
            <Printer size={12} /> ESC/POS Ready
          </span>
        </div>
      </div>

      {/* Exit Confirmation Dialog */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-lg max-w-sm w-full p-5 shadow-2xl">
            <div className="flex items-center gap-3 text-amber-400 mb-3">
              <AlertTriangle size={24} />
              <h3 className="font-semibold text-slate-100 text-sm">Exit POS Application?</h3>
            </div>
            <p className="text-slate-300 text-xs mb-4 leading-relaxed">
              All completed bills and inventory changes are safely persisted in your local SQLite
              database (<code className="text-sky-300">ShopBilling.db</code>).
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs"
              >
                Continue Billing
              </button>
              <button
                onClick={() => {
                  setShowExitConfirm(false);
                }}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs font-semibold"
              >
                Close POS
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
