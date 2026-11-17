import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { ProductVariant } from '../../types';
import { uid } from '../../utils/variantUtils';

interface ProductVariantsManagerProps {
  open: boolean;
  onClose: () => void;
  variants: ProductVariant[];
  onSave: (variants: ProductVariant[]) => void;
}

export default function ProductVariantsManager({
  open,
  onClose,
  variants: initialVariants,
  onSave
}: ProductVariantsManagerProps) {
  const [variants, setVariants] = useState<ProductVariant[]>(() => {
    if (initialVariants && initialVariants.length > 0) {
      return JSON.parse(JSON.stringify(initialVariants));
    }
    return [];
  });

  useEffect(() => {
    if (open) {
      if (initialVariants && initialVariants.length > 0) {
        setVariants(JSON.parse(JSON.stringify(initialVariants)));
      } else {
        setVariants([]);
      }
    }
  }, [open, initialVariants]);

  if (!open) return null;

  const handleAddVariant = () => {
    setVariants((prev) => [
      ...prev,
      {
        id: uid(),
        title: '',
        mandatory: true,
        options: [{ value: '', extraPrice: 0 }]
      }
    ]);
  };

  const handleRemoveVariant = (variantId: string) => {
    setVariants((prev) => prev.filter((v) => v.id !== variantId));
  };

  const handleUpdateVariant = (variantId: string, patch: Partial<ProductVariant>) => {
    setVariants((prev) =>
      prev.map((v) => (v.id === variantId ? { ...v, ...patch } : v))
    );
  };

  const handleAddOption = (variantId: string) => {
    setVariants((prev) =>
      prev.map((v) => {
        if (v.id !== variantId) return v;
        return {
          ...v,
          options: [...v.options, { value: '', extraPrice: 0 }]
        };
      })
    );
  };

  const handleUpdateOption = (
    variantId: string,
    optIndex: number,
    field: 'value' | 'extraPrice',
    val: string | number
  ) => {
    setVariants((prev) =>
      prev.map((v) => {
        if (v.id !== variantId) return v;
        const newOptions = [...v.options];
        newOptions[optIndex] = {
          ...newOptions[optIndex],
          [field]: field === 'extraPrice' ? (val === '' ? 0 : Number(val)) : val
        };
        return { ...v, options: newOptions };
      })
    );
  };

  const handleRemoveOption = (variantId: string, optIndex: number) => {
    setVariants((prev) =>
      prev.map((v) => {
        if (v.id !== variantId) return v;
        if (v.options.length <= 1) return v; // Keep at least one option slot
        return {
          ...v,
          options: v.options.filter((_, idx) => idx !== optIndex)
        };
      })
    );
  };

  const handleSave = () => {
    // Validate if any group has options entered but empty title
    const invalidGroup = variants.find(
      (v) => v.options.some((o) => o.value.trim().length > 0) && v.title.trim().length === 0
    );
    if (invalidGroup) {
      alert("Please provide a Title (e.g. Size, Color) for each variant group with options.");
      return;
    }

    // Filter out completely blank variant groups if any
    const cleaned = variants
      .filter((v) => v.title.trim().length > 0)
      .map((v) => ({
        ...v,
        options: v.options.filter((o) => o.value.trim().length > 0)
      }))
      .filter((v) => v.options.length > 0);

    onSave(cleaned);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="relative bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 md:p-8 shadow-2xl animate-in zoom-in-95 duration-200">
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
            Manage Product Variant
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Configure custom variant attributes (e.g. Size, Color, Age, Material) and optional extra pricing.
          </p>
        </div>

        {/* Variant Cards List */}
        <div className="space-y-6 my-6">
          {variants.length === 0 ? (
            <div className="text-center py-10 px-4 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
              <p className="text-sm font-bold text-gray-700">No variant groups configured.</p>
              <p className="text-xs text-gray-400 mt-1 mb-4">
                This product currently has no variants (single item). Click below to add your first variant.
              </p>
              <button
                type="button"
                onClick={handleAddVariant}
                className="bg-[#5B21B6] hover:bg-[#4C1D95] text-white font-bold text-xs px-5 py-2.5 rounded-full inline-flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Variant</span>
              </button>
            </div>
          ) : (
            variants.map((v) => (
              <div
                key={v.id}
                className="relative p-6 rounded-2xl border-2 border-[#7C3AED]/30 bg-white shadow-xs space-y-4"
              >
                {/* Delete Entire Variant Group (allowed for all groups) */}
                <button
                  type="button"
                  onClick={() => handleRemoveVariant(v.id)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors p-1 cursor-pointer"
                  title="Delete this variant group"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

              {/* Mandatory Toggle */}
              <div className="flex items-center justify-between pr-8">
                <div>
                  <h4 className="text-sm font-bold text-gray-900">
                    Make this variant mandatory
                  </h4>
                  <p className="text-xs text-gray-400">
                    Toggle this on if you want your customer to select at least one of the variant options
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-600">
                    {v.mandatory ? 'YES' : 'NO'}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleUpdateVariant(v.id, { mandatory: !v.mandatory })}
                    className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                      v.mandatory ? 'bg-[#5B21B6]' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                        v.mandatory ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Title Field */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Title</label>
                <input
                  type="text"
                  placeholder="Enter the name of the variant (e.g., Color, Size, Material)"
                  value={v.title}
                  onChange={(e) => handleUpdateVariant(v.id, { title: e.target.value })}
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-[#7C3AED]"
                />
              </div>

              {/* Attributes & Extra Price list */}
              <div className="space-y-3">
                {v.options.map((opt, optIdx) => (
                  <div key={optIdx} className="flex items-end gap-3">
                    <div className="flex-1 space-y-1">
                      {optIdx === 0 && (
                        <label className="text-xs font-bold text-gray-700">Attribute</label>
                      )}
                      <input
                        type="text"
                        placeholder="Enter variant option (e.g., XL, Red)"
                        value={opt.value}
                        onChange={(e) =>
                          handleUpdateOption(v.id, optIdx, 'value', e.target.value)
                        }
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 text-xs text-gray-900 focus:outline-none focus:border-[#7C3AED]"
                      />
                    </div>

                    <div className="flex-1 space-y-1">
                      {optIdx === 0 && (
                        <label className="text-xs font-bold text-gray-700">Extra Price</label>
                      )}
                      <input
                        type="number"
                        min="0"
                        placeholder="Enter extra price for this option"
                        value={opt.extraPrice || ''}
                        onChange={(e) =>
                          handleUpdateOption(v.id, optIdx, 'extraPrice', e.target.value)
                        }
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 text-xs text-gray-900 focus:outline-none focus:border-[#7C3AED]"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveOption(v.id, optIdx)}
                      className="p-2 text-red-400 hover:text-red-600 transition-colors cursor-pointer mb-0.5"
                      title="Remove option"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add More Option button */}
              <button
                type="button"
                onClick={() => handleAddOption(v.id)}
                className="bg-[#EDE9FE] hover:bg-[#DDD6FE] text-[#6D28D9] font-bold text-xs px-4 py-2 rounded-xl transition-colors cursor-pointer inline-flex items-center gap-1"
              >
                <span>Add More Option+</span>
              </button>
            </div>
            ))
          )}
        </div>

        {/* Add Variant Button */}
        {variants.length > 0 && (
          <div className="flex justify-end mb-6">
            <button
              type="button"
              onClick={handleAddVariant}
              className="bg-[#5B21B6] hover:bg-[#4C1D95] text-white font-bold text-xs px-5 py-2.5 rounded-full flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Variant</span>
            </button>
          </div>
        )}

        {/* Save Button */}
        <button
          type="button"
          onClick={handleSave}
          className="w-full bg-[#5B21B6] hover:bg-[#4C1D95] text-white font-bold text-sm py-3.5 rounded-2xl shadow-md transition-all cursor-pointer tracking-wide"
        >
          Save
        </button>
      </div>
    </div>
  );
}
