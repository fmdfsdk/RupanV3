import React, { useState, useMemo } from 'react';
import { 
  X, AlertTriangle, Search, CheckSquare, Square, 
  Trash2, PackageX, Loader2, Check, ArrowRight
} from 'lucide-react';
import { Product } from '../../types';

interface DiscontinuedProductsModalProps {
  open: boolean;
  onClose: () => void;
  discontinuedProducts: Product[];
  onMarkOutOfStock: (selectedIds: string[]) => Promise<void>;
  onDeleteProducts: (selectedIds: string[]) => Promise<void>;
}

export default function DiscontinuedProductsModal({
  open,
  onClose,
  discontinuedProducts,
  onMarkOutOfStock,
  onDeleteProducts
}: DiscontinuedProductsModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    () => new Set(discontinuedProducts.map(p => p.id))
  );
  const [isProcessing, setIsProcessing] = useState<'stock' | 'delete' | null>(null);

  // Update selection whenever modal opens or products change
  React.useEffect(() => {
    if (open) {
      setSelectedIds(new Set(discontinuedProducts.map(p => p.id)));
      setSearchQuery('');
    }
  }, [open, discontinuedProducts]);

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return discontinuedProducts;
    const q = searchQuery.toLowerCase().trim();
    return discontinuedProducts.filter(p => 
      (p.name && p.name.toLowerCase().includes(q)) ||
      (p.sku && p.sku.toLowerCase().includes(q)) ||
      (p.id && p.id.toLowerCase().includes(q)) ||
      (p.category && p.category.toLowerCase().includes(q))
    );
  }, [discontinuedProducts, searchQuery]);

  if (!open || discontinuedProducts.length === 0) return null;

  const allFilteredSelected = filteredProducts.length > 0 && 
    filteredProducts.every(p => selectedIds.has(p.id));

  const toggleSelectAll = () => {
    if (allFilteredSelected) {
      const next = new Set(selectedIds);
      filteredProducts.forEach(p => next.delete(p.id));
      setSelectedIds(next);
    } else {
      const next = new Set(selectedIds);
      filteredProducts.forEach(p => next.add(p.id));
      setSelectedIds(next);
    }
  };

  const toggleProduct = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const handleMarkStockZero = async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) {
      alert("Please select at least one product.");
      return;
    }
    setIsProcessing('stock');
    try {
      await onMarkOutOfStock(ids);
      onClose();
    } catch (err: any) {
      alert(`Failed to mark out of stock: ${err.message}`);
    } finally {
      setIsProcessing(null);
    }
  };

  const handleDelete = async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) {
      alert("Please select at least one product.");
      return;
    }
    const confirmed = window.confirm(
      `Are you sure you want to PERMANENTLY DELETE ${ids.length} products?\n\nThis cannot be undone. Customer order history for these IDs may lose product reference.`
    );
    if (!confirmed) return;

    setIsProcessing('delete');
    try {
      await onDeleteProducts(ids);
      onClose();
    } catch (err: any) {
      alert(`Failed to delete products: ${err.message}`);
    } finally {
      setIsProcessing(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div 
        className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200 border border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-6 md:p-7 border-b border-gray-100 flex items-start justify-between bg-gradient-to-r from-amber-50/50 to-orange-50/30">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 shadow-xs border border-amber-200">
              <AlertTriangle className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg md:text-xl font-black text-gray-900 tracking-tight">
                  Discontinued Products Found
                </h3>
                <span className="bg-amber-100 text-amber-800 text-xs font-black px-2.5 py-0.5 rounded-full border border-amber-200">
                  {discontinuedProducts.length} Missing
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                These products were not returned in the full Mohasagor sync. The supplier may have discontinued or removed them.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing !== null}
            className="w-9 h-9 rounded-full bg-white hover:bg-gray-100 border border-gray-200 text-gray-400 hover:text-gray-700 flex items-center justify-center transition-all cursor-pointer shrink-0 ml-2"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Informative Guidance Banner */}
        <div className="px-6 py-3 bg-amber-50/80 border-b border-amber-100/80 flex items-center gap-2.5 text-xs text-amber-900">
          <PackageX className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>Recommended:</strong> Marking as <strong>Out of Stock</strong> safely blocks new orders while preserving SEO URLs, sitemaps, and past customer receipts.
          </span>
        </div>

        {/* Search & Bulk Select Toolbar */}
        <div className="px-6 pt-4 pb-2 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by product name, SKU, or ID..."
              className="w-full pl-9 pr-4 py-2 bg-gray-50 hover:bg-gray-100/70 focus:bg-white rounded-xl border border-gray-200 focus:border-[#5B21B6] focus:ring-2 focus:ring-[#5B21B6]/10 text-xs font-medium transition-all outline-hidden"
            />
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3 text-xs">
            <button
              type="button"
              onClick={toggleSelectAll}
              className="flex items-center gap-1.5 text-gray-700 font-bold hover:text-[#5B21B6] transition-colors cursor-pointer"
            >
              {allFilteredSelected ? (
                <CheckSquare className="w-4 h-4 text-[#5B21B6]" />
              ) : (
                <Square className="w-4 h-4 text-gray-400" />
              )}
              <span>{allFilteredSelected ? 'Deselect All' : 'Select All'}</span>
            </button>
            <span className="text-gray-400 font-mono text-[11px] bg-gray-100 px-2 py-0.5 rounded-md">
              {selectedIds.size} / {filteredProducts.length} selected
            </span>
          </div>
        </div>

        {/* Product Items List */}
        <div className="flex-1 overflow-y-auto px-6 py-2 divide-y divide-gray-100 max-h-[380px]">
          {filteredProducts.length === 0 ? (
            <div className="py-12 text-center text-xs text-gray-400">
              No products matching "{searchQuery}"
            </div>
          ) : (
            filteredProducts.map((p) => {
              const isSelected = selectedIds.has(p.id);
              const imgUrl = (Array.isArray(p.images) && p.images[0]) || (p as any).thumbnail_img || '';

              return (
                <div
                  key={p.id}
                  onClick={() => toggleProduct(p.id)}
                  className={`py-3 px-3 rounded-2xl flex items-center justify-between gap-3.5 transition-all cursor-pointer ${
                    isSelected ? 'bg-purple-50/40 hover:bg-purple-50/60' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      type="button"
                      className="shrink-0 text-gray-400 hover:text-[#5B21B6] cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleProduct(p.id);
                      }}
                    >
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-[#5B21B6]" />
                      ) : (
                        <Square className="w-4 h-4 text-gray-300" />
                      )}
                    </button>

                    <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden border border-gray-200 shrink-0 flex items-center justify-center">
                      {imgUrl ? (
                        <img 
                          src={imgUrl} 
                          alt={p.name} 
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <PackageX className="w-5 h-5 text-gray-300" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs font-bold text-gray-900 truncate">
                        {p.name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-gray-500 font-mono">
                        <span className="font-semibold text-[#5B21B6] bg-purple-50 px-1.5 py-0.2 rounded border border-purple-100">
                          {p.sku || p.id}
                        </span>
                        {p.category && (
                          <span className="capitalize text-gray-600 truncate max-w-[120px]">
                            • {p.category}
                          </span>
                        )}
                        <span>• ৳{p.discountPrice || p.price}</span>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <span className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      p.stock > 0 
                        ? 'bg-amber-100 text-amber-800' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {p.stock > 0 ? `Stock: ${p.stock}` : 'Out of Stock'}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="p-5 md:p-6 border-t border-gray-100 bg-gray-50/70 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing !== null}
            className="w-full sm:w-auto px-5 py-2.5 rounded-2xl border border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-100 text-xs font-bold transition-all cursor-pointer"
          >
            Cancel / Keep As-Is
          </button>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleDelete}
              disabled={isProcessing !== null || selectedIds.size === 0}
              className="w-full sm:w-auto px-4 py-2.5 rounded-2xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              {isProcessing === 'delete' ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Selected ({selectedIds.size})</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleMarkStockZero}
              disabled={isProcessing !== null || selectedIds.size === 0}
              className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-[#5B21B6] hover:bg-[#4C1D95] text-white text-xs font-bold transition-all shadow-md hover:shadow-lg cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              {isProcessing === 'stock' ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Mark Out of Stock ({selectedIds.size})</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
