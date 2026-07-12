import React, { useState } from 'react';
import { X, ShoppingBag } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useNavigate } from 'react-router-dom';
import { getOptimizedImageUrl } from '../utils/image';
import ProductImage from '../components/ProductImage';
import { useSEO } from '../hooks/useSEO';

export default function CartPage() {
  const navigate = useNavigate();
  const cart = useStore((state) => state.cart);
  const updateCartQty = useStore((state) => state.updateCartQty);
  const applyCoupon = useStore((state) => state.applyCoupon);
  const appliedCoupon = useStore((state) => state.appliedCoupon);
  const dbSettings = useStore((state) => state.dbSettings);
  const addToast = useStore((state) => state.addToast);

  // Cart must never be indexed by search engines
  useSEO({
    title: 'আমার কার্ট | Rupan',
    description: 'আপনার শপিং কার্ট দেখুন এবং চেকআউট করুন।',
    canonical: '/cart',
    robots: 'noindex, nofollow',
  });

  const [couponCode, setCouponCode] = useState<string>('');

  const getSubtotal = () => {
    return cart.reduce((sum, item) => {
      const price = item.product.discountPrice || item.product.price;
      return sum + price * item.quantity;
    }, 0);
  };

  const getShippingFee = () => {
    if (cart.length === 0) return 0;
    const freeShippingLimit = dbSettings?.free_shipping_min_order ?? dbSettings?.freeShippingMinOrder ?? 3000;
    if (getSubtotal() >= freeShippingLimit) return 0;
    // Default Inside Dhaka area for cart estimation, can change in checkout
    const insideFee = dbSettings?.inside_dhaka_shipping ?? dbSettings?.insideDhakaShipping ?? 60;
    return insideFee;
  };

  const getDiscountAmount = () => {
    if (!appliedCoupon) return 0;
    const minOrder = appliedCoupon.minOrder || 0;
    if (getSubtotal() < minOrder) return 0;

    if (appliedCoupon.type === 'fixed') {
      return Math.min(appliedCoupon.discount, getSubtotal());
    } else if (appliedCoupon.type === 'free_shipping') {
      return getShippingFee();
    }
    return Math.round((getSubtotal() * appliedCoupon.discount) / 100);
  };

  const getTotal = () => {
    return getSubtotal() + getShippingFee() - getDiscountAmount();
  };

  const handleCouponSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = applyCoupon(couponCode);
    if (success) {
      addToast('Coupon applied successfully!', 'success');
    } else {
      addToast('Invalid Coupon Code! Try "RUPAN20" or "EIDMUBARAK".', 'error');
    }
  };

  return (
    <div className="w-full max-w-[1750px] mx-auto px-4 sm:px-8 lg:px-12 py-12 space-y-10">
      <h1 className="font-display text-3xl font-extrabold text-brand-text uppercase tracking-tight">
        My Shopping Bag ({cart.reduce((sum, i) => sum + i.quantity, 0)})
      </h1>

      {cart.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left: Item List (2 cols on desktop) */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl border border-gray-100 p-4 flex gap-4 shadow-xs items-center relative"
              >
                <ProductImage
                  src={getOptimizedImageUrl(item.product.images[0], 150)}
                  alt={item.product.name}
                  containerClassName="w-20 h-24 shrink-0"
                  className="w-full h-full object-cover rounded-xl"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-display font-bold text-sm md:text-base text-brand-text truncate">
                    {item.product.name}
                  </h4>
                  
                  {/* selected configurations */}
                  <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-xs text-gray-500 font-medium">
                    <span>Size: <strong className="text-brand-text">{item.selectedSize}</strong></span>
                    <span className="flex items-center gap-1">
                      Color: <strong className="text-brand-text">{item.selectedColor}</strong>
                    </span>
                  </div>

                  {/* pricing calculation */}
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-base font-extrabold text-brand-primary">
                      ৳{(item.product.discountPrice || item.product.price).toLocaleString('en-IN')}
                    </span>
                    {item.product.discountPrice && (
                      <span className="text-xs text-gray-400 line-through">
                        ৳{item.product.price.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>

                  {/* quantity adjustments */}
                  <div className="flex items-center gap-2 mt-3">
                    <button
                      onClick={() => updateCartQty(index, item.quantity - 1)}
                      className="w-7 h-7 bg-gray-50 hover:bg-gray-100 flex items-center justify-center font-bold text-sm text-gray-500 rounded-md cursor-pointer"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-bold text-xs">{item.quantity}</span>
                    <button
                      onClick={() => updateCartQty(index, item.quantity + 1)}
                      className="w-7 h-7 bg-gray-50 hover:bg-gray-100 flex items-center justify-center font-bold text-sm text-gray-500 rounded-md cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* delete cross */}
                <button
                  onClick={() => updateCartQty(index, 0)}
                  className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-50 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Right: Summary panel */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs h-fit space-y-6">
            <h3 className="font-display text-base font-bold uppercase tracking-wider text-brand-text border-b border-gray-100 pb-3">
              Order Summary
            </h3>

            {/* Coupon entry form */}
            <form onSubmit={handleCouponSubmit} className="space-y-2">
              <span className="block text-xs uppercase font-bold text-gray-400">Apply coupon code</span>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="e.g. RUPAN20"
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-brand-primary font-mono"
                />
                <button
                  type="submit"
                  className="bg-brand-primary text-white font-bold text-xs px-4 rounded-xl hover:bg-blue-900 transition-colors cursor-pointer"
                >
                  Apply
                </button>
              </div>
              <p className="text-[10px] text-gray-400">
                * Enter "RUPAN20" for 20% flat discount on total purchase price!
              </p>
            </form>

            {/* Pricing Breakdown */}
            <div className="space-y-3.5 text-sm font-medium border-t border-gray-100 pt-4">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span className="text-brand-text">৳{getSubtotal().toLocaleString('en-IN')}</span>
              </div>

              {appliedCoupon && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Discount ({appliedCoupon.code})</span>
                  <span>- ৳{getDiscountAmount().toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-gray-500">Estimated Shipping Fee</span>
                <span className="text-brand-text">
                  {getShippingFee() === 0 ? (
                    <span className="text-emerald-600 font-bold">FREE</span>
                  ) : (
                    `৳${getShippingFee()}`
                  )}
                </span>
              </div>

              <div className="flex justify-between text-base font-bold border-t border-gray-100 pt-3 text-brand-primary">
                <span>Grand Total</span>
                <span>৳{getTotal().toLocaleString('en-IN')}</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full bg-brand-primary hover:bg-blue-950 text-white font-bold text-sm py-3.5 rounded-xl text-center shadow-md hover:shadow-lg transition-all cursor-pointer block mt-4"
            >
              Proceed To Delivery Checkout
            </button>
            
            <div className="text-center">
              <span className="text-[10px] text-gray-400 font-medium">
                🔒 256-Bit SSL Encrypted Nationwide Transactions
              </span>
            </div>
          </div>

        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-3xl p-16 text-center space-y-4 max-w-md mx-auto">
          <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto" />
          <h3 className="font-display text-lg font-bold uppercase text-brand-text">Your bag is empty</h3>
          <p className="text-sm text-gray-500">
            You haven't added any products to your cart yet. Explore our latest festival and western arrivals to style your wardrobe.
          </p>
          <button
            onClick={() => {
              navigate('/shop');
            }}
            className="bg-brand-primary hover:bg-blue-900 text-white font-bold text-xs px-6 py-3 rounded-xl cursor-pointer transition-colors"
          >
            Start Shopping
          </button>
        </div>
      )}
    </div>
  );
}
