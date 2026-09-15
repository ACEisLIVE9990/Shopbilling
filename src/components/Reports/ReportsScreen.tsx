/**
 * Reports & GST Filing Screen
 * Daily Sales, Monthly Sales, GSTR-1 Tax Summary (HSN, CGST, SGST, IGST),
 * Product-wise profit analytics, and Offline CSV Export
 */

import React, { useState } from 'react';
import {
  BarChart3,
  Download,
  Calendar,
  IndianRupee,
  FileSpreadsheet,
  TrendingUp,
  Boxes,
  Percent,
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { formatINR } from '../../utils/formatters';

export const ReportsScreen: React.FC = () => {
  const { bills, products, settings } = useShop();

  const [reportType, setReportType] = useState<'daily' | 'gst' | 'products' | 'payment'>('daily');

  const completedBills = bills.filter((b) => b.status === 'Completed');

  // Daily totals calculation
  const dailyMap: Record<string, { date: string; billsCount: number; sales: number; tax: number }> =
    {};
  completedBills.forEach((b) => {
    const d = b.createdAt.split('T')[0];
    if (!dailyMap[d]) {
      dailyMap[d] = { date: d, billsCount: 0, sales: 0, tax: 0 };
    }
    dailyMap[d].billsCount += 1;
    dailyMap[d].sales += b.grandTotal;
    dailyMap[d].tax += b.totalTax;
  });
  const dailyList = Object.values(dailyMap).sort((a, b) => b.date.localeCompare(a.date));

  // GST Summary by HSN Code
  const hsnMap: Record<
    string,
    {
      hsn: string;
      description: string;
      qty: number;
      taxableValue: number;
      cgst: number;
      sgst: number;
      igst: number;
      totalTax: number;
    }
  > = {};

  completedBills.forEach((b) => {
    b.items.forEach((it) => {
      const code = it.hsnCode || '9999';
      if (!hsnMap[code]) {
        hsnMap[code] = {
          hsn: code,
          description: it.productName,
          qty: 0,
          taxableValue: 0,
          cgst: 0,
          sgst: 0,
          igst: 0,
          totalTax: 0,
        };
      }
      hsnMap[code].qty += it.quantity;
      hsnMap[code].taxableValue += it.taxableAmount;
      hsnMap[code].totalTax += it.totalTax;
      if (b.isInterstate) {
        hsnMap[code].igst += it.totalTax;
      } else {
        hsnMap[code].cgst += it.totalTax / 2;
        hsnMap[code].sgst += it.totalTax / 2;
      }
    });
  });
  const hsnList = Object.values(hsnMap);

  // Product-wise sales summary
  const prodSalesMap: Record<
    string,
    { name: string; barcode: string; qty: number; totalRevenue: number }
  > = {};
  completedBills.forEach((b) => {
    b.items.forEach((it) => {
      if (!prodSalesMap[it.productId]) {
        prodSalesMap[it.productId] = {
          name: it.productName,
          barcode: it.barcode,
          qty: 0,
          totalRevenue: 0,
        };
      }
      prodSalesMap[it.productId].qty += it.quantity;
      prodSalesMap[it.productId].totalRevenue += it.totalPrice;
    });
  });
  const prodSalesList = Object.values(prodSalesMap).sort(
    (a, b) => b.totalRevenue - a.totalRevenue
  );

  // Export current active report to CSV
  const handleExportCSV = () => {
    let csv = '';
    let filename = `Report_${reportType}_${new Date().toISOString().split('T')[0]}.csv`;

    if (reportType === 'daily') {
      csv = 'Date,Bills_Count,Tax_Collected,Grand_Total_Sales\n';
      dailyList.forEach((r) => {
        csv += `"${r.date}",${r.billsCount},${r.tax.toFixed(2)},${r.sales.toFixed(2)}\n`;
      });
    } else if (reportType === 'gst') {
      csv = 'HSN_SAC,Description,Total_Qty,Taxable_Value,CGST,SGST,IGST,Total_Tax\n';
      hsnList.forEach((h) => {
        csv += `"${h.hsn}","${h.description.replace(/"/g, '""')}",${h.qty},${h.taxableValue.toFixed(2)},${h.cgst.toFixed(2)},${h.sgst.toFixed(2)},${h.igst.toFixed(2)},${h.totalTax.toFixed(2)}\n`;
      });
    } else if (reportType === 'products') {
      csv = 'Product_Name,Barcode,Units_Sold,Total_Revenue\n';
      prodSalesList.forEach((p) => {
        csv += `"${p.name.replace(/"/g, '""')}","${p.barcode}",${p.qty},${p.totalRevenue.toFixed(2)}\n`;
      });
    }

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-hidden text-slate-100">
      {/* Top Header */}
      <div className="p-4 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <BarChart3 size={18} className="text-indigo-400" />
            Financial Reports & GST Filing Data
          </h2>
          <p className="text-xs text-slate-400">
            GSTIN: <span className="font-mono text-amber-300">{settings.gstin}</span> | Export CSV
            spreadsheets directly to your local PC.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-bold flex items-center gap-1.5 shadow"
        >
          <Download size={14} /> Export Report CSV
        </button>
      </div>

      {/* Tabs Switcher */}
      <div className="px-4 pt-2 bg-slate-900/60 border-b border-slate-800 flex items-center gap-3 text-xs shrink-0">
        <button
          onClick={() => setReportType('daily')}
          className={`py-2 px-3 border-b-2 font-semibold transition-colors ${
            reportType === 'daily'
              ? 'border-indigo-400 text-indigo-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Daily Sales Ledger
        </button>
        <button
          onClick={() => setReportType('gst')}
          className={`py-2 px-3 border-b-2 font-semibold transition-colors ${
            reportType === 'gst'
              ? 'border-indigo-400 text-indigo-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          GSTR-1 HSN Tax Summary
        </button>
        <button
          onClick={() => setReportType('products')}
          className={`py-2 px-3 border-b-2 font-semibold transition-colors ${
            reportType === 'products'
              ? 'border-indigo-400 text-indigo-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Top Selling Products
        </button>
      </div>

      {/* Report Tables */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* 1. DAILY SALES LEDGER */}
        {reportType === 'daily' && (
          <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3">Date</th>
                  <th className="p-3 text-center">Bills Count</th>
                  <th className="p-3 text-right">GST Collected</th>
                  <th className="p-3 text-right">Grand Total Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {dailyList.map((row) => (
                  <tr key={row.date} className="hover:bg-slate-850">
                    <td className="p-3 font-semibold font-mono text-slate-200">{row.date}</td>
                    <td className="p-3 text-center font-mono text-slate-300">{row.billsCount}</td>
                    <td className="p-3 text-right font-mono text-slate-400">
                      {formatINR(row.tax)}
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-emerald-400 text-sm">
                      {formatINR(row.sales)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 2. GSTR-1 HSN TAX SUMMARY */}
        {reportType === 'gst' && (
          <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3">HSN/SAC</th>
                  <th className="p-3">Sample Goods Description</th>
                  <th className="p-3 text-center">Qty</th>
                  <th className="p-3 text-right">Taxable Value (₹)</th>
                  <th className="p-3 text-right">CGST (₹)</th>
                  <th className="p-3 text-right">SGST (₹)</th>
                  <th className="p-3 text-right">IGST (₹)</th>
                  <th className="p-3 text-right">Total Tax (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {hsnList.map((h) => (
                  <tr key={h.hsn} className="hover:bg-slate-850">
                    <td className="p-3 font-mono font-bold text-amber-300">{h.hsn}</td>
                    <td className="p-3 text-slate-300">{h.description}</td>
                    <td className="p-3 text-center font-mono text-slate-400">{h.qty}</td>
                    <td className="p-3 text-right font-mono text-slate-200">
                      {formatINR(h.taxableValue)}
                    </td>
                    <td className="p-3 text-right font-mono text-slate-400">
                      {formatINR(h.cgst)}
                    </td>
                    <td className="p-3 text-right font-mono text-slate-400">
                      {formatINR(h.sgst)}
                    </td>
                    <td className="p-3 text-right font-mono text-slate-400">
                      {formatINR(h.igst)}
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-amber-400">
                      {formatINR(h.totalTax)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 3. PRODUCT-WISE SALES */}
        {reportType === 'products' && (
          <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3">Product Name</th>
                  <th className="p-3">Barcode</th>
                  <th className="p-3 text-center">Units Sold</th>
                  <th className="p-3 text-right">Total Revenue Generated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {prodSalesList.map((p, idx) => (
                  <tr key={idx} className="hover:bg-slate-850">
                    <td className="p-3 font-semibold text-slate-200">{p.name}</td>
                    <td className="p-3 font-mono text-slate-400">{p.barcode}</td>
                    <td className="p-3 text-center font-mono text-slate-300 font-bold">{p.qty}</td>
                    <td className="p-3 text-right font-mono font-bold text-emerald-400 text-sm">
                      {formatINR(p.totalRevenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
