import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import ProductCard from '../components/ProductCard';
import { Product } from '../types';
import { productService } from '../services/productService';
import { useSEO, buildOrganizationSchema, buildWebSiteSchema } from '../hooks/useSEO';

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
  const catalogIndex = useStore((state) => state.productCatalogIndex);
  const BLOGS = useStore((state) => state.dbBlogs);
  const dbBanners = useStore((state) => state.dbBanners);
  const dbSettings = useStore((state) => state.dbSettings);
  const wishlist = useStore((state) => state.wishlist);
  const isSupabaseOnline = useStore((state) => state.isSupabaseOnline);
  
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

  // Homepage SEO — Organization + WebSite JSON-LD for Google Sitelinks
  useSEO({
    title: 'Rupan | Premium Traditional & Modern Wear in Bangladesh',
    description: "Rupan-এর কালেকশন থেকে লাক্সারি Jacquard পাঞ্জাবি, কাপল সেট এবং ওয়েস্টার্ন কালেকশন অর্ডার করুন। সারাদেশে দ্রুত ডেলিভারি।",
    canonical: '/',
    ogType: 'website',
    jsonLd: [buildOrganizationSchema(), buildWebSiteSchema()],
  });

  const heroBanners = dbBanners && dbBanners.length > 0
    ? dbBanners.map((b: any) => ({
        id: b.id,
        title: b.title || '',
        highlight: b.title || '',
        subtitle: b.subtitle || '',
        bgUrl: b.image || 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1200&auto=format&fit=crop',
        ctaText: b.cta_text || b.ctaText || '',
        category: b.category || 'All',
        overlayOpacity: b.overlay_opacity !== undefined ? Number(b.overlay_opacity) : (b.overlayOpacity !== undefined ? Number(b.overlayOpacity) : 50)
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

  // State to hold resolved featured products (fetched from DB if missing in local first-1000 PRODUCTS list)
  const [featuredProducts, setFeaturedProducts] = useState<{
    trending: Product[];
    newArrivals: Product[];
    bestSellers: Product[];
  }>({
    trending: [],
    newArrivals: [],
    bestSellers: []
  });
  const [loadingFeatured, setLoadingFeatured] = useState<boolean>(true);

  useEffect(() => {
    const resolveFeaturedProducts = async () => {
      const homeConfig = dbSettings?.homepageConfig || dbSettings?.homepage_config;
      const featuredProductIds = homeConfig?.featured_product_ids || {};
      
      const types = ['trending', 'new_arrivals', 'best_sellers'] as const;
      const resolved: Record<string, Product[]> = {
        trending: [],
        new_arrivals: [],
        best_sellers: []
      };

      // Combined search pool: local 1000 + catalog index (deduped)
      const allIndexedIds = new Set(PRODUCTS.map(p => p.id));
      const extendedPool = [...PRODUCTS, ...catalogIndex.filter(p => !allIndexedIds.has(p.id))];

      for (const type of types) {
        const ids = featuredProductIds[type] || [];
        if (ids.length === 0) continue;

        const list: Product[] = [];
        for (const id of ids) {
          const searchId = id.trim().toLowerCase();

          // Search extended pool (local + catalog index)
          const found = extendedPool.find(p => {
            const pId = String(p.id).toLowerCase();
            const pSlug = String(p.slug || '').toLowerCase();
            return pId === searchId || pSlug === searchId || pId.endsWith('-' + searchId);
          });

          if (found) {
            // If in local 1000, use directly. If only in index, fetch full from DB.
            if (allIndexedIds.has(found.id)) {
              list.push(found);
            } else if (isSupabaseOnline) {
              try {
                const full = await productService.fetchProductByIdOrSlug(found.id);
                list.push(full || found);
              } catch (_) { list.push(found); }
            } else {
              list.push(found);
            }
          } else if (isSupabaseOnline) {
            // Last resort: fetch directly from DB
            try {
              const dbProduct = await productService.fetchProductByIdOrSlug(id);
              if (dbProduct) list.push(dbProduct);
            } catch (e) {
              console.error("Error fetching featured product:", id, e);
            }
          }
        }
        resolved[type] = list;
      }

      setFeaturedProducts({
        trending: resolved.trending,
        newArrivals: resolved.new_arrivals,
        bestSellers: resolved.best_sellers
      });
      setLoadingFeatured(false);
    };

    if (PRODUCTS.length > 0) {
      resolveFeaturedProducts();
    }
  }, [dbSettings, PRODUCTS, catalogIndex, isSupabaseOnline]);

  // Helper to load customized homepage product lists
  const getHomepageProducts = (type: 'trending' | 'new_arrivals' | 'best_sellers', fallbackFilter: (p: Product) => boolean, limit = 6) => {
    const key = type === 'new_arrivals' ? 'newArrivals' : type === 'best_sellers' ? 'bestSellers' : type;
    const matches = featuredProducts[key] || [];
    if (matches.length > 0) {
      if (matches.length < limit) {
        const fill = PRODUCTS.filter(p => fallbackFilter(p) && !matches.some(m => m.id === p.id)).slice(0, limit - matches.length);
        return [...matches, ...fill];
      }
      return matches.slice(0, limit);
    }
    return PRODUCTS.filter(fallbackFilter).slice(0, limit);
  };


  const getHomepageNewArrivals = () => {
    const matches = featuredProducts.newArrivals || [];
    if (matches.length > 0) {
      if (matches.length < 18) {
        const fill = PRODUCTS.filter(p => !matches.some(m => m.id === p.id)).slice(0, 18 - matches.length);
        return [...matches, ...fill];
      }
      return matches.slice(0, 18);
    }
    return PRODUCTS.slice(0, 18);
  };

  const isDebugMode = new URLSearchParams(window.location.search).get('debug') === 'true';

  const homeConfig = dbSettings?.homepageConfig || dbSettings?.homepage_config;
  const promo = homeConfig?.promo_banner || {
    badge: 'Store Promo',
    title: 'BIG SALE',
    discount: 'UP TO 70% OFF',
    description: 'Fashion • Electronics • Beauty • Home • Grocery',
    image1: 'https://images.unsplash.com/photo-1565026057447-bc90a3dca487?q=80&w=400&auto=format&fit=crop',
    image2: 'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?q=80&w=400&auto=format&fit=crop',
    cta_category: 'All',
    bg_color: '#ff5c00'
  };

  const hConfig = dbSettings?.homepageConfig || dbSettings?.homepage_config || {};
  const sideBanner = hConfig.side_banner || {
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=400&auto=format&fit=crop',
    link: '/shop',
    button_text: 'Explore Collection',
    is_enabled: true
  };

  return (
    <div className="bg-gray-50/50 pb-16 space-y-14">
      {isDebugMode && (
        <div className="bg-red-50 p-4 border-y border-red-200 text-xs font-mono text-red-800 text-left max-w-6xl mx-auto rounded-xl space-y-1.5 shadow-xs">
          <div className="font-bold text-sm text-red-900 border-b border-red-100 pb-1.5 mb-1.5 uppercase">Homepage Debug Diagnostics</div>
          <div>dbSettings loaded: {dbSettings ? 'YES' : 'NO'}</div>
          <div>dbSettings ID: {dbSettings?.id || 'N/A'}</div>
          <div>dbSettings.homepageConfig: {dbSettings?.homepageConfig ? 'YES' : 'NO'}</div>
          <div>dbSettings.homepage_config: {dbSettings?.homepage_config ? 'YES' : 'NO'}</div>
          <div>Trending ID List: {JSON.stringify((dbSettings?.homepageConfig || dbSettings?.homepage_config)?.featured_product_ids?.trending || [])}</div>
          <div>New Arrivals ID List: {JSON.stringify((dbSettings?.homepageConfig || dbSettings?.homepage_config)?.featured_product_ids?.new_arrivals || [])}</div>
          <div>PRODUCTS in store: {PRODUCTS.length}</div>
          <div>Trending Matches in State: {featuredProducts.trending.length} (Expected: {(dbSettings?.homepageConfig || dbSettings?.homepage_config)?.featured_product_ids?.trending?.length || 0})</div>
          <div>New Arrivals Matches in State: {featuredProducts.newArrivals.length}</div>
          <div>Best Sellers Matches in State: {featuredProducts.bestSellers.length}</div>
          <div className="text-[10px] text-gray-400 mt-1 border-t border-red-100 pt-1.5">First 5 Products in Store: {JSON.stringify(PRODUCTS.slice(0, 5).map(p => ({ id: p.id, name: p.name })))}</div>
        </div>
      )}

      {/* 1. Split Hero Banner & Carousel */}
      <HeroCarousel 
        heroBanners={heroBanners}
        heroSlide={heroSlide}
        setHeroSlide={setHeroSlide}
        setSelectedCategory={setSelectedCategory}
        navigate={navigate}
        sideBanner={sideBanner}
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
        <div 
          className="rounded-2xl overflow-hidden shadow-md p-6 md:p-8 flex flex-col md:flex-row items-center justify-between text-white relative"
          style={{ backgroundColor: promo.bg_color || '#ff5c00' }}
        >
          <div className="absolute inset-0 bg-black/5 mix-blend-multiply pointer-events-none" />
          {promo.image1 && (
            <div className="hidden md:block w-1/4 max-w-[170px] pointer-events-none">
              <img src={promo.image1} alt="Promo Left" className="w-full object-contain" referrerPolicy="no-referrer" />
            </div>
          )}

          <div className="flex-1 text-center space-y-3.5 px-4 relative z-10">
            {promo.badge && <span className="text-[10px] font-black uppercase tracking-widest bg-white/25 px-3.5 py-1 rounded-full">{promo.badge}</span>}
            <h2 className="font-sans font-black text-3xl md:text-5xl uppercase tracking-tighter leading-none">{promo.title}</h2>
            {promo.discount && (
              <div className="inline-block bg-black text-white text-[11px] font-black px-4.5 py-1.5 rounded-full tracking-wide">
                {promo.discount}
              </div>
            )}
            <p className="text-[10px] sm:text-xs font-bold text-white/90 tracking-wide uppercase">
              {promo.description}
            </p>
            <button 
              onClick={() => { setSelectedCategory(promo.cta_category || 'All'); navigate(`/shop?category=${encodeURIComponent(promo.cta_category || 'All')}`); }} 
              className="bg-white hover:bg-gray-100 font-extrabold text-xs px-8 py-3 rounded-full uppercase tracking-wider transition-all cursor-pointer shadow-sm active:scale-95"
              style={{ color: promo.bg_color || '#ff5c00' }}
            >
              SHOP NOW
            </button>
          </div>

          {promo.image2 && (
            <div className="hidden md:block w-1/4 max-w-[170px] pointer-events-none">
              <img src={promo.image2} alt="Promo Right" className="w-full object-contain" referrerPolicy="no-referrer" />
            </div>
          )}
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
