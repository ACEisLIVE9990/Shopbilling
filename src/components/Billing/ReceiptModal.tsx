/**
 * Receipt & Invoice Print Modal
 * Supports:
 * 1. Thermal Receipt (80mm / 3 inch standard ESC/POS)
 * 2. Thermal Receipt (58mm / 2 inch mini receipt)
 * 3. Standard A4 Tax Invoice (GST compliant with CGST/SGST/IGST breakdown & HSN summary)
 * 100% offline Windows native printing via window.print() and printable CSS.
 */

import React, { useState } from 'react';
import {
  Printer,
  X,
  FileText,
  Download,
  Copy,
  Check,
  Building2,
  Phone,
  QrCode,
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { formatINR, formatIndianDate, numberToWordsINR } from '../../utils/formatters';

export const ReceiptModal: React.FC = () => {
  const { activeBillForPrint, isReceiptModalOpen, setIsReceiptModalOpen, settings } = useShop();

  const [printFormat, setPrintFormat] = useState<'80mm' | '58mm' | 'A4'>('80mm');
  const [copied, setCopied] = useState<boolean>(false);

  if (!isReceiptModalOpen || !activeBillForPrint) return null;

  const bill = activeBillForPrint;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyTextReceipt = () => {
    let text = `================================\n`;
    text += `${settings.shopName}\n`;
    text += `${settings.addressLine1}\n`;
    text += `Phone: ${settings.phone} | GSTIN: ${settings.gstin}\n`;
    text += `--------------------------------\n`;
    text += `Bill No: ${bill.billNumber}\n`;
    text += `Date: ${formatIndianDate(bill.createdAt)}\n`;
    text += `Customer: ${bill.customerName}\n`;
    text += `--------------------------------\n`;
    text += `Item                  Qty  Amount\n`;
    text += `--------------------------------\n`;
    bill.items.forEach((item) => {
      const name = item.productName.substring(0, 18).padEnd(20);
      const qty = String(item.quantity).padStart(3);
      const amt = item.totalPrice.toFixed(2).padStart(8);
      text += `${name} ${qty} ${amt}\n`;
    });
    text += `--------------------------------\n`;
    text += `Subtotal: ${formatINR(bill.subtotal)}\n`;
    text += `Total GST: ${formatINR(bill.totalTax)}\n`;
    text += `GRAND TOTAL: ${formatINR(bill.grandTotal)}\n`;
    text += `Mode: ${bill.paymentMethod}\n`;
    text += `================================\n`;
    text += `${settings.invoiceFooterNote}\n`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-3xl w-full shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Modal Header & Format Switcher */}
        <div className="p-3.5 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <Printer size={18} className="text-emerald-400" />
            <h3 className="text-sm font-bold text-slate-100">
              Print Bill: <span className="font-mono text-emerald-400">{bill.billNumber}</span>
            </h3>
          </div>

          {/* Format Selector: 80mm vs 58mm vs A4 */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setPrintFormat('80mm')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                printFormat === '80mm'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Thermal 80mm (3")
            </button>
            <button
              onClick={() => setPrintFormat('58mm')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                printFormat === '58mm'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Thermal 58mm (2")
            </button>
            <button
              onClick={() => setPrintFormat('A4')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                printFormat === 'A4'
                  ? 'bg-sky-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              A4 Tax Invoice
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyTextReceipt}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs flex items-center gap-1"
              title="Copy receipt as plain text"
            >
              {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold flex items-center gap-1.5 shadow"
            >
              <Printer size={14} />
              <span>Print [Ctrl+P]</span>
            </button>
            <button
              onClick={() => setIsReceiptModalOpen(false)}
              className="p-1.5 text-slate-400 hover:text-white rounded"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable View Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-950 flex justify-center">
          {/* 1. THERMAL 80mm FORMAT */}
          {printFormat === '80mm' && (
            <div
              id="printable-area"
              className="w-full max-w-[340px] bg-white text-black p-4 font-mono text-[11px] leading-tight shadow-2xl rounded-sm border border-slate-300 select-text"
            >
              {/* Header */}
              <div className="text-center pb-2 border-b border-dashed border-gray-600">
                <div className="text-sm font-bold tracking-tight uppercase">{settings.shopName}</div>
                {settings.tagline && <div className="text-[10px] text-gray-600 italic mt-0.5">{settings.tagline}</div>}
                <div className="text-[10px] mt-1">{settings.addressLine1}</div>
                <div className="text-[10px]">{settings.addressLine2}</div>
                <div className="text-[10px] mt-0.5 font-bold">GSTIN: {settings.gstin}</div>
                <div className="text-[10px]">Ph: {settings.phone}</div>
              </div>

              {/* Bill Details */}
              <div className="py-2 border-b border-dashed border-gray-600 text-[10px] space-y-0.5">
                <div className="flex justify-between">
                  <span>INVOICE NO:</span>
                  <span className="font-bold">{bill.billNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span>DATE & TIME:</span>
                  <span>{formatIndianDate(bill.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span>CUSTOMER:</span>
                  <span className="font-semibold">{bill.customerName}</span>
                </div>
                {bill.customerPhone && (
                  <div className="flex justify-between">
                    <span>PHONE:</span>
                    <span>{bill.customerPhone}</span>
                  </div>
                )}
                {bill.customerGstin && (
                  <div className="flex justify-between font-bold">
                    <span>CUST GSTIN:</span>
                    <span>{bill.customerGstin}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>PAYMENT MODE:</span>
                  <span className="font-bold uppercase">{bill.paymentMethod}</span>
                </div>
              </div>

              {/* Items Table */}
              <div className="py-2 border-b border-dashed border-gray-600">
                <div className="flex justify-between font-bold text-[10px] border-b border-gray-400 pb-1 mb-1">
                  <span className="w-1/2">ITEM</span>
                  <span className="w-1/6 text-center">QTY</span>
                  <span className="w-1/6 text-right">RATE</span>
                  <span className="w-1/6 text-right">TOTAL</span>
                </div>
                {bill.items.map((item, i) => (
                  <div key={i} className="mb-1 text-[10px]">
                    <div className="font-semibold truncate">{item.productName}</div>
                    <div className="flex justify-between text-gray-700">
                      <span className="text-[9px]">HSN: {item.hsnCode || '-'} (GST {item.gstRate}%)</span>
                      <span className="text-right">
                        {item.quantity} {item.unit} × {item.unitPrice.toFixed(2)} ={' '}
                        <b className="text-black">{item.totalPrice.toFixed(2)}</b>
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals Breakdown */}
              <div className="py-2 border-b border-dashed border-gray-600 text-[10px] space-y-1">
                <div className="flex justify-between">
                  <span>Total Items / Qty:</span>
                  <span>
                    {bill.items.length} items ({bill.items.reduce((s, i) => s + i.quantity, 0)} units)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Taxable Subtotal:</span>
                  <span>₹{bill.subtotal.toFixed(2)}</span>
                </div>
                {bill.discountAmount > 0 && (
                  <div className="flex justify-between text-gray-800">
                    <span>Discount:</span>
                    <span>-₹{bill.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                {bill.isInterstate ? (
                  <div className="flex justify-between">
                    <span>IGST:</span>
                    <span>₹{bill.igstAmount.toFixed(2)}</span>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between">
                      <span>CGST (Central Tax):</span>
                      <span>₹{bill.cgstAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>SGST (State Tax):</span>
                      <span>₹{bill.sgstAmount.toFixed(2)}</span>
                    </div>
                  </>
                )}
                {bill.roundOff !== 0 && (
                  <div className="flex justify-between">
                    <span>Round Off:</span>
                    <span>{bill.roundOff > 0 ? `+₹${bill.roundOff.toFixed(2)}` : `-₹${Math.abs(bill.roundOff).toFixed(2)}`}</span>
                  </div>
                )}
                <div className="flex justify-between text-xs font-black pt-1 border-t border-black">
                  <span>GRAND TOTAL:</span>
                  <span className="text-sm">₹{bill.grandTotal.toFixed(2)}</span>
                </div>
                {bill.paymentMethod === 'Cash' && (
                  <div className="pt-1 text-[9px] text-gray-700">
                    <div className="flex justify-between">
                      <span>Cash Tendered:</span>
                      <span>₹{bill.amountReceived.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-black">
                      <span>Change Returned:</span>
                      <span>₹{bill.changeReturned.toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer Note */}
              <div className="text-center pt-3 text-[9px] space-y-1">
                <div className="italic">{settings.invoiceFooterNote}</div>
                <div className="font-bold">*** GST INVOICE ***</div>
                <div className="text-[8px] text-gray-500">POS Terminal: {bill.cashierName}</div>
              </div>
            </div>
          )}

          {/* 2. THERMAL 58mm FORMAT */}
          {printFormat === '58mm' && (
            <div
              id="printable-area"
              className="w-full max-w-[240px] bg-white text-black p-2 font-mono text-[9px] leading-tight shadow-2xl rounded-sm border border-slate-300 select-text"
            >
              <div className="text-center pb-1 border-b border-dashed border-gray-600">
                <div className="font-bold text-[11px] uppercase">{settings.shopName}</div>
                <div>{settings.addressLine1}</div>
                <div>GSTIN: {settings.gstin}</div>
                <div>Ph: {settings.phone}</div>
              </div>

              <div className="py-1 border-b border-dashed border-gray-600 text-[8px] space-y-0.5">
                <div>Inv: <b>{bill.billNumber}</b></div>
                <div>Date: {formatIndianDate(bill.createdAt)}</div>
                <div>Cust: {bill.customerName}</div>
                <div>Mode: <b>{bill.paymentMethod}</b></div>
              </div>

              <div className="py-1 border-b border-dashed border-gray-600">
                {bill.items.map((item, i) => (
                  <div key={i} className="mb-0.5">
                    <div className="truncate font-semibold">{item.productName}</div>
                    <div className="flex justify-between text-[8px]">
                      <span>{item.quantity} × {item.unitPrice}</span>
                      <b>₹{item.totalPrice.toFixed(2)}</b>
                    </div>
                  </div>
                ))}
              </div>

              <div className="py-1 border-b border-dashed border-gray-600 text-[8px] space-y-0.5">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>₹{bill.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Tax:</span>
                  <span>₹{bill.totalTax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-[10px] pt-1 border-t border-black">
                  <span>TOTAL:</span>
                  <span>₹{bill.grandTotal.toFixed(2)}</span>
                </div>
              </div>

              <div className="text-center pt-2 text-[8px] italic">
                {settings.invoiceFooterNote}
              </div>
            </div>
          )}

          {/* 3. A4 FULL TAX INVOICE FORMAT */}
          {printFormat === 'A4' && (
            <div
              id="printable-area"
              className="w-full max-w-[680px] bg-white text-black p-6 font-sans text-xs leading-normal shadow-2xl rounded-sm border border-slate-300 select-text"
            >
              {/* Top Banner */}
              <div className="flex justify-between items-start border-b-2 border-slate-900 pb-3 mb-3">
                <div>
                  <h1 className="text-lg font-black tracking-tight uppercase text-slate-900">
                    {settings.shopName}
                  </h1>
                  <p className="text-slate-600 text-[11px]">{settings.tagline}</p>
                  <p className="text-slate-700 text-xs mt-1">{settings.addressLine1}</p>
                  <p className="text-slate-700 text-xs">{settings.addressLine2}</p>
                  <p className="text-xs font-semibold mt-1">
                    Phone: {settings.phone} | Email: {settings.email}
                  </p>
                  <p className="text-xs font-bold text-slate-900">
                    GSTIN: {settings.gstin} | State: {settings.state} (Code: {settings.stateCode})
                  </p>
                </div>
                <div className="text-right">
                  <div className="bg-slate-900 text-white px-3 py-1 text-xs font-black tracking-wider uppercase inline-block mb-2">
                    TAX INVOICE
                  </div>
                  <div className="text-xs">
                    <span className="text-slate-500">Invoice No:</span>{' '}
                    <b className="font-mono text-sm">{bill.billNumber}</b>
                  </div>
                  <div className="text-xs">
                    <span className="text-slate-500">Date:</span>{' '}
                    <b>{formatIndianDate(bill.createdAt)}</b>
                  </div>
                  <div className="text-xs">
                    <span className="text-slate-500">Payment:</span>{' '}
                    <b className="uppercase">{bill.paymentMethod}</b>
                  </div>
                </div>
              </div>

              {/* Bill To Customer Section */}
              <div className="grid grid-cols-2 gap-4 border border-slate-300 p-3 mb-3 rounded-sm bg-slate-50/50">
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-500 mb-0.5">
                    Buyer / Bill To:
                  </div>
                  <div className="font-bold text-slate-900">{bill.customerName}</div>
                  {bill.customerPhone && <div className="text-xs">Phone: {bill.customerPhone}</div>}
                  {bill.customerGstin && (
                    <div className="text-xs font-bold">Buyer GSTIN: {bill.customerGstin}</div>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-[10px] uppercase font-bold text-slate-500 mb-0.5">
                    Place of Supply:
                  </div>
                  <div className="font-semibold text-slate-800">
                    {bill.isInterstate ? 'Interstate' : `${settings.state} (${settings.stateCode})`}
                  </div>
                  <div className="text-[11px] text-slate-600">Reverse Charge: No</div>
                </div>
              </div>

              {/* Items Grid */}
              <table className="w-full border-collapse border border-slate-300 text-xs mb-3">
                <thead className="bg-slate-100 text-slate-800">
                  <tr>
                    <th className="border border-slate-300 p-1.5 w-8 text-center">#</th>
                    <th className="border border-slate-300 p-1.5 text-left">Description of Goods</th>
                    <th className="border border-slate-300 p-1.5 text-center w-16">HSN</th>
                    <th className="border border-slate-300 p-1.5 text-center w-12">Qty</th>
                    <th className="border border-slate-300 p-1.5 text-right w-16">Rate (₹)</th>
                    <th className="border border-slate-300 p-1.5 text-right w-16">Taxable (₹)</th>
                    <th className="border border-slate-300 p-1.5 text-center w-12">GST%</th>
                    <th className="border border-slate-300 p-1.5 text-right w-16">Total (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {bill.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="border border-slate-300 p-1.5 text-center font-mono text-[11px]">
                        {idx + 1}
                      </td>
                      <td className="border border-slate-300 p-1.5">
                        <div className="font-semibold">{item.productName}</div>
                        <div className="text-[10px] text-slate-500 font-mono">Barcode: {item.barcode}</div>
                      </td>
                      <td className="border border-slate-300 p-1.5 text-center font-mono text-[11px]">
                        {item.hsnCode}
                      </td>
                      <td className="border border-slate-300 p-1.5 text-center font-mono">
                        {item.quantity} {item.unit}
                      </td>
                      <td className="border border-slate-300 p-1.5 text-right font-mono">
                        {item.unitPrice.toFixed(2)}
                      </td>
                      <td className="border border-slate-300 p-1.5 text-right font-mono">
                        {item.taxableAmount.toFixed(2)}
                      </td>
                      <td className="border border-slate-300 p-1.5 text-center font-mono text-[11px]">
                        {item.gstRate}%
                      </td>
                      <td className="border border-slate-300 p-1.5 text-right font-mono font-bold">
                        {item.totalPrice.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* GST Tax Summary Table */}
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div className="border border-slate-300 p-2 text-xs rounded-sm">
                  <div className="font-bold text-[10px] uppercase text-slate-600 mb-1">
                    GST Tax Breakup Summary:
                  </div>
                  <table className="w-full text-[10px] border-collapse">
                    <thead>
                      <tr className="border-b border-slate-300 text-slate-600">
                        <th className="text-left py-0.5">Tax Component</th>
                        <th className="text-right py-0.5">Amount (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 font-mono">
                      {bill.isInterstate ? (
                        <tr>
                          <td className="py-0.5">Integrated Tax (IGST)</td>
                          <td className="text-right py-0.5">{bill.igstAmount.toFixed(2)}</td>
                        </tr>
                      ) : (
                        <>
                          <tr>
                            <td className="py-0.5">Central Tax (CGST)</td>
                            <td className="text-right py-0.5">{bill.cgstAmount.toFixed(2)}</td>
                          </tr>
                          <tr>
                            <td className="py-0.5">State Tax (SGST)</td>
                            <td className="text-right py-0.5">{bill.sgstAmount.toFixed(2)}</td>
                          </tr>
                        </>
                      )}
                      <tr className="font-bold text-slate-900">
                        <td className="py-0.5">Total GST Tax</td>
                        <td className="text-right py-0.5">{bill.totalTax.toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Totals Column */}
                <div className="border border-slate-300 p-2 text-xs rounded-sm space-y-1">
                  <div className="flex justify-between text-slate-700">
                    <span>Taxable Amount:</span>
                    <span className="font-mono">₹{bill.subtotal.toFixed(2)}</span>
                  </div>
                  {bill.discountAmount > 0 && (
                    <div className="flex justify-between text-slate-700">
                      <span>Discount:</span>
                      <span className="font-mono">-₹{bill.discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-700">
                    <span>Total Tax:</span>
                    <span className="font-mono">+₹{bill.totalTax.toFixed(2)}</span>
                  </div>
                  {bill.roundOff !== 0 && (
                    <div className="flex justify-between text-slate-700">
                      <span>Round Off:</span>
                      <span className="font-mono">
                        {bill.roundOff > 0 ? `+₹${bill.roundOff.toFixed(2)}` : `-₹${Math.abs(bill.roundOff).toFixed(2)}`}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between font-black text-sm pt-1 border-t-2 border-slate-900 text-slate-950">
                    <span>Invoice Total:</span>
                    <span className="font-mono text-base">₹{bill.grandTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Amount in Words */}
              <div className="border border-slate-300 p-2 mb-3 bg-slate-50 text-xs">
                <span className="text-slate-500 font-semibold">Amount in Words: </span>
                <span className="font-bold italic text-slate-900">
                  {numberToWordsINR(bill.grandTotal)}
                </span>
              </div>

              {/* Terms & Signature */}
              <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-300 text-xs">
                <div>
                  <div className="font-bold text-[10px] uppercase text-slate-600 mb-1">
                    Terms & Conditions:
                  </div>
                  <p className="text-[10px] text-slate-600 leading-tight">
                    1. Goods once sold will not be taken back without original bill.
                    <br />
                    2. Certified that the particulars given above are true and correct.
                  </p>
                </div>
                <div className="text-right flex flex-col justify-between h-20">
                  <div className="text-[10px] font-bold uppercase text-slate-700">
                    For {settings.shopName}
                  </div>
                  <div className="text-[11px] font-semibold text-slate-900 border-t border-slate-400 pt-1 inline-block ml-auto">
                    Authorized Signatory
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
