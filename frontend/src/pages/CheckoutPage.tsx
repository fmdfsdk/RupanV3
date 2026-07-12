import React, { useState, useEffect } from 'react';
import { Truck, CreditCard, QrCode } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useNavigate } from 'react-router-dom';
import { getOptimizedImageUrl } from '../utils/image';
import ProductImage from '../components/ProductImage';
import { orderService } from '../services/orderService';
import { useSEO } from '../hooks/useSEO';
import { trackInitiateCheckout, generateEventId } from '../lib/telemetry';

// High-fidelity SVG Payment Logos matching official brand guidelines
const BanglaQrLogo = ({ className = "w-9 h-9" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <text x="50%" y="22" fill="#D2232A" fontSize="16" fontFamily="'Inter', system-ui, sans-serif" fontWeight="900" textAnchor="middle" letterSpacing="0.6">BANGLA</text>
    <rect x="20" y="30" width="60" height="60" rx="8" stroke="#006A4E" strokeWidth="5.5" />
    <rect x="29" y="39" width="12" height="12" stroke="#D2232A" strokeWidth="3.5" fill="none" />
    <rect x="59" y="39" width="12" height="12" stroke="#D2232A" strokeWidth="3.5" fill="none" />
    <rect x="29" y="69" width="12" height="12" stroke="#D2232A" strokeWidth="3.5" fill="none" />
    <text x="50%" y="65" fill="#006A4E" fontSize="14" fontFamily="'Inter', system-ui, sans-serif" fontWeight="900" textAnchor="middle" letterSpacing="-0.2">QR</text>
  </svg>
);

const BkashLogo = () => (
  <svg className="w-14 h-5.5" viewBox="0 0 90 30" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g transform="translate(2, 0)">
      <path d="M19 15 L22.5 10.5 L17.5 11 L19 15Z" fill="#E2125D" />
      <path d="M11.5 21 L19 15 L14 8.5 L11.5 21Z" fill="#E2125D" fillOpacity="0.9" />
      <path d="M19 15 L14 22 L11.5 21 L19 15Z" fill="#E2125D" fillOpacity="0.8" />
      <path d="M19 15 L24 17.5 L14 22 L19 15Z" fill="#E2125D" />
    </g>
    <text x="31" y="19.5" fill="#E2125D" fontSize="13.5" fontFamily="'Inter', system-ui, sans-serif" fontWeight="900" letterSpacing="-0.3">bKash</text>
  </svg>
);

const NagadLogo = () => (
  <svg className="w-14 h-5.5" viewBox="0 0 90 30" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g transform="translate(2, 1)">
      <circle cx="16" cy="14" r="7" fill="#F25F22" fillOpacity="0.2" />
      <path d="M11 15 C11 11, 15 10, 18 10 C21 10, 21 13, 21 15 C21 19, 17 21, 14 21 C11 21, 11 19, 11 15 Z" fill="#F25F22" />
      <path d="M14 11 C15.5 11, 17 12, 17 14 C17 16, 15.5 18, 14 18 C12.5 18, 11.5 16, 11.5 14" stroke="#F25F22" strokeWidth="1" />
      <circle cx="17" cy="14" r="1.5" fill="#F25F22" />
    </g>
    <text x="29" y="19" fill="#F25F22" fontSize="13.5" fontFamily="'Inter', system-ui, sans-serif" fontWeight="900" letterSpacing="-0.4">nagad</text>
  </svg>
);

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
  
  // Dynamically set default payment method if the current one is disabled
  useEffect(() => {
    const payOptions = [
      { id: 'Bangla QR', enabled: dbSettings?.payment_bangla_qr_enabled ?? dbSettings?.paymentBanglaQrEnabled ?? true },
      { id: 'bKash', enabled: dbSettings?.payment_bkash_enabled ?? dbSettings?.paymentBkashEnabled ?? true },
      { id: 'Nagad', enabled: dbSettings?.payment_nagad_enabled ?? dbSettings?.paymentNagadEnabled ?? true },
      { id: 'Cash on Delivery', enabled: dbSettings?.payment_cod_enabled ?? dbSettings?.paymentCodEnabled ?? true }
    ].filter(p => p.enabled);
    
    const enabledIds = payOptions.map(p => p.id);
    if (enabledIds.length > 0 && !enabledIds.includes(checkoutForm.paymentMethod)) {
      setCheckoutForm({ ...checkoutForm, paymentMethod: enabledIds[0], transactionId: '', paidConfirm: false });
    }
  }, [dbSettings]);

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

  // Track InitiateCheckout when the checkout page is loaded
  const hasTrackedCheckout = React.useRef(false);
  useEffect(() => {
    if (cart.length > 0 && !hasTrackedCheckout.current) {
      hasTrackedCheckout.current = true;
      const eventId = generateEventId('InitiateCheckout');
      const testCode = dbSettings?.metaTestEventCode || dbSettings?.meta_test_event_code;
      trackInitiateCheckout(
        cart,
        getTotal(),
        eventId,
        testCode
      );
    }
  }, [cart, dbSettings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutForm.name || !checkoutForm.phone || !checkoutForm.address) {
      addToast('Please fill out all required fields to proceed with your delivery.', 'error');
      return;
    }

    // Payment validation
    if ((checkoutForm.paymentMethod === 'bKash' || checkoutForm.paymentMethod === 'Nagad') && !checkoutForm.transactionId?.trim()) {
      addToast(`Please enter your Transaction ID for ${checkoutForm.paymentMethod} payment validation.`, 'error');
      return;
    }

    if (checkoutForm.paymentMethod === 'Bangla QR' && !checkoutForm.paidConfirm) {
      addToast('Please scan the QR code and click the "Scan & Paid Confirmed" button to verify your payment.', 'error');
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
            <div className="space-y-4 pt-5 border-t border-gray-100">
              <label className="text-xs uppercase font-extrabold text-gray-500 block mb-2 tracking-wider">Choose Payment Method *</label>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { id: 'Bangla QR', label: 'Bangla QR', logoSrc: '/assets/logo-banglaqr.svg', enabled: dbSettings?.payment_bangla_qr_enabled ?? dbSettings?.paymentBanglaQrEnabled ?? true },
                  { id: 'bKash', label: 'bKash Wallet', logoSrc: '/assets/logo-bkash.svg', enabled: dbSettings?.payment_bkash_enabled ?? dbSettings?.paymentBkashEnabled ?? true },
                  { id: 'Nagad', label: 'Nagad Wallet', logoSrc: '/assets/logo-nagad.webp', enabled: dbSettings?.payment_nagad_enabled ?? dbSettings?.paymentNagadEnabled ?? true },
                  { id: 'Cash on Delivery', label: 'Cash on Delivery', component: <Truck className="w-6 h-6 text-gray-600" />, enabled: dbSettings?.payment_cod_enabled ?? dbSettings?.paymentCodEnabled ?? true }
                ].filter(pay => pay.enabled).map((pay) => {
                  const isSelected = checkoutForm.paymentMethod === pay.id;
                  
                  return (
                    <button
                      key={pay.id}
                      type="button"
                      onClick={() => setCheckoutForm({ ...checkoutForm, paymentMethod: pay.id, transactionId: '', paidConfirm: false })}
                      className={`py-3 px-2 rounded-xl font-bold text-xs uppercase border transition-all cursor-pointer text-center flex flex-col items-center justify-center gap-1.5 select-none min-h-[85px] ${
                        isSelected
                          ? 'bg-blue-50 border-brand-primary text-brand-primary shadow-xs'
                          : 'bg-white border-gray-200 text-gray-500 hover:border-gray-400'
                      }`}
                    >
                      {pay.logoSrc ? (
                        <div className="w-16 h-7 flex items-center justify-center overflow-hidden">
                          <img src={pay.logoSrc} alt={pay.label} className="w-full h-full object-contain" />
                        </div>
                      ) : pay.component}
                      <span className="leading-tight mt-1">{pay.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Dynamic Payment Method Details Panel */}
              <div className="pt-2">
                {checkoutForm.paymentMethod === 'Bangla QR' && (
                  <div className="bg-gradient-to-br from-orange-50/50 via-white to-orange-50/20 border-2 border-orange-100 rounded-2xl p-5 md:p-6 shadow-sm space-y-5 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="flex flex-col lg:flex-row items-center gap-6 justify-center">
                      
                      {/* Remake of the CEXPERT SuperQR PDF Flyer Design */}
                      <div className="w-full sm:w-[340px] bg-white border border-gray-200 rounded-[2rem] overflow-hidden shadow-md flex flex-col font-sans shrink-0 border-t-4 border-t-red-600">
                        {/* Header Area (White bg, Bangla QR logo and sub-logos) */}
                        <div className="bg-white px-4 pt-4 pb-3 flex flex-col items-center text-center space-y-1.5">
                          <img src="/assets/logo-banglaqr.svg" alt="Bangla QR" className="w-12 h-12 object-contain" />
                          <h3 className="font-display font-extrabold text-[13px] sm:text-sm text-gray-900 tracking-tight leading-snug">
                            পেমেন্ট করুন সকল অ্যাপ দিয়ে
                          </h3>
                          {/* Row of sub-logos */}
                          <div className="flex items-center justify-center gap-2.5 pt-1.5 border-t border-gray-100 w-full">
                            <img src="/assets/logo-bkash.svg" alt="bKash" className="h-4.5 object-contain" />
                            <img src="/assets/logo-rocket.svg" alt="Rocket" className="h-4.5 object-contain" />
                            <div className="bg-[#006A4E] text-white font-bold text-[8.5px] px-1.5 py-0.5 rounded-xs leading-none">CellFin</div>
                          </div>
                        </div>

                        {/* Banner Area (Curved Crimson Red Background) */}
                        <div className="bg-[#D2232A] px-4 pt-7 pb-6 flex flex-col items-center space-y-5 rounded-t-[2rem] text-white relative">
                          {/* Raw QR code container */}
                          <div className="bg-white p-2 rounded-2xl w-full aspect-square max-w-[290px] sm:max-w-[310px] flex items-center justify-center shadow-lg">
                            <img 
                              src={dbSettings?.payment_bangla_qr_image ?? dbSettings?.paymentBanglaQrImage ?? '/assets/BanglaQRcode.jpeg'} 
                              alt="Bangla QR Code Scanner" 
                              className="w-full h-full object-contain"
                            />
                          </div>

                          {/* How to pay divider text */}
                          <div className="w-full flex items-center gap-1.5 px-1.5 pt-1">
                            <div className="h-px bg-white/20 flex-1"></div>
                            <span className="text-[9px] uppercase font-bold tracking-wider text-white/80">
                              অ্যাপ থেকে যেভাবে পেমেন্ট করবেন
                            </span>
                            <div className="h-px bg-white/20 flex-1"></div>
                          </div>

                          {/* 3 Step instructions grid */}
                          <div className="grid grid-cols-3 gap-2 w-full text-center text-white">
                            <div className="flex flex-col items-center space-y-1">
                              <div className="w-6 h-6 rounded-full bg-white/15 flex items-center justify-center text-[10px] font-black">১</div>
                              <span className="text-[8.5px] font-bold leading-tight">QR স্ক্যান করুন</span>
                            </div>
                            <div className="flex flex-col items-center space-y-1">
                              <div className="w-6 h-6 rounded-full bg-white/15 flex items-center justify-center text-[10px] font-black">২</div>
                              <span className="text-[8.5px] font-bold leading-tight">টাকার পরিমাণ লিখুন</span>
                            </div>
                            <div className="flex flex-col items-center space-y-1">
                              <div className="w-6 h-6 rounded-full bg-white/15 flex items-center justify-center text-[10px] font-black">৩</div>
                              <span className="text-[8.5px] font-bold leading-tight">PIN দিন</span>
                            </div>
                          </div>
                        </div>

                        {/* Footer (BB Licence) */}
                        <div className="bg-[#FDF2F4] px-4 py-2.5 flex items-center justify-center gap-1.5 border-t border-red-50 text-[9.5px] text-gray-500 font-extrabold">
                          <div className="w-4.5 h-4.5 rounded-full bg-[#006A4E] text-white flex items-center justify-center font-bold text-[8px] leading-none">BB</div>
                          <span>বাংলাদেশ ব্যাংক লাইসেন্সপ্রাপ্ত</span>
                        </div>
                      </div>

                      {/* Right Hand Side Checkout Instructions */}
                      <div className="flex-1 space-y-4 text-left">
                        <div className="space-y-1">
                          <span className="text-[9px] font-black uppercase text-[#ff5c00] tracking-widest bg-orange-100 px-2 py-0.5 rounded-sm inline-block">
                            Payment Details
                          </span>
                          <h4 className="font-display font-extrabold text-gray-900 text-sm sm:text-base leading-tight">
                            Bangla QR পেমেন্ট গাইডলাইন
                          </h4>
                        </div>
                        
                        <p className="text-[11px] sm:text-xs text-gray-500 leading-relaxed font-semibold">
                          {dbSettings?.payment_bangla_qr_instruction ?? dbSettings?.paymentBanglaQrInstruction ?? 'যেকোনো ব্যাংকিং বা পেমেন্ট অ্যাপ (যেমনঃ বিকাশ, রকেট, নগদ, বা সেলফিন) ওপেন করে "Scan QR" অথবা "Bangla QR" সিলেক্ট করে পাশের কোডটি স্ক্যান করে পেমেন্ট সম্পূর্ণ করুন।'}
                        </p>
                        
                        <div className="bg-white/70 p-3.5 rounded-xl border border-gray-150 text-[11px] text-gray-600 font-sans font-semibold">
                          <div className="flex justify-between items-center text-orange-850">
                            <span> Payable Amount:</span>
                            <span className="text-[#ff5c00] font-black text-sm">৳{getTotal().toLocaleString('en-IN')}</span>
                          </div>
                        </div>
                      </div>

                    </div>

                    {/* Paid Confirm Button */}
                    <button
                      type="button"
                      onClick={() => setCheckoutForm({ ...checkoutForm, paidConfirm: !checkoutForm.paidConfirm })}
                      className={`w-full py-3.5 px-4 rounded-xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 border ${
                        checkoutForm.paidConfirm
                          ? 'bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-600/10'
                          : 'bg-white border-gray-200 text-gray-700 hover:border-emerald-500 hover:text-emerald-600'
                      }`}
                    >
                      {checkoutForm.paidConfirm ? '✅ Scan & Paid Confirmed' : 'Confirm Scan & Payment Done'}
                    </button>
                  </div>
                )}

                {(checkoutForm.paymentMethod === 'bKash' || checkoutForm.paymentMethod === 'Nagad') && (
                  <div className="bg-gradient-to-br from-pink-50/20 via-white to-pink-50/10 border-2 border-pink-150 rounded-2xl p-5 md:p-6 shadow-sm space-y-5 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="flex flex-col sm:flex-row items-center gap-5">
                      {/* Logo Mockup */}
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-xs border bg-white p-1 overflow-hidden">
                        <img 
                          src={checkoutForm.paymentMethod === 'bKash' ? '/assets/logo-bkash.svg' : '/assets/logo-nagad.webp'} 
                          alt={checkoutForm.paymentMethod} 
                          className="w-full h-full object-contain" 
                        />
                      </div>
                      {/* Instructions */}
                      <div className="flex-1 space-y-2 text-left">
                        <span className="text-[10px] font-black uppercase tracking-widest bg-pink-100 text-pink-700 px-2.5 py-1 rounded-sm inline-block">
                          Send Money
                        </span>
                        <h4 className="font-display font-extrabold text-gray-900 text-sm sm:text-base leading-snug">
                          {checkoutForm.paymentMethod} পার্সোনাল নাম্বারে সেন্ড মানি করুন
                        </h4>
                        <p className="text-[11px] sm:text-xs text-gray-500 leading-relaxed font-semibold">
                          {(dbSettings?.payment_mfs_instruction ?? dbSettings?.paymentMfsInstruction ?? 'নিচের নম্বরে {amount} সেন্ড মানি (Send Money) করার পর পেমেন্ট ভেরিফাই করতে ট্রানজেকশন আইডি (TrxID) নিচে দিন।').replace('{amount}', `৳${getTotal().toLocaleString('en-IN')}`)}
                        </p>
                        <div className="bg-white/60 p-2.5 rounded-lg border border-gray-150 text-[11px] text-gray-600 space-y-1 font-mono">
                          <div>
                            📱 {checkoutForm.paymentMethod} Number:{' '}
                            <strong className="text-gray-900">
                              {checkoutForm.paymentMethod === 'bKash'
                                ? (dbSettings?.payment_bkash_number ?? dbSettings?.paymentBkashNumber ?? '01600338318')
                                : (dbSettings?.payment_nagad_number ?? dbSettings?.paymentNagadNumber ?? '01600338318')}{' '}
                              (Personal)
                            </strong>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Transaction ID input */}
                    <div className="space-y-1.5 text-left border-t border-gray-100 pt-4">
                      <label className="text-xs uppercase font-extrabold text-gray-500">Transaction ID (TrxID) *</label>
                      <input
                        type="text"
                        required
                        value={checkoutForm.transactionId || ''}
                        onChange={(e) => setCheckoutForm({ ...checkoutForm, transactionId: e.target.value.toUpperCase() })}
                        placeholder="e.g. 8XM7C9JD32"
                        className="w-full bg-gray-50 border border-gray-250 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-primary font-mono uppercase tracking-wide"
                      />
                    </div>
                  </div>
                )}

                {checkoutForm.paymentMethod === 'Cash on Delivery' && (
                  <div className="bg-gray-50 border border-gray-150 rounded-2xl p-5 md:p-6 shadow-xs space-y-3 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="flex items-center gap-3 text-left">
                      <Truck className="w-5 h-5 text-gray-500" />
                      <h4 className="font-display font-extrabold text-gray-900 text-sm uppercase tracking-wide">
                        Cash on Delivery (ক্যাশ অন ডেলিভারি)
                      </h4>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed font-semibold text-left">
                      {dbSettings?.payment_cod_instruction ?? dbSettings?.paymentCodInstruction ?? 'অর্ডার প্লেস করুন এবং সারাদেশে হোম ডেলিভারি পাওয়ার পর কুরিয়ার এজেন্টের কাছে ক্যাশ টাকা দিয়ে আপনার পণ্য বুঝে নিন।'}
                    </p>
                  </div>
                )}
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
                  containerClassName="w-10 h-12 shrink-0"
                  className="w-full h-full object-cover rounded-md"
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
