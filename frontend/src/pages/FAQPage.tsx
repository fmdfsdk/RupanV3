import React from 'react';
import { Phone, MessageCircle } from 'lucide-react';
import { FAQ } from '../data';
import { useStore } from '../store/useStore';

export default function FAQPage() {
  const dbSettings = useStore((state) => state.dbSettings);
  const supportNum = dbSettings?.supportNumber || dbSettings?.support_number || '+8809612345678';
  const whatsappNum = dbSettings?.whatsappNumber || dbSettings?.whatsapp_number || '+8801711223344';
  const cleanWhatsappNum = whatsappNum.replace(/[^\d+]/g, '');

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-10">
      <div className="text-center space-y-2">
        <span className="text-xs font-bold text-brand-primary uppercase tracking-widest block">
          Support Hub
        </span>
        <h1 className="font-display text-3xl font-extrabold text-brand-text uppercase">
          Frequently Asked Questions
        </h1>
        <p className="text-sm text-gray-500 max-w-sm mx-auto">
          Find answers regarding sizing fits, shipping speed, and exchange procedures.
        </p>
      </div>

      {/* Accordion FAQ items */}
      <div className="space-y-4">
        {FAQ.map((faq, i) => (
          <div
            key={i}
            className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-2"
          >
            <h4 className="font-display font-bold text-sm md:text-base text-brand-primary">
              Q: {faq.q}
            </h4>
            <p className="text-xs md:text-sm text-gray-600 leading-relaxed font-sans">
              A: {faq.a}
            </p>
          </div>
        ))}
      </div>

      {/* Support boxes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 text-center">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-2">
          <Phone className="w-6 h-6 text-brand-accent mx-auto" />
          <h4 className="font-bold text-sm text-brand-text">Corporate Phone Helpline</h4>
          <p className="text-xs text-gray-400">Available Daily from 9:00 AM to 10:00 PM</p>
          <strong className="text-brand-primary text-base block font-mono">{supportNum}</strong>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-2">
          <MessageCircle className="w-6 h-6 text-emerald-600 mx-auto" />
          <h4 className="font-bold text-sm text-brand-text">WhatsApp Quick Assistance</h4>
          <p className="text-xs text-gray-400">Direct query regarding color variants or sizing</p>
          <button
            onClick={() => window.open(`https://wa.me/${cleanWhatsappNum}`, '_blank')}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 px-4 rounded-xl cursor-pointer"
          >
            Message WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
}
