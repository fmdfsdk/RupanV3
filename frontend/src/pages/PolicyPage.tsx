import React from 'react';
import { RefreshCw, FileText, ShieldCheck } from 'lucide-react';

export default function PolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-10">
      <h1 className="font-display text-3xl font-extrabold text-brand-text uppercase text-center">
        Brand Policies & Terms
      </h1>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="p-6 md:p-8 space-y-8 font-sans text-sm text-gray-600 leading-relaxed">
          
          {/* Exchange Policy */}
          <div className="space-y-3">
            <h3 className="font-display text-base font-bold uppercase tracking-wider text-brand-primary flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-brand-accent" />
              7-Day Easy Exchange Policy
            </h3>
            <p>
              We want you to love your style. If a garment does not fit as expected or displays any manufacturer defect, we offer a straightforward doorstep exchange program.
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Garments must remain unwashed, unworn, with all designer hangtags intact.</li>
              <li>Saree blouses or custom tailored pieces are ineligible unless defect is present initially.</li>
              <li>Doorstep pickup exchanges within Dhaka are completed within 48 hours of ticket creation.</li>
            </ul>
          </div>

          {/* Privacy Policy */}
          <div className="space-y-3 border-t border-gray-100 pt-6">
            <h3 className="font-display text-base font-bold uppercase tracking-wider text-brand-primary flex items-center gap-2">
              <FileText className="w-5 h-5 text-brand-accent" />
              Secure Customer Privacy Commitment
            </h3>
            <p>
              Your shopping security and transaction safety is our topmost priority. We never sell, share, or lease customer phone numbers, home delivery coordinates, or email IDs with third-party networks. Financial data processed via bKash, Nagad, and secure credit cards are fully tokenized.
            </p>
          </div>

          {/* Terms of Use */}
          <div className="space-y-3 border-t border-gray-100 pt-6">
            <h3 className="font-display text-base font-bold uppercase tracking-wider text-brand-primary flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-brand-accent" />
              Terms of Online Transactions
            </h3>
            <p>
              By placing an order across our catalog, you acknowledge nationwide Cash on Delivery is an act of authentic purchase. Customers are requested to inspect packages in front of courier delivery agents before signing acceptance receipts.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
