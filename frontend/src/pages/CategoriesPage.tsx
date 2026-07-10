import React from 'react';
import { useStore } from '../store/useStore';
import { useNavigate } from 'react-router-dom';

export default function CategoriesPage() {
  const navigate = useNavigate();
  const dbSettings = useStore((state) => state.dbSettings);
  const setSelectedCategory = useStore((state) => state.setSelectedCategory);

  const categories = dbSettings?.homepage_config?.featured_categories && dbSettings.homepage_config.featured_categories.length > 0
    ? dbSettings.homepage_config.featured_categories
    : [
        { name: 'Men Fashions', desc: 'Premium Royal Panjabis, thick cotton overshirts, tailored trousers, and formal wear.', icon: '👕', bg: 'from-orange-50 to-amber-50/20' },
        { name: 'Women Fashions', desc: 'High-density silk sarees, customized cotton salwar kameez sets, and elegant drops.', icon: '👗', bg: 'from-rose-50 to-pink-50/10' },
        { name: 'Couple Collection', desc: 'Perfectly coordinated matching couple outfits for special occasions and wedding festivals.', icon: '👩‍❤️‍👨', bg: 'from-purple-50 to-indigo-50/10' },
        { name: 'Kids Fashions', desc: 'Extremely soft combed organic cotton comfort drops for children and growing toddlers.', icon: '👶', bg: 'from-blue-50 to-sky-50/10' },
        { name: 'Accessories', desc: 'Classic chronometer watches, dial analogs, and smart leather everyday utility gear.', icon: '⌚', bg: 'from-gray-100 to-zinc-50' }
      ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-10 text-left animate-in fade-in duration-300">
      <div className="text-center space-y-2">
        <span className="text-xs font-bold text-[#ff5c00] uppercase tracking-widest block">Collection Map</span>
        <h1 className="font-display text-3xl font-extrabold text-gray-900 uppercase">Product Categories</h1>
        <p className="text-sm text-gray-500 max-w-sm mx-auto font-medium">
          Navigate our specialized collections of ethnic, casual, western, and smart accessory wears easily.
        </p>
      </div>

      {/* Premium bento grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat: any) => (
          <div 
            key={cat.name} 
            onClick={() => {
              setSelectedCategory(cat.name);
              navigate(`/shop?category=${encodeURIComponent(cat.name)}`);
            }}
            className={`bg-gradient-to-br ${cat.bg || 'from-gray-50 to-zinc-50'} p-8 rounded-2xl border border-gray-100 shadow-2xs hover:shadow-xs hover:border-orange-200 transition-all cursor-pointer flex flex-col justify-between min-h-[180px] group`}
          >
            <div className="space-y-2">
              <span className="text-3xl select-none">{cat.icon}</span>
              <h3 className="font-display text-lg font-black text-gray-900 uppercase group-hover:text-[#ff5c00] transition-colors">{cat.name}</h3>
              <p className="text-xs text-gray-500 leading-relaxed font-semibold">{cat.desc}</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#ff5c00] uppercase tracking-wider pt-4">
              <span>Explore Products</span>
              <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
