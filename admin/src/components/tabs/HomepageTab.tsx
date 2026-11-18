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
                    className="w-full h-full object-cover object-top opacity-75"
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

      {/* Section 1b: Homepage Hero Side Banner (Desktop Side Card) */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-6">
        <div className="flex justify-between items-center border-b border-gray-100 pb-3">
          <h3 className="font-bold text-sm uppercase tracking-wide text-gray-500 flex items-center gap-2">
            <Image className="w-4 h-4 text-purple-500" />
            Homepage Hero Side Banner (Desktop Side Card)
          </h3>
          <span className="text-[10px] text-gray-400 font-semibold">Image-Only Promo Banner next to Hero Slider</span>
        </div>

        {(() => {
          const side = homepageConfig?.side_banner || {
            image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=400&auto=format&fit=crop',
            link: '/shop',
            button_text: 'Explore Collection',
            is_enabled: true
          };

          const updateSide = (fields: any) => {
            setHomepageConfig({
              ...homepageConfig,
              side_banner: { ...side, ...fields }
            });
          };

          return (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 text-xs font-semibold text-zinc-700">
              {/* Preview Card */}
              <div className="md:col-span-4 space-y-2">
                <label className="text-[10px] uppercase font-bold text-gray-400 block">Live Preview</label>
                <div className="relative h-64 rounded-xl overflow-hidden border border-gray-200 bg-zinc-950 shadow-sm flex flex-col justify-end p-4 group">
                  {side.image ? (
                    <img 
                      src={side.image} 
                      alt="Side Banner Preview" 
                      className="absolute inset-0 w-full h-full object-cover object-top" 
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-xs">No Image Provided</div>
                  )}
                  {side.button_text && side.button_text.trim() !== '' && (
                    <div className="relative z-10">
                      <div className="w-full bg-black/80 backdrop-blur-xs text-white text-center font-bold text-[10px] py-2 rounded-lg uppercase tracking-wider border border-white/10">
                        {side.button_text}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Form Controls */}
              <div className="md:col-span-8 space-y-4">
                <div className="space-y-1">
                  <label className="uppercase font-bold text-gray-500">Upload Banner Image to Supabase</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      try {
                        try { await supabase.storage.createBucket('banners', { public: true }); } catch (_) {}
                        const fileExt = file.name.split('.').pop();
                        const fileName = `side-banner-${Date.now()}.${fileExt}`;
                        const { error: upErr } = await supabase.storage.from('banners').upload(fileName, file, { upsert: true });
                        if (upErr) throw upErr;
                        const { data: { publicUrl } } = supabase.storage.from('banners').getPublicUrl(fileName);
                        updateSide({ image: publicUrl });
                        alert("Side banner image uploaded successfully!");
                      } catch (err: any) {
                        alert(`Upload failed: ${err.message}`);
                      }
                    }}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-zinc-800 font-medium focus:outline-none file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-[#ff5c00]/10 file:text-[#ff5c00] hover:file:bg-[#ff5c00]/20 file:cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <label className="uppercase font-bold text-gray-500">Image URL (or Paste External Image Link)</label>
                  <input
                    type="text"
                    value={side.image || ''}
                    onChange={(e) => updateSide({ image: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="uppercase font-bold text-gray-500">Target Link / URL (Optional)</label>
                    <input
                      type="text"
                      value={side.link || ''}
                      onChange={(e) => updateSide({ link: e.target.value })}
                      placeholder="e.g. /offers or /shop?category=Beauty or Beauty"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="uppercase font-bold text-gray-500">CTA Button Text (Optional - Leave blank for image-only)</label>
                    <input
                      type="text"
                      value={side.button_text || ''}
                      onChange={(e) => updateSide({ button_text: e.target.value })}
                      placeholder="e.g. Explore Collection (Optional)"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="sideBannerEnabled"
                    checked={side.is_enabled !== false}
                    onChange={(e) => updateSide({ is_enabled: e.target.checked })}
                    className="w-4 h-4 rounded text-brand-primary accent-brand-primary cursor-pointer"
                  />
                  <label htmlFor="sideBannerEnabled" className="text-xs text-zinc-700 font-bold cursor-pointer">
                    Enable Side Banner on Homepage Desktop View
                  </label>
                </div>
              </div>
            </div>
          );
        })()}

        <div className="flex justify-end pt-3 border-t border-gray-100">
          <button
            type="button"
            onClick={async () => {
              const settingsIdTarget = settingsId || 1;
              const { error } = await supabase.from('settings').update({ homepage_config: homepageConfig }).eq('id', settingsIdTarget);
              if (!error) {
                try {
                  const cached = JSON.parse(localStorage.getItem('rup_db_settings') || '{}');
                  cached.homepage_config = homepageConfig;
                  cached.homepageConfig = homepageConfig;
                  localStorage.setItem('rup_db_settings', JSON.stringify(cached));
                } catch (_) {}
                alert("Homepage Side Banner configuration saved successfully!");
              } else {
                alert(`Failed to save side banner: ${error.message}`);
              }
            }}
            className="bg-[#ff5c00] text-white text-xs font-bold uppercase tracking-wider px-6 py-3 rounded-xl hover:bg-orange-600 transition-all cursor-pointer shadow-md"
          >
            Save Side Banner Configuration
          </button>
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
                            const { error } = await supabase.from('settings').update({ homepage_config: updatedConfig }).eq('id', settingsId || 1);
                            if (!error) {
                              setHomepageConfig(updatedConfig);
                              try {
                                const cached = JSON.parse(localStorage.getItem('rup_db_settings') || '{}');
                                cached.homepage_config = updatedConfig;
                                cached.homepageConfig = updatedConfig;
                                localStorage.setItem('rup_db_settings', JSON.stringify(cached));
                              } catch (_) {}
                            } else {
                              alert(`Failed to remove product: ${error.message}`);
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
                      const { error } = await supabase.from('settings').update({ homepage_config: updatedConfig }).eq('id', settingsId || 1);
                      if (!error) {
                        setHomepageConfig(updatedConfig);
                        try {
                          const cached = JSON.parse(localStorage.getItem('rup_db_settings') || '{}');
                          cached.homepage_config = updatedConfig;
                          cached.homepageConfig = updatedConfig;
                          localStorage.setItem('rup_db_settings', JSON.stringify(cached));
                        } catch (_) {}
                        input.value = '';
                        alert("Product successfully added to collection!");
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
        <div className="flex justify-between items-center border-b border-gray-100 pb-3">
          <h3 className="font-bold text-sm uppercase tracking-wide text-gray-500 flex items-center gap-2">
            <Tag className="w-4 h-4 text-purple-500" />
            Showcase Categories Grid (Home)
          </h3>
          <button
            type="button"
            onClick={() => {
              const list = [...(homepageConfig.featured_categories || [])];
              list.push({ name: 'New Showcase Category', desc: 'Detailed description of this category...', icon: '📦', bg: 'from-blue-50 to-sky-50/10' });
              setHomepageConfig({ ...homepageConfig, featured_categories: list });
            }}
            className="bg-brand-primary text-white text-[10px] font-bold uppercase tracking-wider px-3 py-2 rounded-lg hover:bg-blue-900 transition-all cursor-pointer"
          >
            Add Showcase Block
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(homepageConfig.featured_categories || []).map((cat: any, index: number) => (
            <div key={index} className="border border-gray-200 rounded-xl p-4 bg-gray-50/30 space-y-3 relative">
              <button
                type="button"
                onClick={() => {
                  const list = homepageConfig.featured_categories.filter((_: any, i: number) => i !== index);
                  setHomepageConfig({ ...homepageConfig, featured_categories: list });
                }}
                className="absolute top-2 right-2 text-red-500 hover:text-red-700 font-bold text-[10px] px-2 py-0.5 rounded bg-white border border-gray-100 hover:bg-red-50 cursor-pointer"
              >
                Delete
              </button>

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

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-gray-400">Database Category Link (Slug)</label>
                <input
                  type="text"
                  value={cat.mappedId || ''}
                  onChange={(e) => {
                    const list = [...homepageConfig.featured_categories];
                    list[index] = { ...cat, mappedId: e.target.value };
                    setHomepageConfig({ ...homepageConfig, featured_categories: list });
                  }}
                  className="w-full bg-white border border-gray-200 rounded-lg px-2 py-1 text-[10px] focus:outline-none"
                  placeholder="e.g. panjabi or watch"
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
              const { error } = await supabase.from('settings').update({ homepage_config: homepageConfig }).eq('id', settingsId || 1);
              if (!error) {
                try {
                  const cached = JSON.parse(localStorage.getItem('rup_db_settings') || '{}');
                  cached.homepage_config = homepageConfig;
                  cached.homepageConfig = homepageConfig;
                  localStorage.setItem('rup_db_settings', JSON.stringify(cached));
                } catch (_) {}
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

      {/* Section 4: Homepage Circular Categories (Circular Bubbles) */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-6">
        <div className="flex justify-between items-center border-b border-gray-100 pb-3">
          <h3 className="font-bold text-sm uppercase tracking-wide text-gray-500 flex items-center gap-2">
            <Tag className="w-4 h-4 text-[#ff5c00]" />
            Homepage Circular Categories (Bubbles)
          </h3>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-700">
              <label>Bubble Shape:</label>
              <select
                value={homepageConfig.category_style || 'circular'}
                onChange={(e) => {
                  setHomepageConfig({ ...homepageConfig, category_style: e.target.value });
                }}
                className="bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none cursor-pointer"
              >
                <option value="circular">Circular</option>
                <option value="square">Square</option>
              </select>
            </div>
            <button
              type="button"
              onClick={() => {
                const list = [...(homepageConfig.homepage_categories || [])];
                list.push({ 
                  name: 'New Category', 
                  image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80&w=150', 
                  mappedId: 'all' 
                });
                setHomepageConfig({ ...homepageConfig, homepage_categories: list });
              }}
              className="bg-brand-primary text-white text-[10px] font-bold uppercase tracking-wider px-3 py-2 rounded-lg hover:bg-blue-900 transition-all cursor-pointer"
            >
              Add Circular Bubble
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {(homepageConfig.homepage_categories || []).map((cat: any, index: number) => (
            <div key={index} className="border border-gray-200 rounded-xl p-4 bg-gray-50/30 space-y-3 relative">
              <button
                type="button"
                onClick={() => {
                  const list = homepageConfig.homepage_categories.filter((_: any, i: number) => i !== index);
                  setHomepageConfig({ ...homepageConfig, homepage_categories: list });
                }}
                className="absolute top-2 right-2 text-red-500 hover:text-red-700 font-bold text-[10px] px-2 py-0.5 rounded bg-white border border-gray-100 hover:bg-red-50 cursor-pointer"
              >
                Delete
              </button>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 flex items-center justify-center bg-white shrink-0">
                  <img 
                    src={cat.image || 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80&w=150'} 
                    alt={cat.name} 
                    className="w-full h-full object-cover" 
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    value={cat.name}
                    onChange={(e) => {
                      const list = [...homepageConfig.homepage_categories];
                      list[index] = { ...cat, name: e.target.value };
                      setHomepageConfig({ ...homepageConfig, homepage_categories: list });
                    }}
                    className="w-full bg-white border border-gray-200 rounded-lg px-2 py-1 text-xs font-bold focus:outline-none"
                    placeholder="Category Name"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-gray-400">Image URL</label>
                <input
                  type="text"
                  value={cat.image || ''}
                  onChange={(e) => {
                    const list = [...homepageConfig.homepage_categories];
                    list[index] = { ...cat, image: e.target.value };
                    setHomepageConfig({ ...homepageConfig, homepage_categories: list });
                  }}
                  className="w-full bg-white border border-gray-200 rounded-lg px-2 py-1 text-[10px] focus:outline-none"
                  placeholder="https://images.unsplash.com/..."
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-gray-400">Database Category Link (Slug)</label>
                <input
                  type="text"
                  value={cat.mappedId || ''}
                  onChange={(e) => {
                    const list = [...homepageConfig.homepage_categories];
                    list[index] = { ...cat, mappedId: e.target.value };
                    setHomepageConfig({ ...homepageConfig, homepage_categories: list });
                  }}
                  className="w-full bg-white border border-gray-200 rounded-lg px-2 py-1 text-[10px] focus:outline-none"
                  placeholder="e.g. panjabi or watch"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-3">
          <button
            type="button"
            onClick={async () => {
              const { error } = await supabase.from('settings').update({ homepage_config: homepageConfig }).eq('id', settingsId || 1);
              if (!error) {
                try {
                  const cached = JSON.parse(localStorage.getItem('rup_db_settings') || '{}');
                  cached.homepage_config = homepageConfig;
                  cached.homepageConfig = homepageConfig;
                  localStorage.setItem('rup_db_settings', JSON.stringify(cached));
                } catch (_) {}
                alert("Homepage configurations saved successfully!");
              } else {
                alert(`Failed to save configurations: ${error.message}`);
              }
            }}
            className="bg-[#ff5c00] text-white text-xs font-bold uppercase tracking-wider px-6 py-3.5 rounded-xl hover:bg-orange-600 transition-all cursor-pointer shadow-md"
          >
            Save Homepage Configurations
          </button>
        </div>
      </div>

      {/* Section 5: Homepage Promo Banner (BIG SALE) */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-6">
        <h3 className="font-bold text-sm uppercase tracking-wide text-gray-500 border-b border-gray-100 pb-3 flex items-center gap-2">
          <Image className="w-4 h-4 text-rose-500" />
          Homepage Promo Banner (BIG SALE)
        </h3>

        {(() => {
          const promo = homepageConfig.promo_banner || {
            badge: 'Store Promo',
            title: 'BIG SALE',
            discount: 'UP TO 70% OFF',
            description: 'Fashion • Electronics • Beauty • Home • Grocery',
            image1: 'https://images.unsplash.com/photo-1565026057447-bc90a3dca487?q=80&w=400&auto=format&fit=crop',
            image2: 'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?q=80&w=400&auto=format&fit=crop',
            cta_category: 'All',
            bg_color: '#ff5c00'
          };

          const updatePromo = (fields: any) => {
            setHomepageConfig({
              ...homepageConfig,
              promo_banner: { ...promo, ...fields }
            });
          };

          return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-semibold text-zinc-700">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label>Badge Text</label>
                    <input
                      type="text"
                      value={promo.badge || ''}
                      onChange={(e) => updatePromo({ badge: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label>Title</label>
                    <input
                      type="text"
                      value={promo.title || ''}
                      onChange={(e) => updatePromo({ title: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label>Discount Tag</label>
                    <input
                      type="text"
                      value={promo.discount || ''}
                      onChange={(e) => updatePromo({ discount: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label>Background Color (Hex)</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={promo.bg_color || ''}
                        onChange={(e) => updatePromo({ bg_color: e.target.value })}
                        className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none"
                      />
                      <input
                        type="color"
                        value={promo.bg_color || '#ff5c00'}
                        onChange={(e) => updatePromo({ bg_color: e.target.value })}
                        className="w-10 h-10 p-0 bg-transparent border-none cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label>Description / Features List</label>
                  <input
                    type="text"
                    value={promo.description || ''}
                    onChange={(e) => updatePromo({ description: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label>CTA Redirect Category (e.g. All, Panjabi)</label>
                  <input
                    type="text"
                    value={promo.cta_category || ''}
                    onChange={(e) => updatePromo({ cta_category: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label>Left Image URL</label>
                  <input
                    type="text"
                    value={promo.image1 || ''}
                    onChange={(e) => updatePromo({ image1: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none"
                  />
                  {promo.image1 && (
                    <div className="h-16 w-24 rounded border border-gray-200 overflow-hidden mt-1.5">
                      <img src={promo.image1} className="w-full h-full object-contain bg-zinc-50" referrerPolicy="no-referrer" />
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <label>Right Image URL</label>
                  <input
                    type="text"
                    value={promo.image2 || ''}
                    onChange={(e) => updatePromo({ image2: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none"
                  />
                  {promo.image2 && (
                    <div className="h-16 w-24 rounded border border-gray-200 overflow-hidden mt-1.5">
                      <img src={promo.image2} className="w-full h-full object-contain bg-zinc-50" referrerPolicy="no-referrer" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })()}

        <div className="flex justify-end pt-3">
          <button
            type="button"
            onClick={async () => {
              const { error } = await supabase.from('settings').update({ homepage_config: homepageConfig }).eq('id', settingsId || 1);
              if (!error) {
                try {
                  const cached = JSON.parse(localStorage.getItem('rup_db_settings') || '{}');
                  cached.homepage_config = homepageConfig;
                  cached.homepageConfig = homepageConfig;
                  localStorage.setItem('rup_db_settings', JSON.stringify(cached));
                } catch (_) {}
                alert("Promo banner saved successfully!");
              } else {
                alert(`Failed to save promo banner: ${error.message}`);
              }
            }}
            className="bg-[#ff5c00] text-white text-xs font-bold uppercase tracking-wider px-6 py-3.5 rounded-xl hover:bg-orange-600 transition-all cursor-pointer shadow-md"
          >
            Save Promo Banner Configuration
          </button>
        </div>
      </div>

    </div>
  );
}
