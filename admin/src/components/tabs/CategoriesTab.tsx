import React, { useState, useEffect, useRef } from 'react';
import {
  Plus, Search, Edit2, Trash2, FolderTree, Image as ImageIcon,
  CheckCircle, XCircle, ArrowUpDown, ExternalLink, Layers, Eye,
  Sparkles, AlertCircle, LayoutGrid, List, ArrowLeft, GripVertical,
  Package, Upload, X, ChevronRight, RefreshCw
} from 'lucide-react';
import { Category } from '../../types';
import { supabase } from '../../lib/supabase';

interface CategoriesTabProps {
  categories: Category[];
  productCountsByCategory?: Record<string, number>;
  onSaveCategory: (categoryData: Partial<Category>, isEdit: boolean) => Promise<void>;
  onDeleteCategory: (categoryId: string) => Promise<void>;
  onToggleStatus: (categoryId: string, currentStatus: boolean) => Promise<void>;
  onRefresh?: () => Promise<void>;
  loading?: boolean;
}

export default function CategoriesTab({
  categories,
  productCountsByCategory = {},
  onSaveCategory,
  onDeleteCategory,
  onToggleStatus,
  onRefresh,
  loading = false
}: CategoriesTabProps) {
  // Auto-refresh categories from Supabase on mount
  useEffect(() => {
    if (onRefresh) {
      onRefresh();
    }
  }, []);
  // --- Navigation & Hierarchy State ---
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [categoryStack, setCategoryStack] = useState<Category[]>([]);
  const [search, setSearch] = useState('');

  // --- Left Column Edit Form (when drilled into a category) ---
  const [leftForm, setLeftForm] = useState({
    name: '',
    slug: '',
    banner_image: '',
    image: '',
    description: ''
  });
  const [savingLeft, setSavingLeft] = useState(false);

  // Sync leftForm whenever currentCategory changes
  useEffect(() => {
    if (currentCategory) {
      setLeftForm({
        name: currentCategory.name || '',
        slug: currentCategory.slug || currentCategory.id,
        banner_image: currentCategory.banner_image || currentCategory.bannerImage || '',
        image: currentCategory.image || '',
        description: currentCategory.description || currentCategory.short_description || currentCategory.shortDescription || ''
      });
    }
  }, [currentCategory]);

  // --- Modal State (Add / Update Category Dialog) ---
  const [modalOpen, setModalOpen] = useState(false);
  const [modalIsEdit, setModalIsEdit] = useState(false);
  const [modalParentId, setModalParentId] = useState<string | null>(null);
  const [modalCategory, setModalCategory] = useState<Category | null>(null);
  const [modalForm, setModalForm] = useState({
    id: '',
    name: '',
    slug: '',
    banner_image: '',
    image: '',
    description: '',
    sort_order: 0,
    is_active: true
  });
  const [modalSaving, setModalSaving] = useState(false);

  // File input refs for image upload
  const leftBannerFileRef = useRef<HTMLInputElement>(null);
  const leftSquareFileRef = useRef<HTMLInputElement>(null);
  const modalBannerFileRef = useRef<HTMLInputElement>(null);
  const modalSquareFileRef = useRef<HTMLInputElement>(null);

  // Upload helper: uploads to Supabase storage 'banners' bucket or falls back to data URL
  const handleUploadFile = async (file: File): Promise<string> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `cat-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('banners').upload(fileName, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from('banners').getPublicUrl(fileName);
      return data.publicUrl;
    } catch (_) {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    }
  };

  // --- Subcategories Count Calculator ---
  const getSubcategoriesCount = (categoryId: string) => {
    const targetId = String(categoryId).trim().toLowerCase();
    return categories.filter((c) => {
      const pId = c.parent_id || (c as any).parentId;
      if (!pId || pId === 'null') return false;
      return String(pId).trim().toLowerCase() === targetId;
    }).length;
  };

  // --- Navigation Handlers ---
  const handleDrillDown = (cat: Category) => {
    setCategoryStack((prev) => [...prev, cat]);
    setCurrentCategory(cat);
    setSearch('');
  };

  const handleBack = () => {
    if (categoryStack.length <= 1) {
      setCategoryStack([]);
      setCurrentCategory(null);
    } else {
      const nextStack = categoryStack.slice(0, -1);
      setCategoryStack(nextStack);
      setCurrentCategory(nextStack[nextStack.length - 1]);
    }
    setSearch('');
  };

  const handleJumpToBreadcrumb = (index: number) => {
    if (index === -1) {
      // Jump to root
      setCategoryStack([]);
      setCurrentCategory(null);
    } else {
      const nextStack = categoryStack.slice(0, index + 1);
      setCategoryStack(nextStack);
      setCurrentCategory(nextStack[nextStack.length - 1]);
    }
    setSearch('');
  };

  // --- Modal Openers ---
  const openAddModal = (parentId: string | null = null) => {
    setModalIsEdit(false);
    setModalCategory(null);
    setModalParentId(parentId);
    setModalForm({
      id: '',
      name: '',
      slug: '',
      banner_image: '',
      image: '',
      description: '',
      sort_order: categories.length + 1,
      is_active: true
    });
    setModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setModalIsEdit(true);
    setModalCategory(cat);
    setModalParentId(cat.parent_id || (cat as any).parentId || null);
    setModalForm({
      id: cat.id,
      name: cat.name,
      slug: cat.slug || cat.id,
      banner_image: cat.banner_image || cat.bannerImage || '',
      image: cat.image || '',
      description: cat.description || cat.short_description || cat.shortDescription || '',
      sort_order: cat.sort_order ?? cat.sortOrder ?? 0,
      is_active: cat.is_active ?? cat.isActive ?? true
    });
    setModalOpen(true);
  };

  // --- Left Column Update Handler ---
  const handleUpdateCurrentCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCategory) return;
    if (!leftForm.name.trim()) {
      alert('Please provide a category name.');
      return;
    }

    setSavingLeft(true);
    try {
      const slugVal = leftForm.slug.trim() || leftForm.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const pId = currentCategory.parent_id || (currentCategory as any).parentId || null;
      const payload: Partial<Category> = {
        id: currentCategory.id,
        name: leftForm.name.trim(),
        slug: slugVal,
        banner_image: leftForm.banner_image || null,
        image: leftForm.image || null,
        description: leftForm.description || null,
        parent_id: pId,
        sort_order: currentCategory.sort_order ?? 0,
        is_active: currentCategory.is_active !== false
      };

      await onSaveCategory(payload, true);
      // Update currentCategory in local state
      setCurrentCategory((prev) => (prev ? { ...prev, ...payload } : null));
      // Also update in categoryStack
      setCategoryStack((prev) =>
        prev.map((c) => (c.id === currentCategory.id ? { ...c, ...payload } : c))
      );
    } catch (err: any) {
      alert('Error updating category: ' + err.message);
    } finally {
      setSavingLeft(false);
    }
  };

  // --- Modal Save Handler ---
  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalForm.name.trim()) {
      alert('Please provide a category name.');
      return;
    }

    setModalSaving(true);
    try {
      const finalId = modalIsEdit && modalCategory
        ? modalCategory.id
        : modalForm.id.trim() || modalForm.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const finalSlug = modalForm.slug.trim() || finalId;

      const payload: Partial<Category> = {
        id: finalId,
        name: modalForm.name.trim(),
        slug: finalSlug,
        banner_image: modalForm.banner_image || null,
        image: modalForm.image || null,
        description: modalForm.description || null,
        parent_id: modalParentId,
        sort_order: Number(modalForm.sort_order) || 0,
        is_active: modalForm.is_active
      };

      await onSaveCategory(payload, modalIsEdit);
      setModalOpen(false);
    } catch (err: any) {
      alert('Error saving category: ' + err.message);
    } finally {
      setModalSaving(false);
    }
  };

  // --- List Filtering ---
  // If at root: items where parent_id is null / empty
  // If drilled down: items where parent_id === currentCategory.id
  const displayedCategories = categories
    .filter((c) => {
      const pId = c.parent_id || (c as any).parentId || null;
      if (currentCategory) {
        if (!pId || pId === 'null') return false;
        return String(pId).trim().toLowerCase() === String(currentCategory.id).trim().toLowerCase();
      }
      return !pId || pId === 'null' || pId === '';
    })
    .filter((c) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return c.name.toLowerCase().includes(q) || (c.slug || '').toLowerCase().includes(q);
    });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">

      {/* ================= TOP HEADER BAR ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: Breadcrumbs or Title */}
        <div className="flex items-center gap-3">
          {currentCategory ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleBack}
                className="w-8 h-8 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center text-gray-700 transition-colors shadow-xs cursor-pointer"
                title="Go back"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>

              {/* Breadcrumb path */}
              <div className="flex items-center text-sm sm:text-base font-extrabold text-gray-900 tracking-tight">
                <button
                  type="button"
                  onClick={() => handleJumpToBreadcrumb(-1)}
                  className="hover:text-[#5B21B6] transition-colors cursor-pointer"
                >
                  Categories
                </button>
                {categoryStack.map((cat, idx) => (
                  <React.Fragment key={cat.id}>
                    <ChevronRight className="w-4 h-4 text-gray-400 mx-1 shrink-0" />
                    <button
                      type="button"
                      onClick={() => handleJumpToBreadcrumb(idx)}
                      className={`transition-colors cursor-pointer ${
                        idx === categoryStack.length - 1
                          ? 'text-gray-900 font-black'
                          : 'text-gray-500 hover:text-[#5B21B6]'
                      }`}
                    >
                      {cat.name}
                    </button>
                  </React.Fragment>
                ))}
              </div>
            </div>
          ) : (
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
              Categories
            </h1>
          )}
        </div>

        {/* Right: Search, Refresh & Add Button */}
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#5B21B6] w-40 sm:w-56 shadow-xs"
            />
          </div>

          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={loading}
              className="p-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 hover:text-gray-900 shadow-xs transition-colors cursor-pointer"
              title="Refresh categories from database"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#5B21B6]' : ''}`} />
            </button>
          )}

          <button
            type="button"
            onClick={() => openAddModal(currentCategory ? currentCategory.id : null)}
            className="bg-[#5B21B6] hover:bg-[#4C1D95] text-white px-4 sm:px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>{currentCategory ? 'Add Sub Categories' : 'Add Categories'}</span>
          </button>
        </div>
      </div>

      {/* ================= VIEW 1: ROOT LEVEL (Screenshot 2) ================= */}
      {!currentCategory && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-[11px] font-bold text-gray-700 tracking-wider">
                <th className="py-4 pl-6 pr-4 w-12 text-center text-gray-400">#</th>
                <th className="py-4 px-4">Categories</th>
                <th className="py-4 px-6 text-center w-48">Total Subcategory</th>
                <th className="py-4 pr-6 pl-4 text-right w-36">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {displayedCategories.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-gray-400">
                    No categories found. Click "+ Add Categories" to create one.
                  </td>
                </tr>
              ) : (
                displayedCategories.map((cat) => {
                  const subCount = getSubcategoriesCount(cat.id);

                  return (
                    <tr
                      key={cat.id}
                      className="hover:bg-gray-50/70 transition-colors group cursor-pointer"
                      onClick={() => handleDrillDown(cat)}
                    >
                      {/* Drag handle icon */}
                      <td className="py-4 pl-6 pr-4 text-center text-gray-300 group-hover:text-gray-500">
                        <GripVertical className="w-4 h-4 mx-auto" />
                      </td>

                      {/* Category Image & Name */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3.5">
                          {cat.image ? (
                            <img
                              src={cat.image}
                              alt={cat.name}
                              className="w-12 h-10 rounded-lg object-cover border border-gray-100 shadow-2xs"
                            />
                          ) : (
                            <div className="w-12 h-10 rounded-lg bg-purple-50 text-[#5B21B6] border border-purple-100 flex items-center justify-center font-bold text-xs">
                              {cat.name.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <div className="flex items-center gap-1.5 font-bold text-sm text-gray-900 group-hover:text-[#5B21B6] transition-colors">
                              <span>{cat.name}</span>
                              <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                            </div>
                            <p className="text-[11px] text-gray-400 font-medium">
                              {subCount} subcategories
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Total Subcategories Number */}
                      <td className="py-4 px-6 text-center font-bold text-sm text-gray-700">
                        {subCount}
                      </td>

                      {/* Action Icons */}
                      <td
                        className="py-4 pr-6 pl-4 text-right space-x-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => handleDrillDown(cat)}
                          className="p-1.5 text-gray-400 hover:text-[#5B21B6] hover:bg-purple-50 rounded-lg transition-colors cursor-pointer"
                          title="View subcategories"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditModal(cat)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="Edit category"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Delete category "${cat.name}" and all subcategories?`)) {
                              onDeleteCategory(cat.id);
                            }
                          }}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete category"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ================= VIEW 2: DRILLED DOWN LEVEL (Screenshots 3 & 4) ================= */}
      {currentCategory && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* LEFT COLUMN: Update Current Category Form (~5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-gray-100 p-6 shadow-xs space-y-5">
            <form onSubmit={handleUpdateCurrentCategory} className="space-y-4">
              
              {/* 1. Banner / Cover */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-800 tracking-tight block">
                  Banner/Cover
                </label>
                <div className="relative w-full h-36 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden group">
                  {leftForm.banner_image ? (
                    <>
                      <img
                        src={leftForm.banner_image}
                        alt="Banner Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setLeftForm((prev) => ({ ...prev, banner_image: '' }))}
                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white text-red-500 hover:bg-red-50 shadow-md flex items-center justify-center transition-colors cursor-pointer z-10"
                        title="Remove banner"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  ) : null}

                  {/* Add Image Button */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <button
                      type="button"
                      onClick={() => leftBannerFileRef.current?.click()}
                      className="pointer-events-auto bg-white/95 hover:bg-white text-[#5B21B6] border border-purple-200 px-4 py-1.5 rounded-full text-xs font-bold shadow-xs hover:shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{leftForm.banner_image ? 'Change Image' : 'Add Image'}</span>
                    </button>
                  </div>
                  <input
                    ref={leftBannerFileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const url = await handleUploadFile(file);
                        setLeftForm((prev) => ({ ...prev, banner_image: url }));
                      }
                    }}
                  />
                </div>
                <p className="text-[10px] text-gray-400 font-medium leading-relaxed italic">
                  N.B: Upload a banner image for the category. Recommended size is 1300×380 pixels. Maximum file size is 4MB.
                </p>
              </div>

              {/* 2. Square Image */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-800 tracking-tight block">
                  Image
                </label>
                <div className="relative w-48 h-48 mx-auto sm:mx-0 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden group">
                  {leftForm.image ? (
                    <>
                      <img
                        src={leftForm.image}
                        alt="Square Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setLeftForm((prev) => ({ ...prev, image: '' }))}
                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white text-red-500 hover:bg-red-50 shadow-md flex items-center justify-center transition-colors cursor-pointer z-10"
                        title="Remove image"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  ) : null}

                  {/* Add Image Button */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <button
                      type="button"
                      onClick={() => leftSquareFileRef.current?.click()}
                      className="pointer-events-auto bg-white/95 hover:bg-white text-[#5B21B6] border border-purple-200 px-4 py-1.5 rounded-full text-xs font-bold shadow-xs hover:shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{leftForm.image ? 'Change Image' : 'Add Image'}</span>
                    </button>
                  </div>
                  <input
                    ref={leftSquareFileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const url = await handleUploadFile(file);
                        setLeftForm((prev) => ({ ...prev, image: url }));
                      }
                    }}
                  />
                </div>
                <p className="text-[10px] text-gray-400 font-medium leading-relaxed italic">
                  N.B: Upload a square image for the category (1:1) aspect ratio. Recommended size is 500×500 pixels. Maximum file size is 4MB. Note: Recommended image size: 770 × 1024 px (Sellora theme).
                </p>
              </div>

              {/* 3. Category Name */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-800 tracking-tight block">
                  Category Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  maxLength={50}
                  value={leftForm.name}
                  onChange={(e) => setLeftForm({ ...leftForm, name: e.target.value })}
                  placeholder="Category Name"
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 text-xs font-semibold text-gray-900 focus:outline-none focus:border-[#5B21B6]"
                />
                <div className="text-right">
                  <span className="text-[10px] text-gray-400">
                    Character limit: 50 ({leftForm.name.length}/50)
                  </span>
                </div>
              </div>

              {/* 4. Short Description */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-800 tracking-tight block">
                  Short Description
                </label>
                <textarea
                  rows={4}
                  value={leftForm.description}
                  onChange={(e) => setLeftForm({ ...leftForm, description: e.target.value })}
                  placeholder="Short description..."
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#5B21B6] resize-none"
                />
              </div>

              {/* Update Button */}
              <button
                type="submit"
                disabled={savingLeft}
                className="w-full bg-[#5B21B6] hover:bg-[#4C1D95] text-white font-bold py-3 rounded-xl text-xs transition-all shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer"
              >
                {savingLeft ? 'Updating...' : 'Update'}
              </button>

            </form>
          </div>

          {/* RIGHT COLUMN: Subcategories List / Management (~7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
            {displayedCategories.length === 0 ? (
              /* Empty State (Screenshot 4) */
              <div className="py-20 px-6 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto text-gray-400">
                  <Package className="w-8 h-8 stroke-[1.5]" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-gray-900">
                    Your sub categories list is currently empty
                  </h3>
                  <p className="text-xs text-gray-400">
                    Lets get started by adding your first sub category now
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => openAddModal(currentCategory.id)}
                  className="bg-[#5B21B6] hover:bg-[#4C1D95] text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-sm transition-all cursor-pointer inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Sub Category</span>
                </button>
              </div>
            ) : (
              /* Subcategories Table (Screenshot 3) */
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-[11px] font-bold text-gray-700 tracking-wider">
                    <th className="py-4 pl-4 pr-2 w-10 text-center text-gray-400">#</th>
                    <th className="py-4 px-3">Categories</th>
                    <th className="py-4 px-4 text-center w-36">Total Subcategory</th>
                    <th className="py-4 pr-4 pl-2 text-right w-32">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  {displayedCategories.map((sub) => {
                    const childSubCount = getSubcategoriesCount(sub.id);

                    return (
                      <tr
                        key={sub.id}
                        className="hover:bg-gray-50/70 transition-colors group cursor-pointer"
                        onClick={() => handleDrillDown(sub)}
                      >
                        {/* Drag handle */}
                        <td className="py-3.5 pl-4 pr-2 text-center text-gray-300 group-hover:text-gray-500">
                          <GripVertical className="w-4 h-4 mx-auto" />
                        </td>

                        {/* Thumbnail & Name */}
                        <td className="py-3.5 px-3">
                          <div className="flex items-center gap-3">
                            {sub.image ? (
                              <img
                                src={sub.image}
                                alt={sub.name}
                                className="w-10 h-10 rounded-lg object-cover border border-gray-100 shadow-2xs"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-purple-50 text-[#5B21B6] border border-purple-100 flex items-center justify-center font-bold text-xs">
                                {sub.name.slice(0, 2).toUpperCase()}
                              </div>
                            )}
                            <div>
                              <div className="flex items-center gap-1.5 font-bold text-xs text-gray-900 group-hover:text-[#5B21B6] transition-colors">
                                <span>{sub.name}</span>
                                <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                              </div>
                              <p className="text-[10px] text-gray-400 font-medium">
                                {childSubCount} subcategories
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Total Subcategories Number */}
                        <td className="py-3.5 px-4 text-center font-bold text-xs text-gray-700">
                          {childSubCount}
                        </td>

                        {/* Actions */}
                        <td
                          className="py-3.5 pr-4 pl-2 text-right space-x-1.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => handleDrillDown(sub)}
                            className="p-1.5 text-gray-400 hover:text-[#5B21B6] hover:bg-purple-50 rounded-lg transition-colors cursor-pointer"
                            title="View child subcategories"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => openEditModal(sub)}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="Edit subcategory"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`Delete subcategory "${sub.name}"?`)) {
                                onDeleteCategory(sub.id);
                              }
                            }}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete subcategory"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

        </div>
      )}

      {/* ================= MODAL: ADD / UPDATE CATEGORY (Screenshot 5) ================= */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 sm:p-8 space-y-5 shadow-2xl relative animate-in zoom-in-95 duration-150">

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight">
                {modalIsEdit
                  ? 'Update Category'
                  : modalParentId
                  ? 'Add Sub Category'
                  : 'Add Category'}
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="w-7 h-7 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleModalSubmit} className="space-y-4">
              
              {/* Banner/Cover */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 block">Banner/Cover</label>
                <div className="relative w-full h-28 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden">
                  {modalForm.banner_image && (
                    <>
                      <img
                        src={modalForm.banner_image}
                        alt="Banner Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setModalForm({ ...modalForm, banner_image: '' })}
                        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white text-red-500 hover:bg-red-50 shadow-md flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <button
                      type="button"
                      onClick={() => modalBannerFileRef.current?.click()}
                      className="pointer-events-auto bg-white/95 text-[#5B21B6] border border-purple-200 px-3.5 py-1.5 rounded-full text-xs font-bold shadow-xs hover:bg-white transition-all cursor-pointer"
                    >
                      {modalForm.banner_image ? 'Change Image' : 'Add Image'}
                    </button>
                  </div>
                  <input
                    ref={modalBannerFileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const url = await handleUploadFile(file);
                        setModalForm((prev) => ({ ...prev, banner_image: url }));
                      }
                    }}
                  />
                </div>
              </div>

              {/* Square Image & Category Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                {/* Square Image */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 block">Image</label>
                  <div className="relative w-full h-36 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden">
                    {modalForm.image && (
                      <>
                        <img
                          src={modalForm.image}
                          alt="Thumbnail Preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setModalForm({ ...modalForm, image: '' })}
                          className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white text-red-500 hover:bg-red-50 shadow-md flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <button
                        type="button"
                        onClick={() => modalSquareFileRef.current?.click()}
                        className="pointer-events-auto bg-white/95 text-[#5B21B6] border border-purple-200 px-3.5 py-1.5 rounded-full text-xs font-bold shadow-xs hover:bg-white transition-all cursor-pointer"
                      >
                        {modalForm.image ? 'Change Image' : 'Add Image'}
                      </button>
                    </div>
                    <input
                      ref={modalSquareFileRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const url = await handleUploadFile(file);
                          setModalForm((prev) => ({ ...prev, image: url }));
                        }
                      }}
                    />
                  </div>
                </div>

                {/* Category Name & Slug */}
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700 block">
                      Category Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      maxLength={50}
                      value={modalForm.name}
                      onChange={(e) => {
                        const nameVal = e.target.value;
                        const slugVal = nameVal.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                        setModalForm((prev) => ({
                          ...prev,
                          name: nameVal,
                          ...(!modalIsEdit ? { slug: slugVal, id: slugVal } : { slug: slugVal })
                        }));
                      }}
                      placeholder="e.g. Eid Collection 2026"
                      className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-gray-900 focus:outline-none focus:border-[#5B21B6]"
                    />
                    <span className="text-[10px] text-gray-400 block text-right">
                      Character limit: 50
                    </span>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700 block">Slug</label>
                    <input
                      type="text"
                      value={modalForm.slug}
                      onChange={(e) => setModalForm({ ...modalForm, slug: e.target.value })}
                      placeholder="e.g. eid-collection-2026"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs text-gray-700 focus:outline-none focus:border-[#5B21B6]"
                    />
                  </div>
                </div>
              </div>

              {/* Short Description */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 block">Short Description</label>
                <textarea
                  rows={3}
                  value={modalForm.description}
                  onChange={(e) => setModalForm({ ...modalForm, description: e.target.value })}
                  placeholder="Short description..."
                  className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#5B21B6] resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalSaving}
                  className="flex-1 py-2.5 rounded-xl bg-[#5B21B6] hover:bg-[#4C1D95] text-white text-xs font-bold transition-all shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer"
                >
                  {modalSaving ? 'Saving...' : modalIsEdit ? 'Update' : 'Add'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
