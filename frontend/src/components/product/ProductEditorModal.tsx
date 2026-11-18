import React, { useState, useEffect } from 'react';
import {
  X, Plus, ChevronDown, ChevronUp, Upload, Link as LinkIcon,
  Trash2, Image as ImageIcon, Video, HelpCircle, Layers, Check,
  Copy, ExternalLink, Sparkles, FolderTree
} from 'lucide-react';
import { Product, ProductVariant, VariantStock, VariantImages, Category } from '../../types';
import ProductVariantsManager from './ProductVariantsManager';
import ManageStockModal from './ManageStockModal';
import SetupVariantImageModal from './SetupVariantImageModal';
import AssignCategoriesModal from './AssignCategoriesModal';
import { detectProductGender, resolveProductVariants } from '../../utils/variantUtils';

interface ProductEditorModalProps {
  open: boolean;
  onClose: () => void;
  editingProduct: Product | null;
  onSave: (formData: Partial<Product>) => Promise<void> | void;
  availableCategories: string[];
  categories?: Category[];
  onQuickAddCategory?: (name: string, parentId?: string | null) => Promise<void>;
}

export default function ProductEditorModal({
  open,
  onClose,
  editingProduct,
  onSave,
  availableCategories,
  categories = [],
  onQuickAddCategory
}: ProductEditorModalProps) {
  // --- Form State ---
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    slug: '',
    sku: '',
    brand: 'Rupan',
    category: 'Panjabi',
    subCategory: '',
    tags: [],
    gender: 'Men',
    price: 0,
    discountPrice: undefined,
    purchasePrice: undefined,
    stock: 20,
    lowStockWarning: 5,
    unitName: 'PCS',
    initialSold: 0,
    description: '',
    shortDescription: '',
    seoTitle: '',
    seoDescription: '',
    images: [],
    videoUrl: '',
    weight: 0.35,
    length: undefined,
    width: undefined,
    height: undefined,
    condition: 'New',
    status: 'published',
    shippingOption: 'default',
    insideDhakaShipping: 60,
    outsideDhakaShipping: 120,
    detailsList: [
      { type: 'Material', description: 'Premium Cotton' },
      { type: 'Fit', description: 'Regular Fit' }
    ],
    variants: [],
    variant_stock: {},
    variant_images: {},
    maintain_variant_stock: false,
    colors: [],
    sizes: []
  } as any);

  // --- Sub-Modals State ---
  const [variantsModalOpen, setVariantsModalOpen] = useState<boolean>(false);
  const [stockModalOpen, setStockModalOpen] = useState<boolean>(false);
  const [variantImageModalOpen, setVariantImageModalOpen] = useState<boolean>(false);
  const [assignCatModalOpen, setAssignCatModalOpen] = useState<boolean>(false);

  // --- New Item Helper States ---
  const [newImageUrl, setNewImageUrl] = useState<string>('');
  const [imageInputMethod, setImageInputMethod] = useState<'url' | 'upload'>('url');
  const [newTagInput, setNewTagInput] = useState<string>('');
  const [showNewCatInput, setShowNewCatInput] = useState<boolean>(false);
  const [newCatName, setNewCatName] = useState<string>('');
  const [isAddingCat, setIsAddingCat] = useState<boolean>(false);

  // --- Accordion collapse states ---
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (sectionKey: string) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  // Populate form on mount or when editingProduct changes
  useEffect(() => {
    if (editingProduct) {
      // Auto-resolve variants: structured variants if present, otherwise dynamically synthesize from sizes/colors
      const initialVariants = resolveProductVariants(editingProduct);
      const accurateGender = detectProductGender(
        editingProduct.category,
        editingProduct.name,
        editingProduct.gender
      );

      setFormData({
        ...editingProduct,
        isFeatured: editingProduct.isFeatured !== undefined ? !!editingProduct.isFeatured : !!(editingProduct as any).is_featured,
        is_featured: editingProduct.isFeatured !== undefined ? !!editingProduct.isFeatured : !!(editingProduct as any).is_featured,
        isTrending: editingProduct.isTrending !== undefined ? !!editingProduct.isTrending : !!(editingProduct as any).is_trending,
        is_trending: editingProduct.isTrending !== undefined ? !!editingProduct.isTrending : !!(editingProduct as any).is_trending,
        isNew: editingProduct.isNew !== undefined ? !!editingProduct.isNew : ((editingProduct as any).is_new !== undefined ? !!(editingProduct as any).is_new : true),
        is_new: editingProduct.isNew !== undefined ? !!editingProduct.isNew : ((editingProduct as any).is_new !== undefined ? !!(editingProduct as any).is_new : true),
        isBestSeller: editingProduct.isBestSeller !== undefined ? !!editingProduct.isBestSeller : !!(editingProduct as any).is_best_seller,
        is_best_seller: editingProduct.isBestSeller !== undefined ? !!editingProduct.isBestSeller : !!(editingProduct as any).is_best_seller,
        isFlashSale: editingProduct.isFlashSale !== undefined ? !!editingProduct.isFlashSale : !!(editingProduct as any).is_flash_sale,
        is_flash_sale: editingProduct.isFlashSale !== undefined ? !!editingProduct.isFlashSale : !!(editingProduct as any).is_flash_sale,
        sourceId: (editingProduct as any).sourceId || (editingProduct as any).source_id || (editingProduct.id?.startsWith('mohasagor-') ? 'mohasagor' : 'manual'),
        source_id: (editingProduct as any).source_id || (editingProduct as any).sourceId || (editingProduct.id?.startsWith('mohasagor-') ? 'mohasagor' : 'manual'),
        sourceProductId: (editingProduct as any).sourceProductId || (editingProduct as any).source_product_id || null,
        source_product_id: (editingProduct as any).source_product_id || (editingProduct as any).sourceProductId || null,
        gender: accurateGender,
        variants: initialVariants,
        sizes: editingProduct.sizes || [],
        colors: editingProduct.colors || [],
        variant_stock: editingProduct.variant_stock || editingProduct.variantStock || {},
        variant_images: editingProduct.variant_images || editingProduct.variantImages || {},
        maintain_variant_stock: !!(
          editingProduct.maintain_variant_stock ||
          (editingProduct as any).maintainVariantStock ||
          (editingProduct.variant_stock && Object.keys(editingProduct.variant_stock).length > 0) ||
          ((editingProduct as any).variantStock && Object.keys((editingProduct as any).variantStock).length > 0)
        ),
        unitName: (editingProduct as any).unitName || (editingProduct as any).unit_name || 'PCS',
        initialSold: (editingProduct as any).initialSold || (editingProduct as any).initial_sold || 0,
        detailsList: (editingProduct as any).detailsList || (editingProduct as any).details_list || (
          Array.isArray(editingProduct.features) && editingProduct.features.length > 0
            ? editingProduct.features.map((f: string) => {
                const parts = f.split(':');
                if (parts.length > 1) {
                  return { type: parts[0].trim(), description: parts.slice(1).join(':').trim() };
                }
                return { type: 'Feature', description: f };
              })
            : [{ type: 'Material', description: editingProduct.material || 'Premium Quality' }]
        ),
        shippingOption: (editingProduct as any).shippingOption || 'default',
        insideDhakaShipping: (editingProduct as any).insideDhakaShipping ?? 60,
        outsideDhakaShipping: (editingProduct as any).outsideDhakaShipping ?? 120,
        condition: (editingProduct as any).condition || 'New',
        images: Array.isArray(editingProduct.images) ? [...editingProduct.images] : []
      });
    } else {
      // New product defaults - clean without forced dummy variants
      const defaultCategory = availableCategories.find((c) => c !== 'All') || 'Panjabi';
      const defaultGender = detectProductGender(defaultCategory, '');

      setFormData({
        name: '',
        slug: '',
        sku: `RUP-${Math.floor(1000 + Math.random() * 9000)}`,
        brand: 'Rupan',
        category: defaultCategory,
        subCategory: '',
        tags: ['New Arrival'],
        gender: defaultGender,
        price: 0,
        discountPrice: undefined,
        purchasePrice: undefined,
        stock: 10,
        lowStockWarning: 5,
        unitName: 'PCS',
        initialSold: 0,
        description: '',
        shortDescription: '',
        seoTitle: '',
        seoDescription: '',
        images: [],
        videoUrl: '',
        weight: 0.35,
        condition: 'New',
        status: 'published',
        shippingOption: 'default',
        insideDhakaShipping: 60,
        outsideDhakaShipping: 120,
        detailsList: [
          { type: 'Material', description: 'Premium Cotton' }
        ],
        variants: [], // Starts completely optional & clean
        variant_stock: {},
        variant_images: {},
        maintain_variant_stock: false,
        sizes: [],
        colors: []
      } as any);
    }
  }, [editingProduct, availableCategories]);

  if (!open) return null;

  // --- Handlers ---
  const handleAddImage = () => {
    if (newImageUrl.trim()) {
      setFormData((prev) => ({
        ...prev,
        images: [...(prev.images || []), newImageUrl.trim()]
      }));
      setNewImageUrl('');
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: (prev.images || []).filter((_, i) => i !== index)
    }));
  };

  const handleAddDetailItem = () => {
    setFormData((prev) => ({
      ...prev,
      detailsList: [...(prev.detailsList || []), { type: '', description: '' }]
    }));
  };

  const handleUpdateDetailItem = (index: number, field: 'type' | 'description', val: string) => {
    setFormData((prev) => {
      const list = [...(prev.detailsList || [])];
      list[index] = { ...list[index], [field]: val };
      return { ...prev, detailsList: list };
    });
  };

  const handleRemoveDetailItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      detailsList: (prev.detailsList || []).filter((_, i) => i !== index)
    }));
  };

  const handleAddTag = () => {
    if (newTagInput.trim() && !formData.tags?.includes(newTagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...(prev.tags || []), newTagInput.trim()]
      }));
      setNewTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: (prev.tags || []).filter((t) => t !== tag)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.category || !formData.price) {
      alert('Please fill in Item Name, Category, and Price');
      return;
    }
    onSave(formData);
  };

  const currentVariants: ProductVariant[] = formData.variants || [];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="relative bg-[#F8FAFC] rounded-3xl w-full max-w-6xl max-h-[95vh] overflow-y-auto shadow-2xl flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Top Sticky Header */}
        <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-gray-200 flex items-center justify-between rounded-t-3xl">
          <div>
            <h2 className="text-xl font-black text-gray-900 tracking-tight">
              {editingProduct ? `Edit Product: ${editingProduct.name}` : 'Add New Product'}
            </h2>
            <p className="text-xs text-gray-400">
              {editingProduct
                ? 'Update product specifications, variants, pricing, and media inventory.'
                : 'Create and configure a new store SKU with optional custom variants.'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-red-50 text-red-500 border border-red-200 flex items-center justify-center hover:bg-red-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form Body - 2 Columns Layout */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* ================= LEFT MAIN COLUMN (8 COLS) ================= */}
            <div className="lg:col-span-8 space-y-6">

              {/* 1. General Information Card */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
                <div
                  onClick={() => toggleSection('general')}
                  className="flex items-center justify-between cursor-pointer select-none"
                >
                  <h3 className="text-sm font-bold text-gray-900 tracking-tight">
                    General Information
                  </h3>
                  <button type="button" className="text-gray-400 hover:text-gray-600">
                    {collapsedSections['general'] ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronUp className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {!collapsedSections['general'] && (
                  <div className="space-y-4 pt-2">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-700">
                        Item Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name || ''}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Royal Blue Jacquard Premium Semi-Fitted Panjabi"
                        className="w-full bg-white border border-gray-200 text-xs rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#7C3AED]"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <label className="font-bold text-gray-700">Short Description</label>
                        <span className="text-[10px] text-gray-400">
                          {(formData.shortDescription || '').length}/160
                        </span>
                      </div>
                      <input
                        type="text"
                        maxLength={160}
                        value={formData.shortDescription || ''}
                        onChange={(e) =>
                          setFormData({ ...formData, shortDescription: e.target.value })
                        }
                        placeholder="Brief summary displayed on cards and search results"
                        className="w-full bg-white border border-gray-200 text-xs rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#7C3AED]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-700">
                        SEO Description (Direct & Social Feed)
                      </label>
                      <textarea
                        rows={2}
                        value={formData.seoDescription || ''}
                        onChange={(e) =>
                          setFormData({ ...formData, seoDescription: e.target.value })
                        }
                        placeholder="Optimized metadata description for Google, Facebook, and Instagram"
                        className="w-full bg-white border border-gray-200 text-xs rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#7C3AED]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-700">Description</label>
                      <textarea
                        rows={5}
                        value={formData.description || ''}
                        onChange={(e) =>
                          setFormData({ ...formData, description: e.target.value })
                        }
                        placeholder="Full product overview, features, care instructions, and styling notes"
                        className="w-full bg-white border border-gray-200 text-xs rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#7C3AED]"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* 2. Media Card */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
                <div
                  onClick={() => toggleSection('media')}
                  className="flex items-center justify-between cursor-pointer select-none"
                >
                  <h3 className="text-sm font-bold text-gray-900 tracking-tight">Media</h3>
                  <button type="button" className="text-gray-400 hover:text-gray-600">
                    {collapsedSections['media'] ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronUp className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {!collapsedSections['media'] && (
                  <div className="space-y-4 pt-2">
                    {/* Image Acquisition Tabs */}
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setImageInputMethod('url')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                          imageInputMethod === 'url'
                            ? 'bg-[#5B21B6] text-white shadow-xs'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        <LinkIcon className="w-3.5 h-3.5" />
                        <span>Image URL</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setImageInputMethod('upload')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                          imageInputMethod === 'upload'
                            ? 'bg-[#5B21B6] text-white shadow-xs'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload File</span>
                      </button>
                    </div>

                    {imageInputMethod === 'url' ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newImageUrl}
                          onChange={(e) => setNewImageUrl(e.target.value)}
                          placeholder="Paste image URL (e.g. https://images.unsplash.com/...)"
                          className="flex-1 bg-white border border-gray-200 text-xs rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#7C3AED]"
                        />
                        <button
                          type="button"
                          onClick={handleAddImage}
                          className="bg-[#5B21B6] hover:bg-[#4C1D95] text-white font-bold text-xs px-5 py-2.5 rounded-xl cursor-pointer transition-colors"
                        >
                          Add Image
                        </button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center bg-gray-50/50">
                        <input
                          type="file"
                          id="editor-file-upload"
                          className="hidden"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const dummyUrl = URL.createObjectURL(file);
                              setFormData((prev) => ({
                                ...prev,
                                images: [...(prev.images || []), dummyUrl]
                              }));
                            }
                          }}
                        />
                        <label
                          htmlFor="editor-file-upload"
                          className="cursor-pointer space-y-1 block"
                        >
                          <Upload className="w-8 h-8 text-gray-400 mx-auto" />
                          <p className="text-xs font-bold text-[#5B21B6]">
                            Click to upload or drag and drop
                          </p>
                          <p className="text-[10px] text-gray-400">
                            Supported: PNG, JPG, WebP. Recommended 600x600 px or 800x800 px.
                          </p>
                        </label>
                      </div>
                    )}

                    {/* Image Cards Row */}
                    <div className="flex flex-wrap gap-3 pt-2">
                      {(formData.images || []).map((imgUrl, idx) => (
                        <div
                          key={idx}
                          className="relative w-24 h-28 rounded-2xl overflow-hidden border border-gray-200 bg-gray-100 group shadow-xs"
                        >
                          <img
                            src={imgUrl}
                            alt={`Product preview ${idx}`}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors shadow-xs cursor-pointer"
                            title="Remove image"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                          {idx === 0 && (
                            <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full">
                              Cover
                            </span>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Optional Video Link */}
                    <div className="pt-2 border-t border-gray-100 space-y-1">
                      <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                        <Video className="w-3.5 h-3.5 text-gray-500" />
                        <span>Product Video URL (Optional YouTube / MP4 Link)</span>
                      </label>
                      <input
                        type="text"
                        value={(formData as any).videoUrl || ''}
                        onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value } as any)}
                        placeholder="e.g. https://www.youtube.com/watch?v=..."
                        className="w-full bg-white border border-gray-200 text-xs rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#7C3AED]"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* 3. Pricing Card */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
                <div
                  onClick={() => toggleSection('pricing')}
                  className="flex items-center justify-between cursor-pointer select-none"
                >
                  <h3 className="text-sm font-bold text-gray-900 tracking-tight">Pricing</h3>
                  <button type="button" className="text-gray-400 hover:text-gray-600">
                    {collapsedSections['pricing'] ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronUp className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {!collapsedSections['pricing'] && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-700">
                        Sell Dummy Price (৳) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        required
                        value={formData.price || ''}
                        onChange={(e) =>
                          setFormData({ ...formData, price: parseInt(e.target.value) || 0 })
                        }
                        className="w-full bg-white border border-gray-200 text-xs rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#7C3AED]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-700">
                        Regular / Discount Price (৳)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.discountPrice ?? ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            discountPrice: e.target.value ? parseInt(e.target.value) : undefined
                          })
                        }
                        className="w-full bg-white border border-gray-200 text-xs rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#7C3AED]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-700 flex items-center justify-between">
                        <span>Buying / Cost Price (ক্রয়মূল্য ও রিসেলার খরচ)</span>
                        <span className="text-[10px] text-gray-400 font-normal">পাইকারি মূল্য + পরিবহন (৳১২০)</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.purchasePrice ?? ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            purchasePrice: e.target.value ? parseInt(e.target.value) : undefined
                          })
                        }
                        placeholder="e.g. 570"
                        className="w-full bg-white border border-gray-200 text-xs rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#7C3AED]"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* 4. Inventory Card */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
                <div
                  onClick={() => toggleSection('inventory')}
                  className="flex items-center justify-between cursor-pointer select-none"
                >
                  <h3 className="text-sm font-bold text-gray-900 tracking-tight">Inventory</h3>
                  <button type="button" className="text-gray-400 hover:text-gray-600">
                    {collapsedSections['inventory'] ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronUp className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {!collapsedSections['inventory'] && (
                  <div className="space-y-4 pt-2">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-700">Product Serial</label>
                        <input
                          type="text"
                          value={(formData as any).serial || ''}
                          onChange={(e) => setFormData({ ...formData, serial: e.target.value } as any)}
                          placeholder="0"
                          className="w-full bg-white border border-gray-200 text-xs rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#7C3AED]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-700">SKU or Product Code</label>
                        <input
                          type="text"
                          value={formData.sku || ''}
                          onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                          placeholder="e.g. RUP-5184"
                          className="w-full bg-white border border-gray-200 text-xs rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#7C3AED]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-700">Unit Name</label>
                        <input
                          type="text"
                          value={(formData as any).unitName || 'PCS'}
                          onChange={(e) =>
                            setFormData({ ...formData, unitName: e.target.value } as any)
                          }
                          placeholder="e.g. PCS, Pair, Set"
                          className="w-full bg-white border border-gray-200 text-xs rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#7C3AED]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-700">Quantity (Stock)</label>
                        <input
                          type="number"
                          min="0"
                          value={formData.stock ?? 0}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              stock: parseInt(e.target.value) || 0
                            })
                          }
                          className="w-full bg-white border border-gray-200 text-xs rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#7C3AED]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-700">Warranty</label>
                        <input
                          type="text"
                          value={(formData as any).warranty || ''}
                          onChange={(e) =>
                            setFormData({ ...formData, warranty: e.target.value } as any)
                          }
                          placeholder="e.g. 7 Days Replacement"
                          className="w-full bg-white border border-gray-200 text-xs rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#7C3AED]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-700">Initial Sold Count</label>
                        <input
                          type="number"
                          min="0"
                          value={(formData as any).initialSold ?? 0}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              initialSold: parseInt(e.target.value) || 0
                            } as any)
                          }
                          className="w-full bg-white border border-gray-200 text-xs rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#7C3AED]"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 5. Product Details (Key-Value Specs) */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
                <div
                  onClick={() => toggleSection('details')}
                  className="flex items-center justify-between cursor-pointer select-none"
                >
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 tracking-tight">
                      Product Details
                    </h3>
                    <p className="text-xs text-gray-400">
                      Add custom key-value specifications for this product (e.g., Fabric type, Collar, Fit).
                    </p>
                  </div>
                  <button type="button" className="text-gray-400 hover:text-gray-600">
                    {collapsedSections['details'] ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronUp className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {!collapsedSections['details'] && (
                  <div className="space-y-3 pt-2">
                    {((formData as any).detailsList || []).map((item: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-3">
                        <input
                          type="text"
                          placeholder="Detail Type (e.g., Fabric, Fit)"
                          value={item.type || ''}
                          onChange={(e) => handleUpdateDetailItem(idx, 'type', e.target.value)}
                          className="flex-1 bg-white border border-gray-200 text-xs rounded-xl px-4 py-2 focus:outline-none focus:border-[#7C3AED]"
                        />
                        <input
                          type="text"
                          placeholder="Detail Description (e.g., 100% Egyptian Cotton)"
                          value={item.description || ''}
                          onChange={(e) =>
                            handleUpdateDetailItem(idx, 'description', e.target.value)
                          }
                          className="flex-1 bg-white border border-gray-200 text-xs rounded-xl px-4 py-2 focus:outline-none focus:border-[#7C3AED]"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveDetailItem(idx)}
                          className="p-2 text-red-400 hover:text-red-600 transition-colors cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={handleAddDetailItem}
                      className="text-xs font-bold text-[#5B21B6] hover:text-[#4C1D95] cursor-pointer flex items-center gap-1 pt-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Add Detail Item</span>
                    </button>
                  </div>
                )}
              </div>

              {/* 6. Product Variants Card */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 tracking-tight">
                    Product Variants
                  </h3>
                  <p className="text-xs text-gray-400">
                    You can create custom variants for your products (e.g. Size, Color, Age, or Weight etc.)
                  </p>
                  {currentVariants.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {currentVariants.map((v) => (
                        <span
                          key={v.id}
                          className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EDE9FE] text-[#6D28D9] border border-[#DDD6FE]"
                        >
                          {v.title} ({v.options.length} options)
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-[11px] text-gray-400 mt-1.5 inline-block italic">
                      No variants configured (Single item SKU)
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setVariantsModalOpen(true)}
                  className="bg-[#5B21B6] hover:bg-[#4C1D95] text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all cursor-pointer shadow-xs shrink-0"
                >
                  Manage
                </button>
              </div>

              {/* 7. Setup Variant Image Card */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 tracking-tight">
                    Setup Variant Image
                  </h3>
                  <p className="text-xs text-gray-400">
                    Map uploaded images to specific variant options (e.g. selecting Blue swaps the photo).
                  </p>
                  {Object.keys(formData.variant_images || {}).length > 0 && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 mt-2 inline-block">
                      Images mapped
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setVariantImageModalOpen(true)}
                  className="bg-[#5B21B6] hover:bg-[#4C1D95] text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all cursor-pointer shadow-xs shrink-0"
                >
                  Manage
                </button>
              </div>

              {/* 8. Manage Stock Card */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-gray-900 tracking-tight">
                      Manage Stock
                    </h3>
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                        formData.maintain_variant_stock
                          ? 'bg-[#5B21B6]/10 text-[#5B21B6] border border-[#5B21B6]/30'
                          : 'bg-gray-100 text-gray-500 border border-gray-200'
                      }`}
                    >
                      {formData.maintain_variant_stock ? 'Variant Stock: Active' : 'Variant Stock: Inactive'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {formData.maintain_variant_stock
                      ? 'Stock is maintained individually per variant option.'
                      : `Currently using unified inventory quantity (${formData.stock ?? 0} units).`}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setStockModalOpen(true)}
                  className="bg-[#5B21B6] hover:bg-[#4C1D95] text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all cursor-pointer shadow-xs shrink-0"
                >
                  Manage
                </button>
              </div>

              {/* 9. Shipping Card */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
                <div
                  onClick={() => toggleSection('shipping')}
                  className="flex items-center justify-between cursor-pointer select-none"
                >
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 tracking-tight">Shipping</h3>
                    <p className="text-xs text-gray-400">
                      Set custom delivery charges for this product or apply the store defaults.
                    </p>
                  </div>
                  <button type="button" className="text-gray-400 hover:text-gray-600">
                    {collapsedSections['shipping'] ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronUp className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {!collapsedSections['shipping'] && (
                  <div className="space-y-4 pt-2 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-700">
                        Apply default delivery charges
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-500">
                          {(formData as any).shippingOption === 'default'
                            ? 'Applied'
                            : 'Not Applied'}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setFormData((prev: any) => ({
                              ...prev,
                              shippingOption:
                                prev.shippingOption === 'default' ? 'custom' : 'default'
                            }))
                          }
                          className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                            (formData as any).shippingOption === 'default'
                              ? 'bg-[#5B21B6]'
                              : 'bg-gray-300'
                          }`}
                        >
                          <div
                            className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                              (formData as any).shippingOption === 'default'
                                ? 'translate-x-6'
                                : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    {(formData as any).shippingOption === 'custom' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-gray-50 border border-gray-200">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-700">
                            Inside Dhaka (৳)
                          </label>
                          <input
                            type="number"
                            value={(formData as any).insideDhakaShipping ?? 60}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                insideDhakaShipping: parseInt(e.target.value) || 0
                              } as any)
                            }
                            className="w-full bg-white border border-gray-200 text-xs rounded-xl px-4 py-2 focus:outline-none focus:border-[#7C3AED]"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-700">
                            Outside Dhaka (৳)
                          </label>
                          <input
                            type="number"
                            value={(formData as any).outsideDhakaShipping ?? 120}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                outsideDhakaShipping: parseInt(e.target.value) || 0
                              } as any)
                            }
                            className="w-full bg-white border border-gray-200 text-xs rounded-xl px-4 py-2 focus:outline-none focus:border-[#7C3AED]"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

            </div>

            {/* ================= RIGHT SIDEBAR COLUMN (4 COLS) ================= */}
            <div className="lg:col-span-4 space-y-6">

              {/* 1. Category Card */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-gray-900 tracking-tight">Category</h3>
                  <button
                    type="button"
                    onClick={() => setShowNewCatInput(!showNewCatInput)}
                    className="text-[11px] font-bold text-[#7C3AED] hover:underline flex items-center space-x-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{showNewCatInput ? 'Cancel' : '+ New Category'}</span>
                  </button>
                </div>

                {showNewCatInput && (
                  <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-200/60 space-y-2 animate-in fade-in duration-150">
                    <label className="text-[11px] font-bold text-[#7C3AED] uppercase tracking-wider block">
                      Quick Add Category
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. Leather Goods, Shoes..."
                        value={newCatName}
                        onChange={(e) => setNewCatName(e.target.value)}
                        onKeyDown={async (e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const trimmed = newCatName.trim();
                            if (!trimmed) return;
                            setIsAddingCat(true);
                            try {
                              if (onQuickAddCategory) {
                                await onQuickAddCategory(trimmed);
                              }
                              setFormData((prev) => ({
                                ...prev,
                                category: trimmed,
                                gender: detectProductGender(trimmed, prev.name, prev.gender)
                              }));
                              setNewCatName('');
                              setShowNewCatInput(false);
                            } catch (err: any) {
                              alert('Failed to add category: ' + err.message);
                            } finally {
                              setIsAddingCat(false);
                            }
                          }
                        }}
                        className="flex-1 bg-white border border-purple-300 rounded-lg px-3 py-1.5 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#7C3AED]"
                      />
                      <button
                        type="button"
                        disabled={isAddingCat || !newCatName.trim()}
                        onClick={async () => {
                          const trimmed = newCatName.trim();
                          if (!trimmed) return;
                          setIsAddingCat(true);
                          try {
                            if (onQuickAddCategory) {
                              await onQuickAddCategory(trimmed);
                            }
                            setFormData((prev) => ({
                              ...prev,
                              category: trimmed,
                              gender: detectProductGender(trimmed, prev.name, prev.gender)
                            }));
                            setNewCatName('');
                            setShowNewCatInput(false);
                          } catch (err: any) {
                            alert('Failed to add category: ' + err.message);
                          } finally {
                            setIsAddingCat(false);
                          }
                        }}
                        className="px-3 py-1.5 bg-[#7C3AED] text-white text-xs font-bold rounded-lg hover:bg-[#6D28D9] disabled:opacity-50 cursor-pointer shadow-xs"
                      >
                        {isAddingCat ? 'Saving...' : 'Add'}
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  {/* Visual Category & Subcategory Assign Button (Screenshot 1) */}
                  <button
                    type="button"
                    onClick={() => setAssignCatModalOpen(true)}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 bg-[#EDE9FE] hover:bg-[#DDD6FE] text-[#5B21B6] rounded-xl text-xs font-bold transition-all shadow-2xs hover:shadow-xs cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <FolderTree className="w-4 h-4 text-[#5B21B6]" />
                      <span>Assign Categories (Pills)</span>
                    </div>
                    <span className="text-[10px] bg-[#5B21B6] text-white px-2 py-0.5 rounded-full font-bold">
                      Select +
                    </span>
                  </button>

                  <select
                    value={formData.category}
                    onChange={(e) => {
                      const newCat = e.target.value;
                      setFormData((prev) => ({
                        ...prev,
                        category: newCat,
                        gender: detectProductGender(newCat, prev.name, prev.gender)
                      }));
                    }}
                    className="w-full bg-white border border-gray-200 text-xs font-bold rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#7C3AED] cursor-pointer"
                  >
                    {formData.category && !availableCategories.includes(formData.category) && (
                      <option key={formData.category} value={formData.category}>
                        {formData.category}
                      </option>
                    )}
                    {availableCategories.filter((c) => c !== 'All').map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">Sub-Category</label>
                    <input
                      type="text"
                      value={formData.subCategory || ''}
                      onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                      placeholder="e.g. Ethnic Wear, Casual"
                      className="w-full bg-white border border-gray-200 text-xs rounded-xl px-4 py-2 focus:outline-none focus:border-[#7C3AED]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">Gender</label>
                    <select
                      value={formData.gender || 'Men'}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                      className="w-full bg-white border border-gray-200 text-xs font-bold rounded-xl px-4 py-2 focus:outline-none focus:border-[#7C3AED] cursor-pointer"
                    >
                      <option value="Men">Men</option>
                      <option value="Women">Women</option>
                      <option value="Couple">Couple</option>
                      <option value="Kids">Kids</option>
                      <option value="Accessories">Accessories</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 2. Brand (SEO & Data Feed) */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-2">
                <h3 className="text-sm font-bold text-gray-900 tracking-tight">
                  Brand (SEO & Data Feed)
                </h3>
                <input
                  type="text"
                  value={formData.brand || 'Rupan'}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  placeholder="e.g. Rupan"
                  className="w-full bg-white border border-gray-200 text-xs rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#7C3AED]"
                />
              </div>

              {/* 3. Product Weight & Dimensions */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-3">
                <h3 className="text-sm font-bold text-gray-900 tracking-tight">
                  Product Weight & Dimensions
                </h3>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">Weight (kg)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.weight ?? 0.35}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        weight: parseFloat(e.target.value) || undefined
                      })
                    }
                    placeholder="e.g. 0.35"
                    className="w-full bg-white border border-gray-200 text-xs rounded-xl px-4 py-2 focus:outline-none focus:border-[#7C3AED]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">Dimensions (cm)</label>
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="number"
                      placeholder="Length"
                      value={(formData as any).length ?? ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          length: parseFloat(e.target.value) || undefined
                        } as any)
                      }
                      className="w-full bg-white border border-gray-200 text-xs rounded-xl px-3 py-2 text-center focus:outline-none focus:border-[#7C3AED]"
                    />
                    <input
                      type="number"
                      placeholder="Width"
                      value={(formData as any).width ?? ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          width: parseFloat(e.target.value) || undefined
                        } as any)
                      }
                      className="w-full bg-white border border-gray-200 text-xs rounded-xl px-3 py-2 text-center focus:outline-none focus:border-[#7C3AED]"
                    />
                    <input
                      type="number"
                      placeholder="Height"
                      value={(formData as any).height ?? ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          height: parseFloat(e.target.value) || undefined
                        } as any)
                      }
                      className="w-full bg-white border border-gray-200 text-xs rounded-xl px-3 py-2 text-center focus:outline-none focus:border-[#7C3AED]"
                    />
                  </div>
                </div>
              </div>

              {/* 4. Condition (SEO & Data Feed) */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-2">
                <h3 className="text-sm font-bold text-gray-900 tracking-tight">
                  Condition (SEO & Data Feed)
                </h3>
                <select
                  value={(formData as any).condition || 'New'}
                  onChange={(e) =>
                    setFormData({ ...formData, condition: e.target.value as any })
                  }
                  className="w-full bg-white border border-gray-200 text-xs font-bold rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#7C3AED] cursor-pointer"
                >
                  <option value="New">New</option>
                  <option value="Refurbished">Refurbished</option>
                  <option value="Used">Used</option>
                </select>
              </div>

              {/* 5. Product Status */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-2">
                <h3 className="text-sm font-bold text-gray-900 tracking-tight">Product Status</h3>
                <select
                  value={formData.status || 'published'}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full bg-white border border-gray-200 text-xs font-bold rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#7C3AED] cursor-pointer"
                >
                  <option value="published">ACTIVE / PUBLISHED</option>
                  <option value="draft">DRAFT</option>
                  <option value="archived">ARCHIVED</option>
                </select>
              </div>

              {/* 6. Tags & Badges */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-3">
                <h3 className="text-sm font-bold text-gray-900 tracking-tight">Tags</h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    placeholder="e.g. Eid, Cotton"
                    className="flex-1 bg-white border border-gray-200 text-xs rounded-xl px-3 py-1.5 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="bg-zinc-800 text-white font-bold text-xs px-3 py-1.5 rounded-xl cursor-pointer"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(formData.tags || []).map((t) => (
                    <span
                      key={t}
                      className="bg-gray-100 text-gray-700 text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1"
                    >
                      {t}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(t)}
                        className="text-gray-400 hover:text-red-500 cursor-pointer"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* 7. Product Flags / Featured */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-2">
                <h3 className="text-sm font-bold text-gray-900 tracking-tight">Marketing Badges</h3>
                <div className="space-y-2 pt-1 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={Boolean(formData.isFeatured || (formData as any).is_featured)}
                      onChange={(e) =>
                        setFormData({ ...formData, isFeatured: e.target.checked, is_featured: e.target.checked } as any)
                      }
                      className="rounded border-gray-300 text-[#5B21B6] focus:ring-[#5B21B6] w-4 h-4 cursor-pointer"
                    />
                    <span className="font-semibold text-gray-700">Featured Product</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={Boolean(formData.isTrending || (formData as any).is_trending)}
                      onChange={(e) =>
                        setFormData({ ...formData, isTrending: e.target.checked, is_trending: e.target.checked } as any)
                      }
                      className="rounded border-gray-300 text-[#5B21B6] focus:ring-[#5B21B6] w-4 h-4 cursor-pointer"
                    />
                    <span className="font-semibold text-gray-700">Trending Now</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formData.isNew !== undefined ? Boolean(formData.isNew) : ((formData as any).is_new !== undefined ? Boolean((formData as any).is_new) : true)}
                      onChange={(e) => setFormData({ ...formData, isNew: e.target.checked, is_new: e.target.checked } as any)}
                      className="rounded border-gray-300 text-[#5B21B6] focus:ring-[#5B21B6] w-4 h-4 cursor-pointer"
                    />
                    <span className="font-semibold text-gray-700">New Arrival</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={Boolean(formData.isBestSeller || (formData as any).is_best_seller)}
                      onChange={(e) =>
                        setFormData({ ...formData, isBestSeller: e.target.checked, is_best_seller: e.target.checked } as any)
                      }
                      className="rounded border-gray-300 text-[#5B21B6] focus:ring-[#5B21B6] w-4 h-4 cursor-pointer"
                    />
                    <span className="font-semibold text-gray-700">Best Seller</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={Boolean(formData.isFlashSale || (formData as any).is_flash_sale)}
                      onChange={(e) =>
                        setFormData({ ...formData, isFlashSale: e.target.checked, is_flash_sale: e.target.checked } as any)
                      }
                      className="rounded border-gray-300 text-[#5B21B6] focus:ring-[#5B21B6] w-4 h-4 cursor-pointer"
                    />
                    <span className="font-semibold text-gray-700">Flash Sale</span>
                  </label>
                </div>
              </div>

            </div>

          </div>

          {/* Form Bottom Save Actions */}
          <div className="sticky bottom-0 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-gray-200 flex items-center justify-between shadow-lg">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <div className="flex items-center gap-3">
              <button
                type="submit"
                className="bg-[#5B21B6] hover:bg-[#4C1D95] text-white font-bold text-xs uppercase tracking-wider px-8 py-3 rounded-xl transition-all shadow-md cursor-pointer"
              >
                {editingProduct ? 'Save Changes' : 'Create Product SKU'}
              </button>
            </div>
          </div>
        </form>

        {/* --- Sub Modals --- */}
        <ProductVariantsManager
          open={variantsModalOpen}
          onClose={() => setVariantsModalOpen(false)}
          variants={currentVariants}
          onSave={(newVariants) => {
            const sizeVariant = newVariants.find((v) => /size/i.test(v.title));
            const newSizes = sizeVariant ? sizeVariant.options.map((o) => o.value) : [];
            const colorVariant = newVariants.find((v) => /colou?r|age/i.test(v.title));
            const newColors = colorVariant
              ? colorVariant.options.map((o) => ({
                  name: o.value,
                  class: 'bg-zinc-800',
                  hex: '#1E3A8A'
                }))
              : [];

            setFormData((prev: any) => {
              // Clean up variant stock & images for deleted variant groups
              const activeVariantIds = new Set(newVariants.map((v) => v.id));
              const cleanedStock: VariantStock = {};
              if (prev.variant_stock) {
                Object.keys(prev.variant_stock).forEach((vId) => {
                  if (activeVariantIds.has(vId)) {
                    cleanedStock[vId] = prev.variant_stock[vId];
                  }
                });
              }

              const cleanedImages: VariantImages = {};
              if (prev.variant_images) {
                Object.keys(prev.variant_images).forEach((vId) => {
                  if (activeVariantIds.has(vId)) {
                    cleanedImages[vId] = prev.variant_images[vId];
                  }
                });
              }

              return {
                ...prev,
                variants: newVariants,
                sizes: newSizes,
                colors: newColors,
                variant_stock: cleanedStock,
                variant_images: cleanedImages
              };
            });
          }}
        />

        <ManageStockModal
          open={stockModalOpen}
          onClose={() => setStockModalOpen(false)}
          variants={currentVariants}
          variantStock={formData.variant_stock || {}}
          maintainStockEnabled={!!formData.maintain_variant_stock}
          onSave={(newStock, totalStock, isMaintainEnabled) => {
            setFormData((prev: any) => ({
              ...prev,
              maintain_variant_stock: !!isMaintainEnabled,
              variant_stock: isMaintainEnabled ? newStock : {},
              stock: isMaintainEnabled && totalStock !== undefined ? totalStock : prev.stock
            }));
          }}
        />

        <SetupVariantImageModal
          open={variantImageModalOpen}
          onClose={() => setVariantImageModalOpen(false)}
          variants={currentVariants}
          productImages={formData.images || []}
          variantImages={formData.variant_images || {}}
          onSave={(newImages) => {
            setFormData((prev) => ({
              ...prev,
              variant_images: newImages
            }));
          }}
        />

        {/* MODAL: ASSIGN CATEGORIES PILLS (SCREENSHOT 1) */}
        <AssignCategoriesModal
          open={assignCatModalOpen}
          onClose={() => setAssignCatModalOpen(false)}
          categories={categories}
          selectedCategory={formData.category || ''}
          selectedSubCategory={formData.subCategory || ''}
          assignedCategories={formData.tags || []}
          onApply={(primaryCat, primarySub, allAssigned) => {
            setFormData((prev) => ({
              ...prev,
              category: primaryCat || prev.category,
              subCategory: primarySub || prev.subCategory,
              gender: detectProductGender(primaryCat || prev.category || '', prev.name, prev.gender)
            }));
          }}
          onQuickAddCategory={async (name, parentId) => {
            if (onQuickAddCategory) {
              await onQuickAddCategory(name, parentId);
            }
          }}
        />

      </div>
    </div>
  );
}
