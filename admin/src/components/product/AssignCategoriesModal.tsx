import React, { useState, useEffect } from 'react';
import { X, Plus, Check } from 'lucide-react';
import { Category } from '../../types';

interface AssignCategoriesModalProps {
  open: boolean;
  onClose: () => void;
  categories: Category[];
  selectedCategory: string;
  selectedSubCategory?: string;
  assignedCategories?: string[];
  onApply: (primaryCategory: string, primarySubCategory: string, allAssigned: string[]) => void;
  onQuickAddCategory?: (name: string, parentId?: string | null) => Promise<void>;
}

export default function AssignCategoriesModal({
  open,
  onClose,
  categories,
  selectedCategory,
  selectedSubCategory = '',
  assignedCategories = [],
  onApply,
  onQuickAddCategory
}: AssignCategoriesModalProps) {
  // Currently selected pills (names or ids)
  const [selectedPills, setSelectedPills] = useState<string[]>([]);
  // Active category being drilled into (for showing level 2 subcategories)
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  // Active subcategory being drilled into (for showing level 3 subcategories)
  const [activeSubCategoryId, setActiveSubCategoryId] = useState<string | null>(null);

  // Quick add state
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [quickAddLevel, setQuickAddLevel] = useState<'root' | 'sub'>('root');
  const [isAdding, setIsAdding] = useState(false);

  const getParentId = (c: Category): string | null => {
    const p = c.parent_id || (c as any).parentId;
    if (!p || p === 'null') return null;
    return String(p).trim().toLowerCase();
  };

  useEffect(() => {
    if (open) {
      const initial: string[] = [];
      if (selectedCategory) initial.push(selectedCategory);
      if (selectedSubCategory && !initial.includes(selectedSubCategory)) initial.push(selectedSubCategory);
      assignedCategories.forEach((c) => {
        if (c && !initial.includes(c)) initial.push(c);
      });
      setSelectedPills(initial);

      // Resolve initial active category
      const rootCat = categories.find(
        (c) => !getParentId(c) && (c.name === selectedCategory || c.id === selectedCategory)
      );
      if (rootCat) {
        setActiveCategoryId(rootCat.id);
        const subCat = categories.find(
          (c) => getParentId(c) === String(rootCat.id).trim().toLowerCase() && (c.name === selectedSubCategory || c.id === selectedSubCategory)
        );
        if (subCat) {
          setActiveSubCategoryId(subCat.id);
        } else {
          setActiveSubCategoryId(null);
        }
      } else {
        const firstRoot = categories.find((c) => !getParentId(c));
        setActiveCategoryId(firstRoot ? firstRoot.id : null);
        setActiveSubCategoryId(null);
      }
    }
  }, [open, selectedCategory, selectedSubCategory, assignedCategories, categories]);

  if (!open) return null;

  // Level 1: Root categories
  const rootCategories = categories.filter((c) => !getParentId(c));

  // Level 2: Subcategories of activeCategoryId
  const activeRootLower = activeCategoryId ? String(activeCategoryId).trim().toLowerCase() : null;
  const subCategories = activeRootLower
    ? categories.filter((c) => getParentId(c) === activeRootLower)
    : [];

  // Level 3: Child subcategories of activeSubCategoryId
  const activeSubLower = activeSubCategoryId ? String(activeSubCategoryId).trim().toLowerCase() : null;
  const childSubCategories = activeSubLower
    ? categories.filter((c) => getParentId(c) === activeSubLower)
    : [];

  const isSelected = (name: string, id: string) => {
    return selectedPills.includes(name) || selectedPills.includes(id);
  };

  const togglePill = (name: string, id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (isSelected(name, id)) {
      setSelectedPills((prev) => prev.filter((p) => p !== name && p !== id));
    } else {
      setSelectedPills((prev) => [...prev, name]);
    }
  };

  const removePill = (name: string, id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedPills((prev) => prev.filter((p) => p !== name && p !== id));
  };

  const handleDone = () => {
    // Determine primary category and subcategory from selected pills
    let primaryCat = selectedCategory || '';
    let primarySub = selectedSubCategory || '';

    // Pick first selected root category as primary
    const chosenRoot = rootCategories.find((c) => isSelected(c.name, c.id));
    if (chosenRoot) {
      primaryCat = chosenRoot.name;
    }

    // Pick first selected subcategory as primary sub
    const targetParent = (chosenRoot?.id || activeCategoryId ? String(chosenRoot?.id || activeCategoryId).trim().toLowerCase() : null);
    const chosenSub = categories.find(
      (c) => getParentId(c) && isSelected(c.name, c.id) && getParentId(c) === targetParent
    );
    if (chosenSub) {
      primarySub = chosenSub.name;
    }

    onApply(primaryCat, primarySub, selectedPills);
    onClose();
  };

  const handleQuickAdd = async () => {
    const trimmed = newCatName.trim();
    if (!trimmed) return;
    setIsAdding(true);
    try {
      const parent = quickAddLevel === 'sub' ? activeCategoryId : null;
      if (onQuickAddCategory) {
        await onQuickAddCategory(trimmed, parent);
      }
      setSelectedPills((prev) => [...prev, trimmed]);
      setNewCatName('');
      setShowQuickAdd(false);
    } catch (err: any) {
      alert('Error adding category: ' + err.message);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl w-full max-w-xl p-6 sm:p-8 space-y-6 shadow-2xl relative animate-in zoom-in-95 duration-150">
        
        {/* Top Right Close Button */}
        <button
          onClick={onClose}
          type="button"
          className="absolute -top-3 -right-3 w-9 h-9 rounded-full bg-red-100 text-red-500 hover:bg-red-200 flex items-center justify-center shadow-md transition-colors cursor-pointer z-10"
        >
          <X className="w-5 h-5 stroke-[2.5]" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center justify-center gap-2 relative">
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
            Assign categories
          </h2>
          <button
            type="button"
            onClick={() => setShowQuickAdd(!showQuickAdd)}
            className="w-6 h-6 rounded-lg bg-[#5B21B6] hover:bg-[#4C1D95] text-white flex items-center justify-center shadow-xs transition-colors cursor-pointer"
            title="Quick add new category"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Quick Add Inline Box */}
        {showQuickAdd && (
          <div className="p-3.5 bg-purple-50/70 border border-purple-200 rounded-2xl space-y-2 animate-in fade-in duration-150">
            <div className="flex items-center justify-between text-xs font-bold text-[#5B21B6]">
              <span>Quick Add</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setQuickAddLevel('root')}
                  className={`px-2 py-0.5 rounded-md text-[10px] uppercase font-bold transition-colors cursor-pointer ${
                    quickAddLevel === 'root' ? 'bg-[#5B21B6] text-white' : 'bg-purple-100 text-[#5B21B6]'
                  }`}
                >
                  Root Category
                </button>
                {activeCategoryId && (
                  <button
                    type="button"
                    onClick={() => setQuickAddLevel('sub')}
                    className={`px-2 py-0.5 rounded-md text-[10px] uppercase font-bold transition-colors cursor-pointer ${
                      quickAddLevel === 'sub' ? 'bg-[#5B21B6] text-white' : 'bg-purple-100 text-[#5B21B6]'
                    }`}
                  >
                    Sub-category
                  </button>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder={quickAddLevel === 'root' ? 'Category name...' : 'Subcategory name...'}
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleQuickAdd())}
                className="flex-1 bg-white border border-purple-300 rounded-xl px-3 py-1.5 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#5B21B6]"
              />
              <button
                type="button"
                disabled={isAdding || !newCatName.trim()}
                onClick={handleQuickAdd}
                className="px-4 py-1.5 bg-[#5B21B6] hover:bg-[#4C1D95] text-white text-xs font-bold rounded-xl disabled:opacity-50 cursor-pointer shadow-xs"
              >
                {isAdding ? 'Adding...' : 'Add'}
              </button>
            </div>
          </div>
        )}

        {/* Level 1: Select Categories */}
        <div className="space-y-2.5">
          <label className="text-xs font-bold text-gray-700 tracking-tight block">
            Select categories
          </label>
          <div className="flex flex-wrap gap-2.5 items-center">
            {rootCategories.map((cat) => {
              const selected = isSelected(cat.name, cat.id);
              const isActive = activeCategoryId === cat.id;

              return (
                <div
                  key={cat.id}
                  className={isActive ? 'p-0.5 border-2 border-dashed border-[#5B21B6] rounded-full' : ''}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setActiveCategoryId(cat.id);
                      setActiveSubCategoryId(null);
                      if (!selected) togglePill(cat.name, cat.id);
                    }}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                      selected
                        ? 'border-2 border-[#5B21B6] text-[#5B21B6] bg-purple-50/40 shadow-xs'
                        : 'border border-gray-300 text-gray-700 hover:border-gray-400 bg-white'
                    }`}
                  >
                    <span>{cat.name}</span>
                    {selected && (
                      <span
                        onClick={(e) => removePill(cat.name, cat.id, e)}
                        className="w-4 h-4 rounded-full border border-red-500 text-red-500 flex items-center justify-center hover:bg-red-50"
                        title="Remove"
                      >
                        <X className="w-3 h-3 stroke-[3]" />
                      </span>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Level 2: Select Sub-categories */}
        {subCategories.length > 0 && (
          <div className="space-y-2.5 pt-1 animate-in fade-in duration-150">
            <label className="text-xs font-bold text-gray-700 tracking-tight block">
              Select sub-categories
            </label>
            <div className="flex flex-wrap gap-2.5 items-center">
              {subCategories.map((sub) => {
                const selected = isSelected(sub.name, sub.id);
                const isActive = activeSubCategoryId === sub.id;

                return (
                  <div
                    key={sub.id}
                    className={isActive ? 'p-0.5 border-2 border-dashed border-[#5B21B6] rounded-full' : ''}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setActiveSubCategoryId(sub.id);
                        if (!selected) togglePill(sub.name, sub.id);
                      }}
                      className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                        selected
                          ? 'border-2 border-[#5B21B6] text-[#5B21B6] bg-purple-50/40 shadow-xs'
                          : 'border border-gray-300 text-gray-700 hover:border-gray-400 bg-white'
                      }`}
                    >
                      <span>{sub.name}</span>
                      {selected && (
                        <span
                          onClick={(e) => removePill(sub.name, sub.id, e)}
                          className="w-4 h-4 rounded-full border border-red-500 text-red-500 flex items-center justify-center hover:bg-red-50"
                          title="Remove"
                        >
                          <X className="w-3 h-3 stroke-[3]" />
                        </span>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Level 3: Child Sub-categories (Panjabi -> Print Panjabi, Premium Luxury Panjabi, etc.) */}
        {childSubCategories.length > 0 && (
          <div className="space-y-2.5 pt-1 animate-in fade-in duration-150">
            <label className="text-xs font-bold text-gray-700 tracking-tight block">
              Select sub-categories
            </label>
            <div className="flex flex-wrap gap-2.5 items-center">
              {childSubCategories.map((child) => {
                const selected = isSelected(child.name, child.id);

                return (
                  <button
                    key={child.id}
                    type="button"
                    onClick={() => togglePill(child.name, child.id)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                      selected
                        ? 'border-2 border-[#5B21B6] text-[#5B21B6] bg-purple-50/40 shadow-xs'
                        : 'border border-gray-300 text-gray-700 hover:border-gray-400 bg-white'
                    }`}
                  >
                    <span>{child.name}</span>
                    {selected && (
                      <span
                        onClick={(e) => removePill(child.name, child.id, e)}
                        className="w-4 h-4 rounded-full border border-red-500 text-red-500 flex items-center justify-center hover:bg-red-50"
                        title="Remove"
                      >
                        <X className="w-3 h-3 stroke-[3]" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Done Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleDone}
            className="w-full bg-[#5B21B6] hover:bg-[#4C1D95] text-white font-bold py-3.5 rounded-2xl text-sm transition-all shadow-md hover:shadow-lg cursor-pointer"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
}
