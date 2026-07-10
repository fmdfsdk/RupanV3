import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Product } from '../../types';

interface InventoryTabProps {
  products: Product[];
  selectedProductIds: string[];
  setSelectedProductIds: (ids: string[]) => void;
  bulkStockAdd: number;
  setBulkStockAdd: (n: number) => void;
  handleBulkStockUpdate: () => void;
}

export default function InventoryTab({
  products,
  selectedProductIds,
  setSelectedProductIds,
  bulkStockAdd,
  setBulkStockAdd,
  handleBulkStockUpdate
}: InventoryTabProps) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Bulk Stock Control</h1>
          <p className="text-xs text-gray-500">Quickly inspect stock thresholds, monitor alerts, and execute batch adjustments.</p>
        </div>
      </div>

      {/* Bulk Stock Adjustment Tool */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs flex flex-col md:flex-row gap-6 items-end justify-between">
        <div className="space-y-2 flex-1">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Batch adjustment parameters</span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-600">Stock modification amount</label>
              <input 
                type="number" 
                placeholder="e.g. 10 to add, -5 to subtract"
                value={bulkStockAdd || ''}
                onChange={(e) => setBulkStockAdd(parseInt(e.target.value) || 0)}
                className="bg-gray-50 border border-gray-200 text-xs rounded-xl px-3 py-2.5 w-full focus:outline-none"
              />
            </div>
            <div className="flex items-center">
              <span className="text-xs text-zinc-500 leading-normal">
                This will add/subtract stock from the <strong>{selectedProductIds.length}</strong> selected products.
              </span>
            </div>
          </div>
        </div>
        
        <button 
          onClick={handleBulkStockUpdate}
          disabled={selectedProductIds.length === 0}
          className="bg-brand-primary disabled:bg-gray-200 disabled:cursor-not-allowed text-white text-xs font-bold uppercase tracking-wider px-6 py-3 rounded-xl hover:bg-blue-900 transition-all cursor-pointer"
        >
          Apply Batch Change
        </button>
      </div>

      {/* Inventory levels table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                if (selectedProductIds.length === products.length) {
                  setSelectedProductIds([]);
                } else {
                  setSelectedProductIds(products.map(p => p.id));
                }
              }}
              className="text-xs text-brand-primary font-bold hover:underline cursor-pointer"
            >
              Toggle Selection ({selectedProductIds.length})
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-[10px] uppercase tracking-wider text-gray-400 font-bold">
                <th className="p-4 w-12 text-center">Select</th>
                <th className="p-4">SKU Code</th>
                <th className="p-4">Product Name</th>
                <th className="p-4 text-center">Current Stock</th>
                <th className="p-4 text-center">Safety Limit</th>
                <th className="p-4">Level Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-xs">
              {products.map((p) => {
                const isSelected = selectedProductIds.includes(p.id);
                const isLowStock = p.stock <= (p.lowStockWarning || 5);
                return (
                  <tr key={p.id} className={`hover:bg-gray-50/50 ${isSelected ? 'bg-blue-50/20' : ''}`}>
                    <td className="p-4 text-center">
                      <input 
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedProductIds([...selectedProductIds, p.id]);
                          } else {
                            setSelectedProductIds(selectedProductIds.filter(id => id !== p.id));
                          }
                        }}
                        className="rounded border-gray-300 text-brand-primary focus:ring-brand-primary cursor-pointer"
                      />
                    </td>
                    <td className="p-4 font-mono font-bold uppercase text-[10px] text-gray-500">{p.sku || `RUP-${p.id.toUpperCase()}`}</td>
                    <td className="p-4 font-bold text-zinc-900">{p.name}</td>
                    <td className="p-4 text-center font-bold">
                      <span className={isLowStock ? 'text-red-600 font-black' : 'text-zinc-800'}>
                        {p.stock}
                      </span>
                    </td>
                    <td className="p-4 text-center text-gray-400 font-semibold">{p.lowStockWarning || 5} units</td>
                    <td className="p-4">
                      {isLowStock ? (
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold text-red-600 bg-red-50 border border-red-100 px-2 py-0.5 rounded">
                          <AlertTriangle className="w-3 h-3" />
                          CRITICAL STOCK
                        </span>
                      ) : p.stock === 0 ? (
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold text-zinc-500 bg-gray-100 px-2 py-0.5 rounded">
                          SOLD OUT
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold text-green-700 bg-green-50 border border-green-100 px-2 py-0.5 rounded">
                          ADEQUATE LEVEL
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
