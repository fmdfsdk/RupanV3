import React, { useEffect, useState } from 'react';
import { CheckCircle, Copy, Package, MapPin, Phone, CreditCard, ArrowRight, ShoppingBag } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useNavigate } from 'react-router-dom';
import { useSEO } from '../hooks/useSEO';

export default function OrderSuccessPage() {
  const navigate = useNavigate();
  const lastPlacedOrder = useStore(state => state.lastPlacedOrder);
  const [copiedOrderId, setCopiedOrderId] = useState(false);
  const [showContent, setShowContent] = useState(false);

  useSEO({
    title: 'অর্ডার সফল | Rupan',
    description: 'আপনার অর্ডার সফলভাবে গ্রহণ করা হয়েছে।',
    canonical: '/order-success',
    robots: 'noindex, nofollow',
  });

  useEffect(() => {
    // Stagger entrance animation
    const t = setTimeout(() => setShowContent(true), 100);
    return () => clearTimeout(t);
  }, []);

  const handleCopyOrderId = () => {
    if (!lastPlacedOrder) return;
    navigator.clipboard.writeText(lastPlacedOrder.id).then(() => {
      setCopiedOrderId(true);
      setTimeout(() => setCopiedOrderId(false), 3000);
    });
  };

  if (!lastPlacedOrder) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
        <h1 className="font-display text-2xl font-extrabold uppercase text-red-600">No Order Found</h1>
        <p className="text-sm text-gray-500">এই সেশনে কোনো অর্ডার দেওয়া হয়নি।</p>
        <button
          onClick={() => navigate('/shop')}
          className="bg-brand-primary hover:bg-blue-950 text-white font-bold text-sm px-6 py-3 rounded-xl cursor-pointer"
        >
          Go to Shop
        </button>
      </div>
    );
  }

  const isQrPayment = lastPlacedOrder.paymentMethod === 'Bangla QR';
  const isMfsPayment = lastPlacedOrder.paymentMethod === 'bKash' || lastPlacedOrder.paymentMethod === 'Nagad';
  const isCod = lastPlacedOrder.paymentMethod === 'Cash on Delivery';

  return (
    <div className={`max-w-2xl mx-auto px-4 py-10 space-y-6 transition-all duration-700 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>

      {/* ── Success Header ── */}
      <div className="text-center space-y-4">
        {/* Animated checkmark */}
        <div className="relative inline-flex">
          <div className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
            <div className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <CheckCircle className="w-9 h-9 text-white" strokeWidth={2.5} />
            </div>
          </div>
          {/* Pulse rings */}
          <span className="absolute inset-0 rounded-full bg-emerald-100 animate-ping opacity-30" />
        </div>

        <div className="space-y-1">
          <h1 className="font-display text-2xl md:text-3xl font-black text-brand-text">
            {isCod ? 'অর্ডার সফলভাবে গ্রহণ করা হয়েছে!' : 'পেমেন্ট ও অর্ডার নিশ্চিত হয়েছে! 🎉'}
          </h1>
          <p className="text-sm text-gray-500 font-semibold">
            {isCod
              ? 'আপনার অর্ডার রেজিস্ট্রেশন সম্পন্ন হয়েছে। ডেলিভারির সময় পেমেন্ট করুন।'
              : 'ধন্যবাদ! আমরা আপনার অর্ডার ও পেমেন্ট পেয়েছি এবং প্রক্রিয়া করা হচ্ছে।'}
          </p>
        </div>

        {/* Order ID Badge */}
        <div className="inline-flex items-center gap-2 bg-brand-primary/5 border-2 border-brand-primary/20 rounded-2xl px-5 py-3">
          <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Order ID</span>
          <span className="font-mono text-xl font-black text-brand-primary tracking-wide">
            {lastPlacedOrder.id}
          </span>
          <button
            onClick={handleCopyOrderId}
            className="text-gray-400 hover:text-brand-primary transition-colors ml-1"
            title="Copy Order ID"
          >
            {copiedOrderId ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
        {copiedOrderId && (
          <p className="text-[11px] text-emerald-600 font-bold -mt-2">Order ID copied!</p>
        )}
      </div>

      {/* ── Payment Status Badge ── */}
      <div className={`rounded-2xl border p-4 flex items-center gap-3 ${
        isCod ? 'bg-amber-50 border-amber-200' : 'bg-emerald-50 border-emerald-200'
      }`}>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
          isCod ? 'bg-amber-100' : 'bg-emerald-100'
        }`}>
          <CreditCard className={`w-5 h-5 ${isCod ? 'text-amber-600' : 'text-emerald-600'}`} />
        </div>
        <div>
          <span className={`font-black text-sm block ${isCod ? 'text-amber-800' : 'text-emerald-800'}`}>
            {isQrPayment && 'Bangla QR — পেমেন্ট সাবমিট সফল'}
            {isMfsPayment && `${lastPlacedOrder.paymentMethod} — পেমেন্ট যাচাই চলছে`}
            {isCod && 'Cash on Delivery — ডেলিভারির সময় পেমেন্ট'}
          </span>
          <span className={`text-[11px] font-semibold ${isCod ? 'text-amber-700' : 'text-emerald-700'}`}>
            {isQrPayment && 'Admin verification pending — সাধারণত ১-২ ঘণ্টার মধ্যে নিশ্চিত হয়।'}
            {isMfsPayment && lastPlacedOrder.transactionId && `TrxID: ${lastPlacedOrder.transactionId} — নিশ্চিতকরণ চলছে।`}
            {isMfsPayment && !lastPlacedOrder.transactionId && 'Admin verification pending.'}
            {isCod && 'ডেলিভারি এজেন্টকে পণ্য বুঝে নেওয়ার সময় টাকা দিন।'}
          </span>
        </div>
      </div>

      {/* ── Order Items ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
          <Package className="w-4 h-4 text-gray-500" />
          <span className="text-xs font-black uppercase text-gray-500 tracking-wider">
            Ordered Items ({Array.isArray(lastPlacedOrder.items) ? lastPlacedOrder.items.length : 0})
          </span>
        </div>
        <div className="divide-y divide-gray-100">
          {(Array.isArray(lastPlacedOrder.items) ? lastPlacedOrder.items : []).map((item, i) => (
            <div key={i} className="px-5 py-3.5 flex items-center gap-3">
              {item.image && (
                <img
                  src={item.image}
                  alt={item.productName}
                  className="w-12 h-14 object-cover rounded-lg border border-gray-100 shrink-0"
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              )}
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-gray-900 truncate">{item.productName}</h4>
                <span className="text-[11px] text-gray-400 font-semibold">
                  {item.size} / {item.color} × {item.quantity}
                </span>
              </div>
              <div className="text-right shrink-0">
                <span className="text-sm font-black text-brand-primary">
                  ৳{((item.price || 0) * (item.quantity || 1)).toLocaleString('en-IN')}
                </span>
                <span className="block text-[10px] text-gray-400 font-semibold">
                  ৳{item.price || 0} each
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Price Breakdown + Shipping ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Price Breakdown */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-5 space-y-3 text-sm">
          <span className="text-xs font-black uppercase text-gray-400 tracking-wider block pb-1 border-b border-gray-100">
            Price Summary
          </span>
          <div className="flex justify-between text-gray-500 font-semibold">
            <span>Subtotal</span>
            <span>৳{(lastPlacedOrder.subtotal ?? 0).toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between text-gray-500 font-semibold">
            <span>Shipping</span>
            <span>{lastPlacedOrder.shippingFee === 0 ? '🎉 FREE' : `৳${lastPlacedOrder.shippingFee ?? 0}`}</span>
          </div>
          {lastPlacedOrder.onlinePaymentDiscount && lastPlacedOrder.onlinePaymentDiscount > 0 ? (
            <div className="flex justify-between text-emerald-600 font-bold">
              <span>অনলাইন পেমেন্ট ডিসকাউন্ট</span>
              <span>- ৳{(lastPlacedOrder.onlinePaymentDiscount ?? 0).toLocaleString('en-IN')}</span>
            </div>
          ) : null}
          <div className="flex justify-between font-black text-brand-primary text-base pt-2 border-t border-gray-100">
            <span>Total Paid</span>
            <span>৳{(lastPlacedOrder.total ?? 0).toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Delivery Info */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-5 space-y-3 text-sm">
          <span className="text-xs font-black uppercase text-gray-400 tracking-wider block pb-1 border-b border-gray-100">
            Delivery Details
          </span>
          <div className="flex items-start gap-2">
            <Phone className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />
            <span className="text-gray-700 font-semibold text-xs">{lastPlacedOrder.customerName} • {lastPlacedOrder.phone}</span>
          </div>
          <div className="flex items-start gap-2">
            <MapPin className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />
            <span className="text-gray-700 font-semibold text-xs leading-relaxed">{lastPlacedOrder.address}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex bg-blue-50 text-brand-primary text-[10px] font-black px-2 py-0.5 rounded-lg border border-blue-100">
              {lastPlacedOrder.area}
            </span>
            <span className="text-[10px] text-gray-400 font-semibold">Est. 1–3 Working Days</span>
          </div>
        </div>
      </div>

      {/* ── Admin Verification Note ── */}
      {!isCod && (
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-start gap-3">
          <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
            <span className="text-sm">ℹ️</span>
          </div>
          <div className="text-xs text-blue-700 font-semibold leading-relaxed">
            <span className="font-black block mb-0.5">Payment Verification Notice</span>
            আপনার পেমেন্ট আমাদের Admin প্যানেলে সাবমিট হয়েছে। Admin নিজে payment verify করবেন — আপনাকে আলাদাভাবে কিছু করতে হবে না। Order confirm হলে SMS বা WhatsApp-এ জানানো হবে।
          </div>
        </div>
      )}

      {/* ── CTA Buttons ── */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button
          onClick={() => navigate(`/track-order?id=${lastPlacedOrder.id}&phone=${lastPlacedOrder.phone}`)}
          className="flex-1 bg-brand-primary hover:bg-blue-950 text-white font-bold text-sm px-6 py-4 rounded-xl cursor-pointer flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
        >
          <Package className="w-4 h-4" />
          Track My Delivery
          <ArrowRight className="w-4 h-4" />
        </button>
        <button
          onClick={() => navigate('/shop')}
          className="flex-1 bg-white hover:bg-gray-50 text-gray-600 font-bold text-sm px-6 py-4 border-2 border-gray-200 rounded-xl cursor-pointer flex items-center justify-center gap-2 transition-all"
        >
          <ShoppingBag className="w-4 h-4" />
          Continue Shopping
        </button>
      </div>

      {/* ── Footer note ── */}
      <p className="text-center text-[11px] text-gray-400 font-semibold pb-4">
        অর্ডার ট্র্যাক করতে Order ID <strong className="text-gray-600">{lastPlacedOrder.id}</strong> এবং Phone Number সংরক্ষণ করুন।
      </p>
    </div>
  );
}
