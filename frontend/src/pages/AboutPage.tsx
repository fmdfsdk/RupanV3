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
