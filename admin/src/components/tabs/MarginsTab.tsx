import React, { useState, useEffect } from 'react';
import { Percent, Coins, Save, Search, RefreshCw, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface MarginsTabProps {
  products: any[];
  setProducts: React.Dispatch<React.SetStateAction<any[]>>;
  dbSettings: any;
  setDbSettings: (settings: any) => void;
  isSupabaseOnline: boolean;
}

export default function MarginsTab({
  products,
  setProducts,
  dbSettings,
  setDbSettings,
  isSupabaseOnline
}: MarginsTabProps) {
  const [activeSubTab, setActiveSubTab] = useState<'category' | 'product'>('category');
  
  // Category margins states
  const [defaultMargin, setDefaultMargin] = useState<number>(25);
  const [categoryMargins, setCategoryMargins] = useState<Record<string, number>>({});
  const [savingCategory, setSavingCategory] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Product margins states
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editingPrice, setEditingPrice] = useState<string>('');
  const [editingMargin, setEditingMargin] = useState<string>('');
  const [savingProduct, setSavingProduct] = useState<boolean>(false);

  // Initialize category margins from dbSettings
  useEffect(() => {
    if (dbSettings) {
      const config = dbSettings.homepageConfig || dbSettings.homepage_config || {};
      setDefaultMargin(config.default_margin !== undefined ? config.default_margin : 25);
      setCategoryMargins(config.category_margins || {
        "men's fashion": 25,
        "women's fashion": 25,
        "couple collection": 20,
        "kids zone": 30,
        "watch": 35
      });
    }
  }, [dbSettings]);

  // Categories list
  const categoriesList = [
    { id: "men's fashion", name: "Men Fashions" },
    { id: "women's fashion", name: "Women Fashions" },
    { id: "couple collection", name: "Couple Collection" },
    { id: "kids zone", name: "Kids Fashions" },
    { id: "watch", name: "Accessories" }
  ];

  const handleSaveCategoryMargins = async () => {
    setSavingCategory(true);
    setMessage(null);
    try {
      const currentConfig = dbSettings.homepageConfig || dbSettings.homepage_config || {};
      const updatedConfig = {
        ...currentConfig,
        default_margin: defaultMargin,
        category_margins: categoryMargins
      };

      // 1. Persist updated configuration to settings table
      const { data: updatedSettings, error: settingsErr } = await supabase
        .from('settings')
        .update({ homepage_config: updatedConfig })
        .eq('id', 1)
        .select()
        .single();

      if (settingsErr) throw settingsErr;
      setDbSettings(updatedSettings);

      // 2. Query all products from Supabase to recalculate prices based on cost (purchase_price)
      const { data: allDbProducts, error: fetchErr } = await supabase
        .from('products')
        .select('id, category, price, discount_price, purchase_price');

      let updatedCount = 0;

      if (!fetchErr && allDbProducts && allDbProducts.length > 0) {
        const updates: { id: string; price: number; discount_price: number | null }[] = [];
        const updatedLocalProducts = [...products];

        for (const p of allDbProducts) {
          const cost = Number(p.purchase_price || p.purchasePrice || 0);
          if (cost <= 0) continue; // Skip products without cost price

          const catName = (p.category || '').toLowerCase();
          
          // Match category override or fallback to default margin
          let marginPct = defaultMargin;
          for (const [catKey, marginVal] of Object.entries(categoryMargins)) {
            if (catName.includes(catKey.toLowerCase()) || catKey.toLowerCase().includes(catName)) {
              marginPct = Number(marginVal);
              break;
            }
          }

          const sellingPrice = Math.round(cost * (1 + marginPct / 100));
          const regularPrice = Number(p.price || 0);

          let newPrice = sellingPrice;
          let newDiscountPrice: number | null = null;

          if (regularPrice > sellingPrice) {
            newPrice = regularPrice;
            newDiscountPrice = sellingPrice;
          } else {
            newPrice = sellingPrice;
            newDiscountPrice = null;
          }

          // Queue update if price changed
          if (newPrice !== p.price || newDiscountPrice !== p.discount_price) {
            updates.push({
              id: p.id,
              price: newPrice,
              discount_price: newDiscountPrice
            });

            // Update in local state
            const localIdx = updatedLocalProducts.findIndex(lp => lp.id === p.id);
            if (localIdx > -1) {
              updatedLocalProducts[localIdx] = {
                ...updatedLocalProducts[localIdx],
                price: newPrice,
                discountPrice: newDiscountPrice
              };
            }
          }
        }

        // 3. Batch update products in Supabase in chunks of 50
        if (updates.length > 0) {
          const chunkSize = 50;
          for (let i = 0; i < updates.length; i += chunkSize) {
            const chunk = updates.slice(i, i + chunkSize);
            await Promise.all(
              chunk.map(u =>
                supabase
                  .from('products')
                  .update({ price: u.price, discount_price: u.discount_price })
                  .eq('id', u.id)
              )
            );
          }
          updatedCount = updates.length;
          setProducts(updatedLocalProducts);
        }
      }

      setMessage({
        type: 'success',
        text: `Category profit margins updated successfully! Calculated and applied new selling prices for ${updatedCount} products.`
      });
    } catch (err: any) {
      console.error(err);
      setMessage({ type: 'error', text: `Failed to save: ${err.message}` });
    } finally {
      setSavingCategory(false);
    }
  };

  const handleStartEdit = (product: any) => {
    setEditingProductId(product.id);
    setEditingPrice(String(product.discountPrice || product.price));
    
    // Calculate current margin
    const cost = Number(product.purchasePrice || 0);
    const sell = Number(product.discountPrice || product.price || 0);
    if (cost > 0) {
      const marginPercent = Math.round(((sell - cost) / cost) * 100);
      setEditingMargin(String(marginPercent));
    } else {
      setEditingMargin('0');
    }
  };

  const handleMarginChange = (val: string, cost: number) => {
    setEditingMargin(val);
    const m = Number(val);
    if (!isNaN(m) && cost > 0) {
      const calculatedPrice = Math.round(cost * (1 + m / 100));
      setEditingPrice(String(calculatedPrice));
    }
  };

  const handlePriceChange = (val: string, cost: number) => {
    setEditingPrice(val);
    const p = Number(val);
    if (!isNaN(p) && cost > 0 && p > 0) {
      const calculatedMargin = Math.round(((p - cost) / cost) * 100);
      setEditingMargin(String(calculatedMargin));
    }
  };

  const handleSaveProductMargin = async (productId: string, cost: number) => {
    setSavingProduct(true);
    try {
      const sellPrice = Number(editingPrice);
      if (isNaN(sellPrice) || sellPrice <= 0) {
        alert("Please enter a valid price.");
        return;
      }

      // Check if there is a discount
      const product = products.find(p => p.id === productId);
      if (!product) return;

      const updateData: any = {};
      
      // If cost is less than selling price, set it
      if (product.purchasePrice && product.price > sellPrice) {
        updateData.price = product.price; // retain original regular price
        updateData.discount_price = sellPrice;
      } else {
        updateData.price = sellPrice;
        updateData.discount_price = null;
      }

      const { data, error } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', productId)
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setProducts(prev => prev.map(p => p.id === productId ? {
        ...p,
        price: data.price,
        discountPrice: data.discount_price
      } : p));

      setEditingProductId(null);
    } catch (err: any) {
      console.error(err);
      alert(`Failed to save: ${err.message}`);
    } finally {
      setSavingProduct(false);
    }
  };

  // Filter products
  const filteredProducts = products.filter(p => {
    const term = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(term) ||
      (p.sku && p.sku.toLowerCase().includes(term)) ||
      p.category.toLowerCase().includes(term)
    );
  }).slice(0, 100); // limit to 100 items for smooth performance

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
      <div>
        <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
          <Coins className="w-6 h-6 text-brand-primary" />
          Profit Margin Manager
        </h1>
        <p className="text-xs text-gray-500">Configure global reseller markup, category-specific margins, or update individual product profit settings.</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveSubTab('category')}
          className={`px-5 py-2.5 font-bold text-xs uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeSubTab === 'category'
              ? 'border-[#ff5c00] text-[#ff5c00]'
              : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          Category Margins
        </button>
        <button
          onClick={() => setActiveSubTab('product')}
          className={`px-5 py-2.5 font-bold text-xs uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeSubTab === 'product'
              ? 'border-[#ff5c00] text-[#ff5c00]'
              : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          Product Margins ({products.length})
        </button>
      </div>

      {/* Message Banner */}
      {message && (
        <div className={`p-4 rounded-xl border flex items-center gap-3 text-xs font-semibold ${
          message.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{message.text}</span>
        </div>
      )}

      {/* Category Tab Content */}
      {activeSubTab === 'category' && (
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs max-w-2xl space-y-6">
          <div className="space-y-4">
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-gray-900 border-b border-gray-100 pb-2">
              Sync Profit Configurations
            </h3>
            
            {/* Default Markup */}
            <div className="flex items-center justify-between gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div>
                <span className="text-xs font-black uppercase text-gray-700 block">Default Sync Markup</span>
                <span className="text-[10px] text-gray-400 block mt-0.5">Applied to all synced products without category overrides.</span>
              </div>
              <div className="flex items-center gap-1.5 w-32 shrink-0">
                <input
                  type="number"
                  value={defaultMargin}
                  onChange={(e) => setDefaultMargin(Number(e.target.value))}
                  className="w-full text-right px-3 py-2 border border-gray-300 rounded-lg text-xs font-bold outline-none focus:border-[#ff5c00]"
                />
                <span className="text-xs font-bold text-gray-500">%</span>
              </div>
            </div>

            {/* Category Custom Markups */}
            <div className="space-y-3 pt-2">
              <span className="text-xs font-black uppercase text-gray-900 tracking-wider block">Category Overrides</span>
              
              <div className="space-y-2.5">
                {categoriesList.map((cat) => {
                  const currentVal = categoryMargins[cat.id] !== undefined ? categoryMargins[cat.id] : defaultMargin;
                  return (
                    <div key={cat.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-xl hover:bg-gray-50/50">
                      <span className="text-xs font-bold text-gray-700">{cat.name}</span>
                      
                      <div className="flex items-center gap-1.5 w-32 shrink-0">
                        <input
                          type="number"
                          value={currentVal}
                          onChange={(e) => setCategoryMargins({
                            ...categoryMargins,
                            [cat.id]: Number(e.target.value)
                          })}
                          className="w-full text-right px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-bold outline-none focus:border-[#ff5c00]"
                        />
                        <span className="text-xs font-bold text-gray-500">%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <button
              onClick={handleSaveCategoryMargins}
              disabled={savingCategory}
              className="bg-[#ff5c00] hover:bg-orange-600 disabled:bg-orange-800/50 text-white text-xs font-extrabold uppercase tracking-wider px-6 py-3 rounded-xl flex items-center gap-2 cursor-pointer transition-all"
            >
              {savingCategory ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Category Margins
            </button>
          </div>
        </div>
      )}

      {/* Product Tab Content */}
      {activeSubTab === 'product' && (
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
          
          {/* Search bar */}
          <div className="flex max-w-md border border-gray-300 rounded-lg overflow-hidden focus-within:ring-1 focus-within:ring-[#ff5c00] focus-within:border-[#ff5c00]">
            <input
              type="text"
              placeholder="Search product catalog..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-2.5 text-xs text-gray-800 outline-none bg-white placeholder-gray-400"
            />
            <div className="bg-gray-100 px-4 flex items-center justify-center border-l border-gray-200">
              <Search className="w-3.5 h-3.5 text-gray-400" />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto pt-2">
            <table className="w-full text-left text-xs text-gray-600 border-collapse">
              <thead>
                <tr className="border-b border-gray-100 font-bold uppercase text-[10px] text-gray-400">
                  <th className="py-3">Product Name</th>
                  <th className="py-3">SKU</th>
                  <th className="py-3">Category</th>
                  <th className="py-3 text-right">Reseller Cost</th>
                  <th className="py-3 text-right">Selling Price</th>
                  <th className="py-3 text-right">Margin (%)</th>
                  <th className="py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-400 italic">No products found.</td>
                  </tr>
                ) : (
                  filteredProducts.map((p) => {
                    const cost = Number(p.purchasePrice || 0);
                    const sell = Number(p.discountPrice || p.price || 0);
                    const margin = cost > 0 ? Math.round(((sell - cost) / cost) * 100) : 0;
                    const isEditing = editingProductId === p.id;

                    return (
                      <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/20">
                        <td className="py-3 max-w-xs truncate font-semibold text-gray-900">{p.name}</td>
                        <td className="py-3 font-mono text-[10px] text-gray-500 uppercase">{p.sku || 'N/A'}</td>
                        <td className="py-3 font-semibold capitalize text-gray-500">{p.category}</td>
                        <td className="py-3 text-right font-mono font-bold text-gray-700">
                          {cost > 0 ? `৳${cost.toLocaleString()}` : '—'}
                        </td>
                        <td className="py-3 text-right font-mono">
                          {isEditing ? (
                            <div className="relative inline-block w-24 rounded-md border border-gray-300 overflow-hidden focus-within:ring-1 focus-within:ring-[#ff5c00]">
                              <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400">৳</span>
                              <input
                                type="number"
                                value={editingPrice}
                                onChange={(e) => handlePriceChange(e.target.value, cost)}
                                className="w-full pl-5 pr-1.5 py-1 text-xs text-right outline-none bg-white text-gray-800 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              />
                            </div>
                          ) : (
                            <span className="font-bold text-emerald-600">৳{sell.toLocaleString()}</span>
                          )}
                        </td>
                        <td className="py-3 text-right font-mono">
                          {isEditing ? (
                            <div className="relative inline-block w-20 rounded-md border border-gray-300 overflow-hidden focus-within:ring-1 focus-within:ring-[#ff5c00]">
                              <input
                                type="number"
                                value={editingMargin}
                                disabled={cost <= 0}
                                onChange={(e) => handleMarginChange(e.target.value, cost)}
                                className="w-full pr-4 pl-1.5 py-1 text-xs text-right outline-none bg-white text-gray-800 disabled:bg-gray-100 disabled:text-gray-400"
                              />
                              <span className="absolute right-1 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400">%</span>
                            </div>
                          ) : (
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                              margin >= 30 ? 'bg-green-50 text-green-700' :
                              margin >= 15 ? 'bg-blue-50 text-blue-700' :
                              'bg-amber-50 text-amber-700'
                            }`}>
                              +{margin}%
                            </span>
                          )}
                        </td>
                        <td className="py-3 text-right">
                          {isEditing ? (
                            <div className="flex justify-end gap-2.5">
                              <button
                                onClick={() => handleSaveProductMargin(p.id, cost)}
                                disabled={savingProduct}
                                className="text-emerald-600 hover:underline font-extrabold text-[10px] uppercase tracking-wider cursor-pointer disabled:opacity-50"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingProductId(null)}
                                className="text-gray-400 hover:underline font-bold text-[10px] uppercase tracking-wider cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleStartEdit(p)}
                              className="text-[#ff5c00] hover:underline font-bold text-[10px] uppercase tracking-wider cursor-pointer"
                            >
                              Edit Margin
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
