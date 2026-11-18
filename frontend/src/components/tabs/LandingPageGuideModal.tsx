import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, BookOpen, Copy, Check, Sparkles, Code, Database, 
  HelpCircle, Layers, ArrowRight, ExternalLink, ShieldCheck, Zap,
  AlertCircle, CheckCircle2, QrCode, Send, MessageSquare,
  Search, Palette, Smartphone, Tag, ShoppingBag, Sliders, RefreshCw, ChevronDown, Server, Flame
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

// Production Credentials & CDN URLs from Supabase Settings
const STORE_DOMAIN = 'https://www.myrupan.com';
const PUBLIC_BANGLA_QR_IMAGE = 'https://psedkelwvpcxsmulgwry.supabase.co/storage/v1/object/public/banners/banglaqr-1794762015437.jpg';
const PUBLIC_BKASH_NUMBER = '01600338318';
const PUBLIC_NAGAD_NUMBER = '01600338318';
const PUBLIC_WHATSAPP_NUMBER = '+8801974793083';
const PUBLIC_SUPABASE_URL = 'https://psedkelwvpcxsmulgwry.supabase.co';
const PUBLIC_SUPABASE_ANON_KEY = 'sb_publishable_4v0ppJKa529965hglBYlig_gm_3RTT9';

export const VARIABLE_DOCUMENTATION = [
  {
    key: 'RUPAN_PRODUCT_ID',
    label: 'প্রোডাক্ট আইডি (Product ID / SKU)',
    description: 'যে নির্দিষ্ট প্রোডাক্টটির জন্য ল্যান্ডিং পেজ তৈরি করছেন তার আসল আইডি (যেমন: mohasagor-8184 বা SKU)। অর্ডারের items লিস্টে এই আইডিটি পাঠালে ডাটাবেজ ও অ্যাডমিন প্যানেলে সঠিক প্রোডাক্টটি স্বয়ংক্রিয়ভাবে লিংক হবে।',
    whereToUse: 'জাভাস্ক্রিপ্ট অর্ডারের items অ্যারেতে: productId: "RUPAN_PRODUCT_ID"',
    badge: 'Database',
    required: true
  },
  {
    key: 'RUPAN_SUPABASE_URL',
    label: 'Supabase ডাটাবেজ URL',
    description: 'আপনার Supabase প্রজেক্টের URL। ল্যান্ডিং পেজ থেকে সরাসরি orders টেবিলে অর্ডার সেভ এবং ব্যাকএন্ড কমিউনিকেশনের জন্য প্রয়োজন।',
    whereToUse: 'জাভাস্ক্রিপ্টে supabase.createClient("RUPAN_SUPABASE_URL", "...")',
    badge: 'Database',
    required: true
  },
  {
    key: 'RUPAN_SUPABASE_KEY',
    label: 'Supabase পাবলিক অ্যানোন কি (Anon Key)',
    description: 'ক্লায়েন্ট সাইড থেকে নতুন অর্ডার ইনসার্ট করার সিকিউর পাবলিক অ্যানোনিমাস কি।',
    whereToUse: 'জাভাস্ক্রিপ্টে supabase.createClient("...", "RUPAN_SUPABASE_KEY")',
    badge: 'Database',
    required: true
  },
  {
    key: 'RUPAN_INSIDE_DHAKA_SHIPPING',
    label: 'ঢাকার ভেতরে ডেলিভারি চার্জ (শুধুমাত্র ঢাকা জেলা)',
    description: 'অ্যাডমিন সেটিংসের "Inside Dhaka Shipping Cost" (যেমন: ৬০)। শুধুমাত্র "ঢাকা জেলা" সিলেক্ট করলে এই চার্জটি যুক্ত হবে।',
    whereToUse: 'ডেলিভারি জেলা "ঢাকা" হলে: Number("RUPAN_INSIDE_DHAKA_SHIPPING")',
    badge: 'Shipping',
    required: true
  },
  {
    key: 'RUPAN_OUTSIDE_DHAKA_SHIPPING',
    label: 'ঢাকার বাইরে ডেলিভারি চার্জ (বাকি ৬৩টি জেলা)',
    description: 'অ্যাডমিন সেটিংসের "Outside Dhaka Shipping Cost" (যেমন: ১২০)। ঢাকা ব্যতীত বাংলাদেশের বাকি সব জেলার জন্য এই চার্জ প্রযোজ্য।',
    whereToUse: 'ডেলিভারি জেলা ঢাকা ব্যতীত অন্য যেকোনো জেলা হলে: Number("RUPAN_OUTSIDE_DHAKA_SHIPPING")',
    badge: 'Shipping',
    required: true
  },
  {
    key: 'RUPAN_BANGLA_QR_IMAGE',
    label: 'বাংলা কিউআর ইমেজ URL',
    description: 'আপনার Supabase Storage CDN-এ হোস্ট করা অফিসিয়াল বাংলা কিউআর কোড ইমেজ URL।',
    whereToUse: 'পেমেন্ট প্যানেলে: <img src="RUPAN_BANGLA_QR_IMAGE" />',
    badge: 'Payment',
    required: true
  },
  {
    key: 'RUPAN_BKASH_NUMBER',
    label: 'বিকাশ পেমেন্ট নম্বর',
    description: 'আপনার অফিসিয়াল বিকাশ নম্বর (০১৬০০৩৩৮৩১৮)।',
    whereToUse: 'বিকাশ নির্দেশনায়: "বিকাশ নম্বর: RUPAN_BKASH_NUMBER"',
    badge: 'Payment',
    required: true
  },
  {
    key: 'RUPAN_NAGAD_NUMBER',
    label: 'নগদ পেমেন্ট নম্বর',
    description: 'আপনার অফিসিয়াল নগদ নম্বর (০১৬০০৩৩৮৩১৮)।',
    whereToUse: 'নগদ নির্দেশনায়: "নগদ নম্বর: RUPAN_NAGAD_NUMBER"',
    badge: 'Payment',
    required: true
  },
  {
    key: 'RUPAN_META_PIXEL_ID',
    label: 'ফেসবুক মেটা পিক্সেল আইডি (ঐচ্ছিক)',
    description: 'আপনার ফেসবুক মেটা পিক্সেল আইডি (১০৩৪৭৮৫৭৬৫৬০৩৬৫৪)। ফেসবুক বিজ্ঞাপন ও Purchase কনভার্সন ট্র্যাক করার জন্য ব্যবহৃত হয়। বিজ্ঞাপন না চালালে আবশ্যক নয়।',
    whereToUse: '<head> বা fbq("init", "RUPAN_META_PIXEL_ID") এবং Purchase ইভেন্টে',
    badge: 'Marketing',
    required: false
  },
  {
    key: 'RUPAN_FREE_SHIPPING_MIN',
    label: 'ফ্রি শিপিং অর্ডারের ন্যূনতম সীমা (ঐচ্ছিক)',
    description: 'অ্যাডমিন সেটিংসের "Free Shipping Minimum Order" (যেমন: ৩০০০)। ফ্রি ডেলিভারি অফার ব্যানার দেখাতে চাইলে ব্যবহার করতে পারেন।',
    whereToUse: 'অফার ব্যানার টেক্সটে বা ক্যালকুলেশনে',
    badge: 'Shipping',
    required: false
  },
  {
    key: 'RUPAN_GTM_ID',
    label: 'Google Tag Manager আইডি (ঐচ্ছিক)',
    description: 'গুগল ট্যাগ ম্যানেজার কন্টেইনার আইডি (যেমন: GTM-KBXTR5WT)।',
    whereToUse: 'GTM স্ক্রিপ্ট ট্যাগে',
    badge: 'Marketing',
    required: false
  },
  {
    key: 'RUPAN_GA4_ID',
    label: 'Google Analytics 4 আইডি (ঐচ্ছিক)',
    description: 'গুগল অ্যানালিটিক্স ৪ ট্র্যাকিং আইডি (যেমন: G-RF6ZKR8P0Z)।',
    whereToUse: 'gtag স্ক্রিপ্ট ট্যাগে',
    badge: 'Marketing',
    required: false
  }
];

export const AI_LANDING_PAGE_PROMPT = `তুমি Rupan ই-কমার্স প্ল্যাটফর্মের জন্য একটি সম্পূর্ণ প্রোডাকশন-রেডি, হাই-কনভার্টিং সিঙ্গেল-ফাইল HTML ল্যান্ডিং পেজ তৈরি করবে। কোনো প্রশ্ন না করে সরাসরি ১০০% ত্রুটিমুক্ত ও সম্পূর্ণ কোড প্রদান করো।

==================================================
🏛️ আমাদের সিস্টেম আর্কিটেকচার ও সার্ভার কীভাবে কাজ করে:
==================================================
১. এই ল্যান্ডিং পেজটি Rupan-এর Vercel Serverless ইঞ্জিন (https://www.myrupan.com/api/landing) দ্বারা সরাসরি গ্লোবাল Edge CDN থেকে ক্যাশড হয়ে রেন্ডার হয়। কোনো ভারী ফ্রেমওয়ার্ক ছাড়া পিওর HTML/CSS/JS হওয়ায় এটি মিলি-সেকেন্ডে সুপারফাস্ট লোড হয়।
২. লাখ লাখ ফেসবুক অ্যাড ট্রাফিকের সময় যাতে সার্ভার হ্যাং বা ক্র্যাশ না করে, সেজন্য পেজটি ক্লায়েন্ট সাইডে পুরোপুরি স্ট্যাটিক এবং অর্ডার সাবমিশনের সময় সরাসরি Vercel Serverless API (https://www.myrupan.com/api/place-order)-এ কল করে।
৩. /api/place-order এন্ডপয়েন্টটি একই সাথে দুটি কাজ করে:
   ক. Supabase ডাটাবেজের 'orders' এবং 'order_items' টেবিলে অর্ডারটি নিরাপদে সেভ করে।
   খ. টেলিগ্রাম বট (Telegram Bot API)-এর মাধ্যমে মার্চেন্টের টেলিগ্রাম চ্যানেলে ইনস্ট্যান্ট বিস্তারিত নোটিফিকেশন পাঠায়।
   গ. যদি কোনো কারণে নেটওয়ার্ক ড্রপ করে, তবে ক্লায়েন্ট সাইডে Supabase REST API-তে সরাসরি ইনসার্ট করার ফেইল-সেফ ফলব্যাক কোড থাকতে হবে।

==================================================
📌 প্রোডাক্টের তথ্য (Product Details):
==================================================
- প্রোডাক্ট নাম: [প্রোডাক্টের নাম এখানে লিখুন]
- প্রোডাক্ট আইডি: [যেমন: mohasagor-8184]
- অফার মূল্য: [যেমন: ৳ ১,৬৫০] (রেগুলার মূল্য: [যেমন: ৳ ২,৫০০])
- প্রধান ছবি: [ছবির লিংক]

==================================================
🎨 ফ্রন্টেন্ড ডিজাইন ও ক্রিয়েটিভিটি রুলস:
==================================================
১. প্রিমিয়াম লুক: আধুনিক ডিটুসি ব্র্যান্ডের মতো আকর্ষণীয় ডিজাইন, Rupan সিগনেচার অরেঞ্জ (#ff5c00) ও ডার্ক স্লেট কালার থিম।
২. ক্যাচি হিরো ও কাউন্টডাউন ব্যানার: আকর্ষণীয় বাংলা হেডলাইন, সীমিত সময়ের মেগা অফার ব্যানার ও কাউন্টডাউন টাইমার।
৩. গ্লাস-মরফিজম ফিচার কার্ড: সুন্দর আইকন সহ ফিচারস হাইলাইটস ও ৩টি ট্রাস্ট ব্যাজ (১০০% অরিজিনাল পণ্য, সারা দেশে ডেলিভারি, ক্যাশ অন ডেলিভারি)।
৪. মোবাইল স্টিকি বটম বার: মোবাইলে স্ক্রল করার সময় নিচে একটি স্লিম ফ্লোটিং "🛒 এখনই অর্ডার করুন" বাটন থাকবে যা সরাসরি অর্ডারের ফর্মে নিয়ে যাবে।

==================================================
⚙️ ডেলিভারি চার্জ, জেলা ও পেমেন্ট রুলস:
==================================================
১. বিভাগ ও জেলা নির্বাচন:
   - ৮টি বিভাগের ড্রপডাউন (ঢাকা, চট্টগ্রাম, রাজশাহী, খুলনা, বরিশাল, সিলেট, রংপুর, ময়মনসিংহ)। বিভাগ নির্বাচন করলে ওই বিভাগের জেলাগুলো জেলা ড্রপডাউনে ডায়নামিকালি আসবে।
   - Inside Dhaka (শুধুমাত্র ঢাকা জেলা): ডেলিভারি চার্জ ৬০ টাকা (বা RUPAN_INSIDE_DHAKA_SHIPPING)।
   - Outside Dhaka (ঢাকা ব্যতীত বাকি সকল ৬৩টি জেলা): ডেলিভারি চার্জ ১২০ টাকা (বা RUPAN_OUTSIDE_DHAKA_SHIPPING)।
   - জেলা পরিবর্তনের সাথে সাথে মোট টাকার হিসাব রিয়েল-টাইমে আপডেট হবে।
২. পেমেন্ট মেথড (৩টি অপশন):
   - ক্যাশ অন ডেলিভারি (Cash on Delivery)
   - বাংলা কিউআর (Bangla QR):
     * কিউআর ইমেজ URL: ${PUBLIC_BANGLA_QR_IMAGE} (বা RUPAN_BANGLA_QR_IMAGE)
     * নির্দেশনা: বিকাশ, নগদ, রকেট বা যেকোনো ব্যাংক অ্যাপের "Bangla QR" বা "Scan to Pay" দিয়ে স্ক্যান করে পেমেন্ট সম্পন্ন করুন।
     * "আমি পেমেন্ট সম্পন্ন করেছি" চেকবক্স।
   - বিকাশ / নগদ:
     * বিকাশ নম্বর: ${PUBLIC_BKASH_NUMBER}
     * নগদ নম্বর: ${PUBLIC_NAGAD_NUMBER}
     * ট্রানজেকশন আইডি (TrxID) ইনপুট ফিল্ড।
৩. অর্ডার সাবমিশন পেলোড (https://www.myrupan.com/api/place-order):
   {
     order: {
       id: "RP-" + Date.now(),
       customerName: name,
       phone: phone,
       address: address,
       division: divisionName,
       district: districtName,
       area: districtName,
       paymentMethod: selectedPayment,
       transactionId: txId,
       paidConfirm: isPaidConfirmed,
       items: [{
         productId: "RUPAN_PRODUCT_ID",
         productName: "প্রোডাক্টের নাম",
         price: productPrice,
         quantity: 1,
         image: "ছবির লিংক"
       }],
       subtotal: productPrice,
       shippingFee: currentShipping,
       total: productPrice + currentShipping,
       status: "Pending",
       paymentStatus: selectedPayment === 'COD' ? 'Unpaid' : 'Pending'
     }
   }
   - ডাবল-ক্লিক প্রতিরোধে সাবমিট করার সাথে সাথে বাটন ডিজেবল হবে।
   - অর্ডার শেষে fbq('track', 'Purchase', ...) ফায়ার হবে এবং অর্ডার আইডি সহ সাকসেস মডাল দেখাবে।

এখন সম্পূর্ণ সিঙ্গেল-ফাইল HTML কোডটি লিখে দাও।`;

export const DEMO_PRODUCT_LANDING_TEMPLATE = `<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>A9 Pro ANC Touch Display Earbuds - মেগা অফার!</title>
  
  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- Supabase CDN Client (Fail-safe Fallback) -->
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
  <!-- Google Fonts (Hind Siliguri) -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&display=swap" rel="stylesheet">
  
  <style>
    body { font-family: 'Hind Siliguri', sans-serif; }
    .pulse-glow { animation: pulseGlow 2s infinite; }
    @keyframes pulseGlow {
      0%, 100% { box-shadow: 0 0 15px rgba(255, 92, 0, 0.4); }
      50% { box-shadow: 0 0 25px rgba(255, 92, 0, 0.7); }
    }
  </style>
</head>
<body class="bg-slate-50 text-slate-800 antialiased pb-24 sm:pb-12">

  <!-- অফার টপবার ও কাউন্টডাউন ব্যানার -->
  <div class="bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 text-white text-center py-2.5 px-4 font-bold text-xs sm:text-sm tracking-wide shadow-sm flex items-center justify-center gap-2">
    <span>🔥 মেগা ধামাকা অফার! সীমিত সময়ের জন্য বিশেষ ছাড় চলছে!</span>
  </div>

  <div class="max-w-xl mx-auto px-4 py-6 space-y-6">

    <!-- প্রোডাক্ট হেডলাইন -->
    <div class="text-center space-y-2">
      <span class="inline-block bg-orange-100 text-orange-700 text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
        Top Trending 2026
      </span>
      <h1 class="text-2xl sm:text-3xl font-black text-slate-900 leading-snug">
        A9 Pro ANC + ENC টাচ ডিসপ্লে স্মার্ট এয়ারবাডস
      </h1>
      <p class="text-xs sm:text-sm text-slate-500 font-medium">
        স্মার্ট ফুল কালার এলসিডি টাচ কন্ট্রোল কেস • অ্যাক্টিভ নয়েজ ক্যান্সেলেশন • প্রিমিয়াম বাস
      </p>
    </div>

    <!-- ইমেজ গ্যালারি / ব্যানার -->
    <div class="relative bg-white rounded-3xl p-3 border border-slate-100 shadow-xl overflow-hidden">
      <img 
        src="https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80" 
        alt="A9 Pro Earbuds" 
        class="w-full h-72 sm:h-80 object-cover rounded-2xl"
        loading="lazy"
      />
      <div class="absolute top-6 left-6 bg-red-600 text-white font-black text-xs px-3 py-1.5 rounded-full shadow-lg">
        ৩৫% ছাড়
      </div>
    </div>

    <!-- প্রাইস বক্স ও কল-টু-অ্যাকশন বাটন -->
    <div class="bg-white rounded-3xl p-5 border border-orange-100 shadow-md text-center space-y-3">
      <div class="flex items-center justify-center gap-3">
        <span class="text-slate-400 line-through text-lg font-bold">৳ ২,৫০০</span>
        <span class="text-3xl sm:text-4xl font-black text-orange-600">৳ ১,৬৫০</span>
      </div>
      <p class="text-xs text-emerald-600 font-bold bg-emerald-50 py-1.5 px-3 rounded-full inline-block">
        ✓ ১০০% ক্যাশ অন ডেলিভারি (পণ্য হাতে পেয়ে চেক করে টাকা দিন)
      </p>
      <div>
        <a href="#orderSection" class="w-full bg-orange-600 hover:bg-orange-700 text-white font-extrabold py-3.5 px-6 rounded-2xl text-base shadow-lg shadow-orange-200 transition-all block pulse-glow">
          🛒 সরাসরি অর্ডার করতে এখানে ক্লিক করুন
        </a>
      </div>
    </div>

    <!-- প্রোডাক্টের আকর্ষণীয় ফিচারসমূহ -->
    <div class="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
      <h3 class="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
        <span>✨</span> এই এয়ারবাডসটির বিশেষ সুবিধাসমূহ
      </h3>
      <div class="grid grid-cols-1 gap-3 text-xs sm:text-sm text-slate-700">
        <div class="flex items-start gap-2.5 bg-slate-50 p-3 rounded-xl">
          <span class="text-orange-600 font-bold text-base">✓</span>
          <div><strong>স্মার্ট এলইডি টাচ ডিসপ্লে:</strong> কেসের ডিসপ্লে থেকেই গান পরিবর্তন, ভলিউম কন্ট্রোল ও সাউন্ড মোড পরিবর্তন করা যায়।</div>
        </div>
        <div class="flex items-start gap-2.5 bg-slate-50 p-3 rounded-xl">
          <span class="text-orange-600 font-bold text-base">✓</span>
          <div><strong>অ্যাক্টিভ নয়েজ ক্যান্সেলেশন (ANC):</strong> বাইরের অতিরিক্ত কোলাহল দূর করে ক্রিস্টাল ক্লিয়ার সাউন্ড প্রদান করে।</div>
        </div>
        <div class="flex items-start gap-2.5 bg-slate-50 p-3 rounded-xl">
          <span class="text-orange-600 font-bold text-base">✓</span>
          <div><strong>লং ব্যাটারি ব্যাকআপ:</strong> একবার চার্জে প্রায় ৫ ঘণ্টা একটানা বাজবে এবং কেসসহ মোট ২০+ ঘণ্টা ব্যাকআপ।</div>
        </div>
      </div>
    </div>

    <!-- ক্যাশ অন ডেলিভারি ও ফুল অর্ডার ফর্ম -->
    <div id="orderSection" class="bg-white rounded-3xl p-6 border-2 border-orange-500 shadow-2xl space-y-5 scroll-mt-6">
      <div class="text-center space-y-1">
        <h2 class="text-xl sm:text-2xl font-black text-slate-900">অর্ডার করতে নিচের ফর্মটি পূরণ করুন</h2>
        <p class="text-xs text-slate-500">আপনার নাম, মোবাইল নম্বর এবং বিভাগ ও জেলা সঠিকভাবে নির্বাচন করুন</p>
      </div>

      <form id="orderForm" class="space-y-4">
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1.5">আপনার নাম *</label>
          <input 
            type="text" 
            id="custName" 
            required 
            placeholder="আপনার পুরো নাম লিখুন" 
            class="w-full p-3.5 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
          />
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1.5">মোবাইল নম্বর *</label>
          <input 
            type="tel" 
            id="custPhone" 
            required 
            placeholder="১১ ডিজিটের সচল মোবাইল নম্বর দিন" 
            class="w-full p-3.5 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
          />
        </div>

        <!-- বিভাগ ও জেলা ড্রপডাউন (Division & District) -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1.5">বিভাগ নির্বাচন করুন *</label>
            <select 
              id="divisionSelect" 
              required
              class="w-full p-3.5 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition-all cursor-pointer font-medium"
            >
              <option value="">-- বিভাগ নির্বাচন করুন --</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1.5">জেলা নির্বাচন করুন *</label>
            <select 
              id="districtSelect" 
              required
              class="w-full p-3.5 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition-all cursor-pointer font-medium"
            >
              <option value="">-- আগে বিভাগ সিলেক্ট করুন --</option>
            </select>
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1.5">সম্পূর্ণ ঠিকানা *</label>
          <textarea 
            id="custAddress" 
            required 
            rows="2" 
            placeholder="বাসা নং, রোড নং, এলাকা, থানা ইত্যাদি বিস্তারিত লিখুন" 
            class="w-full p-3.5 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
          ></textarea>
        </div>

        <!-- পেমেন্ট অপশন নির্বাচন (COD, Bangla QR, bKash) -->
        <div class="space-y-2 pt-2 border-t border-slate-100">
          <label class="block text-xs font-bold text-slate-700">পেমেন্ট মেথড নির্বাচন করুন *</label>
          <div class="grid grid-cols-3 gap-2 text-xs font-bold">
            <button 
              type="button" 
              onclick="selectPayment('COD')" 
              id="btnPayCOD"
              class="p-3 border-2 border-orange-500 bg-orange-50 text-orange-600 rounded-2xl transition-all cursor-pointer text-center flex flex-col items-center justify-center gap-1"
            >
              <span class="text-base">💵</span>
              <span>ক্যাশ অন ডেলিভারি</span>
            </button>
            <button 
              type="button" 
              onclick="selectPayment('Bangla QR')" 
              id="btnPayQR"
              class="p-3 border-2 border-slate-200 bg-white text-slate-700 hover:border-orange-200 rounded-2xl transition-all cursor-pointer text-center flex flex-col items-center justify-center gap-1"
            >
              <span class="text-base">📱</span>
              <span>বাংলা কিউআর</span>
            </button>
            <button 
              type="button" 
              onclick="selectPayment('bKash')" 
              id="btnPayBkash"
              class="p-3 border-2 border-slate-200 bg-white text-slate-700 hover:border-orange-200 rounded-2xl transition-all cursor-pointer text-center flex flex-col items-center justify-center gap-1"
            >
              <span class="text-base">💳</span>
              <span>বিকাশ / নগদ</span>
            </button>
          </div>

          <!-- Bangla QR প্যানেল -->
          <div id="panelBanglaQR" class="hidden bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3 mt-3 text-center">
            <p class="text-xs text-slate-600 font-medium">বিকাশ, নগদ, রকেট বা যেকোনো ব্যাংক অ্যাপের "Bangla QR" অথবা "Scan to Pay" অপশন দিয়ে নিচের QR কোডটি স্ক্যান করে পেমেন্ট করুন:</p>
            <div class="bg-white p-3 rounded-2xl border border-slate-200 inline-block shadow-sm">
              <img src="${PUBLIC_BANGLA_QR_IMAGE}" alt="Bangla QR" class="w-44 h-44 object-contain mx-auto" />
            </div>
            <label class="flex items-center justify-center gap-2 cursor-pointer text-xs font-bold text-slate-800 pt-1">
              <input type="checkbox" id="checkQrPaid" class="w-4 h-4 rounded text-orange-600 focus:ring-orange-500 cursor-pointer">
              <span>আমি পেমেন্ট সম্পন্ন করেছি (Confirm Payment)</span>
            </label>
          </div>

          <!-- bKash / Nagad প্যানেল -->
          <div id="panelMFS" class="hidden bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3 mt-3">
            <div class="bg-orange-50/80 p-3 rounded-xl border border-orange-200 text-xs text-slate-700 space-y-1">
              <div><strong>বিকাশ নম্বর (Send Money):</strong> <span class="font-mono font-bold text-orange-600">${PUBLIC_BKASH_NUMBER}</span></div>
              <div><strong>নগদ নম্বর (Send Money):</strong> <span class="font-mono font-bold text-orange-600">${PUBLIC_NAGAD_NUMBER}</span></div>
            </div>
            <div>
              <label class="block text-[11px] font-bold text-slate-600 mb-1">ট্রানজেকশন আইডি (Transaction ID) *</label>
              <input 
                type="text" 
                id="trxIdInput" 
                placeholder="যেমন: BL8X9Y7Z" 
                class="w-full p-3 text-xs bg-white border border-slate-200 rounded-xl focus:border-orange-500 outline-none uppercase font-mono"
              />
            </div>
          </div>
        </div>

        <!-- অর্ডার বিল হিসাব -->
        <div class="bg-orange-50/70 p-4 rounded-2xl border border-orange-100 text-xs sm:text-sm space-y-2">
          <div class="flex justify-between text-slate-600">
            <span>প্রোডাক্ট মূল্য:</span>
            <span class="font-bold">৳ <span id="productPrice">1650</span></span>
          </div>
          <div class="flex justify-between text-slate-600">
            <span>ডেলিভারি চার্জ (<span id="deliveryAreaText">ঢাকার বাইরে</span>):</span>
            <span class="font-bold">৳ <span id="shippingCharge">120</span></span>
          </div>
          <div class="flex justify-between border-t border-orange-200 pt-2 text-base sm:text-lg font-black text-orange-600">
            <span>সর্বমোট পরিশোধ করতে হবে:</span>
            <span>৳ <span id="totalAmount">1770</span></span>
          </div>
        </div>

        <!-- সাবমিট বাটন -->
        <button 
          type="submit" 
          id="submitBtn" 
          class="w-full bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white font-black py-4 rounded-2xl text-base sm:text-lg shadow-xl shadow-orange-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          অর্ডার কনফার্ম করুন (৳ <span id="btnTotal">1770</span>)
        </button>
      </form>
    </div>

    <!-- গ্যারান্টি ও ট্রাস্ট ব্যাজ -->
    <div class="grid grid-cols-3 gap-3 text-center text-[10px] sm:text-xs text-slate-600">
      <div class="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
        <div class="text-xl mb-1">🚚</div>
        <div class="font-bold">সারা দেশে ডেলিভারি</div>
      </div>
      <div class="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
        <div class="text-xl mb-1">💵</div>
        <div class="font-bold">ক্যাশ অন ডেলিভারি</div>
      </div>
      <div class="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
        <div class="text-xl mb-1">🛡️</div>
        <div class="font-bold">১০০% অরিজিনাল পণ্য</div>
      </div>
    </div>
  </div>

  <!-- মোবাইল ফ্লোটিং স্টিকি বার -->
  <div class="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 flex items-center justify-between gap-3 shadow-2xl">
    <div>
      <span class="text-[10px] text-slate-400 block font-bold">অফার প্রাইস:</span>
      <span class="text-base font-black text-orange-600">৳ ১,৬৫০</span>
    </div>
    <a href="#orderSection" class="bg-orange-600 hover:bg-orange-700 text-white font-black px-6 py-2.5 rounded-xl text-xs shadow-md shadow-orange-200">
      🛒 অর্ডার করুন
    </a>
  </div>

  <!-- সাকসেস মডাল -->
  <div id="successModal" class="hidden fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
    <div class="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center space-y-4 shadow-2xl">
      <div class="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-3xl font-bold">
        ✓
      </div>
      <h3 class="text-xl font-black text-slate-900">ধন্যবাদ! আপনার অর্ডার সফল হয়েছে</h3>
      <p class="text-xs text-slate-500 leading-relaxed">
        আমাদের কাস্টমার কেয়ার প্রতিনিধি খুব শীঘ্রই আপনার নম্বরে কল করে অর্ডারটি কনফার্ম করবেন।
      </p>
      <div class="bg-slate-50 p-3 rounded-xl border text-xs font-mono text-slate-700 font-bold" id="orderIdText">
        অর্ডার সম্পন্ন হয়েছে
      </div>
      <button 
        onclick="window.location.href='/'" 
        class="w-full bg-slate-900 text-white font-bold py-3 rounded-xl text-xs hover:bg-slate-800 transition-all cursor-pointer"
      >
        হোমপেজে ফিরে যান
      </button>
    </div>
  </div>

  <!-- ডাইনামিক স্ক্রিপ্ট: জেলা, পেমেন্ট, Telegram নোটিফিকেশন ও অর্ডার সাবমিশন লজিক -->
  <script>
    const PRODUCT_ID = 'RUPAN_PRODUCT_ID' !== 'RUPAN_PRODUCT_ID' ? 'RUPAN_PRODUCT_ID' : 'mohasagor-8184';
    const SUPABASE_URL = 'RUPAN_SUPABASE_URL' !== 'RUPAN_SUPABASE_URL' ? 'RUPAN_SUPABASE_URL' : '${PUBLIC_SUPABASE_URL}';
    const SUPABASE_KEY = 'RUPAN_SUPABASE_KEY' !== 'RUPAN_SUPABASE_KEY' ? 'RUPAN_SUPABASE_KEY' : '${PUBLIC_SUPABASE_ANON_KEY}';
    const SHIPPING_INSIDE = Number('RUPAN_INSIDE_DHAKA_SHIPPING') || 60;
    const SHIPPING_OUTSIDE = Number('RUPAN_OUTSIDE_DHAKA_SHIPPING') || 120;
    const PRODUCT_PRICE = 1650;
    const PRODUCT_NAME = "A9 Pro ANC Touch Display Earbuds";

    // বাংলাদেশের ৮টি বিভাগ ও ৬৪টি জেলার ডাটাবেজ
    const BANGLADESH_DIVISIONS = [
      { id: 'dhaka', nameBn: 'ঢাকা', districts: [
        { id: 'dhaka', nameBn: 'ঢাকা (মেট্রোপলিটন ও জেলা)', isDhakaCity: true },
        { id: 'gazipur', nameBn: 'গাজীপুর', isDhakaCity: false },
        { id: 'narayanganj', nameBn: 'নারায়ণগঞ্জ', isDhakaCity: false },
        { id: 'tangail', nameBn: 'টাঙ্গাইল', isDhakaCity: false },
        { id: 'faridpur', nameBn: 'ফরিদপুর', isDhakaCity: false },
        { id: 'manikganj', nameBn: 'মানিকগঞ্জ', isDhakaCity: false },
        { id: 'munshiganj', nameBn: 'মুন্সীগঞ্জ', isDhakaCity: false },
        { id: 'narsingdi', nameBn: 'নরসিংদী', isDhakaCity: false },
        { id: 'gopalganj', nameBn: 'গোপালগঞ্জ', isDhakaCity: false },
        { id: 'kishoreganj', nameBn: 'কিশোরগঞ্জ', isDhakaCity: false },
        { id: 'madaripur', nameBn: 'মাদারীপুর', isDhakaCity: false },
        { id: 'rajbari', nameBn: 'রাজবাড়ী', isDhakaCity: false },
        { id: 'shariatpur', nameBn: 'শরীয়তপুর', isDhakaCity: false }
      ]},
      { id: 'chattogram', nameBn: 'চট্টগ্রাম', districts: [
        { id: 'chattogram', nameBn: 'চট্টগ্রাম', isDhakaCity: false },
        { id: 'coxsbazar', nameBn: 'কক্সবাজার', isDhakaCity: false },
        { id: 'cumilla', nameBn: 'কুমিল্লা', isDhakaCity: false },
        { id: 'feni', nameBn: 'ফেনী', isDhakaCity: false },
        { id: 'brahmanbaria', nameBn: 'ব্রাহ্মণবাড়িয়া', isDhakaCity: false },
        { id: 'chandpur', nameBn: 'চাঁদপুর', isDhakaCity: false },
        { id: 'noakhali', nameBn: 'নোয়াখালী', isDhakaCity: false },
        { id: 'lakshmipur', nameBn: 'লক্ষ্মীপুর', isDhakaCity: false },
        { id: 'khagrachhari', nameBn: 'খাগড়াছড়ি', isDhakaCity: false },
        { id: 'rangamati', nameBn: 'রাঙ্গামাটি', isDhakaCity: false },
        { id: 'bandarban', nameBn: 'বান্দরবান', isDhakaCity: false }
      ]},
      { id: 'rajshahi', nameBn: 'রাজশাহী', districts: [
        { id: 'rajshahi', nameBn: 'রাজশাহী', isDhakaCity: false },
        { id: 'bogra', nameBn: 'বগুড়া', isDhakaCity: false },
        { id: 'pabna', nameBn: 'পাবনা', isDhakaCity: false },
        { id: 'sirajganj', nameBn: 'সিরাজগঞ্জ', isDhakaCity: false },
        { id: 'naogaon', nameBn: 'নওগাঁ', isDhakaCity: false },
        { id: 'natore', nameBn: 'নাটোর', isDhakaCity: false },
        { id: 'chapainawabganj', nameBn: 'চাঁপাইনবাবগঞ্জ', isDhakaCity: false },
        { id: 'joypurhat', nameBn: 'জয়পুরহাট', isDhakaCity: false }
      ]},
      { id: 'khulna', nameBn: 'খুলনা', districts: [
        { id: 'khulna', nameBn: 'খুলনা', isDhakaCity: false },
        { id: 'jashore', nameBn: 'যশোর', isDhakaCity: false },
        { id: 'satkhira', nameBn: 'সাতক্ষীরা', isDhakaCity: false },
        { id: 'bagerhat', nameBn: 'বাগেরহাট', isDhakaCity: false },
        { id: 'kushtia', nameBn: 'কুষ্টিয়া', isDhakaCity: false },
        { id: 'jhenaidah', nameBn: 'ঝিনাইদহ', isDhakaCity: false },
        { id: 'chuadanga', nameBn: 'চুয়াডাঙ্গা', isDhakaCity: false },
        { id: 'magura', nameBn: 'মাগুরা', isDhakaCity: false },
        { id: 'meherpur', nameBn: 'মেহেরপুর', isDhakaCity: false },
        { id: 'narail', nameBn: 'নড়াইল', isDhakaCity: false }
      ]},
      { id: 'barishal', nameBn: 'বরিশাল', districts: [
        { id: 'barishal', nameBn: 'বরিশাল', isDhakaCity: false },
        { id: 'bhola', nameBn: 'ভোলা', isDhakaCity: false },
        { id: 'patuakhali', nameBn: 'পটুয়াখালী', isDhakaCity: false },
        { id: 'pirojpur', nameBn: 'পিরোজপুর', isDhakaCity: false },
        { id: 'barguna', nameBn: 'বরগুনা', isDhakaCity: false },
        { id: 'jhalokati', nameBn: 'ঝালকাঠি', isDhakaCity: false }
      ]},
      { id: 'sylhet', nameBn: 'সিলেট', districts: [
        { id: 'sylhet', nameBn: 'সিলেট', isDhakaCity: false },
        { id: 'moulvibazar', nameBn: 'মৌলভীবাজার', isDhakaCity: false },
        { id: 'habiganj', nameBn: 'হবিগঞ্জ', isDhakaCity: false },
        { id: 'sunamganj', nameBn: 'সুনামগঞ্জ', isDhakaCity: false }
      ]},
      { id: 'rangpur', nameBn: 'রংপুর', districts: [
        { id: 'rangpur', nameBn: 'রংপুর', isDhakaCity: false },
        { id: 'dinajpur', nameBn: 'দিনাজপুর', isDhakaCity: false },
        { id: 'gaibandha', nameBn: 'গাইবান্ধা', isDhakaCity: false },
        { id: 'kurigram', nameBn: 'কুড়িগ্রাম', isDhakaCity: false },
        { id: 'lalmonirhat', nameBn: 'লালমনিরহাট', isDhakaCity: false },
        { id: 'nilphamari', nameBn: 'নীলফামারী', isDhakaCity: false },
        { id: 'panchagarh', nameBn: 'পঞ্চগড়', isDhakaCity: false },
        { id: 'thakurgaon', nameBn: 'ঠাকুরগাঁও', isDhakaCity: false }
      ]},
      { id: 'mymensingh', nameBn: 'ময়মনসিংহ', districts: [
        { id: 'mymensingh', nameBn: 'ময়মনসিংহ', isDhakaCity: false },
        { id: 'jamalpur', nameBn: 'জামালপুর', isDhakaCity: false },
        { id: 'netrokona', nameBn: 'নেত্রকোণা', isDhakaCity: false },
        { id: 'sherpur', nameBn: 'শেরপুর', isDhakaCity: false }
      ]}
    ];

    const divisionSelect = document.getElementById('divisionSelect');
    const districtSelect = document.getElementById('districtSelect');
    const shippingElem = document.getElementById('shippingCharge');
    const deliveryAreaText = document.getElementById('deliveryAreaText');
    const totalElem = document.getElementById('totalAmount');
    const btnTotal = document.getElementById('btnTotal');

    BANGLADESH_DIVISIONS.forEach(div => {
      const opt = document.createElement('option');
      opt.value = div.id;
      opt.textContent = div.nameBn;
      divisionSelect.appendChild(opt);
    });

    let currentShipping = SHIPPING_OUTSIDE;

    divisionSelect.addEventListener('change', function() {
      const selectedDivId = this.value;
      districtSelect.innerHTML = '<option value="">-- জেলা নির্বাচন করুন --</option>';
      
      const foundDiv = BANGLADESH_DIVISIONS.find(d => d.id === selectedDivId);
      if (foundDiv) {
        foundDiv.districts.forEach(dist => {
          const opt = document.createElement('option');
          opt.value = dist.id;
          opt.textContent = dist.nameBn;
          opt.dataset.isDhaka = dist.isDhakaCity ? 'true' : 'false';
          districtSelect.appendChild(opt);
        });
      }
      calculateTotal();
    });

    districtSelect.addEventListener('change', calculateTotal);

    function calculateTotal() {
      const selectedOption = districtSelect.options[districtSelect.selectedIndex];
      const isDhakaCity = selectedOption ? selectedOption.dataset.isDhaka === 'true' : false;

      currentShipping = isDhakaCity ? SHIPPING_INSIDE : SHIPPING_OUTSIDE;
      shippingElem.textContent = currentShipping;
      deliveryAreaText.textContent = isDhakaCity ? 'ঢাকার ভেতরে' : 'ঢাকার বাইরে';

      const total = PRODUCT_PRICE + currentShipping;
      totalElem.textContent = total;
      btnTotal.textContent = total;
    }
    calculateTotal();

    let selectedPaymentMethod = 'COD';
    function selectPayment(method) {
      selectedPaymentMethod = method;
      const btnCOD = document.getElementById('btnPayCOD');
      const btnQR = document.getElementById('btnPayQR');
      const btnMFS = document.getElementById('btnPayBkash');
      const panelQR = document.getElementById('panelBanglaQR');
      const panelMFS = document.getElementById('panelMFS');

      [btnCOD, btnQR, btnMFS].forEach(b => {
        b.className = 'p-3 border-2 border-slate-200 bg-white text-slate-700 hover:border-orange-200 rounded-2xl transition-all cursor-pointer text-center flex flex-col items-center justify-center gap-1';
      });

      panelQR.classList.add('hidden');
      panelMFS.classList.add('hidden');

      if (method === 'COD') {
        btnCOD.className = 'p-3 border-2 border-orange-500 bg-orange-50 text-orange-600 rounded-2xl transition-all cursor-pointer text-center flex flex-col items-center justify-center gap-1';
      } else if (method === 'Bangla QR') {
        btnQR.className = 'p-3 border-2 border-orange-500 bg-orange-50 text-orange-600 rounded-2xl transition-all cursor-pointer text-center flex flex-col items-center justify-center gap-1';
        panelQR.classList.remove('hidden');
      } else if (method === 'bKash') {
        btnMFS.className = 'p-3 border-2 border-orange-500 bg-orange-50 text-orange-600 rounded-2xl transition-all cursor-pointer text-center flex flex-col items-center justify-center gap-1';
        panelMFS.classList.remove('hidden');
      }
    }

    // অর্ডার সাবমিশন ও Telegram নোটিফিকেশন লজিক
    document.getElementById('orderForm').addEventListener('submit', async function(e) {
      e.preventDefault();
      const submitBtn = document.getElementById('submitBtn');
      submitBtn.disabled = true;
      submitBtn.textContent = "অর্ডার প্রসেস হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন...";

      const name = document.getElementById('custName').value.trim();
      const phone = document.getElementById('custPhone').value.trim();
      const address = document.getElementById('custAddress').value.trim();
      
      const divOption = divisionSelect.options[divisionSelect.selectedIndex];
      const distOption = districtSelect.options[districtSelect.selectedIndex];
      const divisionName = divOption ? divOption.textContent : 'Dhaka';
      const districtName = distOption ? distOption.textContent : 'Dhaka';

      if (!districtSelect.value) {
        alert('অনুগ্রহ করে আপনার জেলা নির্বাচন করুন');
        submitBtn.disabled = false;
        submitBtn.textContent = "অর্ডার কনফার্ম করুন";
        return;
      }

      let txId = '';
      let isPaidConfirmed = false;
      if (selectedPaymentMethod === 'Bangla QR') {
        isPaidConfirmed = document.getElementById('checkQrPaid').checked;
      } else if (selectedPaymentMethod === 'bKash') {
        txId = document.getElementById('trxIdInput').value.trim();
      }

      const orderId = 'RP-' + Date.now();
      const total = PRODUCT_PRICE + currentShipping;

      const orderPayload = {
        order: {
          id: orderId,
          customerName: name,
          phone: phone,
          address: address,
          division: divisionName,
          district: districtName,
          area: districtName,
          paymentMethod: selectedPaymentMethod,
          transactionId: txId,
          paidConfirm: isPaidConfirmed,
          items: [{
            productId: PRODUCT_ID,
            productName: PRODUCT_NAME,
            price: PRODUCT_PRICE,
            quantity: 1,
            image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800"
          }],
          subtotal: PRODUCT_PRICE,
          shippingFee: currentShipping,
          total: total,
          status: 'Pending',
          paymentStatus: selectedPaymentMethod === 'COD' ? 'Unpaid' : (isPaidConfirmed || txId ? 'Paid' : 'Pending')
        }
      };

      try {
        // ১. Vercel Serverless /api/place-order এন্ডপয়েন্টে পাঠানো
        let orderCreated = false;
        try {
          const apiRes = await fetch('https://www.myrupan.com/api/place-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderPayload)
          });
          if (apiRes.ok) {
            orderCreated = true;
          }
        } catch (apiErr) {
          console.warn("Direct /api/place-order error, attempting local relative or Supabase fallback:", apiErr);
          // Try local relative /api/place-order
          try {
            const relRes = await fetch('/api/place-order', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(orderPayload)
            });
            if (relRes.ok) orderCreated = true;
          } catch (_) {}
        }

        // ২. ফলব্যাক: সরাসরি Supabase ইনসার্ট (যদি API অফলাইন থাকে)
        if (!orderCreated && SUPABASE_URL && !SUPABASE_URL.startsWith('RUPAN_')) {
          const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
          await supabaseClient.from('orders').insert([{
            id: orderId,
            customer_name: name,
            phone: phone,
            address: address,
            area: districtName,
            division: divisionName,
            district: districtName,
            payment_method: selectedPaymentMethod,
            transaction_id: txId,
            paid_confirm: isPaidConfirmed,
            subtotal: PRODUCT_PRICE,
            shipping_fee: currentShipping,
            total: total,
            status: 'Pending',
            payment_status: 'Unpaid',
            items: orderPayload.order.items
          }]);
        }

        // ৩. Meta Pixel Purchase Event
        if (typeof fbq === 'function') {
          fbq('track', 'Purchase', {
            content_name: PRODUCT_NAME,
            content_ids: [PRODUCT_ID],
            value: total,
            currency: 'BDT'
          });
        }

        // সাকসেস মডাল দেখানো
        document.getElementById('orderIdText').textContent = 'Order ID: #' + orderId;
        document.getElementById('successModal').classList.remove('hidden');
      } catch (err) {
        console.error(err);
        alert('অর্ডার সাবমিট করতে সমস্যা হয়েছে। দয়া করে কিছুক্ষণ পর আবার চেষ্টা করুন বা সরাসরি ফোন করুন।');
        submitBtn.disabled = false;
        submitBtn.textContent = "আবার চেষ্টা করুন";
      }
    });
  </script>
</body>
</html>`;

interface LandingPageGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadDemoTemplate?: (code: string) => void;
  products?: any[];
}

export default function LandingPageGuideModal({ 
  isOpen, 
  onClose,
  onLoadDemoTemplate,
  products = []
}: LandingPageGuideModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'variables' | 'ai_prompt' | 'demo_template'>('ai_prompt');
  const [promptMode, setPromptMode] = useState<'product_generator' | 'master_prompt'>('product_generator');
  
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedCustomPrompt, setCopiedCustomPrompt] = useState(false);
  const [copiedDemo, setCopiedDemo] = useState(false);
  const [copiedVarKey, setCopiedVarKey] = useState<string | null>(null);

  // Products loading for Interactive Generator
  const [storeProducts, setStoreProducts] = useState<any[]>(products || []);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Creative options
  const [includeGlassmorphism, setIncludeGlassmorphism] = useState(true);
  const [includeUrgencyTimer, setIncludeUrgencyTimer] = useState(true);
  const [includeStickyBar, setIncludeStickyBar] = useState(true);
  const [includeTrustBadges, setIncludeTrustBadges] = useState(true);

  // Load products from Supabase if not provided
  useEffect(() => {
    if (isOpen && (!storeProducts || storeProducts.length === 0)) {
      setLoadingProducts(true);
      supabase
        .from('products')
        .select('id, name, price, discount_price, images, sku, category, description')
        .order('created_at', { ascending: false })
        .limit(100)
        .then(({ data, error }) => {
          setLoadingProducts(false);
          if (!error && data) {
            const mapped = data.map((p: any) => ({
              id: p.id,
              name: p.name,
              price: p.price,
              discountPrice: p.discount_price,
              images: Array.isArray(p.images) ? p.images : (typeof p.images === 'string' ? JSON.parse(p.images || '[]') : []),
              sku: p.sku || p.id,
              category: p.category,
              description: p.description
            }));
            setStoreProducts(mapped);
            if (mapped.length > 0 && !selectedProduct) {
              setSelectedProduct(mapped[0]);
            }
          }
        });
    } else if (storeProducts && storeProducts.length > 0 && !selectedProduct) {
      setSelectedProduct(storeProducts[0]);
    }
  }, [isOpen, storeProducts]);

  // Filter products by search query
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return storeProducts.slice(0, 20);
    const q = searchQuery.toLowerCase().trim();
    return storeProducts.filter((p: any) => 
      (p.name && p.name.toLowerCase().includes(q)) ||
      (p.id && p.id.toLowerCase().includes(q)) ||
      (p.sku && p.sku.toLowerCase().includes(q))
    ).slice(0, 20);
  }, [storeProducts, searchQuery]);

  // Generate customized prompt for the selected product with creative frontend directions
  const generatedProductPrompt = useMemo(() => {
    if (!selectedProduct) return AI_LANDING_PAGE_PROMPT;

    const pName = selectedProduct.name || 'Premium Product';
    const pId = selectedProduct.id || 'PRODUCT_ID';
    const pSku = selectedProduct.sku || pId;
    const pOfferPrice = selectedProduct.discountPrice || selectedProduct.price || 1650;
    const pRegularPrice = selectedProduct.price || pOfferPrice + 500;
    const pImage = (selectedProduct.images && selectedProduct.images[0]) || 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800';
    const pDesc = selectedProduct.description ? selectedProduct.description.replace(/<[^>]*>/g, '').slice(0, 250) : '';

    return `তুমি Rupan ই-কমার্স প্ল্যাটফর্মের জন্য "${pName}" প্রোডাক্টটির একটি সম্পূর্ণ প্রোডাকশন-রেডি, হাই-কনভার্টিং সিঙ্গেল-ফাইল HTML ল্যান্ডিং পেজ তৈরি করবে। কোনো প্রশ্ন না করে সরাসরি ১০০% ত্রুটিমুক্ত ও সম্পূর্ণ কোড প্রদান করো।

==================================================
🏛️ আমাদের সিস্টেম আর্কিটেকচার ও সার্ভার কীভাবে কাজ করে (Architecture Brief):
==================================================
১. এই ল্যান্ডিং পেজটি Rupan-এর Vercel Serverless ইঞ্জিন (https://www.myrupan.com/api/landing) দ্বারা সরাসরি গ্লোবাল Edge CDN থেকে ক্যাশড হয়ে রেন্ডার হয়। কোনো ভারী ফ্রেমওয়ার্ক ছাড়া পিওর HTML/CSS/JS হওয়ায় এটি মিলি-সেকেন্ডে সুপারফাস্ট লোড হয়।
২. লাখ লাখ ফেসবুক অ্যাড ট্রাফিকের সময় যাতে সার্ভার হ্যাং বা ক্র্যাশ না করে, সেজন্য পেজটি ক্লায়েন্ট সাইডে পুরোপুরি স্ট্যাটিক এবং অর্ডার সাবমিশনের সময় সরাসরি Vercel Serverless API (https://www.myrupan.com/api/place-order)-এ কল করে।
৩. /api/place-order এন্ডপয়েন্টটি একই সাথে দুটি কাজ করে:
   ক. Supabase ডাটাবেজের 'orders' এবং 'order_items' টেবিলে অর্ডারটি নিরাপদে সেভ করে।
   খ. টেলিগ্রাম বট (Telegram Bot API)-এর মাধ্যমে মার্চেন্টের টেলিগ্রাম চ্যানেলে ইনস্ট্যান্ট বিস্তারিত নোটিফিকেশন পাঠায়।
   গ. যদি কোনো কারণে নেটওয়ার্ক ড্রপ করে, তবে ক্লায়েন্ট সাইডে Supabase REST API-তে সরাসরি ইনসার্ট করার ফেইল-সেফ ফলব্যাক কোড থাকতে হবে।

==================================================
📌 সিলেক্টেড প্রোডাক্টের তথ্য (Product Details):
==================================================
- প্রোডাক্টের নাম: ${pName}
- প্রোডাক্ট আইডি (Product ID): ${pId}
- SKU: ${pSku}
- অফার প্রাইস (Selling Price): ৳ ${pOfferPrice}
- রেগুলার প্রাইস (Regular Price): ৳ ${pRegularPrice}
- প্রধান ছবির লিঙ্ক: ${pImage}
${selectedProduct.images?.[1] ? `- অতিরিক্ত ছবির লিঙ্ক: ${selectedProduct.images[1]}` : ''}
${pDesc ? `- প্রোডাক্ট বিবরণ ও ফিচারস: ${pDesc}...` : ''}

==================================================
🎨 ফ্রন্টেন্ড ক্রিয়েটিভিটি ও ডিজাইনের বিশেষ নির্দেশিকা (Creative Frontend Rules):
==================================================
১. দৃষ্টি-নন্দন আধুনিক ডিজাইন (Modern & Classy UI):
   - ফ্রন্টেন্ডটি যেন গতানুগতিক না হয়ে প্রিমিয়াম ডিটুসি (D2C) ব্র্যান্ডের মতো অত্যন্ত দৃষ্টিনন্দন, ক্ল্যাসি এবং ক্রিয়েটিভ হয়।
   - Rupan-এর সিগনেচার অরেঞ্জ কালার (#ff5c00) ও ডার্ক স্লেট কালার প্যালেটে আকর্ষণীয় গ্রাডিয়েন্ট, সফট কার্ড শ্যাডো এবং মডার্ন রাউন্ডেড বর্ডার ব্যবহার করবে।
${includeUrgencyTimer ? '২. আকর্ষনীয় হেডলাইন ও হুক (Catchy Headline & Urgency):\n   - উপরে সীমিত সময়ের অফার কাউন্টডাউন ব্যানার বা জরুরি বার্তা (Urgency message)।\n   - প্রোডাক্টের সুবিধা হাইলাইট করে একটি বড় আকর্ষণীয় বাংলা হেডলাইন ও সাব-হেডলাইন।' : ''}
${includeGlassmorphism ? '৩. ক্রিয়েটিভ ফিচার সেকশন (Glassmorphism Feature Cards):\n   - সুন্দর আইকন সহ মডার্ন ফিচার কার্ড (কেন এই প্রোডাক্টটি বাজারের সেরা)।' : ''}
${includeTrustBadges ? '৪. ট্রাস্ট এলিমেন্টস (Trust Guarantee Badges):\n   - ৩টি বিশ্বস্ত ব্যাজ: ১০০% অরিজিনাল পণ্য, সারা দেশে দ্রুত ডেলিভারি, এবং পণ্য হাতে পেয়ে টাকা পরিশোধ (COD)।\n   - টেস্টমোনিয়াল বা কাস্টমার রিভিউ সেকশন।' : ''}
${includeStickyBar ? '৫. মোবাইল স্টিকি বটম বার (Mobile Sticky Buy Button):\n   - মোবাইলে ভিজিটর নিচের দিকে স্ক্রল করার সময় নিচে একটি স্লিম ফ্লোটিং "🛒 এখনই অর্ডার করুন" বাটন থাকবে, যাতে ক্লিক করলে সরাসরি নিচের অর্ডার ফর্মে স্মুথ স্ক্রল করে নিয়ে যায়।' : ''}

==================================================
⚙️ ডেলিভারি চার্জ, জেলা ও পেমেন্ট রুলস (Strict System Rules):
==================================================
১. বিভাগ ও জেলা নির্বাচন:
   - ৮টি বিভাগের ড্রপডাউন (ঢাকা, চট্টগ্রাম, রাজশাহী, খুলনা, বরিশাল, সিলেট, রংপুর, ময়মনসিংহ)। বিভাগ নির্বাচন করলে ওই বিভাগের জেলাগুলো জেলা ড্রপডাউনে লোড হবে।
   - Inside Dhaka (শুধুমাত্র ঢাকা জেলা): ডেলিভারি চার্জ ৬০ টাকা (বা RUPAN_INSIDE_DHAKA_SHIPPING)।
   - Outside Dhaka (ঢাকা ব্যতীত বাকি সকল ৬৩টি জেলা): ডেলিভারি চার্জ ১২০ টাকা (বা RUPAN_OUTSIDE_DHAKA_SHIPPING)।
   - জেলা পরিবর্তনের সাথে সাথে মোট টাকার হিসাব রিয়েল-টাইমে আপডেট হতে হবে।
২. পেমেন্ট মেথড (৩টি অপশন):
   - ১. ক্যাশ অন ডেলিভারি (Cash on Delivery)
   - ২. বাংলা কিউআর (Bangla QR):
     * কিউআর ইমেজ URL: ${PUBLIC_BANGLA_QR_IMAGE} (বা RUPAN_BANGLA_QR_IMAGE)
     * নির্দেশনা: বিকাশ, নগদ, রকেট বা যেকোনো ব্যাংক অ্যাপের "Bangla QR" বা "Scan to Pay" দিয়ে স্ক্যান করে পেমেন্ট সম্পন্ন করুন।
     * "আমি পেমেন্ট সম্পন্ন করেছি" চেকবক্স।
   - ৩. বিকাশ / নগদ:
     * বিকাশ নম্বর: ${PUBLIC_BKASH_NUMBER}
     * নগদ নম্বর: ${PUBLIC_NAGAD_NUMBER}
     * ট্রানজেকশন আইডি (TxID) ইনপুট ফিল্ড।
৩. অর্ডার সাবমিশন পেলোড (https://www.myrupan.com/api/place-order):
   {
     order: {
       id: "RP-" + Date.now(),
       customerName: name,
       phone: phone,
       address: address,
       division: divisionName,
       district: districtName,
       area: districtName,
       paymentMethod: selectedPayment,
       transactionId: txId,
       paidConfirm: isPaidConfirmed,
       items: [{
         productId: "${pId}",
         productName: "${pName}",
         price: ${pOfferPrice},
         quantity: 1,
         image: "${pImage}"
       }],
       subtotal: ${pOfferPrice},
       shippingFee: currentShipping,
       total: ${pOfferPrice} + currentShipping,
       status: "Pending",
       paymentStatus: selectedPayment === 'COD' ? 'Unpaid' : 'Pending'
     }
   }
   - ডাবল-ক্লিক প্রতিরোধে সাবমিট করার সাথে সাথে বাটন ডিজেবল হবে।
   - অর্ডার শেষে fbq('track', 'Purchase', ...) ফায়ার হবে এবং অর্ডার আইডি সহ সাকসেস মডাল দেখাবে।

এখন কোনো প্রশ্ন না করে উপরের তথ্যের ওপর ভিত্তি করে সম্পূর্ণ ত্রুটিহীন, রেসপনসিভ ও ক্রিয়েটিভ HTML কোডটি লিখে দাও।`;
  }, [selectedProduct, includeGlassmorphism, includeUrgencyTimer, includeStickyBar, includeTrustBadges]);

  if (!isOpen) return null;

  const handleCopyVar = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedVarKey(key);
    setTimeout(() => setCopiedVarKey(null), 2000);
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(AI_LANDING_PAGE_PROMPT);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const handleCopyCustomPrompt = () => {
    navigator.clipboard.writeText(generatedProductPrompt);
    setCopiedCustomPrompt(true);
    setTimeout(() => setCopiedCustomPrompt(false), 2000);
  };

  const handleCopyDemo = () => {
    navigator.clipboard.writeText(DEMO_PRODUCT_LANDING_TEMPLATE);
    setCopiedDemo(true);
    setTimeout(() => setCopiedDemo(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-5xl h-[90vh] flex flex-col shadow-2xl border border-gray-100 overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-slate-900 to-slate-800 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center border border-orange-500/30">
              <BookOpen className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
                ল্যান্ডিং পেজ সিস্টেম গাইডলাইন ও AI প্রম্পট জেনারেটর
              </h2>
              <p className="text-[11px] text-slate-300">
                হাই-ট্রাফিক অপ্টিমাইজেশন, রিয়েল বিকাশ/কিউআর ডাটা ও ইনস্ট্যান্ট Telegram নোটিফিকেশন গাইড
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-xl transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 px-6 py-2.5 bg-slate-50 border-b border-gray-200 text-xs font-bold shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('ai_prompt')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === 'ai_prompt'
                ? 'bg-orange-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Sparkles className="w-4 h-4 text-yellow-300" />
            <span>১. AI প্রম্পট জেনারেটর (Recommended)</span>
          </button>

          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === 'overview'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Server className="w-4 h-4 text-orange-400" />
            <span>২. সিস্টেম আর্কিটেকচার ও হাই-ট্রাফিক হ্যান্ডলিং</span>
          </button>

          <button
            onClick={() => setActiveTab('variables')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === 'variables'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Database className="w-4 h-4 text-emerald-400" />
            <span>৩. আবশ্যক ও ঐচ্ছিক ভেরিয়েবল তালিকা</span>
          </button>

          <button
            onClick={() => setActiveTab('demo_template')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === 'demo_template'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Code className="w-4 h-4 text-cyan-400" />
            <span>৪. সম্পূর্ণ ডেমো প্রোডাক্ট কোড</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm text-slate-700 bg-white">
          
          {/* TAB 1: AI PROMPT GENERATOR */}
          {activeTab === 'ai_prompt' && (
            <div className="space-y-5 max-w-4xl">
              
              {/* Sub-mode switcher */}
              <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl w-fit">
                <button
                  onClick={() => setPromptMode('product_generator')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    promptMode === 'product_generator'
                      ? 'bg-white text-orange-600 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <ShoppingBag className="w-3.5 h-3.5 text-orange-500" />
                  <span>🎯 ১-ক্লিকে প্রোডাক্ট সিলেক্ট করে প্রম্পট তৈরি</span>
                </button>
                <button
                  onClick={() => setPromptMode('master_prompt')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    promptMode === 'master_prompt'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Code className="w-3.5 h-3.5" />
                  <span>📋 জেনেরিক মাস্টার প্রম্পট</span>
                </button>
              </div>

              {promptMode === 'product_generator' ? (
                /* PRODUCT SELECTOR & CUSTOM PROMPT VIEW */
                <div className="space-y-4">
                  {/* Product Search & Selector Box */}
                  <div className="bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50/40 p-4 rounded-3xl border border-orange-200 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                          <ShoppingBag className="w-4 h-4 text-orange-600" />
                          যেকোনো প্রোডাক্ট সিলেক্ট করুন:
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          প্রোডাক্ট সিলেক্ট করা মাত্রই তার নাম, আইডি, আসল ছবি, বিকাশ নম্বর ও ডেলিভারি তথ্য প্রম্পটে অটো-লিংক হয়ে যাবে।
                        </p>
                      </div>
                      
                      {/* Search Bar */}
                      <div className="relative w-full sm:w-64">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input 
                          type="text" 
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="প্রোডাক্ট নাম বা ID দিয়ে সার্চ..."
                          className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:border-orange-500 focus:ring-1 focus:ring-orange-200 outline-none"
                        />
                      </div>
                    </div>

                    {/* Products Quick Selector Grid/Pills */}
                    <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto p-1 bg-white/60 rounded-2xl border border-orange-100">
                      {loadingProducts ? (
                        <div className="text-xs text-slate-400 p-3">প্রোডাক্ট লোড হচ্ছে...</div>
                      ) : filteredProducts.length > 0 ? (
                        filteredProducts.map((prod) => (
                          <button
                            key={prod.id}
                            onClick={() => setSelectedProduct(prod)}
                            className={`flex items-center gap-2 p-1.5 pr-3 rounded-xl border text-xs text-left transition-all cursor-pointer ${
                              selectedProduct?.id === prod.id
                                ? 'bg-orange-600 text-white border-orange-600 shadow-xs'
                                : 'bg-white hover:bg-orange-50/50 text-slate-700 border-slate-200'
                            }`}
                          >
                            <img 
                              src={(prod.images && prod.images[0]) || 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=200'} 
                              alt="" 
                              className="w-7 h-7 object-cover rounded-lg bg-slate-100"
                            />
                            <div className="truncate max-w-[180px]">
                              <div className="font-bold truncate text-[11px]">{prod.name}</div>
                              <div className={`text-[9px] font-mono ${selectedProduct?.id === prod.id ? 'text-orange-200' : 'text-slate-400'}`}>
                                ID: {prod.id} • ৳{prod.discountPrice || prod.price}
                              </div>
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="text-xs text-slate-400 p-3">কোনো প্রোডাক্ট পাওয়া যায়নি।</div>
                      )}
                    </div>

                    {/* Selected Product Highlight Card */}
                    {selectedProduct && (
                      <div className="bg-white p-3.5 rounded-2xl border border-orange-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                        <div className="flex items-center gap-3">
                          <img 
                            src={(selectedProduct.images && selectedProduct.images[0]) || 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=200'} 
                            alt="" 
                            className="w-12 h-12 object-cover rounded-xl border"
                          />
                          <div>
                            <div className="text-[10px] font-bold text-orange-600 uppercase tracking-wider">সিলেক্টেড প্রোডাক্ট</div>
                            <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm">{selectedProduct.name}</h4>
                            <div className="text-[10px] text-slate-500 font-mono flex items-center gap-2 mt-0.5">
                              <span>আইডি: <strong className="text-slate-800">{selectedProduct.id}</strong></span>
                              <span>•</span>
                              <span>অফার প্রাইস: <strong className="text-orange-600">৳{selectedProduct.discountPrice || selectedProduct.price}</strong></span>
                              <span>(রেগুলার: ৳{selectedProduct.price})</span>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={handleCopyCustomPrompt}
                          className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm shadow-orange-200 shrink-0"
                        >
                          {copiedCustomPrompt ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          <span>{copiedCustomPrompt ? 'প্রম্পট কপি হয়েছে!' : 'এই প্রোডাক্টের রেডি প্রম্পট কপি করুন'}</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Creative Design Options Toggles */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                    <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                      <Palette className="w-3.5 h-3.5 text-orange-600" />
                      <span>ল্যান্ডিং পেজের ক্রিয়েটিভ ফ্রন্টেন্ড ফিচারসমূহ (যা প্রম্পটে স্বয়ংক্রিয়ভাবে থাকবে):</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs">
                      <label className="flex items-center gap-2 cursor-pointer bg-white p-2.5 rounded-xl border border-slate-200">
                        <input 
                          type="checkbox" 
                          checked={includeUrgencyTimer} 
                          onChange={(e) => setIncludeUrgencyTimer(e.target.checked)}
                          className="rounded text-orange-600 focus:ring-orange-500 w-4 h-4 cursor-pointer"
                        />
                        <span className="font-medium text-slate-700">আকর্ষণীয় হেডলাইন ও কাউন্টডাউন অফার ব্যানার</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer bg-white p-2.5 rounded-xl border border-slate-200">
                        <input 
                          type="checkbox" 
                          checked={includeGlassmorphism} 
                          onChange={(e) => setIncludeGlassmorphism(e.target.checked)}
                          className="rounded text-orange-600 focus:ring-orange-500 w-4 h-4 cursor-pointer"
                        />
                        <span className="font-medium text-slate-700">গ্লাস-মরফিজম ফিচার কার্ড ও বেনিফিট হাইলাইটস</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer bg-white p-2.5 rounded-xl border border-slate-200">
                        <input 
                          type="checkbox" 
                          checked={includeStickyBar} 
                          onChange={(e) => setIncludeStickyBar(e.target.checked)}
                          className="rounded text-orange-600 focus:ring-orange-500 w-4 h-4 cursor-pointer"
                        />
                        <span className="font-medium text-slate-700">মোবাইল ফ্লোটিং স্টিকি "অর্ডার করুন" বাটন</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer bg-white p-2.5 rounded-xl border border-slate-200">
                        <input 
                          type="checkbox" 
                          checked={includeTrustBadges} 
                          onChange={(e) => setIncludeTrustBadges(e.target.checked)}
                          className="rounded text-orange-600 focus:ring-orange-500 w-4 h-4 cursor-pointer"
                        />
                        <span className="font-medium text-slate-700">কাস্টমার রিভিউ ও ১০০% অরিজিনাল ট্রাস্ট ব্যাজ</span>
                      </label>
                    </div>
                  </div>

                  {/* Generated Prompt Codebox */}
                  <div className="relative bg-slate-950 rounded-2xl p-4 border border-slate-800">
                    <div className="flex justify-between items-center pb-2 mb-2 border-b border-slate-800 text-[11px] text-slate-400 font-mono">
                      <span>Ready Creative AI Prompt (ChatGPT / Claude / Gemini Ready)</span>
                      <button 
                        onClick={handleCopyCustomPrompt} 
                        className="text-orange-400 hover:text-orange-300 flex items-center gap-1 cursor-pointer font-bold"
                      >
                        <Copy className="w-3 h-3" />
                        <span>{copiedCustomPrompt ? 'Copied!' : 'Copy Prompt'}</span>
                      </button>
                    </div>
                    <pre className="text-xs font-mono text-emerald-400 whitespace-pre-wrap leading-relaxed overflow-x-auto max-h-96">
                      {generatedProductPrompt}
                    </pre>
                  </div>
                </div>
              ) : (
                /* GENERIC MASTER PROMPT VIEW */
                <div className="space-y-4">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-between gap-3">
                    <p className="text-xs text-slate-600">
                      এটি একটি জেনেরিক টেমপ্লেট প্রম্পট। এখানে আপনি যেকোনো প্রোডাক্টের তথ্য নিচে ম্যানুয়ালি বসিয়ে AI কে দিতে পারেন।
                    </p>
                    <button
                      onClick={handleCopyPrompt}
                      className="bg-slate-900 hover:bg-black text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
                    >
                      {copiedPrompt ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedPrompt ? 'কপি হয়েছে!' : 'প্রম্পট কপি করুন'}</span>
                    </button>
                  </div>

                  <div className="relative bg-slate-950 rounded-2xl p-4 border border-slate-800">
                    <pre className="text-xs font-mono text-emerald-400 whitespace-pre-wrap leading-relaxed overflow-x-auto max-h-96">
                      {AI_LANDING_PAGE_PROMPT}
                    </pre>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB 2: OVERVIEW & HIGH TRAFFIC ARCHITECTURE */}
          {activeTab === 'overview' && (
            <div className="space-y-6 max-w-4xl">
              <div className="bg-orange-50/70 border border-orange-200 rounded-2xl p-5 space-y-2">
                <h3 className="text-base font-extrabold text-orange-900 flex items-center gap-2">
                  <Flame className="w-5 h-5 text-orange-600" />
                  হাই-ট্রাফিক অ্যাড ক্যাম্পেইন ও সার্ভার লোড প্রোটেকশন
                </h3>
                <p className="text-xs sm:text-sm text-orange-950/80 leading-relaxed">
                  ফেসবুক বিজ্ঞাপনের সময় একসাথে হাজার হাজার কাস্টমার পেজে হিট করলেও আপনার সার্ভার ক্র্যাশ করবে না। কারণ ল্যান্ডিং পেজটি ভারী কোনো রিয়্যাক্ট বান্ডেল বা ডেভ সার্ভারের ওপর নির্ভরশীল নয় — এটি Vercel Edge CDN থেকে সরাসরি আল্ট্রা-ফাস্ট লাইটওয়েট HTML হিসেবে সার্ভ হয়।
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                    ১
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">গ্লোবাল Edge CDN ক্যাশিং</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Vercel ক্যাশে পেজটি সংরক্ষিত থাকায় কোটি কোটি ট্রাফিক আসলেও ডাটাবেজে অতিরিক্ত লোড পড়ে না। প্রতিটি ভিজিটরের ব্রাউজারে পেজটি শূন্য মিলি-সেকেন্ডে ওপেন হয়।
                  </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-xs">
                    ২
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">ডাবল-সাবমিট লক ও ফলব্যাক</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    অর্ডার বাটনে ক্লিক করার সাথে সাথে বাটনটি ডিজেবল হয়ে যায়, যাতে কাস্টমার বারবার ক্লিক করে সার্ভারে জ্যাম তৈরি না করে। একই সাথে <code>/api/place-order</code> এবং সরাসরি Supabase ইনসার্ট ব্যাকআপ সক্রিয় থাকে।
                  </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-xs">
                    ৩
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                    <Send className="w-4 h-4 text-purple-600" />
                    Telegram নোটিফিকেশন গ্যারান্টি
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    অর্ডার সাবমিট হওয়া মাত্রই সার্ভারলেস ফাংশন আপনার টেলিগ্রাম বট (<code>8610132603:AAHm...</code>) এবং চ্যানেলে (<code>6532839240</code>) রিয়েল-টাইমে প্রতিটি অর্ডারের পুশ নোটিফিকেশন পাঠিয়ে দেয়।
                  </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-700 font-bold flex items-center justify-center text-xs">
                    ৪
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                    <QrCode className="w-4 h-4 text-orange-600" />
                    অফিসিয়াল বাংলা কিউআর ও বিকাশ/নগদ
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    ক্যাশ অন ডেলিভারি ছাড়াও আমাদের Supabase Storage CDN-এ হোস্ট করা পাবলিক কিউআর কোড (<code>{PUBLIC_BANGLA_QR_IMAGE}</code>) এবং বিকাশ/নগদ নম্বর (<code>{PUBLIC_BKASH_NUMBER}</code>) দিয়ে কাস্টমার তাৎক্ষণিক পেমেন্ট সম্পন্ন করতে পারে।
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: VARIABLES */}
          {activeTab === 'variables' && (
            <div className="space-y-4 max-w-4xl">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">ডাইনামিক ভেরিয়েবলসমূহের রেফারেন্স গাইড</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    কোন ভেরিয়েবলগুলো <strong>আবশ্যক</strong> এবং কোনগুলো <strong>ঐচ্ছিক</strong> তা স্পষ্টভাবে আলাদা করে দেওয়া হয়েছে।
                  </p>
                </div>
              </div>

              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100/75 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                      <th className="p-3.5">ভেরিয়েবল নাম</th>
                      <th className="p-3.5 text-center">স্ট্যাটাস</th>
                      <th className="p-3.5">বিবরণ ও ব্যবহারের সঠিক স্থান</th>
                      <th className="p-3.5 text-center">কপি</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {VARIABLE_DOCUMENTATION.map((item) => (
                      <tr key={item.key} className="hover:bg-slate-50/60 transition-colors">
                        <td className="p-3.5 font-mono font-bold text-orange-600">
                          <div>{item.key}</div>
                          <span className={`inline-block mt-1 text-[9px] px-1.5 py-0.2 rounded font-sans font-bold ${
                            item.badge === 'Marketing' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                            item.badge === 'Database' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                            item.badge === 'Payment' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                            'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}>
                            {item.badge}
                          </span>
                        </td>
                        <td className="p-3.5 text-center">
                          {item.required ? (
                            <span className="bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded text-[10px] font-bold">
                              আবশ্যক (Required)
                            </span>
                          ) : (
                            <span className="bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded text-[10px] font-medium">
                              ঐচ্ছিক (Optional)
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 text-slate-700">
                          <div className="font-bold text-slate-900 mb-0.5">{item.label}</div>
                          <div className="text-[11px] text-slate-500 mb-1">{item.description}</div>
                          <code className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200 font-mono text-[10px] text-slate-600 inline-block">
                            {item.whereToUse}
                          </code>
                        </td>
                        <td className="p-3.5 text-center">
                          <button
                            onClick={() => handleCopyVar(item.key)}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1.5 rounded-lg font-bold text-[10px] transition-all cursor-pointer flex items-center gap-1 mx-auto"
                            title="কপি করুন"
                          >
                            {copiedVarKey === item.key ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5 text-slate-500" />
                            )}
                            <span>{copiedVarKey === item.key ? 'কপি হয়েছে' : 'কপি'}</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Delivery charge division breakdown */}
              <div className="bg-amber-50/70 border border-amber-200 p-4 rounded-2xl space-y-2 text-xs">
                <div className="font-bold text-amber-900 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  ডেলিভারি চার্জ নির্ধারণের সুনির্দিষ্ট নিয়ম (Inside vs Outside Dhaka):
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-700 pt-1">
                  <div className="bg-white p-3 rounded-xl border border-amber-200">
                    <span className="font-bold text-emerald-700 block mb-0.5">১. Inside Dhaka (ঢাকার ভেতরে):</span>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      শুধুমাত্র <strong>"ঢাকা জেলা / মেট্রোপলিটন"</strong>। কাস্টমার ঢাকা জেলা সিলেক্ট করলেই চার্জ বসবে <code>RUPAN_INSIDE_DHAKA_SHIPPING</code> (সাধারণত ৬০ টাকা)।
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-amber-200">
                    <span className="font-bold text-orange-700 block mb-0.5">২. Outside Dhaka (ঢাকার বাইরে):</span>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      ঢাকা জেলা ব্যতীত বাংলাদেশের <strong>বাকি সকল ৬৩টি জেলা</strong> (এমনকি ঢাকা বিভাগের অন্তর্ভুক্ত গাজীপুর, নারায়ণগঞ্জ, টাঙ্গাইল, নরসিংদী ইত্যাদি এবং চট্টগ্রাম, রাজশাহীসহ সকল জেলা)। এগুলোতে চার্জ হবে <code>RUPAN_OUTSIDE_DHAKA_SHIPPING</code> (সাধারণত ১২০ টাকা)।
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: DEMO TEMPLATE */}
          {activeTab === 'demo_template' && (
            <div className="space-y-4 max-w-4xl">
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                    <Code className="w-4 h-4 text-cyan-600" />
                    রেডিমেড ল্যান্ডিং পেজ (বিভাগ, জেলা, বাংলা কিউআর ও Telegram নোটিফিকেশন সহ)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    এই কোডটিতে সব জেলা, ডেলিভারি চার্জ অটো-ক্যালকুলেশন, বাংলা কিউআর প্যানেল এবং Telegram নোটিফিকেশন ইন্টিগ্রেশন সম্পন্ন করা আছে।
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyDemo}
                    className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    {copiedDemo ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedDemo ? 'কোড কপি হয়েছে!' : 'কোড কপি করুন'}</span>
                  </button>
                  {onLoadDemoTemplate && (
                    <button
                      onClick={() => {
                        onLoadDemoTemplate(DEMO_PRODUCT_LANDING_TEMPLATE);
                        onClose();
                      }}
                      className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-sm shadow-orange-200"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>এডিটরে লোড করুন</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="relative bg-slate-950 rounded-2xl p-4 border border-slate-800">
                <div className="flex justify-between items-center pb-2 mb-2 border-b border-slate-800 text-[11px] text-slate-400 font-mono">
                  <span>demo-product-landing-full.html</span>
                  <button onClick={handleCopyDemo} className="text-orange-400 hover:text-orange-300 flex items-center gap-1 cursor-pointer">
                    <Copy className="w-3 h-3" />
                    <span>{copiedDemo ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="text-[11px] font-mono text-cyan-300 whitespace-pre-wrap leading-relaxed overflow-x-auto max-h-96">
                  {DEMO_PRODUCT_LANDING_TEMPLATE}
                </pre>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-gray-200 flex items-center justify-between shrink-0 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>সিস্টেমটি সরাসরি <code>https://www.myrupan.com/api/place-order</code> ও Supabase-এর সাথে সুসংযুক্ত।</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl transition-all cursor-pointer"
          >
            বন্ধ করুন
          </button>
        </div>

      </div>
    </div>
  );
}
