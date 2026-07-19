/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MessageSquareCode } from 'lucide-react';

export default function WhatsAppButton() {
  const handleWhatsAppClick = () => {
    // Open a friendly chat in a new window with a pre-configured message
    const message = encodeURIComponent("Hello Rupan! I would like to query about your latest premium collections.");
    window.open(`https://wa.me/8801700000000?text=${message}`, '_blank');
  };

  return (
    <button
      id="whatsapp-floating-trigger"
      onClick={handleWhatsAppClick}
      className="fixed bottom-20 right-6 md:bottom-6 md:right-6 z-40 flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-4 rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95 duration-300 group cursor-pointer"
      title="Chat with us on WhatsApp"
    >
      <span className="relative flex h-3 w-3">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
      </span>
      <MessageSquareCode className="w-5 h-5 text-white" />
      <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-out text-sm font-sans whitespace-nowrap">
        WhatsApp Helpline
      </span>
    </button>
  );
}
