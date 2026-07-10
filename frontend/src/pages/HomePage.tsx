import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import ProductCard from '../components/ProductCard';
import { Product } from '../types';

// Decomposed Sub-components
import HeroCarousel from '../components/home/HeroCarousel';
import CategoryGrid from '../components/home/CategoryGrid';
import FlashSale from '../components/home/FlashSale';
import ValueProps from '../components/home/ValueProps';
import BlogPreview from '../components/home/BlogPreview';

export default function HomePage() {
  const navigate = useNavigate();
  
  // Load store states and actions
  const PRODUCTS = useStore((state) => state.dbProducts);
  const BLOGS = useStore((state) => state.dbBlogs);
  const dbBanners = useStore((state) => state.dbBanners);
  const dbSettings = useStore((state) => state.dbSettings);
  const wishlist = useStore((state) => state.wishlist);
  
  const toggleWishlist = useStore((state) => state.toggleWishlist);
  const addToCart = useStore((state) => state.addToCart);
  const setQuickViewProduct = useStore((state) => state.setQuickViewProduct);
  const setSelectedCategory = useStore((state) => state.setSelectedCategory);
  const setSelectedGender = useStore((state) => state.setSelectedGender);

  // Local Page States
  const [heroSlide, setHeroSlide] = useState(0);
  const [secondsRemaining, setSecondsRemaining] = useState(86327); // 23h 58m 27s

  const handleBuyNow = (product: any, size: string, color: string) => {
    addToCart(product, size, color, 1);
    navigate('/checkout');
  };

  // Set Homepage SEO Meta Tags
  useEffect(() => {
    document.title = 'Rupan | Premium Traditional & Modern Wear in Bangladesh';
    
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', "Explore Rupan's collections of luxury Jacquard Panjabis, Couple Sets, and Western Wear. Fast shipping within Bangladesh.");

    const updateOGTag = (property: string, content: string) => {
      let tag = document.querySelector(`meta[property="${property}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('property', property);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };

    updateOGTag('og:title', 'Rupan | Premium Traditional & Modern Wear');
    updateOGTag('og:description', "Explore Rupan's collections of luxury Jacquard Panjabis, Couple Sets, and Western Wear.");
    updateOGTag('og:image', 'https://myrupan.com/assets/Rupan%20Logo%20Final.png');
    updateOGTag('og:type', 'website');
  }, []);

  const heroBanners = dbBanners && dbBanners.length > 0
    ? dbBanners.map((b: any) => ({
        title: b.title || 'EXCLUSIVE',
        highlight: b.title || '',
        subtitle: b.subtitle || '',
        bgUrl: b.image || 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1200&auto=format&fit=crop',
        ctaText: 'SHOP NOW',
        category: b.category || 'All'
      }))
    : [
        {
          title: 'FESTIVAL COLLECTION',
          highlight: 'Royal Jacquard Panjabi',
          subtitle: 'Style That Speaks Traditional Luxury',
          bgUrl: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1200&auto=format&fit=crop',
          ctaText: 'Shop Panjabi Collection',
          category: 'Panjabi'
        },
        {
          title: 'EXCLUSIVE COORDINATED MATCHING SETS',
          highlight: 'Crimson Love Couple Sets',
          subtitle: 'Synchronized Elegance For Special Celebrations',
          bgUrl: 'https://images.unsplash.com/photo-1614975058789-41316d0e2e9c?q=80&w=1200&auto=format&fit=crop',
          ctaText: 'Shop Couple Collection',
          category: 'Couple Collection'
        },
        {
          title: 'MODERN COTTON ESSENTIALS',
          highlight: 'Premium Combed Cotton T-Shirts',
          subtitle: 'Ultra-Soft, High-Strength 180 GSM Fabric',
          bgUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1200&auto=format&fit=crop',
          ctaText: 'Shop Western Collections',
          category: 'T-Shirts'
        }
      ];

  // Auto sliding carousel effect
  useEffect(() => {
    const timer = setInterval(() => {
      setHeroSlide((prev) => (prev + 1) % heroBanners.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [heroBanners.length]);

  // Countdown timer effect
  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 86399));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Helper to load customized homepage product lists
  const getHomepageProducts = (type: 'trending' | 'new_arrivals' | 'best_sellers', fallbackFilter: (p: Product) => boolean, limit = 6) => {
    const configIds = dbSettings?.homepage_config?.featured_product_ids?.[type] || [];
    if (configIds.length > 0) {
      const matches = configIds
        .map((id: string) => PRODUCTS.find(p => p.id === id || p.slug === id))
        .filter(Boolean) as Product[];
      if (matches.length > 0) {
        if (matches.length < limit) {
          const fill = PRODUCTS.filter(p => fallbackFilter(p) && !matches.some(m => m.id === p.id)).slice(0, limit - matches.length);
          return [...matches, ...fill];
        }
        return matches.slice(0, limit);
      }
    }
    return PRODUCTS.filter(fallbackFilter).slice(0, limit);
  };

  const getHomepageNewArrivals = () => {
    const configIds = dbSettings?.homepage_config?.featured_product_ids?.new_arrivals || [];
    if (configIds.length > 0) {
      const matches = configIds
        .map((id: string) => PRODUCTS.find(p => p.id === id || p.slug === id))
        .filter(Boolean) as Product[];
      if (matches.length > 0) {
        if (matches.length < 18) {
          const fill = PRODUCTS.filter(p => !matches.some(m => m.id === p.id)).slice(0, 18 - matches.length);
          return [...matches, ...fill];
        }
        return matches.slice(0, 18);
      }
    }
    return PRODUCTS.slice(0, 18);
  };

  return (
    <div className="bg-gray-50/50 pb-16 space-y-14">
      {/* 1. Split Hero Banner & Carousel */}
      <HeroCarousel 
        heroBanners={heroBanners}
        heroSlide={heroSlide}
        setHeroSlide={setHeroSlide}
        setSelectedCategory={setSelectedCategory}
        navigate={navigate}
      />

      {/* 2. Product Categories Section */}
      <CategoryGrid 
        setSelectedCategory={setSelectedCategory}
        setSelectedGender={setSelectedGender}
        navigate={navigate}
      />

      {/* 3. Flash Sale Section */}
      <FlashSale 
        products={PRODUCTS}
        secondsRemaining={secondsRemaining}
        setQuickViewProduct={setQuickViewProduct}
        addToCart={addToCart}
        handleBuyNow={handleBuyNow}
        toggleWishlist={toggleWishlist}
        wishlist={wishlist}
      />

      {/* Big Sale Promo */}
      <section className="w-full max-w-[1750px] mx-auto px-4 sm:px-8 lg:px-12">
        <div className="bg-[#ff5c00] rounded-2xl overflow-hidden shadow-md p-6 md:p-8 flex flex-col md:flex-row items-center justify-between text-white relative">
          <div className="absolute inset-0 bg-black/5 mix-blend-multiply pointer-events-none" />
          <div className="hidden md:block w-1/4 max-w-[170px] pointer-events-none">
            <img src="https://images.unsplash.com/photo-1565026057447-bc90a3dca487?q=80&w=400&auto=format&fit=crop" alt="Bag Luggage Combo" className="w-full object-contain" referrerPolicy="no-referrer" />
          </div>

          <div className="flex-1 text-center space-y-3.5 px-4 relative z-10">
            <span className="text-[10px] font-black uppercase tracking-widest bg-white/25 px-3.5 py-1 rounded-full">Store Promo</span>
            <h2 className="font-sans font-black text-3xl md:text-5xl uppercase tracking-tighter leading-none">BIG SALE</h2>
            <div className="inline-block bg-black text-white text-[11px] font-black px-4.5 py-1.5 rounded-full tracking-wide">
              UP TO 70% OFF
            </div>
            <p className="text-[10px] sm:text-xs font-bold text-white/90 tracking-wide uppercase">
              Fashion • Electronics • Beauty • Home • Grocery
            </p>
            <button 
              onClick={() => { setSelectedCategory('All'); navigate('/shop'); }} 
              className="bg-white text-[#ff5c00] hover:bg-gray-100 font-extrabold text-xs px-8 py-3 rounded-full uppercase tracking-wider transition-all cursor-pointer shadow-sm active:scale-95"
            >
              SHOP NOW
            </button>
          </div>

          <div className="hidden md:block w-1/4 max-w-[170px] pointer-events-none">
            <img src="https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?q=80&w=400&auto=format&fit=crop" alt="Home Blender Appliances" className="w-full object-contain" referrerPolicy="no-referrer" />
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="w-full max-w-[1750px] mx-auto px-4 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between mb-8 pb-3 border-b border-gray-100">
          <h2 className="font-sans text-xl sm:text-2xl font-black text-gray-900 uppercase tracking-tight">
            Featured Products
          </h2>
          <button 
            onClick={() => { setSelectedCategory('New Arrivals'); navigate('/shop'); }}
            className="bg-black text-white hover:bg-gray-800 text-[11px] font-bold px-4 py-2 rounded-full uppercase tracking-wider transition-colors cursor-pointer"
          >
            View All
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {getHomepageProducts('trending', (p) => p.isFeatured, 6).map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onQuickView={(p) => setQuickViewProduct(p)}
              onAddToCart={addToCart}
              onBuyNow={handleBuyNow}
              onToggleWishlist={toggleWishlist}
              isWishlisted={wishlist.some((w) => w.id === product.id)}
            />
          ))}
        </div>
      </section>

      {/* Recent Products */}
      <section className="w-full max-w-[1750px] mx-auto px-4 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between mb-8 pb-3 border-b border-gray-100">
          <h2 className="font-sans text-xl sm:text-2xl font-black text-gray-900 uppercase tracking-tight">
            Recent Products
          </h2>
          <button 
            onClick={() => { setSelectedCategory('All'); navigate('/shop'); }}
            className="bg-black text-white hover:bg-gray-800 text-[11px] font-bold px-4 py-2 rounded-full uppercase tracking-wider transition-colors cursor-pointer"
          >
            View All
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {getHomepageNewArrivals().map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onQuickView={(p) => setQuickViewProduct(p)}
              onAddToCart={addToCart}
              onBuyNow={handleBuyNow}
              onToggleWishlist={toggleWishlist}
              isWishlisted={wishlist.some((w) => w.id === product.id)}
            />
          ))}
        </div>
      </section>

      {/* Most Selling Products */}
      <section className="w-full max-w-[1750px] mx-auto px-4 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between mb-8 pb-3 border-b border-gray-100">
          <h2 className="font-sans text-xl sm:text-2xl font-black text-gray-900 uppercase tracking-tight">
            Most Selling Products
          </h2>
          <button 
            onClick={() => { setSelectedCategory('Best Sellers'); navigate('/shop'); }}
            className="bg-black text-white hover:bg-gray-800 text-[11px] font-bold px-4 py-2 rounded-full uppercase tracking-wider transition-colors cursor-pointer"
          >
            View All
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {getHomepageProducts('best_sellers', (p) => p.isBestSeller, 6).map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onQuickView={(p) => setQuickViewProduct(p)}
              onAddToCart={addToCart}
              onBuyNow={handleBuyNow}
              onToggleWishlist={toggleWishlist}
              isWishlisted={wishlist.some((w) => w.id === product.id)}
            />
          ))}
        </div>
      </section>

      {/* 4. Value Props */}
      <ValueProps />

      {/* 5. Blogs & News Section */}
      <BlogPreview 
        blogs={BLOGS}
        navigate={navigate}
      />
    </div>
  );
}
