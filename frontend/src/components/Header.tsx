/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Search, Menu, X, Heart, User, Sparkles, HelpCircle, Flame, Grid, MapPin, BookOpen } from 'lucide-react';
import { productService } from '../services/productService';

interface HeaderProps {
  activePage: string;
  onPageChange: (page: string) => void;
  cartCount: number;
  cartTotal: number;
  wishlistCount: number;
  onOpenSearch: () => void;
  currentUser: any;
}

export default function Header({
  activePage,
  onPageChange,
  cartCount,
  cartTotal,
  wishlistCount,
  onOpenSearch,
  currentUser
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState('');
  const [scrolled, setScrolled] = useState(false);
  
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigate = useNavigate();

  // Fetch search suggestions
  useEffect(() => {
    if (localSearch.trim().length <= 1) {
      setSuggestions([]);
      return;
    }
    setLoadingSuggestions(true);
    const timer = setTimeout(async () => {
      try {
        const results = await productService.searchProducts(localSearch, 5);
        setSuggestions(results);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingSuggestions(false);
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [localSearch]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (localSearch.trim()) {
      setShowSuggestions(false);
      navigate(`/shop?search=${encodeURIComponent(localSearch.trim())}`);
    }
  };

  return (
    <>
      {/* Top bar (Darker Orange-Red) - Scrolls naturally out of view */}
      <div className="bg-[#cc4a00] text-white text-[11px] font-medium py-2.5 px-4 md:px-12">
        <div className="w-full max-w-[1750px] mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex items-center gap-1.5 uppercase tracking-wider">
            <span className="text-sm">🚚</span>
            <span>FREE SHIPPING FOR ALL ORDERS OF 6500TK</span>
          </div>
          <div className="flex items-center gap-4 text-[10px] uppercase tracking-wider opacity-90">
            <button onClick={() => onPageChange('newsletter')} className="hover:underline cursor-pointer">Newsletter</button>
            <span>|</span>
            <button onClick={() => onPageChange('track-order')} className="hover:underline cursor-pointer">Track Order</button>
            <span>|</span>
            <button onClick={() => onPageChange('account')} className="hover:underline cursor-pointer">
              {currentUser ? `HELLO, ${currentUser.username.toUpperCase()}` : 'Login/Register'}
            </button>
            <span>|</span>
            <button onClick={() => onPageChange('faq')} className="hover:underline cursor-pointer">Help & Support</button>
            <span>|</span>
            <button onClick={() => onPageChange('faq')} className="hover:underline cursor-pointer">FAQs</button>
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-40 w-full shadow-md font-sans">
        {/* Main Header (Bright Orange-Red) - Shrinks on scroll */}
      <div className={`bg-[#ff5c00] text-white transition-all duration-300 ${scrolled ? 'py-2 px-4 md:px-12' : 'py-3.5 px-4 md:px-12'}`}>
        <div className="w-full max-w-[1750px] mx-auto flex items-center justify-between gap-4">
          
          {/* Logo */}
          <div className="flex items-center gap-3">
            {/* Mobile menu toggle */}
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-1.5 text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div 
              onClick={() => onPageChange('home')}
              className="flex items-center cursor-pointer select-none border-2 border-white bg-white/10 rounded-lg p-1.5 px-3 max-h-[50px] md:max-h-[60px] transition-all hover:bg-white/20 shadow-sm"
            >
              <img 
                src="/assets/Rupan Logo Final.png" 
                alt="Rupan" 
                width={200}
                height={200}
                className="h-8 md:h-10 w-auto object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>

          {/* Search Bar */}
          <div className="hidden md:block flex-1 max-w-2xl relative">
            <form 
              onSubmit={handleSearchSubmit}
              className="flex items-center w-full bg-white rounded-md overflow-hidden shadow-inner"
            >
              <input 
                type="text"
                placeholder="Search for Products..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                className="flex-1 px-4 py-2.5 text-sm text-gray-800 outline-none placeholder-gray-400"
              />
              <button 
                type="submit"
                className="bg-[#ff5c00] hover:bg-[#e04f00] text-white px-5 py-2.5 transition-colors cursor-pointer flex items-center justify-center border-l border-gray-100"
              >
                <Search className="w-4.5 h-4.5" />
              </button>
            </form>

            {/* Header Suggestions Dropdown */}
            {showSuggestions && localSearch.trim().length > 1 && (
              <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-gray-100 rounded-lg shadow-xl z-50 overflow-hidden text-left divide-y divide-gray-50 max-h-[360px] overflow-y-auto">
                {loadingSuggestions && (
                  <div className="p-3 text-xs text-gray-400 font-semibold text-center animate-pulse">
                    Searching catalog...
                  </div>
                )}
                {!loadingSuggestions && suggestions.length === 0 && (
                  <div className="p-3 text-xs text-gray-400 font-semibold text-center italic">
                    No matching products found.
                  </div>
                )}
                {suggestions.map((item) => (
                  <div 
                    key={item.id}
                    onClick={() => {
                      setLocalSearch('');
                      setShowSuggestions(false);
                      navigate(`/product/${item.slug || item.id}`);
                    }}
                    className="p-3 flex items-center gap-3.5 hover:bg-gray-50/70 transition-all cursor-pointer"
                  >
                    <img 
                      src={item.images?.[0] || 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80&w=100'} 
                      alt={item.name} 
                      className="w-8 h-10 object-cover rounded border border-gray-100 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h5 className="font-bold text-xs text-gray-900 leading-snug truncate">{item.name}</h5>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-[#ff5c00] font-bold uppercase tracking-wider">{item.category}</span>
                        <span className="text-[10px] text-gray-400 font-semibold">{item.discount_price ? item.discount_price : item.price}৳</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Action Widgets */}
          <div className="flex items-center gap-4">
            {/* Search trigger on mobile */}
            <button 
              onClick={onOpenSearch}
              className="md:hidden p-2 text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
            >
              <Search className="w-5.5 h-5.5" />
            </button>

            {/* Wishlist */}
            <button 
              onClick={() => onPageChange('wishlist')}
              className="p-2 text-white hover:bg-white/10 rounded-full transition-colors relative cursor-pointer flex items-center gap-1.5"
              title="Wishlist"
            >
              <Heart className="w-5.5 h-5.5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-white text-[#ff5c00] font-mono text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center shadow-md">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Admin Panel Link */}
            <button 
              onClick={() => onPageChange('admin')}
              className="hidden sm:flex p-2 text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer items-center gap-1.5"
              title="Admin Panel"
            >
              <User className="w-5.5 h-5.5" />
            </button>

            {/* Cart Bag with "0b" text next to it exactly as in image */}
            <button 
              onClick={() => onPageChange('cart')}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
              title="Shopping Cart"
            >
              <div className="relative">
                <ShoppingCart className="w-6 h-6 text-white" />
                <span className="absolute -top-1.5 -right-1.5 bg-white text-[#ff5c00] font-mono text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center shadow-md">
                  {cartCount}
                </span>
              </div>
              <span className="text-sm font-bold ml-1 text-white flex items-center">
                {cartTotal.toLocaleString('en-IN')}৳
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Sub-navigation Menu Bar - Shrinks on scroll */}
      <div className="hidden md:block bg-white border-b border-gray-100 shadow-sm transition-all duration-300">
        <div className={`w-full max-w-[1750px] mx-auto px-4 md:px-12 transition-all duration-300 flex items-center justify-between ${scrolled ? 'py-2' : 'py-3'}`}>
          <nav className="flex items-center gap-8 text-xs font-black text-gray-700 tracking-wider">
            <button 
              onClick={() => onPageChange('home')}
              className={`hover:text-[#ff5c00] cursor-pointer transition-colors uppercase ${activePage === 'home' ? 'text-[#ff5c00]' : ''}`}
            >
              HOME
            </button>
            <button 
              onClick={() => onPageChange('shop')}
              className={`hover:text-[#ff5c00] cursor-pointer transition-colors uppercase ${activePage === 'shop' ? 'text-[#ff5c00]' : ''}`}
            >
              SHOP ALL
            </button>
            <button 
              onClick={() => onPageChange('offer')}
              className={`hover:text-[#ff5c00] cursor-pointer transition-colors uppercase ${activePage === 'offers' ? 'text-[#ff5c00]' : ''}`}
            >
              FLASH DEALS
            </button>
            <button 
              onClick={() => onPageChange('blog')}
              className={`hover:text-[#ff5c00] cursor-pointer transition-colors uppercase ${activePage === 'blog' || activePage === 'blog-detail' ? 'text-[#ff5c00]' : ''}`}
            >
              BLOGS
            </button>
            <button 
              onClick={() => onPageChange('track-order')}
              className={`hover:text-[#ff5c00] cursor-pointer transition-colors uppercase ${activePage === 'track-order' ? 'text-[#ff5c00]' : ''}`}
            >
              TRACK ORDER
            </button>
            <button 
              onClick={() => onPageChange('faq')}
              className={`hover:text-[#ff5c00] cursor-pointer transition-colors uppercase ${activePage === 'faq' ? 'text-[#ff5c00]' : ''}`}
            >
              FAQ & HELP
            </button>
          </nav>

          {/* Hotline on the right */}
          <div className="flex items-center gap-1.5 text-xs font-black text-gray-800 tracking-wider">
            <span className="text-[#ff5c00] text-sm">📞</span>
            <span>HOTLINE: <span className="text-[#ff5c00] font-extrabold">09678 123 456</span></span>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
          />
          <div className="relative flex flex-col w-full max-w-xs bg-white h-full shadow-2xl p-6 animate-in slide-in-from-left duration-300 text-gray-800">
            <div className="flex items-center justify-between pb-6 border-b border-gray-100">
              <div 
                onClick={() => { onPageChange('home'); setMobileMenuOpen(false); }}
                className="flex items-center cursor-pointer select-none border-2 border-[#ff5c00] bg-[#ff5c00]/5 rounded-lg p-1 px-2.5 max-h-[45px] transition-all hover:bg-[#ff5c00]/10 shadow-xs"
              >
                <img 
                  src="/assets/Rupan Logo Final.png" 
                  alt="Rupan" 
                  width={200}
                  height={200}
                  className="h-7 w-auto object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-6 space-y-4">
              <button
                onClick={() => { onPageChange('home'); setMobileMenuOpen(false); }}
                className={`flex items-center gap-3 w-full text-left py-2 px-3 rounded-lg font-bold text-sm ${activePage === 'home' ? 'bg-[#ff5c00]/10 text-[#ff5c00]' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                Home
              </button>
              <button
                onClick={() => { onPageChange('shop'); setMobileMenuOpen(false); }}
                className={`flex items-center gap-3 w-full text-left py-2 px-3 rounded-lg font-bold text-sm ${activePage === 'shop' ? 'bg-[#ff5c00]/10 text-[#ff5c00]' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                Shop All Products
              </button>
              <button
                onClick={() => { onPageChange('wishlist'); setMobileMenuOpen(false); }}
                className={`flex items-center gap-3 w-full text-left py-2 px-3 rounded-lg font-bold text-sm ${activePage === 'wishlist' ? 'bg-[#ff5c00]/10 text-[#ff5c00]' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                Wishlist
              </button>
              <button
                onClick={() => { onPageChange('cart'); setMobileMenuOpen(false); }}
                className={`flex items-center gap-3 w-full text-left py-2 px-3 rounded-lg font-bold text-sm ${activePage === 'cart' ? 'bg-[#ff5c00]/10 text-[#ff5c00]' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                Cart Bag
              </button>
              <button
                onClick={() => { onPageChange('track-order'); setMobileMenuOpen(false); }}
                className={`flex items-center gap-3 w-full text-left py-2 px-3 rounded-lg font-bold text-sm ${activePage === 'track-order' ? 'bg-[#ff5c00]/10 text-[#ff5c00]' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                Track Order
              </button>
              <button
                onClick={() => { onPageChange('admin'); setMobileMenuOpen(false); }}
                className={`flex items-center gap-3 w-full text-left py-2 px-3 rounded-lg font-bold text-sm ${activePage === 'admin' ? 'bg-[#ff5c00]/10 text-[#ff5c00]' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                Admin Control
              </button>
            </div>

            <div className="pt-6 border-t border-gray-100 text-xs text-gray-500 space-y-1">
              <p>📍 Shop Mart Bangladesh Ltd.</p>
              <p>📞 Phone: 09678 123 456</p>
              <p>✉️ Email: support@doraz.com.bd</p>
            </div>
          </div>
        </div>
      )}
    </header>
    </>
  );
}
