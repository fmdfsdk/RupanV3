import React, { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { ProductVariant, VariantStock } from '../../types';
import { buildInitialVariantStock } from '../../utils/variantUtils';

interface ManageStockModalProps {
  open: boolean;
  onClose: () => void;
  variants: ProductVariant[];
  variantStock: VariantStock;
  maintainStockEnabled?: boolean;
  onSave: (stock: VariantStock, totalCalculatedStock?: number, isMaintainEnabled?: boolean) => void;
}

export default function ManageStockModal({
  open,
  onClose,
  variants,
  variantStock: initialStock,
  maintainStockEnabled = false,
  onSave
}: ManageStockModalProps) {
  const [maintainStock, setMaintainStock] = useState<boolean>(maintainStockEnabled);
  const [stockState, setStockState] = useState<VariantStock>({});

  useEffect(() => {
    if (open) {
      const initialized = buildInitialVariantStock(variants, initialStock);
      setStockState(initialized);
      setMaintainStock(!!maintainStockEnabled);
    }
  }, [open, variants, initialStock, maintainStockEnabled]);

  if (!open) return null;

  const handleUpdateQty = (variantId: string, optValue: string, qty: number) => {
    setStockState((prev) => ({
      ...prev,
      [variantId]: {
        ...(prev[variantId] || {}),
        [optValue]: {
          ...(prev[variantId]?.[optValue] || { active: true, qty: 0 }),
          qty: Math.max(0, qty)
        }
      }
    }));
  };

  const handleToggleActive = (variantId: string, optValue: string) => {
    setStockState((prev) => {
      const current = prev[variantId]?.[optValue]?.active ?? true;
      return {
        ...prev,
        [variantId]: {
          ...(prev[variantId] || {}),
          [optValue]: {
            ...(prev[variantId]?.[optValue] || { qty: 0 }),
            active: !current
          }
        }
      };
    });
  };

  const handleSave = () => {
    if (!maintainStock) {
      // Disabled: clear variant-wise stock so product uses master inventory stock
      onSave({}, undefined, false);
      onClose();
      return;
    }

    // Calculate total stock from all active variant options
    let totalStock = 0;
    Object.values(stockState).forEach((opts) => {
      Object.values(opts).forEach((st) => {
        if (st.active) {
          totalStock += Number(st.qty) || 0;
        }
      });
    });

    onSave(stockState, totalStock, true);
    onClose();
  };

  // Check if variants exist
  const hasVariants = variants && variants.some((v) => v.options.length > 0);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="relative bg-white rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 md:p-8 shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Close Button Top Right */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-red-50 text-red-500 border border-red-200 flex items-center justify-center hover:bg-red-100 transition-colors cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Title */}
        <div className="text-center pb-6 border-b border-gray-100">
          <h2 className="text-xl font-black text-gray-900 tracking-tight">
            Manage Stock
          </h2>
        </div>

        {/* Maintain variant wise stock toggle row */}
        <div className="flex items-center justify-between py-6 border-b border-gray-100">
          <div className="pr-4">
            <h4 className="text-sm font-bold text-gray-900">
              Maintain variant wise stock
            </h4>
            <p className="text-xs text-gray-400">
              By enabling it, you can maintain stock based on your products variant
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className={`text-xs font-bold ${maintainStock ? 'text-[#5B21B6]' : 'text-gray-400'}`}>
              {maintainStock ? 'ACTIVE' : 'INACTIVE'}
            </span>
            <button
              type="button"
              onClick={() => setMaintainStock((prev) => !prev)}
              className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                maintainStock ? 'bg-[#5B21B6]' : 'bg-gray-300'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  maintainStock ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Inactive Notice */}
        {!maintainStock && (
          <div className="my-5 p-4 bg-gray-50 border border-gray-200 rounded-2xl flex items-start gap-3 text-xs text-gray-600">
            <AlertCircle className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-gray-800 block mb-0.5">
                Variant-wise stock is currently INACTIVE
              </span>
              This product will use the unified <strong>Quantity (Stock)</strong> configured in the Inventory section. Customer orders will decrement the overall stock instead of option-specific limits.
            </div>
          </div>
        )}

        {/* Variant options cards */}
        {!hasVariants ? (
          <div className="py-12 text-center text-gray-400 text-xs">
            No variants configured yet. Please configure Product Variants first to manage variant stock.
          </div>
        ) : (
          <div className={`space-y-6 my-6 transition-opacity duration-200 ${!maintainStock ? 'opacity-40 pointer-events-none' : ''}`}>
            {variants.map((v) => (
              <div key={v.id} className="space-y-3">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                  {v.title || 'Variant Group'}
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {v.options.map((opt) => {
                    const st = stockState[v.id]?.[opt.value] || { qty: 0, active: true };
                    return (
                      <div
                        key={opt.value}
                        className="p-4 rounded-2xl border border-gray-200 bg-white space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-extrabold text-gray-800">
                            {opt.value}
                          </span>
                          <button
                            type="button"
                            disabled={!maintainStock}
                            onClick={() => handleToggleActive(v.id, opt.value)}
                            className={`w-10 h-5 flex items-center rounded-full p-0.5 cursor-pointer transition-colors ${
                              st.active ? 'bg-[#5B21B6]' : 'bg-gray-300'
                            }`}
                          >
                            <div
                              className={`bg-white w-4 h-4 rounded-full shadow-xs transform transition-transform ${
                                st.active ? 'translate-x-5' : 'translate-x-0'
                              }`}
                            />
                          </button>
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-gray-500 block">
                            Quantity
                          </label>
                          <input
                            type="number"
                            min="0"
                            disabled={!maintainStock || !st.active}
                            value={st.qty ?? 0}
                            onChange={(e) =>
                              handleUpdateQty(
                                v.id,
                                opt.value,
                                parseInt(e.target.value) || 0
                              )
                            }
                            className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-[#7C3AED] disabled:bg-gray-50 disabled:text-gray-400"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Save Button */}
        <button
          type="button"
          onClick={handleSave}
          className="w-full bg-[#5B21B6] hover:bg-[#4C1D95] text-white font-bold text-sm py-3.5 rounded-2xl shadow-md transition-all cursor-pointer tracking-wide mt-4"
        >
          Save
        </button>
      </div>
    </div>
  );
}
