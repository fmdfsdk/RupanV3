import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Truck, Upload, CheckCircle, Copy, Clock, Sparkles, MapPin, Tag, Download, ShieldCheck } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useNavigate } from 'react-router-dom';
import { getOptimizedImageUrl } from '../utils/image';
import ProductImage from '../components/ProductImage';
import { orderService } from '../services/orderService';
import { useSEO } from '../hooks/useSEO';
import { trackInitiateCheckout, generateEventId } from '../lib/telemetry';
import { supabase } from '../lib/supabase';
import { BANGLADESH_DIVISIONS, getShippingFeeForDistrict, findDistrictById } from '../data/bangladeshDistricts';
import { Product } from '../types';

// ─── Payment Method Logos ─────────────────────────────────────────────────────

const BkashLogo = ({ className = 'h-5' }: { className?: string }) => (
  <img src="/assets/logo-bkash.svg" alt="bKash" className={`${className} object-contain`} />
);

const NagadLogo = ({ className = 'h-5' }: { className?: string }) => (
  <img src="/assets/logo-nagad.webp" alt="Nagad" className={`${className} object-contain`} />
);

// ─── QR Payment Panel ─────────────────────────────────────────────────────────

interface QrPaymentPanelProps {
  total: number;
  qrImageUrl: string;
  instruction: string;
  paidConfirm: boolean;
  onPaidConfirm: (confirmed: boolean) => void;
  onScreenshotUpload: (url: string) => void;
  screenshotUrl: string;
  screenshotEnabled?: boolean;
}

function QrPaymentPanel({
  total,
  qrImageUrl,
  instruction,
  paidConfirm,
  onPaidConfirm,
  onScreenshotUpload,
  screenshotUrl,
  screenshotEnabled = true
}: QrPaymentPanelProps) {
  const [timerCount, setTimerCount] = useState(10);
  const [timerDone, setTimerDone] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Start 10-second countdown when panel mounts
  useEffect(() => {
    setTimerDone(false);
    setTimerCount(10);
    intervalRef.current = setInterval(() => {
      setTimerCount(prev => {
        if (prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setTimerDone(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('ছবির সাইজ সর্বোচ্চ ৫ মেগাবাইট হতে পারবে।');
      return;
    }
    setUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      onScreenshotUpload(dataUrl);
      setUploading(false);
    };
    reader.onerror = () => {
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleCopyAmount = () => {
    navigator.clipboard.writeText(String(total)).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-md bg-white animate-in fade-in slide-in-from-top-4 duration-300">
      {/* Green Header */}
      <div className="bg-[#006A4E] px-5 py-4 flex items-center justify-between">
        <div>
          <h3 className="text-white font-black text-base tracking-tight">Bangla QR Payment</h3>
          <p className="text-white/70 text-[11px] font-semibold mt-0.5">স্ক্যান করে পেমেন্ট করুন</p>
        </div>
        <div className="flex items-center gap-1.5 bg-white/15 rounded-xl px-3 py-1.5">
          <span className="text-white/80 text-[10px] font-bold uppercase">Amount</span>
          <span className="text-white font-black text-base">৳{total.toLocaleString('en-IN')}</span>
          <button
            type="button"
            onClick={handleCopyAmount}
            title="Copy amount"
            className="ml-1 text-white/60 hover:text-white transition-colors"
          >
            {copied ? <CheckCircle className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Amount Banner */}
        <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Payable Amount</span>
            <span className="text-[#006A4E] font-black text-2xl leading-tight">৳{total.toLocaleString('en-IN')}</span>
            <span className="text-[10px] text-gray-400 font-semibold block mt-0.5">(No extra charge)</span>
          </div>
          <div className="text-right">
            <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[10px] font-black px-2 py-1 rounded-lg border border-emerald-100">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block" />
              Secure Payment
            </span>
          </div>
        </div>

        {/* QR Code */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="bg-white border-4 border-[#006A4E] rounded-2xl p-3 shadow-lg w-[220px] h-[220px] sm:w-[260px] sm:h-[260px] flex items-center justify-center">
              <img
                src={qrImageUrl}
                alt="Bangla QR Code — Scan to Pay"
                className="w-full h-full object-contain"
                loading="eager"
              />
            </div>
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-[#006A4E] text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full whitespace-nowrap shadow-md">
              SCAN HERE TO PAY
            </div>
          </div>
        </div>

        {/* QR Download Button */}
        <div className="flex justify-center mt-6">
          <button
            type="button"
            onClick={() => {
              const url = qrImageUrl.startsWith('/')
                ? window.location.origin + qrImageUrl
                : qrImageUrl;
              fetch(url)
                .then(res => res.blob())
                .then(blob => {
                  const objectUrl = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = objectUrl;
                  a.download = 'bangla-qr-payment.png';
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(objectUrl);
                })
                .catch(() => {
                  // Fallback: open in new tab
                  window.open(url, '_blank');
                });
            }}
            className="flex items-center gap-2 bg-[#006A4E]/10 hover:bg-[#006A4E]/20 text-[#006A4E] font-bold text-xs px-4 py-2.5 rounded-xl border border-[#006A4E]/20 hover:border-[#006A4E]/40 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            QR Code ডাউনলোড করুন
          </button>
        </div>

        {/* Payment Brand Logos Row */}
        <div className="border border-gray-100 rounded-xl px-4 py-3 flex items-center justify-center gap-3 flex-wrap bg-gray-50/50">
          <img src="/assets/logo-bkash.svg" alt="bKash" className="h-4 object-contain opacity-80" />
          <img src="/assets/logo-rocket.svg" alt="Rocket" className="h-4 object-contain opacity-80" />
          <div className="bg-[#006A4E] text-white font-bold text-[8px] px-1.5 py-0.5 rounded-sm leading-none">CellFin</div>
          <img src="/assets/logo-nagad.webp" alt="Nagad" className="h-4 object-contain opacity-80" />
          <img src="/assets/logo-visa.svg" alt="Visa" className="h-3.5 object-contain opacity-70" />
          <img src="/assets/logo-mastercard.svg" alt="Mastercard" className="h-5 object-contain opacity-70" />
        </div>

        {/* Instructions */}
        <p className="text-xs text-gray-500 leading-relaxed font-semibold text-center">
          {instruction}
        </p>

        {/* Optional Screenshot Upload (Controlled via Admin Panel Setting) */}
        {screenshotEnabled && (
          <div className="border-t border-dashed border-gray-200 pt-4 space-y-2">
            <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 text-center">
              Upload Payment Screenshot / Receipt{' '}
              <span className="text-gray-300 font-semibold normal-case">(Optional)</span>
            </p>
            <div
              className={`border-2 border-dashed rounded-xl p-4 text-center transition-all cursor-pointer hover:border-[#006A4E]/40 hover:bg-emerald-50/20 ${
                screenshotUrl
                  ? 'border-emerald-400 bg-emerald-50/50'
                  : 'border-gray-200 bg-gray-50/50'
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleScreenshotChange}
                className="hidden"
              />
              {uploading ? (
                <div className="flex flex-col items-center gap-1.5">
                  <div className="w-6 h-6 border-2 border-[#006A4E] border-t-transparent rounded-full animate-spin" />
                  <span className="text-[11px] text-[#006A4E] font-bold">প্রক্রিয়াকরণ হচ্ছে...</span>
                </div>
              ) : screenshotUrl ? (
                <div className="flex flex-col items-center gap-2">
                  {screenshotUrl.startsWith('data:image/') ? (
                    <img src={screenshotUrl} alt="Receipt Preview" className="h-20 max-w-[160px] object-contain rounded-lg border border-emerald-300 shadow-xs" />
                  ) : (
                    <CheckCircle className="w-6 h-6 text-emerald-500" />
                  )}
                  <div className="flex items-center gap-1 text-emerald-700 font-bold text-xs">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>পেমেন্ট রসিদ / স্ক্রিনশট সিলেক্ট করা হয়েছে</span>
                  </div>
                  <span className="text-[10px] text-gray-400">ছবি পরিবর্তন করতে ক্লিক করুন</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1.5">
                  <Upload className="w-6 h-6 text-gray-400" />
                  <span className="text-[11px] text-gray-600 font-semibold">পেমেন্টের স্ক্রিনশট বা রসিদ আপলোড করুন (ঐচ্ছিক)</span>
                  <span className="text-[9px] text-gray-400">সর্বোচ্চ সাইজ: 5MB (JPEG, PNG, WEBP, GIF)</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 10-second Timer → পেমেন্ট করেছি Button */}
        <div>
          {!timerDone ? (
            <div className="w-full py-3.5 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center gap-2">
              <Clock className="w-4 h-4 text-gray-400 animate-pulse" />
              <span className="text-gray-400 text-sm font-bold">
                পেমেন্ট করার পর বাটন আসবে ({timerCount}s)
              </span>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onPaidConfirm(!paidConfirm)}
              className={`w-full py-4 rounded-xl font-black text-sm uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm ${
                paidConfirm
                  ? 'bg-emerald-600 border-2 border-emerald-600 text-white shadow-emerald-600/20 shadow-md'
                  : 'bg-[#006A4E] hover:bg-[#005a42] text-white border-2 border-[#006A4E]'
              }`}
            >
              {paidConfirm ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  পেমেন্ট নিশ্চিত করা হয়েছে ✓
                </>
              ) : (
                <>✓ পেমেন্ট করেছি</>
              )}
            </button>
          )}
        </div>

        {/* Bangladesh Bank notice */}
        <div className="flex items-center justify-center gap-1.5 text-[9.5px] text-gray-400 font-semibold">
          <div className="w-4 h-4 rounded-full bg-[#006A4E] text-white flex items-center justify-center font-black text-[7px] leading-none shrink-0">BB</div>
          <span>বাংলাদেশ ব্যাংক লাইসেন্সপ্রাপ্ত পেমেন্ট গেটওয়ে</span>
        </div>
      </div>
    </div>
  );
}

// ─── bKash / Nagad Panel ──────────────────────────────────────────────────────

interface MfsPaymentPanelProps {
  method: 'bKash' | 'Nagad';
  number: string;
  instruction: string;
  total: number;
  transactionId: string;
  onTransactionIdChange: (id: string) => void;
  screenshotUrl?: string;
  onScreenshotUpload?: (url: string) => void;
  screenshotEnabled?: boolean;
}

function MfsPaymentPanel({
  method,
  number,
  instruction,
  total,
  transactionId,
  onTransactionIdChange,
  screenshotUrl,
  onScreenshotUpload,
  screenshotEnabled = true
}: MfsPaymentPanelProps) {
  const [copied, setCopied] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isBkash = method === 'bKash';
  const accentColor = isBkash ? '#E2125D' : '#F25F22';
  const bgColor = isBkash ? 'bg-pink-50' : 'bg-orange-50';
  const borderColor = isBkash ? 'border-pink-100' : 'border-orange-100';

  const handleCopyNumber = () => {
    navigator.clipboard.writeText(number).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('ছবির সাইজ সর্বোচ্চ ৫ মেগাবাইট হতে পারবে।');
      return;
    }
    setUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      onScreenshotUpload?.(dataUrl);
      setUploading(false);
    };
    reader.onerror = () => {
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className={`rounded-2xl overflow-hidden border ${borderColor} shadow-sm animate-in fade-in slide-in-from-top-4 duration-300`}>
      {/* Colored Header */}
      <div
        className="px-5 py-4 flex items-center gap-3"
        style={{ backgroundColor: accentColor }}
      >
        <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center p-2 shrink-0">
          {isBkash
            ? <img src="/assets/logo-bkash.svg" alt="bKash" className="w-full h-full object-contain" />
            : <img src="/assets/logo-nagad.webp" alt="Nagad" className="w-full h-full object-contain" />
          }
        </div>
        <div>
          <h3 className="text-white font-black text-base">{method} পেমেন্ট</h3>
          <p className="text-white/75 text-[11px] font-semibold">Send Money করুন</p>
        </div>
        <div className="ml-auto bg-white/20 rounded-xl px-3 py-1.5 text-right">
          <span className="text-white/80 text-[9px] font-bold uppercase block">Pay</span>
          <span className="text-white font-black text-base leading-tight">৳{total.toLocaleString('en-IN')}</span>
        </div>
      </div>

      <div className={`p-5 space-y-4 ${bgColor}`}>
        {/* Instructions */}
        <p className="text-xs text-gray-600 leading-relaxed font-semibold">
          {instruction.replace('{amount}', `৳${total.toLocaleString('en-IN')}`)}
        </p>

        {/* Phone Number Box */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs p-4 space-y-1">
          <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider block">
            {method} Personal Number
          </span>
          <div className="flex items-center justify-between gap-3">
            <span className="font-mono text-xl font-black tracking-wide" style={{ color: accentColor }}>
              {number}
            </span>
            <button
              type="button"
              onClick={handleCopyNumber}
              className="flex items-center gap-1.5 text-[10px] font-black uppercase px-3 py-1.5 rounded-lg border transition-all cursor-pointer"
              style={copied ? { backgroundColor: accentColor, color: 'white', borderColor: accentColor } : { borderColor: '#e5e7eb', color: '#6b7280' }}
            >
              {copied ? <CheckCircle className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <span className="text-[10px] text-gray-400 font-semibold">(Personal) — Send Money করুন</span>
        </div>

        {/* Transaction ID Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-black uppercase text-gray-600 tracking-wide block">
            Transaction ID (TrxID) *
          </label>
          <input
            type="text"
            required
            value={transactionId}
            onChange={e => onTransactionIdChange(e.target.value.toUpperCase())}
            placeholder="e.g. 8XM7C9JD32"
            className="w-full bg-white border-2 border-gray-200 focus:border-gray-500 rounded-xl px-4 py-3 text-sm font-mono uppercase tracking-widest focus:outline-none transition-colors"
          />
          <p className="text-[10px] text-gray-400 font-semibold">
            পেমেন্ট সম্পন্ন হওয়ার পর SMS-এ Transaction ID পাবেন
          </p>
        </div>

        {/* Optional Screenshot Upload (Controlled via Admin Panel Setting) */}
        {screenshotEnabled && onScreenshotUpload && (
          <div className="space-y-1.5 pt-2 border-t border-dashed border-gray-200">
            <label className="text-[10px] font-black uppercase text-gray-500 tracking-wider block">
              Payment Screenshot / Receipt (ঐচ্ছিক)
            </label>
            <div
              className={`border-2 border-dashed rounded-xl p-3 text-center transition-all cursor-pointer hover:border-gray-400 ${
                screenshotUrl
                  ? 'border-emerald-400 bg-emerald-50/50'
                  : 'border-gray-200 bg-white'
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleScreenshotChange}
                className="hidden"
              />
              {uploading ? (
                <div className="flex flex-col items-center gap-1">
                  <div className="w-5 h-5 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
                  <span className="text-[10px] text-gray-600 font-bold">প্রক্রিয়াকরণ হচ্ছে...</span>
                </div>
              ) : screenshotUrl ? (
                <div className="flex flex-col items-center gap-1.5">
                  {screenshotUrl.startsWith('data:image/') ? (
                    <img src={screenshotUrl} alt="Receipt Preview" className="h-16 max-w-[140px] object-contain rounded-lg border border-emerald-300 shadow-xs" />
                  ) : (
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                  )}
                  <span className="text-[11px] text-emerald-700 font-bold">পেমেন্ট রসিদ / স্ক্রিনশট যুক্ত হয়েছে ✓</span>
                  <span className="text-[9px] text-gray-400">ছবি পরিবর্তন করতে ক্লিক করুন</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1">
                  <Upload className="w-5 h-5 text-gray-400" />
                  <span className="text-[11px] text-gray-600 font-semibold">পেমেন্ট স্ক্রিনশট যোগ করুন (ঐচ্ছিক)</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Checkout Page ───────────────────────────────────────────────────────

export default function CheckoutPage() {
  const navigate = useNavigate();
  const cart = useStore(state => state.cart);
  const currentUser = useStore(state => state.currentUser);
  const checkoutForm = useStore(state => state.checkoutForm);
  const setCheckoutForm = useStore(state => state.setCheckoutForm);
  const placeOrder = useStore(state => state.placeOrder);
  const appliedCoupon = useStore(state => state.appliedCoupon);
  const applyCoupon = useStore(state => state.applyCoupon);
  const setAppliedCoupon = useStore(state => state.setAppliedCoupon);
  const dbSettings = useStore(state => state.dbSettings);
  const dbCoupons = useStore(state => state.dbCoupons);
  const addToast = useStore(state => state.addToast);

  const isScreenshotEnabled = (dbSettings?.payment_screenshot_enabled ?? dbSettings?.paymentScreenshotEnabled) !== false;

  // Active Recommended Coupons from Admin Panel
  const recommendedCoupons = useMemo(() => {
    return (dbCoupons || []).filter((c: any) => {
      const isRec = c.isRecommended === true || c.is_recommended === true;
      const isActive = c.isActive !== false && c.is_active !== false;
      return isRec && isActive;
    });
  }, [dbCoupons]);

  // Auto-Apply Qualified Coupons on Cart Threshold Engine
  useEffect(() => {
    const subtotal = cart.reduce((sum, item) => sum + (item.product.discountPrice || item.product.price) * item.quantity, 0);
    if (subtotal <= 0 || !dbCoupons || dbCoupons.length === 0) return;

    // Filter active auto-apply coupons
    const autoCoupons = (dbCoupons || []).filter((c: any) => {
      const isAuto = c.isAutoApply === true || c.is_auto_apply === true;
      const isActive = c.isActive !== false && c.is_active !== false;
      const notExpired = !c.expiryDate || new Date(c.expiryDate) >= new Date();
      const minReq = Number(c.minOrder ?? c.min_order ?? 0);
      return isAuto && isActive && notExpired && subtotal >= minReq;
    });

    if (autoCoupons.length > 0) {
      // Pick best auto-apply coupon (highest minOrder or discount)
      const best = autoCoupons.sort((a: any, b: any) => Number(b.minOrder ?? 0) - Number(a.minOrder ?? 0))[0];
      if (!appliedCoupon || (appliedCoupon.code !== best.code && (appliedCoupon as any).isAutoApply)) {
        applyCoupon(best.code);
      }
    } else if (appliedCoupon && (appliedCoupon as any).isAutoApply) {
      // If previously auto-applied coupon no longer qualifies due to cart reductions
      const minReq = Number(appliedCoupon.minOrder ?? 0);
      if (subtotal < minReq) {
        useStore.getState().removeCoupon();
      }
    }
  }, [cart, dbCoupons, appliedCoupon, applyCoupon]);

  useSEO({
    title: 'চেকআউট | Rupan',
    description: 'আপনার অর্ডার সম্পন্ন করুন।',
    canonical: '/checkout',
    robots: 'noindex, nofollow',
  });

  const [savedAddresses, setSavedAddresses] = useState<{ name: string; phone: string; address: string; area: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDivisionId, setSelectedDivisionId] = useState<string>(checkoutForm.division || '');
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>(checkoutForm.district || '');

  // Persistent payment proof & confirmation states to prevent closure wiping
  const [screenshotUrl, setScreenshotUrl] = useState<string>(checkoutForm.paymentScreenshotUrl || '');
  const [paidConfirmed, setPaidConfirmed] = useState<boolean>(checkoutForm.paidConfirm || false);

  // Coupon Input States
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  const hasSelectedLocation = Boolean(selectedDistrictId);

  useEffect(() => {
    if (checkoutForm.division) setSelectedDivisionId(checkoutForm.division);
    if (checkoutForm.district) setSelectedDistrictId(checkoutForm.district);
  }, [checkoutForm.division, checkoutForm.district]);

  const handleDivisionChange = (divId: string) => {
    setSelectedDivisionId(divId);
    setSelectedDistrictId('');
    setCheckoutForm({
      ...checkoutForm,
      division: divId,
      district: '',
      area: ''
    });
  };

  const handleDistrictChange = (distId: string) => {
    setSelectedDistrictId(distId);
    const districtObj = findDistrictById(distId);
    if (districtObj) {
      setCheckoutForm({
        ...checkoutForm,
        district: distId,
        area: districtObj.nameBn
      });
    }
  };

  const handleApplyCoupon = (e?: React.FormEvent, directCode?: string) => {
    if (e) e.preventDefault();
    const clean = (directCode || couponCodeInput).trim().toUpperCase();
    if (!clean) return;
    setCouponError('');
    setCouponSuccess('');

    const res = applyCoupon(clean);
    if (!res.success) {
      setCouponError(res.message);
      addToast(res.message, 'error');
      return;
    }

    // Evaluate effective discount with minimum price floor protection
    const { effectiveCoupon, isCappedToFloor } = calculateEffectiveDiscounts();

    if (effectiveCoupon === 0) {
      // Prompt requirement: If applying coupon results in 0 discount, display "ম্যাক্সিমাম ডিসকাউন্ট অ্যাপ্লাইড"
      setCouponSuccess('ম্যাক্সিমাম ডিসকাউন্ট অ্যাপ্লাইড (Maximum Discount Applied)');
      addToast('ম্যাক্সিমাম ডিসকাউন্ট অ্যাপ্লাইড: আপনার অর্ডারে ইতিমধ্যে সর্বোচ্চ ছাড় প্রযোজ্য হয়েছে।', 'info');
      setCouponCodeInput('');
      return;
    }

    if (isCappedToFloor) {
      setCouponSuccess(`কুপন '${clean}' কার্যকর হয়েছে! (ম্যাক্সিমাম ডিসকাউন্ট লিমিট: ৳${effectiveCoupon.toLocaleString('en-IN')} ছাড়)`);
      addToast(`কুপন '${clean}' কার্যকর হয়েছে (ম্যাক্সিমাম ডিসকাউন্ট সমন্বিত)!`, 'success');
    } else {
      setCouponSuccess(`কুপন '${clean}' কার্যকর হয়েছে! (৳${effectiveCoupon.toLocaleString('en-IN')} ছাড়)`);
      addToast(`কুপন '${clean}' সফলভাবে প্রয়োগ করা হয়েছে!`, 'success');
    }
    setCouponCodeInput('');
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponSuccess('');
    setCouponError('');
    addToast('কুপন রিমুভ করা হয়েছে।', 'info');
  };

  useEffect(() => {
    const loadSavedAddresses = async () => {
      if (!currentUser?.id || !useStore.getState().isSupabaseOnline) return;
      try {
        const orders = await orderService.fetchOrdersByUserId(currentUser.id);
        const unique: { name: string; phone: string; address: string; area: string }[] = [];
        const seen = new Set<string>();
        for (const o of orders) {
          const key = `${o.customerName}-${o.phone}-${o.address}-${o.area}`;
          if (!seen.has(key) && o.address && o.phone) {
            seen.add(key);
            unique.push({ name: o.customerName, phone: o.phone, address: o.address, area: o.area });
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
      setCheckoutForm({ ...checkoutForm, paymentMethod: enabledIds[0], transactionId: '', paidConfirm: false, paymentScreenshotUrl: '' });
    }
  }, [dbSettings]);

  const getItemFloorPrice = (product: Product): number => {
    const pConfig = dbSettings?.pricing_config || dbSettings?.pricingConfig || {};
    const deductionPct = Number(pConfig.deduction_percentage ?? 25) / 100;
    const regular = Number(product.price || 0);
    const purchase = Number(product.purchasePrice || product.purchase_price || 0);

    // Live calculation using current admin deduction percentage if wholesale cost exists
    if (purchase > 0 && regular > purchase) {
      const diffX = regular - purchase;
      return Math.round(regular - deductionPct * diffX);
    }

    if (product.finalPrice && product.finalPrice > 0) return product.finalPrice;
    if (product.final_price && product.final_price > 0) return product.final_price;
    return regular;
  };

  const getFloorSubtotal = () =>
    cart.reduce((sum, item) => sum + getItemFloorPrice(item.product) * item.quantity, 0);

  const getSubtotal = () =>
    cart.reduce((sum, item) => sum + (item.product.discountPrice || item.product.price) * item.quantity, 0);

  const getMaxAllowedDiscount = () => Math.max(0, getSubtotal() - getFloorSubtotal());

  const getShippingFee = () => {
    if (cart.length === 0) return 0;
    const insideFee = dbSettings?.inside_dhaka_shipping ?? dbSettings?.insideDhakaShipping ?? 60;
    const outsideFee = dbSettings?.outside_dhaka_shipping ?? dbSettings?.outsideDhakaShipping ?? 120;
    
    // Free shipping coupon overrides everything (applied manually or auto-applied)
    if (appliedCoupon?.type === 'free_shipping') return 0;
    
    // General Free shipping threshold ONLY if explicitly enabled by admin (> 0 and enabled)
    const isFreeShippingEnabled = Boolean(dbSettings?.free_shipping_enabled ?? dbSettings?.freeShippingEnabled ?? false);
    const freeShippingLimit = Number(dbSettings?.free_shipping_min_order ?? dbSettings?.freeShippingMinOrder ?? 0);
    if (isFreeShippingEnabled && freeShippingLimit > 0 && getSubtotal() >= freeShippingLimit) {
      return 0;
    }

    // If no location selected yet, default to inside-Dhaka fee (৳60)
    if (!hasSelectedLocation) return insideFee;
    const isDhaka = selectedDistrictId === 'dhaka' || 
                    checkoutForm.district === 'dhaka' || 
                    checkoutForm.area === 'Inside Dhaka' || 
                    checkoutForm.area?.includes('ঢাকা');
    return isDhaka ? insideFee : outsideFee;
  };

  const getRawCouponDiscount = () => {
    if (!appliedCoupon) return 0;
    const minOrder = appliedCoupon.minOrder || 0;
    if (getSubtotal() < minOrder) return 0;
    if (appliedCoupon.type === 'fixed') return Math.min(appliedCoupon.discount, getSubtotal());
    if (appliedCoupon.type === 'free_shipping') return 0;
    return Math.round((getSubtotal() * appliedCoupon.discount) / 100);
  };

  const getRawOnlinePaymentDiscount = () => {
    const isEnabled = Boolean(dbSettings?.online_payment_discount_enabled ?? dbSettings?.onlinePaymentDiscountEnabled ?? false);
    if (!isEnabled) return 0;

    const isOnlineMethod = ['Bangla QR', 'bKash', 'Nagad'].includes(checkoutForm.paymentMethod);
    if (!isOnlineMethod) return 0;

    const subtotal = getSubtotal();
    if (subtotal <= 0) return 0;

    const discountPercent = Number(dbSettings?.online_payment_discount_percent ?? dbSettings?.onlinePaymentDiscountPercent ?? 50);

    // Total margin buffer across cart
    const totalMargin = Math.max(0, subtotal - getFloorSubtotal());
    if (totalMargin <= 0) return 0;

    let discount = Math.round(totalMargin * (discountPercent / 100));

    // Incentive (up to 5% of subtotal as long as it does not exceed margin)
    const minIncentive = Math.min(Math.round(subtotal * 0.05), totalMargin);
    discount = Math.max(discount, minIncentive);

    return Math.min(discount, totalMargin);
  };

  // Multiple Discounts & Minimum Price Protection:
  // Final Payable Amount = max(Final Price, Discounted Selling Price)
  const calculateEffectiveDiscounts = () => {
    const rawCoupon = getRawCouponDiscount();
    const rawOnline = getRawOnlinePaymentDiscount();
    const maxDiscount = getMaxAllowedDiscount();

    const pConfig = dbSettings?.pricing_config || dbSettings?.pricingConfig || {};
    const combinationRule = pConfig.discount_combination_rule || 'stack';

    let effectiveCoupon = rawCoupon;
    let effectiveOnline = rawOnline;
    let isCappedToFloor = false;

    if (combinationRule === 'max') {
      if (rawCoupon >= rawOnline) {
        effectiveOnline = 0;
        effectiveCoupon = Math.min(rawCoupon, maxDiscount);
      } else {
        effectiveCoupon = 0;
        effectiveOnline = Math.min(rawOnline, maxDiscount);
      }
      if ((rawCoupon > maxDiscount && effectiveCoupon > 0) || (rawOnline > maxDiscount && effectiveOnline > 0)) {
        isCappedToFloor = true;
      }
    } else {
      // Default: Stack both discounts, with Floor Protection constraint
      const totalRequested = rawCoupon + rawOnline;
      if (totalRequested > maxDiscount) {
        isCappedToFloor = true;
        effectiveCoupon = Math.min(rawCoupon, maxDiscount);
        effectiveOnline = Math.max(0, maxDiscount - effectiveCoupon);
      }
    }

    return {
      effectiveCoupon,
      effectiveOnline,
      totalDiscount: effectiveCoupon + effectiveOnline,
      isCappedToFloor
    };
  };

  const getDiscountAmount = () => calculateEffectiveDiscounts().effectiveCoupon;
  const getOnlinePaymentDiscount = () => calculateEffectiveDiscounts().effectiveOnline;

  const getTotal = () => {
    const { totalDiscount } = calculateEffectiveDiscounts();
    const total = getSubtotal() + getShippingFee() - totalDiscount;
    return Math.max(0, total);
  };

  const hasTrackedCheckout = React.useRef(false);
  useEffect(() => {
    if (cart.length > 0 && !hasTrackedCheckout.current) {
      hasTrackedCheckout.current = true;
      const eventId = generateEventId('InitiateCheckout');
      const testCode = dbSettings?.metaTestEventCode || dbSettings?.meta_test_event_code;
      trackInitiateCheckout(cart, getTotal(), eventId, testCode);
    }
  }, [cart, dbSettings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutForm.name || !checkoutForm.phone || !checkoutForm.address) {
      addToast('সকল প্রয়োজনীয় তথ্য পূরণ করুন।', 'error');
      return;
    }

    if (!hasSelectedLocation) {
      addToast('অনুগ্রহ করে আপনার ডেলিভারি বিভাগ ও জেলা নির্বাচন করুন।', 'error');
      return;
    }

    if ((checkoutForm.paymentMethod === 'bKash' || checkoutForm.paymentMethod === 'Nagad') && !checkoutForm.transactionId?.trim()) {
      addToast(`${checkoutForm.paymentMethod} পেমেন্টের জন্য Transaction ID দিন।`, 'error');
      return;
    }

    if (checkoutForm.paymentMethod === 'Bangla QR' && !paidConfirmed && !checkoutForm.paidConfirm) {
      addToast('QR কোড স্ক্যান করে পেমেন্ট করুন, তারপর "পেমেন্ট করেছি" বাটনে ক্লিক করুন।', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const { effectiveCoupon, effectiveOnline } = calculateEffectiveDiscounts();
      const orderPayload = {
        ...checkoutForm,
        division: selectedDivisionId,
        district: selectedDistrictId,
        shippingFee: getShippingFee(),
        onlinePaymentDiscount: effectiveOnline,
        couponDiscount: effectiveCoupon,
        finalPriceFloor: getFloorSubtotal(),
        paidConfirm: paidConfirmed || checkoutForm.paidConfirm || false,
        paymentScreenshotUrl: isScreenshotEnabled ? (screenshotUrl || checkoutForm.paymentScreenshotUrl || '') : ''
      };
      const order = await placeOrder(orderPayload);
      if (order) {
        navigate('/order-success');
      }
    } catch (err: any) {
      console.error('Order submission error:', err);
      addToast('অর্ডার সম্পন্ন করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="font-display text-xl font-bold uppercase text-brand-text">Your bag is empty</h2>
        <p className="text-sm text-gray-500">Add products to your cart before proceeding to checkout.</p>
        <button onClick={() => navigate('/shop')} className="bg-brand-primary hover:bg-blue-950 text-white font-bold text-sm px-6 py-3 rounded-xl cursor-pointer">
          Explore Catalog
        </button>
      </div>
    );
  }

  const paymentOptions = [
    { id: 'Bangla QR', label: 'Bangla QR', logoSrc: '/assets/logo-banglaqr.svg', badge: 'অনলাইন ছাড়', enabled: dbSettings?.payment_bangla_qr_enabled ?? dbSettings?.paymentBanglaQrEnabled ?? true },
    { id: 'bKash', label: 'bKash', logoSrc: '/assets/logo-bkash.svg', badge: 'অনলাইন ছাড়', enabled: dbSettings?.payment_bkash_enabled ?? dbSettings?.paymentBkashEnabled ?? true },
    { id: 'Nagad', label: 'Nagad', logoSrc: '/assets/logo-nagad.webp', badge: 'অনলাইন ছাড়', enabled: dbSettings?.payment_nagad_enabled ?? dbSettings?.paymentNagadEnabled ?? true },
    { id: 'Cash on Delivery', label: 'Cash on Delivery', enabled: dbSettings?.payment_cod_enabled ?? dbSettings?.paymentCodEnabled ?? true }
  ].filter(p => p.enabled);

  return (
    <div className="w-full max-w-[1750px] mx-auto px-4 sm:px-8 lg:px-12 py-12 space-y-10">
      {/* Progress Indicator */}
      <div className="flex items-center justify-center gap-2 max-w-md mx-auto mb-10 text-xs font-bold uppercase text-gray-400">
        <span className="text-brand-primary">1. Shopping Bag</span>
        <span className="h-0.5 w-10 bg-brand-primary" />
        <span className="text-brand-primary">2. Delivery & Payment</span>
        <span className="h-0.5 w-10 bg-gray-200" />
        <span>3. Confirmed</span>
      </div>

      {/* Welcome / Guest Checkout Banner */}
      <div className="max-w-4xl mx-auto bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-200/80 rounded-2xl p-5 flex items-start gap-4 shadow-xs animate-in fade-in slide-in-from-top-4 duration-500">
        <div className="bg-orange-100 p-2.5 rounded-xl text-orange-600 font-extrabold text-xl shrink-0">🎉</div>
        <div className="space-y-1 text-left flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h4 className="text-xs sm:text-sm font-extrabold text-orange-950 uppercase tracking-wide">
              {currentUser ? 'স্বাগতম, আপনার অ্যাকাউন্ট থেকে অর্ডার করছেন' : 'প্রথমবার অর্ডার করছেন? Guest হিসেবে অর্ডার করতে পারেন'}
            </h4>
            {!currentUser && (
              <button
                type="button"
                onClick={() => navigate('/account')}
                className="text-[11px] font-black text-brand-primary hover:text-blue-900 bg-white border border-orange-200 hover:border-brand-primary px-3 py-1 rounded-lg transition-colors cursor-pointer w-fit shadow-2xs"
              >
                অ্যাকাউন্ট তৈরি করুন →
              </button>
            )}
          </div>
          <p className="text-[11px] sm:text-xs text-orange-800 leading-relaxed font-semibold">
            {currentUser 
              ? 'আপনার অ্যাকাউন্ট থেকে অর্ডারটি নিশ্চিত করা হচ্ছে। অর্ডার সংক্রান্ত সমস্ত আপডেট আপনার অ্যাকাউন্টে দেখতে পাবেন।'
              : 'এখন খুব সহজেই Guest হিসেবে অর্ডার সম্পন্ন করতে পারেন! ভবিষ্যতে স্পেশাল মেম্বার ডিসকাউন্ট ও ক্যাশব্যাক পেতে অ্যাকাউন্ট খুলে নিন। পরবর্তীতে Track Order পেজে ফোন নম্বর ও Order ID দিয়ে ডেলিভারি ট্র্যাক করতে পারবেন।'
            }
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left — Form */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-xs space-y-6">
          <h2 className="font-display text-lg font-bold uppercase tracking-wide text-brand-text pb-3 border-b border-gray-100">
            Shipping & Delivery Information
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Quick Autofill */}
            {savedAddresses.length > 0 && (
              <div className="bg-gray-50/50 border border-gray-100 rounded-2xl p-4 space-y-3 mb-4">
                <label className="text-[10px] uppercase font-black text-gray-400 block tracking-wider">
                  Quick Autofill Address History:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {savedAddresses.map((addr, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setCheckoutForm({ ...checkoutForm, name: addr.name, phone: addr.phone, address: addr.address, area: addr.area });
                        addToast('Autofilled shipping details!', 'success');
                      }}
                      className="bg-white hover:bg-orange-50/30 border border-gray-200 hover:border-[#ff5c00]/30 rounded-xl p-3 text-left transition-all cursor-pointer space-y-1 shadow-2xs hover:shadow-xs"
                    >
                      <span className="block font-sans font-bold text-xs text-gray-900 truncate">{addr.name}</span>
                      <span className="block font-sans text-[10px] text-gray-400 font-semibold">{addr.phone}</span>
                      <p className="font-sans text-[10px] text-gray-500 line-clamp-1">{addr.address}</p>
                      <span className="inline-block bg-[#ff5c00]/10 text-[#ff5c00] text-[9px] font-bold px-1.5 py-0.5 rounded-md mt-1">{addr.area}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Name */}
            <div className="space-y-1.5">
              <label className="text-xs uppercase font-bold text-gray-500">Customer Full Name *</label>
              <input
                type="text" required value={checkoutForm.name}
                onChange={e => setCheckoutForm({ ...checkoutForm, name: e.target.value })}
                placeholder="e.g. Sajid Al-Hasan"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-primary font-sans"
              />
            </div>

            {/* Phone & Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs uppercase font-bold text-gray-500">Phone Number *</label>
                <input
                  type="tel" required value={checkoutForm.phone}
                  onChange={e => setCheckoutForm({ ...checkoutForm, phone: e.target.value })}
                  placeholder="e.g. 01712345678"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-primary font-sans"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs uppercase font-bold text-gray-500">Email Address (Optional)</label>
                <input
                  type="email" value={checkoutForm.email}
                  onChange={e => setCheckoutForm({ ...checkoutForm, email: e.target.value })}
                  placeholder="e.g. customer@gmail.com"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-primary font-sans"
                />
              </div>
            </div>

            {/* Bangladesh 64 Districts Location Selector (Division & District FIRST) */}
            <div className="bg-gray-50/80 border border-gray-200/80 rounded-2xl p-4 sm:p-5 space-y-4">
              <label className="text-xs uppercase font-extrabold text-gray-700 flex items-center gap-1.5 tracking-wider">
                <MapPin className="w-4 h-4 text-[#006A4E]" />
                <span>ডেলিভারি এলাকা ও জেলা নির্বাচন করুন (Delivery Location) *</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Division Selector */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-gray-500 uppercase">বিভাগ (Division) *</span>
                  <select
                    value={selectedDivisionId}
                    onChange={e => handleDivisionChange(e.target.value)}
                    required
                    className="w-full bg-white border-2 border-gray-200 hover:border-gray-300 focus:border-brand-primary rounded-xl px-3.5 py-2.5 text-xs font-bold text-gray-800 focus:outline-none transition-colors cursor-pointer"
                  >
                    <option value="">-- বিভাগ নির্বাচন করুন --</option>
                    {BANGLADESH_DIVISIONS.map(div => (
                      <option key={div.id} value={div.id}>
                        {div.nameBn} ({div.nameEn})
                      </option>
                    ))}
                  </select>
                </div>

                {/* District Selector */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-gray-500 uppercase">জেলা (District) *</span>
                  <select
                    value={selectedDistrictId}
                    disabled={!selectedDivisionId}
                    onChange={e => handleDistrictChange(e.target.value)}
                    required
                    className="w-full bg-white disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed border-2 border-gray-200 hover:border-gray-300 focus:border-brand-primary rounded-xl px-3.5 py-2.5 text-xs font-bold text-gray-800 focus:outline-none transition-colors cursor-pointer"
                  >
                    <option value="">{selectedDivisionId ? '-- জেলা নির্বাচন করুন --' : '-- আগে বিভাগ নির্বাচন করুন --'}</option>
                    {(BANGLADESH_DIVISIONS.find(d => d.id === selectedDivisionId)?.districts || []).map(dist => (
                      <option key={dist.id} value={dist.id}>
                        {dist.nameBn}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Detailed Address (Follows Division & District) */}
            <div className="space-y-1.5">
              <label className="text-xs uppercase font-bold text-gray-500">বিস্তারিত ডেলিভারি ঠিকানা (Detailed Delivery Address) *</label>
              <textarea
                required rows={3} value={checkoutForm.address}
                onChange={e => setCheckoutForm({ ...checkoutForm, address: e.target.value })}
                placeholder="বাসা/হোল্ডিং নম্বর, রোড নম্বর, এলাকা, থানা ইত্যাদি বিস্তারিত লিখুন (e.g. House 12, Road 3, Sector 4, Uttara)"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-primary font-sans resize-none"
              />
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-4 pt-5 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <label className="text-xs uppercase font-extrabold text-gray-500 block tracking-wider">
                  Choose Payment Method *
                </label>
                <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                  🎉 অনলাইন পেমেন্টে বিশেষ ছাড়
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {paymentOptions.map(pay => {
                  const isSelected = checkoutForm.paymentMethod === pay.id;
                  return (
                    <button
                      key={pay.id}
                      type="button"
                      onClick={() => setCheckoutForm({
                        ...checkoutForm,
                        paymentMethod: pay.id,
                        transactionId: '',
                        paidConfirm: false,
                        paymentScreenshotUrl: ''
                      })}
                      className={`relative py-3 px-2 rounded-xl font-bold text-xs uppercase border-2 transition-all cursor-pointer text-center flex flex-col items-center justify-center gap-1.5 select-none min-h-[85px] ${
                        isSelected
                          ? 'bg-blue-50 border-brand-primary text-brand-primary shadow-sm'
                          : 'bg-white border-gray-200 text-gray-500 hover:border-gray-400'
                      }`}
                    >
                      {pay.badge && (
                        <span className="absolute -top-2.5 bg-gradient-to-r from-emerald-600 to-green-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-2xs tracking-tight">
                          {pay.badge}
                        </span>
                      )}
                      {pay.logoSrc ? (
                        <div className="w-16 h-7 flex items-center justify-center overflow-hidden">
                          <img src={pay.logoSrc} alt={pay.label} className="w-full h-full object-contain" />
                        </div>
                      ) : (
                        <Truck className="w-6 h-6 text-gray-600" />
                      )}
                      <span className="leading-tight mt-0.5 text-[10px]">{pay.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Dynamic Payment Panels */}
              <div className="pt-2">
                {checkoutForm.paymentMethod === 'Bangla QR' && (
                  <QrPaymentPanel
                    total={getTotal()}
                    qrImageUrl={dbSettings?.payment_bangla_qr_image ?? dbSettings?.paymentBanglaQrImage ?? '/assets/Defualt_Bangla_Qr_EBL.jpeg'}
                    instruction={dbSettings?.payment_bangla_qr_instruction ?? dbSettings?.paymentBanglaQrInstruction ?? 'যেকোনো ব্যাংকিং বা পেমেন্ট অ্যাপ ওপেন করে "Scan QR" বা "Bangla QR" সিলেক্ট করে পাশের কোডটি স্ক্যান করে পেমেন্ট সম্পন্ন করুন।'}
                    paidConfirm={paidConfirmed || checkoutForm.paidConfirm || false}
                    onPaidConfirm={confirmed => {
                      setPaidConfirmed(confirmed);
                      setCheckoutForm(prev => ({ ...prev, paidConfirm: confirmed }));
                    }}
                    onScreenshotUpload={url => {
                      setScreenshotUrl(url);
                      setCheckoutForm(prev => ({ ...prev, paymentScreenshotUrl: url }));
                    }}
                    screenshotUrl={screenshotUrl || checkoutForm.paymentScreenshotUrl || ''}
                    screenshotEnabled={isScreenshotEnabled}
                  />
                )}

                {(checkoutForm.paymentMethod === 'bKash' || checkoutForm.paymentMethod === 'Nagad') && (
                  <MfsPaymentPanel
                    method={checkoutForm.paymentMethod as 'bKash' | 'Nagad'}
                    number={
                      checkoutForm.paymentMethod === 'bKash'
                        ? (dbSettings?.payment_bkash_number ?? dbSettings?.paymentBkashNumber ?? '01600338318')
                        : (dbSettings?.payment_nagad_number ?? dbSettings?.paymentNagadNumber ?? '01600338318')
                    }
                    instruction={dbSettings?.payment_mfs_instruction ?? dbSettings?.paymentMfsInstruction ?? 'নিচের নম্বরে {amount} সেন্ড মানি (Send Money) করার পর পেমেন্ট ভেরিফাই করতে ট্রানজেকশন আইডি (TrxID) নিচে দিন।'}
                    total={getTotal()}
                    transactionId={checkoutForm.transactionId || ''}
                    onTransactionIdChange={id => setCheckoutForm({ ...checkoutForm, transactionId: id })}
                    screenshotUrl={screenshotUrl || checkoutForm.paymentScreenshotUrl || ''}
                    onScreenshotUpload={url => {
                      setScreenshotUrl(url);
                      setCheckoutForm(prev => ({ ...prev, paymentScreenshotUrl: url }));
                    }}
                    screenshotEnabled={isScreenshotEnabled}
                  />
                )}

                {checkoutForm.paymentMethod === 'Cash on Delivery' && (
                  <div className="bg-gray-50 border border-gray-150 rounded-2xl p-5 shadow-xs space-y-3 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="flex items-center gap-3">
                      <Truck className="w-5 h-5 text-gray-500" />
                      <h4 className="font-display font-extrabold text-gray-900 text-sm uppercase tracking-wide">
                        Cash on Delivery (ক্যাশ অন ডেলিভারি)
                      </h4>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed font-semibold">
                      {dbSettings?.payment_cod_instruction ?? dbSettings?.paymentCodInstruction ?? 'অর্ডার প্লেস করুন এবং সারাদেশে হোম ডেলিভারি পাওয়ার পর কুরিয়ার এজেন্টের কাছে ক্যাশ টাকা দিয়ে আপনার পণ্য বুঝে নিন।'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-brand-primary hover:bg-blue-950 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-sm py-4 rounded-xl text-center shadow-lg hover:shadow-xl transition-all cursor-pointer block mt-6 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  অর্ডার প্রক্রিয়া চলছে...
                </>
              ) : (
                `Confirm Order ৳${getTotal().toLocaleString('en-IN')}`
              )}
            </button>
          </form>
        </div>

        {/* Right — Order Summary */}
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

          {/* Coupon Code & Recommendations Section */}
          <div className="pt-2 space-y-3">
            {/* 1. Recommended Coupons (if admin enabled recommendation) */}
            {recommendedCoupons.length > 0 && !appliedCoupon && (
              <div className="bg-gradient-to-r from-amber-50/90 to-orange-50/80 p-3 rounded-2xl border border-amber-200/90 space-y-2 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase text-amber-950 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                    <span>বিশেষ কুপন রিকমেন্ডেশন (Recommended Coupons)</span>
                  </span>
                  <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">
                    স্পেশাল অফার
                  </span>
                </div>

                <div className="space-y-1.5">
                  {recommendedCoupons.map((rc: any) => {
                    const minOrd = Number(rc.minOrder ?? rc.min_order ?? 0);
                    const meetsMin = getSubtotal() >= minOrd;
                    const deficit = minOrd - getSubtotal();

                    return (
                      <div key={rc.code} className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-amber-100 shadow-2xs">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-black text-xs text-[#ff5c00] uppercase tracking-wider bg-orange-50 px-2 py-0.5 rounded-md border border-orange-100">
                              {rc.code}
                            </span>
                            <span className="text-[11px] font-bold text-gray-800">
                              {rc.type === 'percentage' ? `${rc.value}% ছাড়` : rc.type === 'fixed' ? `৳${rc.value} ছাড়` : 'ফ্রি শিপিং'}
                            </span>
                          </div>
                          <span className="text-[10px] text-gray-500 block mt-0.5">
                            {minOrd > 0 ? `ন্যূনতম অর্ডার ৳${minOrd.toLocaleString('en-IN')}` : 'যেকোনো অর্ডারে প্রযোজ্য'}
                            {!meetsMin && deficit > 0 && (
                              <span className="text-amber-700 font-semibold ml-1">(আর মাত্র ৳{deficit.toLocaleString('en-IN')} যোগ করুন)</span>
                            )}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleApplyCoupon(undefined, rc.code)}
                          className={`text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                            meetsMin
                              ? 'bg-[#ff5c00] hover:bg-orange-600 text-white shadow-xs active:scale-95'
                              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                          }`}
                        >
                          Apply This (প্রয়োগ করুন)
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 2. Coupon Form / Applied Coupon View */}
            {appliedCoupon ? (
              <div className="bg-emerald-50/90 border border-emerald-200 rounded-xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-xs text-emerald-800 uppercase tracking-wider">{appliedCoupon.code}</span>
                      <span className="text-[9px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-md font-bold">প্রয়োগকৃত</span>
                    </div>
                    <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                      {appliedCoupon.type === 'free_shipping' ? 'ফ্রি শিপিং কার্যকর' : getDiscountAmount() === 0 ? (
                        <span className="text-amber-800 font-bold">ম্যাক্সিমাম ডিসকাউন্ট অ্যাপ্লাইড (৳০ অতিরিক্ত ছাড়)</span>
                      ) : (
                        `৳${getDiscountAmount().toLocaleString('en-IN')} ছাড়`
                      )}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveCoupon}
                  className="text-xs text-red-500 hover:text-red-700 font-bold px-2 py-1 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                >
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-600 uppercase flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-gray-400" />
                  <span>কুপন কোড (Promo Code)</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCodeInput}
                    onChange={e => {
                      setCouponCodeInput(e.target.value.toUpperCase());
                      setCouponError('');
                    }}
                    placeholder="কোড লিখুন (যেমন: EID20)"
                    className="flex-1 bg-gray-50 border border-gray-200 focus:border-brand-primary rounded-xl px-3 py-2 text-xs font-mono uppercase tracking-wider focus:outline-none transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={!couponCodeInput.trim()}
                    className="bg-brand-primary hover:bg-blue-950 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer shadow-xs shrink-0"
                  >
                    Apply
                  </button>
                </div>
                {couponError && <p className="text-[10px] text-red-500 font-semibold">{couponError}</p>}
                {couponSuccess && <p className="text-[10px] text-emerald-600 font-semibold">{couponSuccess}</p>}
              </form>
            )}
          </div>

          <div className="space-y-3 text-xs font-semibold pt-4 border-t border-gray-100">
            <div className="flex justify-between">
              <span className="text-gray-500">Subtotal</span>
              <span>৳{getSubtotal().toLocaleString('en-IN')}</span>
            </div>
            {appliedCoupon && (
              <div className="flex justify-between items-center text-emerald-600 font-bold">
                <span>Discount ({appliedCoupon.code})</span>
                {getDiscountAmount() === 0 ? (
                  <span className="text-[10px] bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded-full font-bold">
                    ম্যাক্সিমাম ডিসকাউন্ট অ্যাপ্লাইড
                  </span>
                ) : (
                  <span>- ৳{getDiscountAmount().toLocaleString('en-IN')}</span>
                )}
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Shipping</span>
              <span className="font-bold">
                {getShippingFee() === 0 ? (
                  <span className="text-emerald-600 font-black">🎉 FREE</span>
                ) : (
                  <span>
                    ৳{getShippingFee().toLocaleString('en-IN')}
                    {!hasSelectedLocation && (
                      <span className="text-[9px] text-gray-400 font-normal ml-1">(আনুমানিক)</span>
                    )}
                  </span>
                )}
              </span>
            </div>
            {getOnlinePaymentDiscount() > 0 && (
              <div className="flex justify-between items-center text-emerald-700 font-bold bg-emerald-50/90 p-2.5 rounded-xl border border-emerald-200">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>অনলাইন পেমেন্ট ডিসকাউন্ট</span>
                </span>
                <span className="font-mono text-emerald-700 font-black">- ৳{getOnlinePaymentDiscount().toLocaleString('en-IN')}</span>
              </div>
            )}
            {['Bangla QR', 'bKash', 'Nagad'].includes(checkoutForm.paymentMethod) && getOnlinePaymentDiscount() === 0 && (
              <div className="text-[10.5px] bg-sky-50 text-sky-900 p-2.5 rounded-xl border border-sky-200 flex items-center gap-1.5 font-medium leading-relaxed">
                <ShieldCheck className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                <span>ম্যাক্সিমাম ডিসকাউন্ট অ্যাপ্লাইড: আপনার কার্টের পণ্যগুলো ইতিমধ্যেই সর্বোচ্চ গ্রহণযোগ্য ছাড়কৃত মূল্যে (Final Price) রয়েছে।</span>
              </div>
            )}
            {calculateEffectiveDiscounts().isCappedToFloor && getOnlinePaymentDiscount() > 0 && (
              <div className="text-[10px] bg-amber-50 text-amber-900 p-2.5 rounded-xl border border-amber-200 flex items-center gap-1.5 font-semibold leading-relaxed">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>সর্বোচ্চ গ্রহণযোগ্য ডিসকাউন্ট সমন্বয় করা হয়েছে (ওয়েবসাইট ন্যূনতম মূল্য সুরক্ষিত)।</span>
              </div>
            )}
            {checkoutForm.paymentMethod === 'Cash on Delivery' && (
              <div className="text-[11px] text-gray-500 bg-gray-50 p-2 rounded-lg border border-gray-150 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-emerald-600 shrink-0" />
                <span>বিকাশ, নগদ বা Bangla QR-এ পেমেন্ট করলে বিশেষ ছাড় পাবেন!</span>
              </div>
            )}
            <div className="flex justify-between items-center text-sm font-bold text-brand-primary border-t border-gray-100 pt-3">
              <span>Total</span>
              <span className="text-base font-black">৳{getTotal().toLocaleString('en-IN')}</span>
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
