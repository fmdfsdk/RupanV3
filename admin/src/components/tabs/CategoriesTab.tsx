import React, { useState } from 'react';
import {
  Plus, Search, Edit2, Trash2, FolderTree, Image as ImageIcon,
  CheckCircle, XCircle, ArrowUpDown, ExternalLink, Layers, Eye,
  Sparkles, AlertCircle, LayoutGrid, List
} from 'lucide-react';
import { Category } from '../../types';

interface CategoriesTabProps {
  categories: Category[];
  productCountsByCategory?: Record<string, number>;
  onSaveCategory: (categoryData: Partial<Category>, isEdit: boolean) => Promise<void>;
  onDeleteCategory: (categoryId: string) => Promise<void>;
  onToggleStatus: (categoryId: string, currentStatus: boolean) => Promise<void>;
  loading?: boolean;
}

export default function CategoriesTab({
  categories,
  productCountsByCategory = {},
  onSaveCategory,
  onDeleteCategory,
  onToggleStatus,
  loading = false
}: CategoriesTabProps) {
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState<Partial<Category>>({
    id: '',
    name: '',
    slug: '',
    image: '',
    sort_order: 0,
    is_active: true
  });

  const openAddModal = () => {
    setEditingCategory(null);
    setFormData({
      id: '',
      name: '',
      slug: '',
      image: '',
      sort_order: categories.length + 1,
      is_active: true
    });
    setModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setFormData({
      id: cat.id,
      name: cat.name,
      slug: cat.slug || cat.id.replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      image: cat.image || '',
      sort_order: cat.sort_order ?? cat.sortOrder ?? 0,
      is_active: cat.is_active ?? cat.isActive ?? true
    });
    setModalOpen(true);
  };

  const handleNameChange = (nameVal: string) => {
    const slugVal = nameVal.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    setFormData((prev) => ({
      ...prev,
      name: nameVal,
      // If adding new, auto-generate slug and id
      ...(!editingCategory ? { slug: slugVal, id: nameVal.toLowerCase().trim() } : { slug: slugVal })
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      alert('Please provide a category name.');
      return;
    }

    setSaving(true);
    try {
      const finalId = editingCategory ? editingCategory.id : (formData.id?.trim() || formData.name!.toLowerCase().trim());
      const finalSlug = formData.slug?.trim() || finalId.replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

      await onSaveCategory({
        id: finalId,
        name: formData.name.trim(),
        slug: finalSlug,
        image: formData.image?.trim() || null,
        sort_order: Number(formData.sort_order) || 0,
        is_active: formData.is_active !== undefined ? !!formData.is_active : true
      }, !!editingCategory);

      setModalOpen(false);
    } catch (err: any) {
      alert(`Error saving category: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const filteredCategories = categories.filter((c) => {
    const query = search.toLowerCase().trim();
    return (
      c.name.toLowerCase().includes(query) ||
      c.id.toLowerCase().includes(query) ||
      (c.slug && c.slug.toLowerCase().includes(query))
    );
  }).sort((a, b) => (a.sort_order ?? a.sortOrder ?? 0) - (b.sort_order ?? b.sortOrder ?? 0));

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-gray-900">
              Category Management
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-brand-primary/10 text-brand-primary border border-brand-primary/20">
              {categories.length} Categories
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Organize catalog classifications, banner visuals, slugs, and navigation priority for your store.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Toggle View Mode */}
          <div className="flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'grid' ? 'bg-white shadow-xs text-brand-primary font-bold' : 'text-gray-500 hover:text-gray-700'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'table' ? 'bg-white shadow-xs text-brand-primary font-bold' : 'text-gray-500 hover:text-gray-700'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={openAddModal}
            className="bg-brand-primary text-white text-xs font-bold uppercase tracking-wider px-5 py-3 rounded-xl flex items-center gap-2 hover:bg-blue-900 transition-all cursor-pointer shadow-sm active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Category</span>
          </button>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search categories by name, slug or keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-brand-primary focus:bg-white transition-all font-medium"
          />
        </div>

        <div className="text-xs text-gray-400 font-medium">
          Showing <strong className="text-gray-700">{filteredCategories.length}</strong> of {categories.length} categories
        </div>
      </div>

      {/* Category Content: Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredCategories.map((cat) => {
            const count = productCountsByCategory[cat.id] ?? productCountsByCategory[cat.name] ?? 0;
            const isActive = cat.is_active ?? cat.isActive ?? true;

            return (
              <div
                key={cat.id}
                className={`bg-white rounded-2xl border p-5 shadow-xs transition-all flex flex-col justify-between group hover:shadow-md ${
                  isActive ? 'border-gray-200 hover:border-brand-primary/40' : 'border-gray-200/60 bg-gray-50/50 opacity-75'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center shrink-0">
                      {cat.image ? (
                        <img
                          src={cat.image}
                          alt={cat.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <Layers className="w-6 h-6 text-gray-400" />
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => onToggleStatus(cat.id, isActive)}
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full cursor-pointer transition-colors ${
                          isActive
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                            : 'bg-gray-200 text-gray-600 border border-gray-300 hover:bg-gray-300'
                        }`}
                        title="Click to toggle status"
                      >
                        {isActive ? 'ACTIVE' : 'INACTIVE'}
                      </button>
                    </div>
                  </div>

                  <h3 className="font-extrabold text-sm text-gray-900 group-hover:text-brand-primary transition-colors line-clamp-1">
                    {cat.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-mono text-gray-400">/{cat.slug || cat.id}</span>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-3 mt-4 flex items-center justify-between text-xs">
                  <span className="font-bold text-gray-600">
                    <strong className="text-gray-900">{count}</strong> Products
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openEditModal(cat)}
                      className="p-1.5 rounded-lg text-gray-500 hover:text-brand-primary hover:bg-blue-50 transition-colors cursor-pointer"
                      title="Edit Category"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (count > 0) {
                          if (!confirm(`Warning: ${count} products are assigned to this category. Deleting it may impact filtering. Proceed?`)) {
                            return;
                          }
                        } else if (!confirm(`Are you sure you want to delete category "${cat.name}"?`)) {
                          return;
                        }
                        onDeleteCategory(cat.id);
                      }}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      title="Delete Category"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Category Content: Table View */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/75 border-b border-gray-200 text-[10px] font-extrabold uppercase tracking-wider text-gray-400">
                <th className="p-4">Category</th>
                <th className="p-4">Slug / Identifier</th>
                <th className="p-4 text-center">Sort Order</th>
                <th className="p-4 text-center">Products</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {filteredCategories.map((cat) => {
                const count = productCountsByCategory[cat.id] ?? productCountsByCategory[cat.name] ?? 0;
                const isActive = cat.is_active ?? cat.isActive ?? true;

                return (
                  <tr key={cat.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center shrink-0">
                        {cat.image ? (
                          <img
                            src={cat.image}
                            alt={cat.name}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <Layers className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                      <span className="font-bold text-gray-900">{cat.name}</span>
                    </td>
                    <td className="p-4 font-mono text-gray-500 text-[11px]">
                      /{cat.slug || cat.id}
                    </td>
                    <td className="p-4 text-center font-bold text-gray-600">
                      {cat.sort_order ?? cat.sortOrder ?? 0}
                    </td>
                    <td className="p-4 text-center font-bold text-gray-900">
                      {count}
                    </td>
                    <td className="p-4 text-center">
                      <button
                        type="button"
                        onClick={() => onToggleStatus(cat.id, isActive)}
                        className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full cursor-pointer ${
                          isActive
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-gray-200 text-gray-600 border border-gray-300'
                        }`}
                      >
                        {isActive ? 'ACTIVE' : 'INACTIVE'}
                      </button>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openEditModal(cat)}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-brand-primary hover:bg-gray-100 transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (!confirm(`Are you sure you want to delete "${cat.name}"?`)) return;
                            onDeleteCategory(cat.id);
                          }}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-gray-100 transition-colors cursor-pointer"
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
      )}

      {/* Add / Edit Category Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative bg-white rounded-3xl w-full max-w-lg p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="text-xl font-black text-gray-900 tracking-tight pb-4 border-b border-gray-100">
              {editingCategory ? `Edit Category: ${editingCategory.name}` : 'Add New Category'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Category Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Panjabi, Saree, Polo & T-Shirts"
                  value={formData.name || ''}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-brand-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Category Slug / ID *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. panjabi, saree"
                  value={formData.slug || ''}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-brand-primary font-mono"
                />
                <p className="text-[10px] text-gray-400">Used in URLs and product categorization matching.</p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Banner / Icon Image URL</label>
                <input
                  type="url"
                  placeholder="https://example.com/images/category-banner.jpg"
                  value={formData.image || ''}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-brand-primary"
                />
                {formData.image && (
                  <div className="mt-2 w-16 h-16 rounded-xl border border-gray-200 overflow-hidden bg-gray-50">
                    <img
                      src={formData.image}
                      alt="Category preview"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">Sort Order</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.sort_order ?? 0}
                    onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-brand-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">Status</label>
                  <select
                    value={formData.is_active ? 'active' : 'inactive'}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'active' })}
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-brand-primary cursor-pointer font-bold"
                  >
                    <option value="active">Active (Visible)</option>
                    <option value="inactive">Inactive (Hidden)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-brand-primary hover:bg-blue-900 text-white text-xs font-bold px-6 py-2.5 rounded-xl transition-all cursor-pointer shadow-md disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingCategory ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
