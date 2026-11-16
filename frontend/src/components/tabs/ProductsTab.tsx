import React from 'react';
import { Plus, Search, Edit, Copy, Trash2 } from 'lucide-react';
import { Product } from '../../types';

interface ProductsTabProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  filterCategory: string;
  setFilterCategory: (c: string) => void;
  filterStatus: string;
  setFilterStatus: (s: string) => void;
  availableCategories: string[];
  filteredProducts: Product[];
  totalProductsCount: number;
  productsPage: number;
  setProductsPage: (p: number | ((prev: number) => number)) => void;
  pageSize: number;
  openProductForm: (p: Product | null) => void;
  handleDuplicateProduct: (p: Product) => void;
  handleDeleteProduct: (id: string) => void;
  isManualOnly?: boolean;
  isMohasagorOnly?: boolean;
}

export default function ProductsTab({
  searchQuery,
  setSearchQuery,
  filterCategory,
  setFilterCategory,
  filterStatus,
  setFilterStatus,
  availableCategories,
  filteredProducts,
  totalProductsCount,
  productsPage,
  setProductsPage,
  pageSize,
  openProductForm,
  handleDuplicateProduct,
  handleDeleteProduct,
  isManualOnly = false,
  isMohasagorOnly = false
}: ProductsTabProps) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
            {isMohasagorOnly ? "🌊 Mohasagor Reseller Products" : isManualOnly ? "🏷️ My Added Products" : "Products Inventory"}
          </h1>
          <p className="text-xs text-gray-500">
            {isMohasagorOnly 
              ? "Products imported & synchronized directly via the Mohasagor API." 
              : isManualOnly 
              ? "Manage your manually created boutique designs and custom inventory." 
              : "Dynamically add, edit, duplicate, and configure store SKUs."}
          </p>
        </div>
        <button
          onClick={() => openProductForm(null)}
          className="bg-brand-primary text-white text-xs font-bold uppercase tracking-wider px-5 py-3 rounded-xl flex items-center space-x-2 hover:bg-blue-900 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Product</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 w-72">
          <Search className="w-4 h-4 text-gray-400 mr-2" />
          <input 
            type="text" 
            placeholder="Search product, category, ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none text-xs focus:ring-0 w-full outline-none"
          />
        </div>

        <div className="flex gap-3">
          <div>
            <select 
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-gray-50 border border-gray-200 text-xs font-bold rounded-xl px-3 py-2 cursor-pointer focus:outline-none"
            >
              {availableCategories.map(cat => (
                <option key={cat} value={cat}>{cat === 'All' ? 'All Categories' : cat}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-gray-50 border border-gray-200 text-xs font-bold rounded-xl px-3 py-2 cursor-pointer focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="published">Published Only</option>
              <option value="draft">Drafts Only</option>
              <option value="archived">Archived Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Grid / Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-[10px] uppercase tracking-wider text-gray-400 font-bold">
                <th className="p-4 w-12">Preview</th>
                <th className="p-4">SKU / Product Info</th>
                <th className="p-4">Category</th>
                <th className="p-4 text-right">Price</th>
                <th className="p-4 text-center">Stock</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-xs">
              {filteredProducts.map((p) => {
                const isLowStock = p.stock <= (p.lowStockWarning || 5);
                return (
                  <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4">
                      <img 
                        src={p.images[0] || 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80&w=200'} 
                        alt={p.name}
                        className="w-10 h-12 object-cover rounded-md"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80&w=200';
                        }}
                      />
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-zinc-900 leading-tight">{p.name}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">
                          SKU: {p.sku || `RUP-${p.id.toUpperCase()}`}
                        </span>
                        {(p as any).source_id === 'mohasagor' ? (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                            🌊 Mohasagor
                          </span>
                        ) : (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            🏷️ Manual
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 font-semibold text-gray-500 uppercase text-[10px]">{p.category}</td>
                    <td className="p-4 text-right font-bold text-zinc-950">
                      {p.discountPrice ? (
                        <div className="flex flex-col items-end">
                          <span className="text-brand-primary">৳{p.discountPrice.toLocaleString('en-IN')}</span>
                          <span className="text-[10px] text-gray-400 line-through">৳{p.price.toLocaleString('en-IN')}</span>
                        </div>
                      ) : (
                        <span>৳{p.price.toLocaleString('en-IN')}</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <span className={`px-2 py-0.5 rounded font-bold ${
                        isLowStock 
                          ? 'bg-red-50 text-red-600 border border-red-100' 
                          : 'bg-green-50 text-green-700 border border-green-100'
                      }`}>
                        {p.stock} units
                      </span>
                    </td>
                    <td className="p-4 text-center uppercase text-[9px] font-bold">
                      <span className={`px-2 py-1 rounded-full ${
                        p.status === 'published' || !p.status
                          ? 'bg-blue-50 text-blue-700 border border-blue-100'
                          : p.status === 'draft'
                          ? 'bg-gray-100 text-gray-600'
                          : 'bg-red-50 text-red-600'
                      }`}>
                        {p.status || 'published'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end space-x-2">
                        <button 
                          onClick={() => openProductForm(p)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-brand-primary"
                          title="Edit Product Details"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDuplicateProduct(p)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-indigo-600"
                          title="Duplicate SKU"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteProduct(p.id)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-red-500"
                          title="Delete Product Permanently"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        <div className="bg-white p-4 border-t border-gray-100 flex items-center justify-between flex-wrap gap-3">
          <div className="text-xs font-semibold text-gray-500">
            Showing <span className="text-gray-900 font-bold">{totalProductsCount === 0 ? 0 : Math.min(totalProductsCount, (productsPage - 1) * pageSize + 1)}</span> to{' '}
            <span className="text-gray-900 font-bold">{Math.min(totalProductsCount, productsPage * pageSize)}</span> of{' '}
            <span className="text-gray-900 font-bold">{totalProductsCount}</span> products
          </div>
          
          <div className="flex items-center space-x-1.5">
            <button
              type="button"
              onClick={() => setProductsPage(prev => Math.max(1, prev - 1))}
              disabled={productsPage === 1}
              className="px-3 py-1.5 text-xs font-bold rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none transition-all cursor-pointer"
            >
              Previous
            </button>
            
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, Math.ceil(totalProductsCount / pageSize)) }).map((_, idx) => {
                const totalPages = Math.ceil(totalProductsCount / pageSize);
                let pageNo = idx + 1;
                
                if (productsPage > 3 && totalPages > 5) {
                  if (productsPage + 2 >= totalPages) {
                    pageNo = totalPages - 4 + idx;
                  } else {
                    pageNo = productsPage - 2 + idx;
                  }
                }
                
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setProductsPage(pageNo)}
                    className={`w-8 h-8 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      productsPage === pageNo
                        ? 'bg-brand-primary text-white font-black'
                        : 'text-gray-600 hover:bg-gray-100 border border-transparent'
                    }`}
                  >
                    {pageNo}
                  </button>
                );
              })}
            </div>
            
            <button
              type="button"
              onClick={() => setProductsPage(prev => Math.min(Math.ceil(totalProductsCount / pageSize), prev + 1))}
              disabled={productsPage >= Math.ceil(totalProductsCount / pageSize)}
              className="px-3 py-1.5 text-xs font-bold rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none transition-all cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
