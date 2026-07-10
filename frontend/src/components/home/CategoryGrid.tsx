import React from 'react';

interface CategoryGridProps {
  setSelectedCategory: (cat: string) => void;
  setSelectedGender: (gender: string) => void;
  navigate: (path: string) => void;
}

export default function CategoryGrid({
  setSelectedCategory,
  setSelectedGender,
  navigate
}: CategoryGridProps) {
  const categoriesList = [
    { name: 'Women Fashions', image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=150&auto=format&fit=crop' },
    { name: 'Watches', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=150&auto=format&fit=crop' },
    { name: 'Toys Products', image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?q=80&w=150&auto=format&fit=crop' },
    { name: 'Shoes', image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=150&auto=format&fit=crop' },
    { name: 'Power Sanders', image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?q=80&w=150&auto=format&fit=crop' },
    { name: 'Men Fashions', image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=150&auto=format&fit=crop' },
    { name: 'Shirts & Polos', image: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=150&auto=format&fit=crop' },
    { name: 'Kitchen Items', image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=150&auto=format&fit=crop' },
    { name: 'Home & Living', image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=150&auto=format&fit=crop' },
    { name: 'Health Care', image: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?q=80&w=150&auto=format&fit=crop' },
    { name: 'Grocery', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=150&auto=format&fit=crop' },
    { name: 'Fitness', image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=150&auto=format&fit=crop' },
    { name: 'Electronics', image: 'https://images.unsplash.com/photo-1588508065123-287b28e013da?q=80&w=150&auto=format&fit=crop' },
    { name: 'Beauty', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=150&auto=format&fit=crop' },
    { name: 'Baby & Kids', image: 'https://images.unsplash.com/photo-1515488042361-404e9250afef?q=80&w=150&auto=format&fit=crop' },
    { name: 'Accessories', image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=150&auto=format&fit=crop' }
  ];

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

      {/* Grid of 16 categories */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
        {categoriesList.map((cat) => (
          <button
            key={cat.name}
            onClick={() => {
              setSelectedCategory(cat.name);
              setSelectedGender('All');
              navigate('/shop');
            }}
            className="group bg-white border border-gray-100 rounded-xl p-3 flex flex-col items-center justify-center text-center shadow-2xs hover:shadow-md transition-all duration-300 cursor-pointer animate-in fade-in"
          >
            <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-50 border border-gray-100 flex items-center justify-center">
              <img 
                src={cat.image} 
                alt={cat.name} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                referrerPolicy="no-referrer" 
              />
            </div>
            <span className="text-[11px] font-extrabold text-gray-800 group-hover:text-[#ff5c00] transition-colors mt-2.5 line-clamp-1 uppercase tracking-tight">
              {cat.name}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
