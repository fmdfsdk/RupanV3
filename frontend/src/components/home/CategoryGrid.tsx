import React from 'react';
import { useStore } from '../../store/useStore';

interface CategoryGridProps {
  setSelectedCategory: (cat: string) => void;
  setSelectedGender: (gender: string) => void;
  navigate: (path: string) => void;
}

const mapCategoryToDbIdFallback = (name: string): string => {
  const mapping: { [key: string]: string } = {
    'Women Fashions': "women's fashion",
    'Watches': 'watch',
    'Toys Products': 'kids zone',
    'Shoes': "men's fashion",
    'Power Sanders': 'gadgets & electronics',
    'Men Fashions': "men's fashion",
    'Shirts & Polos': "men's fashion",
    'Kitchen Items': 'home & lifestyle',
    'Home & Living': 'home & lifestyle',
    'Health Care': 'beauty',
    'Grocery': 'foods',
    'Fitness': 'fitness',
    'Electronics': 'gadgets & electronics',
    'Beauty': 'beauty',
    'Baby & Kids': 'kids zone',
    'Accessories': 'watch'
  };
  return mapping[name] || name.toLowerCase();
};

export default function CategoryGrid({
  setSelectedCategory,
  setSelectedGender,
  navigate
}: CategoryGridProps) {
  const dbSettings = useStore((state) => state.dbSettings);
  const homeConfig = dbSettings?.homepageConfig || dbSettings?.homepage_config;
  
  const defaultCategoriesList = [
    { name: 'Women Fashions', image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=150&auto=format&fit=crop', mappedId: "women's fashion" },
    { name: 'Watches', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=150&auto=format&fit=crop', mappedId: 'watch' },
    { name: 'Toys Products', image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?q=80&w=150&auto=format&fit=crop', mappedId: 'kids zone' },
    { name: 'Shoes', image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=150&auto=format&fit=crop', mappedId: "men's fashion" },
    { name: 'Power Sanders', image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?q=80&w=150&auto=format&fit=crop', mappedId: 'gadgets & electronics' },
    { name: 'Men Fashions', image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=150&auto=format&fit=crop', mappedId: "men's fashion" },
    { name: 'Shirts & Polos', image: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=150&auto=format&fit=crop', mappedId: "men's fashion" },
    { name: 'Kitchen Items', image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=150&auto=format&fit=crop', mappedId: 'home & lifestyle' },
    { name: 'Home & Living', image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=150&auto=format&fit=crop', mappedId: 'home & lifestyle' },
    { name: 'Health Care', image: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?q=80&w=150&auto=format&fit=crop', mappedId: 'beauty' },
    { name: 'Grocery', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=150&auto=format&fit=crop', mappedId: 'foods' },
    { name: 'Fitness', image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=150&auto=format&fit=crop', mappedId: 'fitness' },
    { name: 'Electronics', image: 'https://images.unsplash.com/photo-1588508065123-287b28e013da?q=80&w=150&auto=format&fit=crop', mappedId: 'gadgets & electronics' },
    { name: 'Beauty', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=150&auto=format&fit=crop', mappedId: 'beauty' },
    { name: 'Baby & Kids', image: 'https://images.unsplash.com/photo-1515488042361-404e9250afef?q=80&w=150&auto=format&fit=crop', mappedId: 'kids zone' },
    { name: 'Accessories', image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=150&auto=format&fit=crop', mappedId: 'watch' }
  ];

  const categoriesList = homeConfig?.homepage_categories && homeConfig.homepage_categories.length > 0
    ? homeConfig.homepage_categories
    : defaultCategoriesList;

  const isSquare = homeConfig?.category_style === 'square';

  return (
    <section className="w-full max-w-[1750px] mx-auto px-4 sm:px-8 lg:px-12">
      <div className="flex items-center justify-between mb-8 pb-3 border-b border-gray-100">
        <h2 className="font-sans text-xl sm:text-2xl font-black text-gray-900 uppercase tracking-tight">
          Product Categories
        </h2>
        <button 
          onClick={() => { setSelectedCategory('All'); navigate('/shop'); }}
          className="bg-black text-white hover:bg-gray-800 text-[11px] font-bold px-4 py-2 rounded-full uppercase tracking-wider transition-colors cursor-pointer"
        >
          View All
        </button>
      </div>

      {/* Grid of WooCommerce-style circular categories */}
      <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-x-3 gap-y-6">
        {categoriesList.map((cat: any) => (
          <button
            key={cat.name}
            onClick={() => {
              const mappedId = cat.mappedId || mapCategoryToDbIdFallback(cat.name);
              setSelectedCategory(mappedId);
              setSelectedGender('All');
              navigate(`/shop?category=${encodeURIComponent(mappedId)}`);
            }}
            className="group flex flex-col items-center justify-center text-center cursor-pointer border-0 bg-transparent p-0 transition-all select-none"
          >
            {/* Circular or Square bubble container */}
            <div className={`w-16 h-16 sm:w-20 sm:h-20 border border-gray-200/80 shadow-2xs group-hover:border-[#ff5c00] group-hover:shadow-md transition-all duration-300 overflow-hidden flex items-center justify-center bg-white ${
              isSquare ? 'rounded-2xl' : 'rounded-full'
            }`}>
              <img 
                src={cat.image} 
                alt={cat.name} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                referrerPolicy="no-referrer" 
              />
            </div>
            {/* Label name */}
            <span className="text-[10px] sm:text-[11px] font-bold text-gray-700 group-hover:text-[#ff5c00] transition-colors mt-3 uppercase tracking-tight leading-snug max-w-[90px] line-clamp-2">
              {cat.name}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
