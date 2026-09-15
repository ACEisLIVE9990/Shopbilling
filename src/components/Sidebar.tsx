/**
 * Windows Desktop Sidebar Navigation
 * Matches requested modules with Role-Based Access Control (Admin vs Employee).
 */

import React from 'react';
import {
  LayoutDashboard,
  ReceiptText,
  Package,
  Boxes,
  Users,
  BadgePercent,
  RotateCcw,
  BarChart3,
  Settings,
  UserCog,
  Shield,
  Lock,
  LogOut,
  AlertTriangle,
  Sparkles,
  AppWindow,
  Download,
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { ActiveTab } from '../types';

interface NavItem {
  id: ActiveTab;
  label: string;
  icon: React.ReactNode;
  shortcut?: string;
  badge?: number | string;
  badgeColor?: string;
  adminOnly?: boolean;
}

export const Sidebar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    products,
    heldBills,
    bills,
    currentUser,
    isAdmin,
    isEmployee,
    setIsLoginModalOpen,
  } = useShop();

  // Count low stock items
  const lowStockCount = products.filter((p) => p.currentStock <= p.minStock).length;

  // Today's completed bills
  const todayStr = new Date().toISOString().split('T')[0];
  const todayBillsCount = bills.filter(
    (b) => b.createdAt.startsWith(todayStr) && b.status === 'Completed'
  ).length;

  const navItems: NavItem[] = [
    {
      id: 'billing',
      label: 'New Bill (POS)',
      icon: <ReceiptText size={18} />,
      shortcut: 'F1',
      badge: heldBills.length > 0 ? `${heldBills.length} Held` : undefined,
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      adminOnly: false,
    },
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard size={18} />,
      adminOnly: true,
    },
    {
      id: 'products',
      label: 'Products',
      icon: <Package size={18} />,
      badge: products.length,
      badgeColor: 'bg-slate-800 text-slate-300 border-slate-700',
      adminOnly: true,
    },
    {
      id: 'inventory',
      label: 'Inventory',
      icon: <Boxes size={18} />,
      badge: lowStockCount > 0 ? `${lowStockCount} Low` : undefined,
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      adminOnly: true,
    },
    {
      id: 'customers',
      label: 'Customers & Loyalty',
      icon: <Users size={18} />,
      adminOnly: true,
    },
    {
      id: 'sales',
      label: 'Sales History',
      icon: <BadgePercent size={18} />,
      badge: todayBillsCount > 0 ? todayBillsCount : undefined,
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      adminOnly: true,
    },
    {
      id: 'returns',
      label: 'Returns & Credit',
      icon: <RotateCcw size={18} />,
      adminOnly: true,
    },
    {
      id: 'reports',
      label: 'Reports & GST',
      icon: <BarChart3 size={18} />,
      adminOnly: true,
    },
    {
      id: 'employees',
      label: 'Staff & Roles',
      icon: <UserCog size={18} />,
      adminOnly: true,
    },
    {
      id: 'settings',
      label: 'Settings & Loyalty',
      icon: <Settings size={18} />,
      adminOnly: true,
    },
    {
      id: 'packaging',
      label: 'Download & .EXE',
      icon: <Download size={18} />,
      shortcut: 'F9',
      badge: 'Local',
      badgeColor: 'bg-sky-950/80 text-sky-300 border-sky-700/60',
      adminOnly: true,
    },
  ];

  return (
    <aside className="w-56 bg-slate-900 border-r border-slate-800 flex flex-col justify-between select-none shrink-0">
      <div className="flex-1 flex flex-col overflow-y-auto">
        {/* User Role Card */}
        <div className="p-3 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 truncate">
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                  isAdmin
                    ? 'bg-blue-600/30 border border-blue-500/50 text-blue-300'
                    : 'bg-emerald-600/30 border border-emerald-500/50 text-emerald-300'
                }`}
              >
                {isAdmin ? <Shield size={14} /> : '👤'}
              </div>
              <div className="truncate">
                <div className="font-bold text-slate-200 text-xs truncate">
                  {currentUser?.fullName || 'POS User'}
                </div>
                <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                  <span
                    className={`inline-block w-1.5 h-1.5 rounded-full ${
                      isAdmin ? 'bg-blue-400' : 'bg-emerald-400'
                    }`}
                  />
                  {currentUser?.role === 'admin' ? 'Administrator' : 'Cashier Terminal'}
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
              title="Switch User / Lock POS"
            >
              <LogOut size={14} />
            </button>
          </div>

          {isEmployee && (
            <div className="mt-2 p-1.5 bg-amber-950/40 border border-amber-800/40 rounded text-[10px] text-amber-300">
              ⚡ Cashier Mode: Fast Billing & Customer Loyalty rewards active.
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <div className="py-2 px-2 space-y-1">
          <div className="px-2 py-1 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
            {isAdmin ? 'Full Management' : 'Allowed Modules'}
          </div>

          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            const isRestricted = isEmployee && item.adminOnly;

            return (
              <button
                key={item.id}
                id={`nav-btn-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
                    : isRestricted
                    ? 'text-slate-500 hover:bg-slate-800/40 hover:text-slate-400'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <span className={isActive ? 'text-white' : isRestricted ? 'text-slate-600' : 'text-slate-400'}>
                    {item.icon}
                  </span>
                  <span className="truncate">{item.label}</span>
                </div>

                <div className="flex items-center space-x-1.5">
                  {isRestricted ? (
                    <span className="text-[10px] text-slate-500 flex items-center gap-0.5 bg-slate-950 px-1.5 py-0.2 rounded border border-slate-800">
                      <Lock size={10} />
                      <span className="text-[9px]">Admin</span>
                    </span>
                  ) : (
                    <>
                      {item.badge !== undefined && (
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded border font-mono ${
                            item.badgeColor || 'bg-slate-800 text-slate-300 border-slate-700'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                      {item.shortcut && !isActive && (
                        <span className="text-[10px] text-slate-400 font-mono bg-slate-800/80 px-1 py-0.5 rounded">
                          {item.shortcut}
                        </span>
                      )}
                    </>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Information Box */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/40 text-[11px]">
        <div className="bg-slate-800/60 rounded p-2 border border-slate-700/60 space-y-1">
          <div className="flex items-center justify-between text-slate-300">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">POS Engine</span>
            <span className="text-emerald-400 text-[10px] font-mono">v1.0.0 Win</span>
          </div>
          <p className="text-[10px] text-slate-400 leading-tight">
            Native SQLite engine. 100% offline & persistent.
          </p>
        </div>
      </div>
    </aside>
  );
};
