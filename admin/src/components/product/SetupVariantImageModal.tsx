import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { ProductVariant, VariantImages } from '../../types';

interface SetupVariantImageModalProps {
  open: boolean;
  onClose: () => void;
  variants: ProductVariant[];
  productImages: string[];
  variantImages: VariantImages;
  onSave: (images: VariantImages) => void;
}

export default function SetupVariantImageModal({
  open,
  onClose,
  variants,
  productImages,
  variantImages: initialVariantImages,
  onSave
}: SetupVariantImageModalProps) {
  const [selectedVariantId, setSelectedVariantId] = useState<string>('');
  const [selectedOptionValue, setSelectedOptionValue] = useState<string>('');
  const [imagesState, setImagesState] = useState<VariantImages>({});

  useEffect(() => {
    if (open) {
      setImagesState(initialVariantImages ? JSON.parse(JSON.stringify(initialVariantImages)) : {});
      if (variants && variants.length > 0) {
        setSelectedVariantId(variants[0].id);
        if (variants[0].options.length > 0) {
          setSelectedOptionValue(variants[0].options[0].value);
        }
      }
    }
  }, [open, variants, initialVariantImages]);

  if (!open) return null;

  const currentVariant = variants.find((v) => v.id === selectedVariantId) || variants[0];
  const assignedImage =
    selectedVariantId && selectedOptionValue
      ? imagesState[selectedVariantId]?.[selectedOptionValue]
      : '';

  const handleSelectVariantGroup = (vId: string) => {
    setSelectedVariantId(vId);
    const v = variants.find((item) => item.id === vId);
    if (v && v.options.length > 0) {
      setSelectedOptionValue(v.options[0].value);
    } else {
      setSelectedOptionValue('');
    }
  };

  const handleSelectOptionValue = (val: string) => {
    setSelectedOptionValue(val);
  };

  const handleAssignImage = (imgUrl: string) => {
    if (!selectedVariantId || !selectedOptionValue) return;

    setImagesState((prev) => {
      const current = prev[selectedVariantId]?.[selectedOptionValue];
      // Toggle off if clicking the already selected image
      const nextUrl = current === imgUrl ? '' : imgUrl;

      return {
        ...prev,
        [selectedVariantId]: {
          ...(prev[selectedVariantId] || {}),
          [selectedOptionValue]: nextUrl
        }
      };
    });
  };

  const handleSave = () => {
    onSave(imagesState);
    onClose();
  };

  const hasVariants = variants && variants.some((v) => v.options.length > 0);
  const cleanImages = (productImages || []).filter((img) => img && img.trim().length > 0);

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
            Setup Variant Image
          </h2>
        </div>

        {!hasVariants ? (
          <div className="py-12 text-center text-gray-400 text-xs">
            No variants configured yet. Please configure Product Variants first to map variant images.
          </div>
        ) : (
          <div className="space-y-6 my-6">
            {/* Step 1: Select Variant Group */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-900 block">
                Select variant
              </label>
              <p className="text-xs text-gray-400">
                Select your preferred variant which you want to have image.
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                {variants.map((v) => {
                  const isSelected = v.id === selectedVariantId;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => handleSelectVariantGroup(v.id)}
                      className={`px-5 py-2 rounded-full font-bold text-xs transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#5B21B6] text-white shadow-sm'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {v.title || 'Variant'}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Select Variant Option Value */}
            {currentVariant && currentVariant.options.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-900 block">
                  Select option
                </label>
                <p className="text-xs text-gray-400">
                  Select the specific option value to bind an image to.
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {currentVariant.options.map((opt) => {
                    const isSelected = opt.value === selectedOptionValue;
                    const hasMappedImg = !!imagesState[selectedVariantId]?.[opt.value];
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => handleSelectOptionValue(opt.value)}
                        className={`min-w-10 px-4 py-2 rounded-full font-bold text-xs border transition-all cursor-pointer flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-[#5B21B6] text-white border-[#5B21B6] shadow-sm'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-[#5B21B6]'
                        }`}
                      >
                        <span>{opt.value}</span>
                        {hasMappedImg && (
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isSelected ? 'bg-white' : 'bg-[#5B21B6]'
                            }`}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 3: Select Image */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-900 block">
                Select Image
              </label>
              <p className="text-xs text-gray-400">
                Select appropriate image for{' '}
                <strong className="text-gray-700">
                  {currentVariant?.title} ({selectedOptionValue})
                </strong>
              </p>

              {cleanImages.length === 0 ? (
                <div className="p-6 text-center rounded-2xl border-2 border-dashed border-gray-200 text-gray-400 text-xs">
                  No images uploaded yet. Please add images in the Media section first.
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 pt-2">
                  {cleanImages.map((imgUrl, idx) => {
                    const isCurrentAssigned = assignedImage === imgUrl;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleAssignImage(imgUrl)}
                        className={`relative aspect-square rounded-2xl overflow-hidden border-2 transition-all cursor-pointer bg-gray-50 group ${
                          isCurrentAssigned
                            ? 'border-[#5B21B6] ring-4 ring-[#5B21B6]/20'
                            : 'border-gray-200 hover:border-gray-400'
                        }`}
                      >
                        <img
                          src={imgUrl}
                          alt={`Product media ${idx}`}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        {isCurrentAssigned && (
                          <div className="absolute inset-0 bg-[#5B21B6]/30 flex items-center justify-center">
                            <div className="w-7 h-7 rounded-full bg-[#5B21B6] text-white flex items-center justify-center shadow-md">
                              <Check className="w-4 h-4 stroke-[3]" />
                            </div>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
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
