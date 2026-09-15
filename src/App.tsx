/**
 * Native Windows Desktop Shop Billing Application
 * Main Application Frame with Offline SQLite, RBAC Authentication, and Customer Loyalty
 */

import React, { useEffect } from 'react';
import { ShopProvider, useShop } from './context/ShopContext';
import { TitleBar } from './components/TitleBar';
import { Sidebar } from './components/Sidebar';
import { StatusBar } from './components/StatusBar';

// Modules
import { BillingScreen } from './components/Billing/BillingScreen';
import { DashboardScreen } from './components/Dashboard/DashboardScreen';
import { ProductsScreen } from './components/Products/ProductsScreen';
import { InventoryScreen } from './components/Inventory/InventoryScreen';
import { CustomersScreen } from './components/Customers/CustomersScreen';
import { SalesScreen } from './components/Sales/SalesScreen';
import { ReturnsScreen } from './components/Returns/ReturnsScreen';
import { ReportsScreen } from './components/Reports/ReportsScreen';
import { SettingsScreen } from './components/Settings/SettingsScreen';
import { EmployeesScreen } from './components/Employees/EmployeesScreen';
import { WindowsPackagingGuide } from './components/Packaging/WindowsPackagingGuide';

// Modals
import { ReceiptModal } from './components/Billing/ReceiptModal';
import { LoginModal } from './components/Auth/LoginModal';
import { ShieldAlert, X } from 'lucide-react';

const MainLayout: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    accessDeniedMessage,
    clearAccessDenied,
    theme,
  } = useShop();

  // Global Function Key & POS Shortcut Listeners
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Avoid overriding inside print modal or standard input typing for standard keys
      if (e.key === 'F1') {
        e.preventDefault();
        setActiveTab('billing');
      } else if (e.key === 'F2') {
        e.preventDefault();
        setActiveTab('products');
      } else if (e.key === 'F3') {
        e.preventDefault();
        setActiveTab('inventory');
      } else if (e.key === 'F4') {
        e.preventDefault();
        setActiveTab('customers');
      } else if (e.key === 'F5') {
        // Prevent default browser refresh, redirect to sales screen
        e.preventDefault();
        setActiveTab('sales');
      } else if (e.key === 'F6') {
        e.preventDefault();
        setActiveTab('returns');
      } else if (e.key === 'F7') {
        e.preventDefault();
        setActiveTab('reports');
      } else if (e.key === 'F8') {
        e.preventDefault();
        setActiveTab('settings');
      } else if (e.key === 'F9') {
        e.preventDefault();
        setActiveTab('packaging');
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [setActiveTab]);

  return (
    <div
      data-theme={theme}
      className={`flex flex-col h-screen w-screen overflow-hidden select-none font-sans ${
        theme === 'light'
          ? 'bg-slate-100 text-slate-800'
          : 'bg-slate-950 text-slate-100'
      }`}
    >
      {/* Windows Native-like Title Bar */}
      <TitleBar />

      {/* Access Denied Toast Notice */}
      {accessDeniedMessage && (
        <div className="bg-rose-900 border-b border-rose-700 text-white px-4 py-2 text-xs flex items-center justify-between shadow-lg z-30 animate-in fade-in slide-in-from-top-1">
          <div className="flex items-center gap-2">
            <ShieldAlert size={16} className="text-rose-300 shrink-0" />
            <span className="font-semibold">{accessDeniedMessage}</span>
          </div>
          <button
            onClick={clearAccessDenied}
            className="text-rose-200 hover:text-white p-0.5 rounded hover:bg-rose-800"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Main Workspace Area (Sidebar + Screen View) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar />

        {/* Dynamic Screen View */}
        <main className="flex-1 flex flex-col overflow-hidden bg-slate-950 relative">
          {activeTab === 'billing' && <BillingScreen />}
          {activeTab === 'dashboard' && <DashboardScreen />}
          {activeTab === 'products' && <ProductsScreen />}
          {activeTab === 'inventory' && <InventoryScreen />}
          {activeTab === 'customers' && <CustomersScreen />}
          {activeTab === 'sales' && <SalesScreen />}
          {activeTab === 'returns' && <ReturnsScreen />}
          {activeTab === 'reports' && <ReportsScreen />}
          {activeTab === 'employees' && <EmployeesScreen />}
          {activeTab === 'settings' && <SettingsScreen />}
          {activeTab === 'packaging' && <WindowsPackagingGuide />}
        </main>
      </div>

      {/* Windows Native-like Status Bar */}
      <StatusBar />

      {/* Offline Receipt & Tax Invoice Print Modal */}
      <ReceiptModal />

      {/* Offline User Authentication & Role Switcher Modal */}
      <LoginModal />
    </div>
  );
};

export default function App() {
  return (
    <ShopProvider>
      <MainLayout />
    </ShopProvider>
  );
}
