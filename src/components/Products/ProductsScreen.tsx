/**
 * Product Master & Inventory Management Screen
 * Full CRUD for Products, Barcodes, HSN Codes, GST Rates, Stock Levels, and CSV Export
 */

import React, { useState } from 'react';
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  Barcode,
  Download,
  Filter,
  AlertTriangle,
  CheckCircle,
  X,
  Printer,
  Sparkles,
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { Product, GstRate, ProductUnit } from '../../types';
import { formatINR } from '../../utils/formatters';

export const ProductsScreen: React.FC = () => {
  const { products, categories, saveProduct, deleteProduct, addCategory } = useShop();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [onlyLowStock, setOnlyLowStock] = useState<boolean>(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [barcodePreviewProduct, setBarcodePreviewProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form Fields
  const [name, setName] = useState<string>('');
  const [barcode, setBarcode] = useState<string>('');
  const [sku, setSku] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>(categories[0]?.id || '');
  const [purchasePrice, setPurchasePrice] = useState<number>(0);
  const [sellingPrice, setSellingPrice] = useState<number>(0);
  const [mrp, setMrp] = useState<number>(0);
  const [gstRate, setGstRate] = useState<GstRate>(5);
  const [hsnCode, setHsnCode] = useState<string>('');
  const [currentStock, setCurrentStock] = useState<number>(0);
  const [minStock, setMinStock] = useState<number>(5);
  const [unit, setUnit] = useState<ProductUnit>('Pcs');
  const [formError, setFormError] = useState<string | null>(null);

  // New Category inline input
  const [newCatName, setNewCatName] = useState<string>('');
  const [showAddCat, setShowAddCat] = useState<boolean>(false);

  const openAddModal = () => {
    setEditingProduct(null);
    setName('');
    // Auto-generate random standard 13-digit EAN barcode
    setBarcode(`890${Math.floor(1000000000 + Math.random() * 9000000000)}`);
    setSku('');
    setCategoryId(categories[0]?.id || '');
    setPurchasePrice(0);
    setSellingPrice(0);
    setMrp(0);
    setGstRate(5);
    setHsnCode('');
    setCurrentStock(10);
    setMinStock(5);
    setUnit('Pcs');
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setBarcode(p.barcode);
    setSku(p.sku);
    setCategoryId(p.categoryId);
    setPurchasePrice(p.purchasePrice);
    setSellingPrice(p.sellingPrice);
    setMrp(p.mrp || p.sellingPrice);
    setGstRate(p.gstRate);
    setHsnCode(p.hsnCode);
    setCurrentStock(p.currentStock);
    setMinStock(p.minStock);
    setUnit(p.unit);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name.trim() || !barcode.trim() || sellingPrice <= 0) {
      setFormError('Please fill in Name, Barcode, and a valid Selling Price.');
      return;
    }

    const catObj = categories.find((c) => c.id === categoryId);

    const productPayload: Product = {
      id: editingProduct ? editingProduct.id : `prod-${Date.now()}`,
      barcode: barcode.trim(),
      sku: sku.trim() || `SKU-${barcode.trim().slice(-6)}`,
      name: name.trim(),
      categoryId,
      categoryName: catObj?.name || 'General',
      purchasePrice: Number(purchasePrice) || 0,
      sellingPrice: Number(sellingPrice),
      mrp: Number(mrp) || Number(sellingPrice),
      gstRate,
      hsnCode: hsnCode.trim() || '9999',
      currentStock: Number(currentStock) || 0,
      minStock: Number(minStock) || 5,
      unit,
      createdAt: editingProduct ? editingProduct.createdAt : new Date().toISOString(),
    };

    const result = saveProduct(productPayload);
    if (!result.success) {
      setFormError(result.message || 'Failed to save product');
      return;
    }

    setIsModalOpen(false);
    setToastMessage({
      type: 'success',
      text: editingProduct
        ? `Product "${productPayload.name}" updated successfully.`
        : `Product "${productPayload.name}" added to catalog.`,
    });
  };

  const confirmDeleteProduct = () => {
    if (!productToDelete) return;
    const targetName = productToDelete.name;
    const targetId = productToDelete.id;
    const success = deleteProduct(targetId);

    if (success) {
      setToastMessage({
        type: 'success',
        text: `Product "${targetName}" was permanently removed from the catalog.`,
      });
    } else {
      setToastMessage({
        type: 'error',
        text: `Failed to remove "${targetName}" from database.`,
      });
    }
    setProductToDelete(null);
  };

  // Export to CSV
  const handleExportCSV = () => {
    let csv = 'Barcode,SKU,Name,Category,HSN,GST_Rate,Purchase_Price,Selling_Price,Stock,Unit\n';
    products.forEach((p) => {
      csv += `"${p.barcode}","${p.sku}","${p.name.replace(/"/g, '""')}","${p.categoryName || ''}","${p.hsnCode}",${p.gstRate}%,${p.purchasePrice},${p.sellingPrice},${p.currentStock},"${p.unit}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Products_Catalog_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Filtered List
  const filteredList = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.barcode.includes(searchQuery) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.hsnCode.includes(searchQuery);

    const matchesCategory = selectedCategory === 'all' || p.categoryId === selectedCategory;
    const matchesLowStock = !onlyLowStock || p.currentStock <= p.minStock;

    return matchesSearch && matchesCategory && matchesLowStock;
  });

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-hidden text-slate-100">
      {/* Top Header & Search Bar */}
      <div className="p-4 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Package size={18} className="text-blue-400" />
            Product Master & Barcodes ({products.length})
          </h2>
          <p className="text-xs text-slate-400">
            Manage your retail inventory, HSN codes, GST rates, and barcode labels.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded text-xs flex items-center gap-1.5 font-medium transition-colors"
          >
            <Download size={13} /> Export CSV
          </button>

          <button
            id="btn-add-new-product"
            onClick={openAddModal}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-bold flex items-center gap-1.5 shadow"
          >
            <Plus size={15} /> Add New Product
          </button>
        </div>
      </div>

      {/* Filter and Search Ribbon */}
      {toastMessage && (
        <div
          className={`px-4 py-2 text-xs flex items-center justify-between border-b ${
            toastMessage.type === 'success'
              ? 'bg-emerald-950/80 border-emerald-800 text-emerald-300'
              : 'bg-rose-950/80 border-rose-800 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {toastMessage.type === 'success' ? <CheckCircle size={14} /> : <AlertTriangle size={14} />}
            <span>{toastMessage.text}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="hover:opacity-75 p-0.5"
            title="Dismiss"
          >
            <X size={13} />
          </button>
        </div>
      )}

      <div className="p-3 bg-slate-900/60 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
            <Search size={14} />
          </div>
          <input
            type="text"
            id="product-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Product Name, Barcode, SKU, or HSN Code..."
            className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
          />
        </div>

        {/* Category filter & Low stock toggle */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Filter size={13} />
            <span>Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-slate-200 rounded px-2 py-1 text-xs focus:outline-none"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-1.5 text-slate-400 cursor-pointer hover:text-slate-200">
            <input
              type="checkbox"
              checked={onlyLowStock}
              onChange={(e) => setOnlyLowStock(e.target.checked)}
              className="rounded border-slate-700 text-rose-600 focus:ring-0"
            />
            <span className="text-rose-400 font-medium">Low Stock Only</span>
          </label>
        </div>
      </div>

      {/* Products Table */}
      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-900/90 text-slate-400 font-semibold sticky top-0 border-b border-slate-800 z-10">
            <tr>
              <th className="py-2.5 px-3">Barcode / SKU</th>
              <th className="py-2.5 px-3">Product Name</th>
              <th className="py-2.5 px-3">Category</th>
              <th className="py-2.5 px-2 text-center">HSN</th>
              <th className="py-2.5 px-2 text-center">GST%</th>
              <th className="py-2.5 px-3 text-right">Cost Price</th>
              <th className="py-2.5 px-3 text-right">Selling Price</th>
              <th className="py-2.5 px-3 text-right">Stock Level</th>
              <th className="py-2.5 px-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-sans">
            {filteredList.map((p) => {
              const isLow = p.currentStock <= p.minStock;
              return (
                <tr key={p.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-2 px-3 font-mono">
                    <div className="font-bold text-slate-200 flex items-center gap-1">
                      <Barcode size={13} className="text-slate-400" />
                      {p.barcode}
                    </div>
                    <div className="text-[10px] text-slate-500">{p.sku}</div>
                  </td>
                  <td className="py-2 px-3">
                    <div className="font-semibold text-slate-100">{p.name}</div>
                    <div className="text-[10px] text-slate-500">Unit: {p.unit}</div>
                  </td>
                  <td className="py-2 px-3 text-slate-400">{p.categoryName || 'General'}</td>
                  <td className="py-2 px-2 text-center font-mono text-slate-400">{p.hsnCode}</td>
                  <td className="py-2 px-2 text-center font-mono font-semibold text-amber-400">
                    {p.gstRate}%
                  </td>
                  <td className="py-2 px-3 text-right font-mono text-slate-400">
                    {formatINR(p.purchasePrice)}
                  </td>
                  <td className="py-2 px-3 text-right font-mono font-bold text-emerald-400 text-sm">
                    {formatINR(p.sellingPrice)}
                  </td>
                  <td className="py-2 px-3 text-right font-mono">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${
                        isLow
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      }`}
                    >
                      {p.currentStock} {p.unit}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => setBarcodePreviewProduct(p)}
                        className="p-1 text-slate-400 hover:text-sky-400 hover:bg-slate-800 rounded"
                        title="View & Print Barcode Label"
                      >
                        <Barcode size={14} />
                      </button>
                      <button
                        onClick={() => openEditModal(p)}
                        className="p-1 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded"
                        title="Edit Product"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => setProductToDelete(p)}
                        className="p-1 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded transition-colors"
                        title="Delete Product"
                        aria-label={`Delete ${p.name}`}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-xl w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Package size={16} className="text-blue-400" />
                {editingProduct ? 'Edit Product Details' : 'Add New Product to Catalog'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {formError && (
              <div className="p-2.5 bg-rose-950/80 border border-rose-800 text-rose-300 text-xs rounded flex items-center gap-2">
                <AlertTriangle size={14} />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveProduct} className="space-y-3 text-xs">
              {/* Product Name */}
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Aashirvaad Shudh Chakki Atta 5kg"
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded text-xs text-slate-100"
                />
              </div>

              {/* Barcode & SKU */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-slate-300 font-semibold">Barcode (EAN/UPC) *</label>
                    <button
                      type="button"
                      onClick={() =>
                        setBarcode(`890${Math.floor(1000000000 + Math.random() * 9000000000)}`)
                      }
                      className="text-[10px] text-sky-400 hover:underline flex items-center gap-0.5"
                    >
                      <Sparkles size={10} /> Generate
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    placeholder="890..."
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded font-mono text-xs text-emerald-400"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">SKU / Item Code</label>
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="e.g. ATTA-ASH-05K"
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded font-mono text-xs text-slate-300"
                  />
                </div>
              </div>

              {/* Category & Unit */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-slate-300 font-semibold">Category</label>
                    <button
                      type="button"
                      onClick={() => setShowAddCat(!showAddCat)}
                      className="text-[10px] text-sky-400 hover:underline"
                    >
                      + New
                    </button>
                  </div>
                  {showAddCat ? (
                    <div className="flex gap-1">
                      <input
                        type="text"
                        value={newCatName}
                        onChange={(e) => setNewCatName(e.target.value)}
                        placeholder="Category name"
                        className="flex-1 px-2 py-1 bg-slate-950 border border-slate-700 rounded text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (newCatName.trim()) {
                            const newC = addCategory(newCatName);
                            setCategoryId(newC.id);
                            setNewCatName('');
                            setShowAddCat(false);
                          }
                        }}
                        className="px-2 py-1 bg-blue-600 text-white rounded text-xs"
                      >
                        Add
                      </button>
                    </div>
                  ) : (
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded text-xs text-slate-200"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Unit of Measurement</label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value as ProductUnit)}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded text-xs text-slate-200"
                  >
                    <option value="Pcs">Pieces (Pcs)</option>
                    <option value="Pkt">Packets (Pkt)</option>
                    <option value="Kg">Kilogram (Kg)</option>
                    <option value="Gm">Gram (Gm)</option>
                    <option value="Ltr">Litre (Ltr)</option>
                    <option value="Ml">Millilitre (Ml)</option>
                    <option value="Box">Box / Carton</option>
                    <option value="Dozen">Dozen</option>
                    <option value="Mtr">Meter (Mtr)</option>
                  </select>
                </div>
              </div>

              {/* Pricing & GST */}
              <div className="grid grid-cols-3 gap-3 bg-slate-950/60 p-2.5 rounded border border-slate-800">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Purchase Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={purchasePrice || ''}
                    onChange={(e) => setPurchasePrice(parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    className="w-full px-2.5 py-1 bg-slate-900 border border-slate-700 rounded font-mono text-xs text-slate-300"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Selling Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={sellingPrice || ''}
                    onChange={(e) => setSellingPrice(parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    className="w-full px-2.5 py-1 bg-slate-900 border border-slate-700 rounded font-mono text-xs text-emerald-400 font-bold"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">GST Rate (%)</label>
                  <select
                    value={gstRate}
                    onChange={(e) => setGstRate(parseInt(e.target.value, 10) as GstRate)}
                    className="w-full px-2.5 py-1 bg-slate-900 border border-slate-700 rounded font-mono text-xs text-amber-400"
                  >
                    <option value="0">0% (Nil / Exempted)</option>
                    <option value="3">3% (Gold / Gems)</option>
                    <option value="5">5% (Essentials / Oil)</option>
                    <option value="12">12% (Processed Foods)</option>
                    <option value="18">18% (Standard FMCG / Soaps)</option>
                    <option value="28">28% (Luxury / Aerated)</option>
                  </select>
                </div>
              </div>

              {/* HSN & Stock */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">HSN / SAC Code</label>
                  <input
                    type="text"
                    value={hsnCode}
                    onChange={(e) => setHsnCode(e.target.value)}
                    placeholder="e.g. 1101"
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded font-mono text-xs text-slate-300"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Current Stock</label>
                  <input
                    type="number"
                    value={currentStock || ''}
                    onChange={(e) => setCurrentStock(parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded font-mono text-xs text-slate-100"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Min Alert Level</label>
                  <input
                    type="number"
                    value={minStock || ''}
                    onChange={(e) => setMinStock(parseFloat(e.target.value) || 0)}
                    placeholder="5"
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded font-mono text-xs text-rose-300"
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-800">
                {editingProduct ? (
                  <button
                    type="button"
                    onClick={() => {
                      const toDelete = editingProduct;
                      setIsModalOpen(false);
                      setProductToDelete(toDelete);
                    }}
                    className="px-3 py-2 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/80 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    title="Delete this product"
                  >
                    <Trash2 size={13} />
                    Delete Product
                  </button>
                ) : (
                  <div />
                )}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-bold shadow"
                  >
                    {editingProduct ? 'Update Product' : 'Save to SQLite Master'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Barcode Label Print Modal */}
      {barcodePreviewProduct && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-sm w-full p-5 shadow-2xl text-center space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center justify-center gap-1.5">
              <Barcode size={18} className="text-emerald-400" />
              Shelf Barcode Label
            </h3>

            {/* Printable Label View */}
            <div className="bg-white text-black p-4 rounded border-2 border-dashed border-gray-400 space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-gray-700">
                Shree Ganesh Supermarket
              </div>
              <div className="text-xs font-bold leading-tight">{barcodePreviewProduct.name}</div>
              <div className="text-lg font-black font-mono text-black">
                {formatINR(barcodePreviewProduct.sellingPrice)}
              </div>
              <div className="text-[9px] text-gray-600">
                (Incl. of all taxes | GST {barcodePreviewProduct.gstRate}%)
              </div>
              {/* Visual simulated 1D barcode lines */}
              <div className="py-2 flex items-center justify-center">
                <div className="h-10 flex items-center gap-[2px] bg-white px-2">
                  {barcodePreviewProduct.barcode.split('').map((digit, i) => {
                    const width = (parseInt(digit, 10) % 3) + 1;
                    return (
                      <div
                        key={i}
                        className="h-full bg-black"
                        style={{ width: `${width * 2}px` }}
                      />
                    );
                  })}
                </div>
              </div>
              <div className="text-xs font-mono font-bold tracking-widest">
                {barcodePreviewProduct.barcode}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setBarcodePreviewProduct(null)}
                className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded text-xs"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold flex items-center gap-1"
              >
                <Printer size={13} /> Print Label
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Product In-App Confirmation Modal */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-rose-950/80 border border-rose-800 flex items-center justify-center shrink-0 text-rose-400">
                <Trash2 size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-white">Delete Product from Catalog</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Are you sure you want to permanently delete this product from the master catalog?
                </p>
              </div>
              <button
                onClick={() => setProductToDelete(null)}
                className="text-slate-400 hover:text-white p-1"
                title="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 text-xs space-y-2">
              <div className="font-semibold text-slate-100 text-sm">{productToDelete.name}</div>
              <div className="grid grid-cols-2 gap-2 text-slate-400 font-mono text-[11px]">
                <div>Barcode: <span className="text-slate-200">{productToDelete.barcode}</span></div>
                <div>SKU: <span className="text-slate-200">{productToDelete.sku}</span></div>
                <div>Selling Price: <span className="text-emerald-400 font-bold">{formatINR(productToDelete.sellingPrice)}</span></div>
                <div>Current Stock: <span className="text-slate-200">{productToDelete.currentStock} {productToDelete.unit}</span></div>
              </div>
            </div>

            <p className="text-[11px] text-amber-400/90 bg-amber-950/30 border border-amber-800/40 p-2.5 rounded">
              This action removes the item from active barcode lookups and inventory calculations. Past sales bills will preserve historical records.
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setProductToDelete(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                id="btn-confirm-delete-product"
                onClick={confirmDeleteProduct}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded text-xs font-bold shadow flex items-center gap-1.5 transition-colors"
              >
                <Trash2 size={13} /> Yes, Delete Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
