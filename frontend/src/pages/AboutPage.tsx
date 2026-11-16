import React from 'react';
import { useSEO, buildLocalBusinessSchema } from '../hooks/useSEO';

export default function AboutPage() {
  useSEO({
    title: 'আমাদের সম্পর্কে | Rupan — বাংলাদেশের প্রিমিয়াম ফ্যাশন ব্র্যান্ড',
    description: 'Rupan — বাংলাদেশের প্রিমিয়াম লাইফস্টাইল ফ্যাশন ব্র্যান্ড। উন্নত কারুকাজ, দীর্ঘস্থায়ী ফ্যাব্রিক এবং সমসাময়িক ডিজাইনের নিখুঁত সমন্বয়।',
    canonical: '/about-us',
    ogType: 'website',
    jsonLd: [buildLocalBusinessSchema()],
  });
  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-16 text-left animate-in fade-in duration-300">
      {/* Elegant Hero Section */}
      <div className="relative rounded-3xl overflow-hidden bg-black text-white p-8 md:p-16 flex flex-col justify-center min-h-[350px]">
        <div className="absolute inset-0 opacity-40 bg-cover bg-center mix-blend-overlay" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200')" }}></div>
        <div className="relative z-10 space-y-4 max-w-2xl">
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#ff5c00]">Our Legacy & Spirit</span>
          <h1 className="font-display text-4xl md:text-5xl font-black uppercase leading-tight">
            Crafting the Future of <span className="text-[#ff5c00]">Bangladeshi Style</span>
          </h1>
          <p className="text-sm md:text-base text-gray-300 leading-relaxed font-medium">
            We are a premium lifestyle fashion brand engineered with elite Bangladeshi craftsmanship, durable climate-resilient fabrics, and contemporary fit excellence.
          </p>
        </div>
      </div>

      {/* Official Identity & Trust Signals */}
      <div className="bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50/40 border border-orange-200/80 rounded-2xl p-6 md:p-8 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-orange-100 pb-4">
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-[#ff5c00] bg-orange-100/80 px-3 py-1 rounded-full inline-block mb-1.5">
              Official Brand Identity
            </span>
            <h2 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight">
              Rupan (রূপান) ও myrupan.com — একই নির্ভরযোগ্য প্রতিষ্ঠান
            </h2>
          </div>
          <div className="text-xs font-bold text-gray-600 bg-white/80 border border-orange-100 px-4 py-2 rounded-xl shrink-0">
            স্টোর ডোমেন: <span className="text-[#ff5c00] font-black font-mono">www.myrupan.com</span>
          </div>
        </div>
        <p className="text-xs md:text-sm text-gray-700 leading-relaxed font-medium">
          <strong>Rupan (রূপান)</strong> হলো আমাদের প্রতিষ্ঠিত ফ্যাশন ও লাইফস্টাইল ব্র্যান্ড, এবং <strong>myrupan.com</strong> হলো আমাদের একমাত্র অফিশিয়াল অনলাইন ফ্ল্যাগশিপ শপিং প্ল্যাটফর্ম। উভয় পরিচয়ই একক ও অভিন্ন সত্ত্বা। আমাদের সকল পণ্য সরাসরি নিজস্ব তত্ত্বাবধানে উৎপাদিত ও মান নিয়ন্ত্রিত হয়ে গ্রাহকের কাছে পৌঁছায়।
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs font-bold">
          <div className="bg-white p-3 rounded-xl border border-orange-100 text-center space-y-1 shadow-2xs">
            <span className="text-lg">⭐</span>
            <div className="font-black text-gray-900 text-sm">১০,০০০+</div>
            <div className="text-[11px] text-gray-500 font-semibold">সন্তুষ্ট গ্রাহক</div>
          </div>
          <div className="bg-white p-3 rounded-xl border border-orange-100 text-center space-y-1 shadow-2xs">
            <span className="text-lg">🛡️</span>
            <div className="font-black text-emerald-700 text-sm">ক্যাশ অন ডেলিভারি</div>
            <div className="text-[11px] text-gray-500 font-semibold">পণ্য দেখে মূল্য পরিশোধ</div>
          </div>
          <div className="bg-white p-3 rounded-xl border border-orange-100 text-center space-y-1 shadow-2xs">
            <span className="text-lg">⚡</span>
            <div className="font-black text-gray-900 text-sm">দ্রুত ডেলিভারি</div>
            <div className="text-[11px] text-gray-500 font-semibold">সারাদেশে হোম ডেলিভারি</div>
          </div>
          <div className="bg-white p-3 rounded-xl border border-orange-100 text-center space-y-1 shadow-2xs">
            <span className="text-lg">🔄</span>
            <div className="font-black text-gray-900 text-sm">৭ দিনের গ্যারান্টি</div>
            <div className="text-[11px] text-gray-500 font-semibold">সহজ রিটার্ন ও এক্সচেঞ্জ</div>
          </div>
        </div>
      </div>

      {/* Core Pillars / Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-2xs space-y-4">
          <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-xl">✨</div>
          <h3 className="font-display text-lg font-black text-gray-900 uppercase">Premium Selection</h3>
          <p className="text-xs md:text-sm text-gray-500 leading-relaxed font-semibold">
            Every thread in our Royal Jacquard Panjabis, combed cotton T-Shirts, and couple matching sets is rigorously quality-checked for high thread-density durability.
          </p>
        </div>
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-2xs space-y-4">
          <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-xl">🧵</div>
          <h3 className="font-display text-lg font-black text-gray-900 uppercase">Tailored Fit</h3>
          <p className="text-xs md:text-sm text-gray-500 leading-relaxed font-semibold">
            Specifically tailored to fit Bangladeshi builds. Comfortable shoulder drop, breathable cotton chest contours, and flawless double-stitched durability.
          </p>
        </div>
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-2xs space-y-4">
          <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-xl">🚚</div>
          <h3 className="font-display text-lg font-black text-gray-900 uppercase">Hassle-Free Exchanges</h3>
          <p className="text-xs md:text-sm text-gray-500 leading-relaxed font-semibold">
            We want you to dress with perfect confidence. That is why we provide a unique doorstep exchange program across all major regions in Bangladesh.
          </p>
        </div>
      </div>

      {/* Story & Heritage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <span className="text-xs font-extrabold uppercase tracking-wider text-[#ff5c00] block">Our Mission</span>
          <h2 className="font-display text-3xl font-black text-gray-900 uppercase leading-snug">
            Uncompromising Quality For The Trendsetters
          </h2>
          <div className="text-sm text-gray-600 space-y-4 leading-relaxed font-semibold">
            <p>
              Established with a single mission to eliminate low-quality fashion alternatives, our clothing line has risen to become Bangladesh’s premier household brand for high-street, ethnic, and western styles.
            </p>
            <p>
              From weavers in Tangail to specialized tailoring factories in Dhaka, we combine localized traditional craftsmanship with clean, high-street minimalist designs. Our collection is curated with ultimate premium prestige.
            </p>
          </div>
          <div className="flex gap-6 pt-2">
            <div>
              <h4 className="text-3xl font-black text-[#ff5c00]">100K+</h4>
              <p className="text-[10px] uppercase font-bold text-gray-400">Happy Wardrobes</p>
            </div>
            <div className="border-l border-gray-100 pl-6">
              <h4 className="text-3xl font-black text-[#ff5c00]">50+</h4>
              <p className="text-[10px] uppercase font-bold text-gray-400">Master Craftsmen</p>
            </div>
            <div className="border-l border-gray-100 pl-6">
              <h4 className="text-3xl font-black text-[#ff5c00]">100%</h4>
              <p className="text-[10px] uppercase font-bold text-gray-400">Pure Combed Cotton</p>
            </div>
          </div>
        </div>
        <div className="relative rounded-2xl overflow-hidden shadow-md">
          <img src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=1000" alt="Tailoring Craft" className="w-full h-[380px] object-cover" />
        </div>
      </div>
    </div>
  );
}
