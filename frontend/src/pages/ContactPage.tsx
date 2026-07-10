import React, { useState } from 'react';
import { Phone, MessageCircle, MapPin } from 'lucide-react';
import { useStore } from '../store/useStore';

export default function ContactPage() {
  const dbSettings = useStore((state) => state.dbSettings);
  
  const [contactName, setContactName] = useState<string>('');
  const [contactEmail, setContactEmail] = useState<string>('');
  const [contactPhone, setContactPhone] = useState<string>('');
  const [contactSubject, setContactSubject] = useState<string>('');
  const [contactMessage, setContactMessage] = useState<string>('');
  const [isSubmittingContact, setIsSubmittingContact] = useState<boolean>(false);
  const [contactSuccess, setContactSuccess] = useState<boolean>(false);

  const supportNum = dbSettings?.supportNumber || dbSettings?.support_number || '09678 123 456';
  const whatsappNum = dbSettings?.whatsappNumber || dbSettings?.whatsapp_number || '+8801711223344';
  const cleanWhatsappNum = whatsappNum.replace(/[^\d+]/g, '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingContact(true);
    setTimeout(() => {
      setIsSubmittingContact(false);
      setContactSuccess(true);
      setContactName('');
      setContactEmail('');
      setContactPhone('');
      setContactSubject('');
      setContactMessage('');
    }, 1200);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-12 text-left animate-in fade-in duration-300">
      <div className="text-center space-y-2">
        <span className="text-xs font-bold text-[#ff5c00] uppercase tracking-widest block">We Are Here For You</span>
        <h1 className="font-display text-3xl font-extrabold text-gray-900 uppercase">Contact Our Support Hub</h1>
        <p className="text-sm text-gray-500 max-w-sm mx-auto font-medium">
          Have questions about fits, shipments, or exchanges? Reach out directly.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Interactive Contact Form (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-2xs space-y-6">
          <h3 className="font-display text-lg font-black text-gray-900 uppercase border-b border-gray-100 pb-3">
            Send Us A Message
          </h3>

          {contactSuccess ? (
            <div className="bg-emerald-50 text-emerald-800 p-6 rounded-xl border border-emerald-100 text-center space-y-4">
              <div className="text-3xl">🎉</div>
              <h4 className="font-bold text-base uppercase">Message Sent Successfully!</h4>
              <p className="text-xs leading-relaxed font-semibold">
                Thank you for contacting us. Your inquiry has been logged, and our customer support representative will reach out to you via email or phone shortly.
              </p>
              <button
                onClick={() => setContactSuccess(false)}
                className="bg-[#ff5c00] text-white text-xs font-extrabold px-4 py-2 rounded-md uppercase tracking-wider cursor-pointer hover:bg-black transition-colors"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-extrabold text-gray-400">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Your full name"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#ff5c00]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-extrabold text-gray-400">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="Your email address"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#ff5c00]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-extrabold text-gray-400">Phone Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 017XXXXXXXX"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#ff5c00]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-extrabold text-gray-400">Subject *</label>
                  <input
                    type="text"
                    required
                    placeholder="Topic of discussion"
                    value={contactSubject}
                    onChange={(e) => setContactSubject(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#ff5c00]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-extrabold text-gray-400">Message / Inquiry *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Write your detailed inquiry..."
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#ff5c00]"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingContact}
                className="w-full bg-[#ff5c00] hover:bg-black text-white font-extrabold text-xs py-3.5 rounded-lg tracking-wider uppercase transition-all shadow-md cursor-pointer disabled:opacity-50"
              >
                {isSubmittingContact ? 'SUBMITTING MESSAGE...' : 'SUBMIT MESSAGE'}
              </button>
            </form>
          )}
        </div>

        {/* Right Column: Direct details (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-4">
            <h3 className="font-display text-base font-black text-gray-900 uppercase">
              Direct Contact Lines
            </h3>
            
            <div className="space-y-3.5 text-xs font-semibold text-gray-600">
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-[#ff5c00] shrink-0 mt-0.5" />
                <div>
                  <p className="text-gray-900 font-extrabold">Helpline Number</p>
                  <p className="text-sm font-black text-[#ff5c00] mt-0.5">{supportNum} (9 AM - 10 PM)</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MessageCircle className="w-4 h-4 text-[#ff5c00] shrink-0 mt-0.5" />
                <div>
                  <p className="text-gray-900 font-extrabold">WhatsApp Support</p>
                  <p className="text-xs font-black text-brand-primary mt-0.5 hover:underline">
                    <a href={`https://wa.me/${cleanWhatsappNum}`} target="_blank" rel="noopener noreferrer">{whatsappNum}</a>
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#ff5c00] shrink-0 mt-0.5" />
                <div>
                  <p className="text-gray-900 font-extrabold">Corporate HQ</p>
                  <p className="leading-relaxed">House-23, Road-12, Dhanmondi, Dhaka-1209, Bangladesh</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-4">
            <h3 className="font-display text-base font-black text-gray-900 uppercase">
              Flagship Outlets
            </h3>

            <div className="space-y-3 text-xs leading-relaxed font-semibold text-gray-600">
              <div className="border-b border-gray-200/60 pb-2">
                <p className="text-gray-950 font-extrabold uppercase">Dhanmondi Outlet</p>
                <p className="Mimi Plaza, 2nd Floor, Road 27, Dhanmondi, Dhaka"></p>
                <p className="text-[10px] text-gray-400 font-bold">Hours: 10:00 AM - 9:30 PM (Weekly Off: Tuesday)</p>
              </div>
              <div className="border-b border-gray-200/60 pb-2">
                <p className="text-gray-950 font-extrabold uppercase">Banani Outlet</p>
                <p className="Road-11, House-45, Block-F, Banani, Dhaka"></p>
                <p className="text-[10px] text-gray-400 font-bold">Hours: 10:00 AM - 9:30 PM (Weekly Off: Wednesday)</p>
              </div>
              <div>
                <p className="text-gray-950 font-extrabold uppercase">Uttara Outlet</p>
                <p className="Sector-3, Sonargaon Janapath Road, Uttara, Dhaka"></p>
                <p className="text-[10px] text-gray-400 font-bold">Hours: 10:00 AM - 9:30 PM (Weekly Off: Monday)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
