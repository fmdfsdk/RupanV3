import React from 'react';
import { Truck, ShieldCheck, RotateCcw, HelpCircle } from 'lucide-react';

export default function ValueProps() {
  return (
    <section className="w-full max-w-[1750px] mx-auto px-4 sm:px-8 lg:px-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-white border border-gray-100 rounded-2xl p-6 md:p-8 shadow-2xs">
        <div className="flex items-center gap-4 border-r border-gray-100/70 last:border-0 pr-4">
          <div className="p-3.5 bg-orange-50 rounded-xl text-[#ff5c00] shrink-0">
            <Truck className="w-7 h-7" />
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-gray-900 tracking-tight text-left">FAST DELIVERY</h4>
            <p className="text-xs text-gray-400 mt-0.5 font-medium text-left">Free shipping over 5000Tk</p>
          </div>
        </div>
        <div className="flex items-center gap-4 border-r border-gray-100/70 last:border-0 pr-4">
          <div className="p-3.5 bg-orange-50 rounded-xl text-[#ff5c00] shrink-0">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-gray-900 tracking-tight text-left">AUTHORIZED PRODUCTS</h4>
            <p className="text-xs text-gray-400 mt-0.5 font-medium text-left">100% Genuine Brands Guaranteed</p>
          </div>
        </div>
        <div className="flex items-center gap-4 border-r border-gray-100/70 last:border-0 pr-4">
          <div className="p-3.5 bg-orange-50 rounded-xl text-[#ff5c00] shrink-0">
            <RotateCcw className="w-7 h-7" />
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-gray-900 tracking-tight text-left">7-DAY REPLACEMENTS</h4>
            <p className="text-xs text-gray-400 mt-0.5 font-medium text-left">Within 7 days for an exchange</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-orange-50 rounded-xl text-[#ff5c00] shrink-0">
            <HelpCircle className="w-7 h-7" />
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-gray-900 tracking-tight text-left">CUSTOMER SUPPORT</h4>
            <p className="text-xs text-gray-400 mt-0.5 font-medium text-left">24/7 Helpline & Live Chat</p>
          </div>
        </div>
      </div>
    </section>
  );
}
