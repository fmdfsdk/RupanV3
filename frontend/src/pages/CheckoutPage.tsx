import React, { useState, useEffect } from 'react';
import { Truck, CreditCard } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useNavigate } from 'react-router-dom';
import { getOptimizedImageUrl } from '../utils/image';
import ProductImage from '../components/ProductImage';
import { orderService } from '../services/orderService';
import { useSEO } from '../hooks/useSEO';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const cart = useStore((state) => state.cart);
  const currentUser = useStore((state) => state.currentUser);
  const checkoutForm = useStore((state) => state.checkoutForm);
  const setCheckoutForm = useStore((state) => state.setCheckoutForm);
  const placeOrder = useStore((state) => state.placeOrder);
  const appliedCoupon = useStore((state) => state.appliedCoupon);
  const dbSettings = useStore((state) => state.dbSettings);
  const addToast = useStore((state) => state.addToast);

  // Checkout must never be indexed by search engines
  useSEO({
    title: 'চেকআউট | Rupan',
    description: 'আপনার অর্ডার সম্পন্ন করুন।',
    canonical: '/checkout',
    robots: 'noindex, nofollow',
  });

  const [savedAddresses, setSavedAddresses] = useState<{ name: string; phone: string; address: string; area: string }[]>([]);
  
  useEffect(() => {
    const loadSavedAddresses = async () => {
      if (!currentUser?.id || !useStore.getState().isSupabaseOnline) return;
      try {
        const orders = await orderService.fetchOrdersByUserId(currentUser.id);
        const unique = [];
        const seen = new Set();
        for (const o of orders) {
          const key = `${o.customerName}-${o.phone}-${o.address}-${o.area}`;
          if (!seen.has(key) && o.address && o.phone) {
            seen.add(key);
            unique.push({
              name: o.customerName,
              phone: o.phone,
              address: o.address,
              area: o.area
            });
          }
        }
        setSavedAddresses(unique.slice(0, 3));
      } catch (err) {
        console.error(err);
      }
    };
    loadSavedAddresses();
  }, [currentUser]);

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
    const insideFee = dbSettings?.inside_dhaka_shipping ?? dbSettings?.insideDhakaShipping ?? 60;
    const outsideFee = dbSettings?.outside_dhaka_shipping ?? dbSettings?.outsideDhakaShipping ?? 120;
    return checkoutForm.area === 'Inside Dhaka' ? insideFee : outsideFee;
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutForm.name || !checkoutForm.phone || !checkoutForm.address) {
      addToast('Please fill out all required fields to proceed with your delivery.', 'error');
      return;
    }

    const order = await placeOrder(checkoutForm);
    if (order) {
      navigate('/order-success');
    }
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="font-display text-xl font-bold uppercase text-brand-text">Your bag is empty</h2>
        <p className="text-sm text-gray-500">Add products to your cart before proceeding to checkout.</p>
        <button
          onClick={() => navigate('/shop')}
          className="bg-brand-primary hover:bg-blue-950 text-white font-bold text-sm px-6 py-3 rounded-xl cursor-pointer"
        >
          Explore Catalog
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1750px] mx-auto px-4 sm:px-8 lg:px-12 py-12 space-y-10">
      {/* Checkout Progress Indicator */}
      <div className="flex items-center justify-center gap-2 max-w-md mx-auto mb-10 text-xs font-bold uppercase text-gray-400">
        <span className="text-brand-primary">1. Shopping Bag</span>
        <span className="h-0.5 w-10 bg-brand-primary" />
        <span className="text-brand-primary">2. Delivery Info</span>
        <span className="h-0.5 w-10 bg-gray-200" />
        <span>3. Order Complete</span>
      </div>

      {/* Incognito Guest Checkout Reassurance Banner */}
      {currentUser === null && (
        <div className="max-w-4xl mx-auto bg-orange-50 border-2 border-orange-200 rounded-2xl p-5 flex items-start gap-4 shadow-xs animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="bg-orange-100 p-2.5 rounded-xl text-orange-600 font-extrabold text-xl shrink-0">
            🕶️
          </div>
          <div className="space-y-1 text-left">
            <h4 className="text-xs sm:text-sm font-extrabold text-orange-950 uppercase tracking-wide flex items-center gap-2">
              Incognito Guest Checkout Enabled
            </h4>
            <p className="text-[11px] sm:text-xs text-orange-800 leading-relaxed font-semibold">
              You are placing this order as a guest without creating an account. Once checked out, you can securely track your delivery in real-time on our <strong className="text-[#ff5c00] underline cursor-pointer hover:text-[#e04f00]" onClick={() => navigate('/track-order')}>Track Order</strong> page simply by entering your <span className="underline font-bold">Phone Number</span> and <span className="underline font-bold">Order ID</span>.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Checkout Input Form */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-xs space-y-6">
          <h2 className="font-display text-lg font-bold uppercase tracking-wide text-brand-text pb-3 border-b border-gray-100">
            Shipping & Delivery Information
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Quick autofill from saved addresses */}
            {savedAddresses.length > 0 && (
              <div className="bg-gray-50/50 border border-gray-100 rounded-2xl p-4 space-y-3 mb-4">
                <label className="text-[10px] uppercase font-black text-gray-400 block text-left tracking-wider">
                  Quick Autofill Address History:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {savedAddresses.map((addr, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setCheckoutForm({
                          ...checkoutForm,
                          name: addr.name,
                          phone: addr.phone,
                          address: addr.address,
                          area: addr.area
                        });
                        addToast('Autofilled shipping details!', 'success');
                      }}
                      className="bg-white hover:bg-orange-50/30 border border-gray-200 hover:border-[#ff5c00]/30 rounded-xl p-3 text-left transition-all cursor-pointer space-y-1 shadow-2xs hover:shadow-xs"
                    >
                      <span className="block font-sans font-bold text-xs text-gray-900 truncate">{addr.name}</span>
                      <span className="block font-sans text-[10px] text-gray-400 font-semibold">{addr.phone}</span>
                      <p className="font-sans text-[10px] text-gray-500 line-clamp-1 leading-normal">{addr.address}</p>
                      <span className="inline-block bg-[#ff5c00]/10 text-[#ff5c00] text-[9px] font-bold px-1.5 py-0.5 rounded-md mt-1">
                        {addr.area}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Name */}
            <div className="space-y-1.5">
              <label className="text-xs uppercase font-bold text-gray-500">Customer Full Name *</label>
              <input
                type="text"
                required
                value={checkoutForm.name}
                onChange={(e) => setCheckoutForm({ ...checkoutForm, name: e.target.value })}
                placeholder="e.g. Sajid Al-Hasan"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-primary font-sans"
              />
            </div>

            {/* Phone & Email Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs uppercase font-bold text-gray-500">Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={checkoutForm.phone}
                  onChange={(e) => setCheckoutForm({ ...checkoutForm, phone: e.target.value })}
                  placeholder="e.g. 01712345678"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-primary font-sans"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs uppercase font-bold text-gray-500">Email Address (Optional)</label>
                <input
                  type="email"
                  value={checkoutForm.email}
                  onChange={(e) => setCheckoutForm({ ...checkoutForm, email: e.target.value })}
                  placeholder="e.g. customer@gmail.com"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-primary font-sans"
                />
              </div>
            </div>

            {/* Address */}
            <div className="space-y-1.5">
              <label className="text-xs uppercase font-bold text-gray-500">Detailed Delivery Address *</label>
              <textarea
                required
                rows={3}
                value={checkoutForm.address}
                onChange={(e) => setCheckoutForm({ ...checkoutForm, address: e.target.value })}
                placeholder="e.g. House No. 12, Road No. 3, Sector 4, Uttara, Dhaka"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-primary font-sans resize-none"
              />
            </div>

            {/* Delivery Location Area Selector */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <button
                type="button"
                onClick={() => setCheckoutForm({ ...checkoutForm, area: 'Inside Dhaka' })}
                className={`py-3.5 px-4 rounded-xl font-bold text-xs uppercase border transition-all cursor-pointer text-center ${
                  checkoutForm.area === 'Inside Dhaka'
                    ? 'bg-blue-50 border-brand-primary text-brand-primary shadow-xs'
                    : 'bg-white border-gray-200 text-gray-500 hover:border-gray-400'
                }`}
              >
                🛵 Inside Dhaka
                <span className="block text-[10px] text-gray-400 font-semibold mt-1">Delivery Charge: ৳{dbSettings?.inside_dhaka_shipping ?? 60}</span>
              </button>
              <button
                type="button"
                onClick={() => setCheckoutForm({ ...checkoutForm, area: 'Outside Dhaka' })}
                className={`py-3.5 px-4 rounded-xl font-bold text-xs uppercase border transition-all cursor-pointer text-center ${
                  checkoutForm.area === 'Outside Dhaka'
                    ? 'bg-blue-50 border-brand-primary text-brand-primary shadow-xs'
                    : 'bg-white border-gray-200 text-gray-500 hover:border-gray-400'
                }`}
              >
                🚚 Outside Dhaka
                <span className="block text-[10px] text-gray-400 font-semibold mt-1">Delivery Charge: ৳{dbSettings?.outside_dhaka_shipping ?? 120}</span>
              </button>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-3 pt-5 border-t border-gray-100">
              <label className="text-xs uppercase font-bold text-gray-500 block mb-2">Choose Payment Method *</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { id: 'Cash on Delivery', label: 'Cash on Delivery', icon: Truck },
                  { id: 'bKash Wallet', label: 'bKash Instant Pay', icon: CreditCard },
                  { id: 'Nagad Wallet', label: 'Nagad Instant Pay', icon: CreditCard }
                ].map((pay) => {
                  const IconComp = pay.icon;
                  return (
                    <button
                      key={pay.id}
                      type="button"
                      onClick={() => setCheckoutForm({ ...checkoutForm, paymentMethod: pay.id })}
                      className={`py-3.5 px-4 rounded-xl font-bold text-xs uppercase border transition-all cursor-pointer text-center flex flex-col items-center justify-center gap-1.5 ${
                        checkoutForm.paymentMethod === pay.id
                          ? 'bg-blue-50 border-brand-primary text-brand-primary shadow-xs'
                          : 'bg-white border-gray-200 text-gray-500 hover:border-gray-400'
                      }`}
                    >
                      <IconComp className="w-5 h-5" />
                      <span>{pay.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-brand-primary hover:bg-blue-950 text-white font-bold text-sm py-4 rounded-xl text-center shadow-lg hover:shadow-xl transition-all cursor-pointer block mt-6"
            >
              Confirm Nationwide Order ৳{getTotal().toLocaleString('en-IN')}
            </button>

          </form>
        </div>

        {/* Checkout Summary panel */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs h-fit space-y-6">
          <h3 className="font-display text-base font-bold uppercase tracking-wider text-brand-text border-b border-gray-100 pb-3">
            In Your Bag
          </h3>

          <div className="divide-y divide-gray-100 max-h-[250px] overflow-y-auto">
            {cart.map((item, i) => (
              <div key={i} className="py-3 flex gap-3">
                <ProductImage
                  src={getOptimizedImageUrl(item.product.images[0], 100)}
                  alt={item.product.name}
                  className="w-10 h-12 object-cover rounded-md shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-brand-text truncate">{item.product.name}</h4>
                  <span className="text-[10px] text-gray-400 block mt-0.5">
                    {item.selectedSize} / {item.selectedColor} • Qty {item.quantity}
                  </span>
                </div>
                <span className="text-xs font-bold text-brand-primary shrink-0">
                  ৳{((item.product.discountPrice || item.product.price) * item.quantity).toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>

          <div className="space-y-3 text-xs font-semibold pt-4 border-t border-gray-100">
            <div className="flex justify-between">
              <span className="text-gray-500">Subtotal</span>
              <span>৳{getSubtotal().toLocaleString('en-IN')}</span>
            </div>
            {appliedCoupon && (
              <div className="flex justify-between text-emerald-600 font-bold">
                <span>Discount ({appliedCoupon.code})</span>
                <span>- ৳{getDiscountAmount().toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-500">Shipping Delivery</span>
              <span>{getShippingFee() === 0 ? 'FREE' : `৳${getShippingFee()}`}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-brand-primary border-t border-gray-100 pt-3">
              <span>Total Cost</span>
              <span>৳{getTotal().toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-50 space-y-2 text-xs">
            <span className="font-bold text-brand-primary uppercase block">7-DAY DOORSTEP EXCHANGE</span>
            <p className="text-[10px] text-gray-500 leading-relaxed">
              Try the garments in comfort at your own home. If you have any sizing issue, we schedule free pick-up exchanges within Dhaka and flat 7-days anywhere else.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
