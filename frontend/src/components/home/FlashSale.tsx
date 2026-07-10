import React from 'react';
import { Flame } from 'lucide-react';
import ProductCard from '../ProductCard';
import { Product } from '../../types';

interface FlashSaleProps {
  products: Product[];
  secondsRemaining: number;
  setQuickViewProduct: (p: Product) => void;
  addToCart: any;
  handleBuyNow: any;
  toggleWishlist: any;
  wishlist: Product[];
}

export default function FlashSale({
  products,
  secondsRemaining,
  setQuickViewProduct,
  addToCart,
  handleBuyNow,
  toggleWishlist,
  wishlist
}: FlashSaleProps) {
  const flashSaleProducts = products.filter((p) => p.isFlashSale).slice(0, 6);

  if (flashSaleProducts.length === 0) return null;

  return (
    <section className="w-full max-w-[1750px] mx-auto px-4 sm:px-8 lg:px-12">
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-xs">
        <div className="px-6 py-5 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#ff5c00]/10 flex items-center justify-center text-[#ff5c00] animate-pulse">
              <Flame className="w-5.5 h-5.5 fill-current" />
            </div>
            <div>
              <h3 className="font-sans font-black text-lg text-gray-900 uppercase tracking-tight flex items-center gap-2">
                Flash Sale
              </h3>
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Hurry up! Limited time offers</p>
            </div>
          </div>

          {/* Countdown Clock */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 mr-1.5 hidden sm:inline">Ends In:</span>
            <div className="bg-[#1e1e1e] text-white font-mono text-sm font-black px-3 py-1.5 rounded-sm min-w-[38px] text-center shadow-xs">
              {String(Math.floor(secondsRemaining / 3600)).padStart(2, '0')}
            </div>
            <span className="text-xs font-bold text-gray-400">:</span>
            <div className="bg-[#1e1e1e] text-white font-mono text-sm font-black px-3 py-1.5 rounded-sm min-w-[38px] text-center shadow-xs">
              {String(Math.floor((secondsRemaining % 3600) / 60)).padStart(2, '0')}
            </div>
            <span className="text-xs font-bold text-gray-400">:</span>
            <div className="bg-[#1e1e1e] text-white font-mono text-sm font-black px-3 py-1.5 rounded-sm min-w-[38px] text-center shadow-xs">
              {String(secondsRemaining % 60).padStart(2, '0')}
            </div>
          </div>
        </div>

        {/* Flash Sale Grid */}
        <div className="p-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {flashSaleProducts.map((product) => (
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
    </section>
  );
}
