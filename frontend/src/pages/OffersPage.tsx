import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import ProductCard from '../components/ProductCard';
import { useNavigate } from 'react-router-dom';

export default function OffersPage() {
  const navigate = useNavigate();
  const PRODUCTS = useStore((state) => state.dbProducts);
  const wishlist = useStore((state) => state.wishlist);
  const toggleWishlist = useStore((state) => state.toggleWishlist);
  const addToCart = useStore((state) => state.addToCart);
  const setQuickViewProduct = useStore((state) => state.setQuickViewProduct);

  const [copiedCoupon, setCopiedCoupon] = useState<string | null>(null);

  const handleBuyNow = (product: any, size: string, color: string) => {
    addToCart(product, size, color, 1);
    navigate('/checkout');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-12 text-left animate-in fade-in duration-300">
      <div className="text-center space-y-2">
        <span className="text-xs font-bold text-[#ff5c00] uppercase tracking-widest block">Save More Today</span>
        <h1 className="font-display text-3xl font-extrabold text-gray-900 uppercase">Deals & Coupons</h1>
        <p className="text-sm text-gray-500 max-w-sm mx-auto font-medium">
          Copy discount promo codes below and apply them during the checkout process for extra savings!
        </p>
      </div>

      {/* Promo Codes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { code: 'EID20', title: 'Flat ৳200 Discount', desc: 'Valid on ordering above ৳1,500. Perfect for Eid outfits and Panjabi sets.', badge: 'FESTIVAL COUPON' },
          { code: 'FREEBD', title: 'Free Home Delivery', desc: 'Get zero shipping costs nationwide on purchasing above ৳2,500.', badge: 'FREE SHIPPING' },
          { code: 'MART15', title: 'Flat 15% OFF', desc: 'Valid on entire Coordinated Couple Collection matches.', badge: 'COUPLE DEAL' }
        ].map(coupon => (
          <div key={coupon.code} className="bg-gradient-to-br from-orange-50 via-white to-amber-50/30 p-6 rounded-2xl border border-orange-100 flex flex-col justify-between shadow-2xs space-y-4">
            <div className="space-y-1.5">
              <span className="text-[9px] font-black uppercase text-[#ff5c00] tracking-wider bg-orange-100 px-2 py-0.5 rounded-sm inline-block">
                {coupon.badge}
              </span>
              <h4 className="font-display text-lg font-black text-gray-900 uppercase">{coupon.title}</h4>
              <p className="text-xs text-gray-500 leading-relaxed font-semibold">{coupon.desc}</p>
            </div>
            
            <div className="flex items-center gap-2 pt-2">
              <div className="flex-1 bg-white border border-dashed border-orange-300 rounded-lg px-4 py-2 text-center font-mono font-black text-sm text-gray-800 uppercase tracking-widest">
                {coupon.code}
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(coupon.code);
                  setCopiedCoupon(coupon.code);
                  setTimeout(() => setCopiedCoupon(null), 2000);
                }}
                className="bg-[#ff5c00] hover:bg-black text-white text-xs font-black px-4 py-2.5 rounded-lg uppercase tracking-wider transition-colors cursor-pointer"
              >
                {copiedCoupon === coupon.code ? 'COPIED!' : 'COPY'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Live Flash Deals */}
      <div className="space-y-6 pt-8 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-xl font-black text-gray-900 uppercase tracking-wide">
            Active Flash Sale items
          </h3>
          <span className="text-xs font-bold text-[#ff5c00] uppercase tracking-widest">
            Up to 40% OFF
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
          {PRODUCTS.filter(p => p.discountPrice && p.discountPrice < p.price).map((product) => (
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
    </div>
  );
}
