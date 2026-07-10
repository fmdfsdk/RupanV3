import React, { useState, useEffect } from 'react';
import { Search, ShoppingBag } from 'lucide-react';
import { useStore } from '../store/useStore';
import ProductCard from '../components/ProductCard';
import { useNavigate } from 'react-router-dom';
import { productService } from '../services/productService';
import { getOptimizedImageUrl, getProductSlug } from '../utils/image';

export default function SearchPage() {
  const navigate = useNavigate();
  const PRODUCTS = useStore((state) => state.dbProducts);
  const wishlist = useStore((state) => state.wishlist);
  const toggleWishlist = useStore((state) => state.toggleWishlist);
  const addToCart = useStore((state) => state.addToCart);
  const setQuickViewProduct = useStore((state) => state.setQuickViewProduct);

  const [inputValue, setInputValue] = useState<string>('');
  const [searchPageQuery, setSearchPageQuery] = useState<string>('');
  
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState<boolean>(false);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState<boolean>(false);

  const handleBuyNow = (product: any, size: string, color: string) => {
    addToCart(product, size, color, 1);
    navigate('/checkout');
  };

  // 1. Debounce Search Query trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchPageQuery(inputValue);
    }, 300);
    return () => clearTimeout(timer);
  }, [inputValue]);

  // 2. Autocomplete suggestions fetch
  useEffect(() => {
    if (inputValue.trim().length <= 1) {
      setSuggestions([]);
      return;
    }
    setLoadingSuggestions(true);
    const timer = setTimeout(async () => {
      try {
        const results = await productService.searchProducts(inputValue, 5);
        setSuggestions(results);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingSuggestions(false);
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [inputValue]);

  // 3. Database full-text query search
  useEffect(() => {
    if (!searchPageQuery.trim()) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    const performSearch = async () => {
      try {
        const results = await productService.searchProducts(searchPageQuery, 40);
        setSearchResults(results);
      } catch (e) {
        console.error(e);
      } finally {
        setSearching(false);
      }
    };
    performSearch();
  }, [searchPageQuery]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-10 text-left animate-in fade-in duration-300">
      <div className="text-center space-y-2 max-w-lg mx-auto">
        <span className="text-xs font-bold text-[#ff5c00] uppercase tracking-widest block">Catalog Explorer</span>
        <h1 className="font-display text-3xl font-extrabold text-gray-900 uppercase">Product Search</h1>
        
        <div className="relative mt-4">
          <input
            type="text"
            placeholder="What are you looking for? (e.g. Panjabi, Polo, Couple Set)"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            className="w-full bg-white border-2 border-[#ff5c00] rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff5c00]/20"
          />
          <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />

          {/* Autocomplete Suggestions Dropdown */}
          {showSuggestions && inputValue.trim().length > 1 && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 overflow-hidden text-left divide-y divide-gray-50">
              {loadingSuggestions && (
                <div className="p-4 text-xs text-gray-400 font-semibold text-center animate-pulse">
                  Searching catalog...
                </div>
              )}
              {!loadingSuggestions && suggestions.length === 0 && (
                <div className="p-4 text-xs text-gray-400 font-semibold text-center italic">
                  No direct matches found.
                </div>
              )}
              {suggestions.map((item) => (
                <div 
                  key={item.id}
                  onClick={() => {
                    setInputValue(item.name);
                    setSearchPageQuery(item.name);
                    setShowSuggestions(false);
                    navigate(`/product/${getProductSlug(item.name, item.id)}`);
                  }}
                  className="p-3.5 flex items-center gap-3.5 hover:bg-gray-50/70 transition-all cursor-pointer"
                >
                  <img 
                    src={getOptimizedImageUrl(item.images?.[0], 100)} 
                    alt={item.name} 
                    className="w-9 h-11 object-cover rounded-md border border-gray-100"
                  />
                  <div>
                    <h5 className="font-bold text-xs text-zinc-900 leading-snug line-clamp-1">{item.name}</h5>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-[#ff5c00] font-bold uppercase tracking-wider">{item.category}</span>
                      {item.sku && (
                        <span className="text-[10px] text-gray-400 font-mono">({item.sku})</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Trending Tags */}
      <div className="flex flex-wrap items-center gap-2 justify-center max-w-xl mx-auto text-xs font-bold text-gray-500">
        <span>Trending Search:</span>
        {['Panjabi', 'Couple Collection', 'Saree', 'Overshirt', 'Cotton', 'Polo', 'Jeans'].map(tag => (
          <button
            key={tag}
            onClick={() => {
              setInputValue(tag);
              setSearchPageQuery(tag);
            }}
            className="bg-gray-100 hover:bg-[#ff5c00] hover:text-white text-gray-800 px-3 py-1.5 rounded-full transition-colors cursor-pointer"
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Search Results Area */}
      <div className="space-y-6 pt-4 border-t border-gray-100">
        {searchPageQuery ? (
          <>
            <h3 className="font-display text-base font-black text-gray-900 uppercase">
              Search Results ({searchResults.length})
            </h3>
            
            {searching ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <div key={idx} className="bg-gray-100 animate-pulse rounded-2xl h-80 w-full"></div>
                ))}
              </div>
            ) : searchResults.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
                {searchResults.map((product) => (
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
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center space-y-4 shadow-2xs max-w-md mx-auto">
                <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto" />
                <h3 className="font-sans font-bold text-base text-gray-900 uppercase">No Matches Found</h3>
                <p className="text-xs text-gray-500 max-w-xs mx-auto leading-relaxed">
                  We could not find any products matching "{searchPageQuery}". Try another keyword or explore categories below.
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="space-y-6">
            <h3 className="font-display text-base font-black text-gray-900 uppercase">
              Featured Recommendations
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
              {PRODUCTS.slice(0, 4).map((product) => (
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
          </div>
        )}
      </div>
    </div>
  );
}
