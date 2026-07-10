import React from 'react';
import { Image, ShoppingBag, Tag } from 'lucide-react';
import { Banner } from '../../types';
import { supabase } from '../../lib/supabase';

interface HomepageTabProps {
  banners: Banner[];
  setBanners: (b: Banner[]) => void;
  homepageConfig: any;
  setHomepageConfig: (config: any) => void;
  openBannerForm: (b: Banner | null) => void;
  handleDeleteBanner: (id: string) => void;
  settingsId?: any;
}

export default function HomepageTab({
  banners,
  setBanners,
  homepageConfig,
  setHomepageConfig,
  openBannerForm,
  handleDeleteBanner,
  settingsId
}: HomepageTabProps) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Homepage Customization</h1>
          <p className="text-xs text-gray-500">Configure promotional sliders, category showcase blocks, and featured collections.</p>
        </div>
      </div>

      {/* Section 1: Hero Banners */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-4">
        <div className="flex justify-between items-center border-b border-gray-100 pb-3">
          <h3 className="font-bold text-sm uppercase tracking-wide text-gray-500 flex items-center gap-2">
            <Image className="w-4 h-4 text-orange-500" />
            Hero Banner Sliders
          </h3>
          <button
            onClick={() => openBannerForm(null)}
            className="bg-brand-primary text-white text-[10px] font-bold uppercase tracking-wider px-3.5 py-2 rounded-lg hover:bg-blue-900 transition-all cursor-pointer"
          >
            Add Slide
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {banners.map((b) => (
            <div key={b.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-2xs relative flex flex-col justify-between">
              <div>
                <div className="relative h-32 bg-zinc-950 overflow-hidden">
                  <img 
                    src={b.image || 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80&w=600'} 
                    alt={b.title} 
                    className="w-full h-full object-cover opacity-75"
                    referrerPolicy="no-referrer"
                  />
                  <span className="absolute top-2 left-2 bg-brand-primary text-white text-[8px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wider">
                    {b.type}
                  </span>
                </div>
                
                <div className="p-4 space-y-1">
                  <h4 className="font-bold text-xs text-zinc-950 leading-snug">{b.title}</h4>
                  <p className="text-[10px] text-zinc-500 font-semibold">{b.subtitle}</p>
                  {b.category && <p className="text-[10px] text-brand-primary font-bold">Link: {b.category}</p>}
                </div>
              </div>

              <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex justify-between items-center text-[10px]">
                <div className="flex space-x-2">
                  <button
                    onClick={() => openBannerForm(b)}
                    className="text-brand-primary font-bold hover:underline cursor-pointer"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteBanner(b.id)}
                    className="text-red-500 font-bold hover:underline cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
                <button
                  onClick={async () => {
                    const updated = banners.map(bn => bn.id === b.id ? { ...bn, isActive: !bn.isActive } : bn);
                    await supabase.from('banners').update({ isActive: !b.isActive }).eq('id', b.id);
                    setBanners(updated);
                  }}
                  className={`font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                    b.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}
                >
                  {b.isActive ? 'Online' : 'Offline'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 2: Featured Collections */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-6">
        <h3 className="font-bold text-sm uppercase tracking-wide text-gray-500 border-b border-gray-100 pb-3 flex items-center gap-2">
          <ShoppingBag className="w-4 h-4 text-emerald-500" />
          Featured Collections Products
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {['trending', 'new_arrivals', 'best_sellers'].map((type) => {
            const title = type === 'trending' ? 'Trending Products' : type === 'new_arrivals' ? 'New Arrivals' : 'Best Sellers';
            const idsList = homepageConfig.featured_product_ids?.[type] || [];
            
            return (
              <div key={type} className="border border-gray-200 rounded-2xl p-4 bg-gray-50/30 space-y-3">
                <span className="text-xs font-black uppercase text-zinc-800 block">{title}</span>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {idsList.length === 0 ? (
                    <p className="text-[11px] text-gray-400 font-semibold italic">No products added. Using dynamic algorithms.</p>
                  ) : (
                    idsList.map((id: string) => (
                      <div key={id} className="flex justify-between items-center p-2 bg-white rounded-lg border border-gray-100 text-xs font-semibold">
                        <span className="truncate max-w-[120px]">{id}</span>
                        <button
                          type="button"
                          onClick={async () => {
                            const updatedConfig = {
                              ...homepageConfig,
                              featured_product_ids: {
                                ...homepageConfig.featured_product_ids,
                                [type]: idsList.filter((item: string) => item !== id)
                              }
                            };
                            const { error } = await supabase.from('settings').update({ homepageConfig: updatedConfig }).eq('id', settingsId || 1);
                            if (!error) {
                              setHomepageConfig(updatedConfig);
                            }
                          }}
                          className="text-red-500 hover:text-red-700 font-bold px-1"
                        >
                          ✕
                        </button>
                      </div>
                    ))
                  )}
                </div>

                {/* Add Product ID Form */}
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const form = e.currentTarget;
                    const input = form.elements.namedItem('productId') as HTMLInputElement;
                    const newId = input.value.trim();
                    if (newId && !idsList.includes(newId)) {
                      const updatedConfig = {
                        ...homepageConfig,
                        featured_product_ids: {
                          ...homepageConfig.featured_product_ids,
                          [type]: [...idsList, newId]
                        }
                      };
                      const { error } = await supabase.from('settings').update({ homepageConfig: updatedConfig }).eq('id', settingsId || 1);
                      if (!error) {
                        setHomepageConfig(updatedConfig);
                        input.value = '';
                      } else {
                        alert(`Failed to save: ${error.message}`);
                      }
                    }
                  }}
                  className="flex gap-2"
                >
                  <input
                    type="text"
                    name="productId"
                    placeholder="Paste Product ID (e.g. mohasagor-8327)"
                    className="flex-1 bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="bg-brand-primary text-white text-xs px-3 py-1.5 rounded-lg font-bold"
                  >
                    Add
                  </button>
                </form>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 3: Homepage Featured Categories */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-6">
        <h3 className="font-bold text-sm uppercase tracking-wide text-gray-500 border-b border-gray-100 pb-3 flex items-center gap-2">
          <Tag className="w-4 h-4 text-purple-500" />
          Showcase Categories Grid (Home)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(homepageConfig.featured_categories || []).map((cat: any, index: number) => (
            <div key={index} className="border border-gray-200 rounded-xl p-4 bg-gray-50/30 space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{cat.icon}</span>
                <div className="flex-1">
                  <input
                    type="text"
                    value={cat.name}
                    onChange={(e) => {
                      const list = [...homepageConfig.featured_categories];
                      list[index] = { ...cat, name: e.target.value };
                      setHomepageConfig({ ...homepageConfig, featured_categories: list });
                    }}
                    className="w-full bg-white border border-gray-200 rounded-lg px-2 py-1 text-xs font-bold focus:outline-none"
                    placeholder="Category Name"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-gray-400">Description</label>
                <textarea
                  value={cat.desc}
                  onChange={(e) => {
                    const list = [...homepageConfig.featured_categories];
                    list[index] = { ...cat, desc: e.target.value };
                    setHomepageConfig({ ...homepageConfig, featured_categories: list });
                  }}
                  className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs focus:outline-none h-16 resize-none font-semibold text-gray-600"
                  placeholder="Category description..."
                />
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div>
                  <label className="uppercase font-bold text-gray-400 block mb-1">Icon Emoji</label>
                  <input
                    type="text"
                    value={cat.icon}
                    onChange={(e) => {
                      const list = [...homepageConfig.featured_categories];
                      list[index] = { ...cat, icon: e.target.value };
                      setHomepageConfig({ ...homepageConfig, featured_categories: list });
                    }}
                    className="w-full bg-white border border-gray-200 rounded-lg px-2 py-1 focus:outline-none text-center"
                    placeholder="👕"
                  />
                </div>
                <div>
                  <label className="uppercase font-bold text-gray-400 block mb-1">Tailwind Gradient</label>
                  <input
                    type="text"
                    value={cat.bg}
                    onChange={(e) => {
                      const list = [...homepageConfig.featured_categories];
                      list[index] = { ...cat, bg: e.target.value };
                      setHomepageConfig({ ...homepageConfig, featured_categories: list });
                    }}
                    className="w-full bg-white border border-gray-200 rounded-lg px-2 py-1 focus:outline-none"
                    placeholder="from-orange-50 to-amber-50/20"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-3">
          <button
            type="button"
            onClick={async () => {
              const { error } = await supabase.from('settings').update({ homepageConfig: homepageConfig }).eq('id', settingsId || 1);
              if (!error) {
                alert("Homepage category configurations saved successfully!");
              } else {
                alert(`Failed to save categories: ${error.message}`);
              }
            }}
            className="bg-[#ff5c00] text-white text-xs font-bold uppercase tracking-wider px-6 py-3.5 rounded-xl hover:bg-orange-600 transition-all cursor-pointer shadow-md"
          >
            Save Categories Grid Configuration
          </button>
        </div>
      </div>
    </div>
  );
}
