import React, { useState } from 'react';
import { MapPin } from 'lucide-react';
import { useStore } from '../store/useStore';
import { orderService } from '../services/orderService';
import { Order } from '../types';

export default function OrderTrackingPage() {
  const isSupabaseOnline = useStore((state) => state.isSupabaseOnline);
  const localOrders = useStore((state) => state.orders);
  const dbSettings = useStore((state) => state.dbSettings);

  const [trackOrderId, setTrackOrderId] = useState<string>('');
  const [trackPhone, setTrackPhone] = useState<string>('');
  const [trackingResult, setTrackingResult] = useState<Order | null>(null);
  const [trackingSearched, setTrackingSearched] = useState<boolean>(false);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  const supportNum = dbSettings?.supportNumber || dbSettings?.support_number || '+8809612345678';

  const handleTrackQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    setTrackingSearched(true);
    setIsSearching(true);
    
    const cleanId = trackOrderId.trim().toUpperCase();
    const cleanPhone = trackPhone.trim();

    // 1. Try to search locally first
    const localMatched = localOrders.find(
      (o) => o.id.toUpperCase() === cleanId && o.phone === cleanPhone
    );

    if (localMatched) {
      setTrackingResult(localMatched);
      setIsSearching(false);
      return;
    }

    // 2. Try to search live database if online
    if (isSupabaseOnline) {
      try {
        const order = await orderService.fetchOrderByIdAndPhone(cleanId, cleanPhone);
        if (order) {
          setTrackingResult(order);
        } else {
          setTrackingResult(null);
        }
      } catch (err) {
        console.error("Error searching order in Supabase:", err);
        setTrackingResult(null);
      }
    } else {
      setTrackingResult(null);
    }
    
    setIsSearching(false);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-10">
      <div className="text-center space-y-3">
        <span className="text-xs font-bold text-brand-primary uppercase tracking-widest block">
          Delivery Tracker
        </span>
        <h1 className="font-display text-3xl font-extrabold text-brand-text uppercase">
          Track Your Delivery Status
        </h1>
        <p className="text-sm text-gray-500 max-w-sm mx-auto">
          Enter your Order ID (e.g. RUP-9524) and Phone Number to inspect your delivery timeline.
        </p>
        
        <div className="flex justify-center pt-2">
          {isSupabaseOnline ? (
            <button 
              type="button"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 uppercase tracking-widest border border-emerald-200 shadow-sm"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Online
            </button>
          ) : (
            <button 
              type="button"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-extrabold bg-gray-100 text-gray-700 uppercase tracking-widest border border-gray-200 shadow-sm"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-gray-400"></span>
              Offline
            </button>
          )}
        </div>
      </div>

      {/* Tracking Search Form */}
      <form onSubmit={handleTrackQuery} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 space-y-1.5 w-full">
          <label className="text-xs uppercase font-bold text-gray-500">Order ID *</label>
          <input
            type="text"
            required
            value={trackOrderId}
            onChange={(e) => setTrackOrderId(e.target.value)}
            placeholder="e.g. RUP-9524"
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-primary font-mono"
          />
        </div>
        <div className="flex-1 space-y-1.5 w-full">
          <label className="text-xs uppercase font-bold text-gray-500">Phone Number *</label>
          <input
            type="tel"
            required
            value={trackPhone}
            onChange={(e) => setTrackPhone(e.target.value)}
            placeholder="e.g. 01711223344"
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-primary font-sans"
          />
        </div>
        <button
          type="submit"
          disabled={isSearching}
          className="w-full md:w-auto bg-brand-primary hover:bg-blue-950 text-white font-bold text-sm px-6 py-3.5 rounded-xl transition-all cursor-pointer disabled:opacity-50"
        >
          {isSearching ? 'Searching...' : 'Track Now'}
        </button>
      </form>

      {/* Tracking Results Visual Timeline */}
      {trackingSearched && !isSearching && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-xs space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
          {trackingResult ? (
            <>
              {/* Header Info */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-gray-100">
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase">CURRENT STATUS</span>
                  <h3 className="font-display text-lg font-bold text-brand-primary uppercase">
                    {trackingResult.status}
                  </h3>
                </div>
                <div className="text-left md:text-right text-xs">
                  <p className="text-gray-400">Order ID: <strong className="text-brand-text font-mono">{trackingResult.id}</strong></p>
                  <p className="text-gray-400">Customer: <strong className="text-brand-text">{trackingResult.customerName}</strong></p>
                </div>
              </div>

              {/* Timeline Tracker */}
              <div className="relative pt-6 max-w-md mx-auto">
                {/* Vertical Line */}
                <div className="absolute left-4 top-10 bottom-10 w-0.5 bg-gray-200" />

                {/* States */}
                {[
                  { name: 'Pending', label: 'Order Pending', desc: 'Order submitted, awaiting staff validation.' },
                  { name: 'Confirmed', label: 'Order Confirmed', desc: 'Verified and approved by customer representative.' },
                  { name: 'Packed', label: 'Packed & Dispatched', desc: 'Carefully packed and handed to Pathao Logistics.' },
                  { name: 'Shipped', label: 'Shipped', desc: 'Package left Dhaka main dispatch warehouse.' },
                  { name: 'Out for Delivery', label: 'Out for Delivery', desc: 'Courier agent is arriving at your doorstep.' },
                  { name: 'Delivered', label: 'Delivered', desc: 'Successfully received & paid by cash/wallet.' }
                ].map((step, i) => {
                  const statusWeights = { Pending: 1, Confirmed: 2, Packed: 3, Shipped: 4, 'Out for Delivery': 5, Delivered: 6 };
                  const currentWeight = statusWeights[trackingResult.status as keyof typeof statusWeights] || 1;
                  const stepWeight = statusWeights[step.name as keyof typeof statusWeights];
                  const isDone = stepWeight <= currentWeight;
                  const isCurrent = step.name === trackingResult.status;

                  return (
                    <div key={i} className="flex gap-4 items-start mb-6 last:mb-0 relative z-10">
                      {/* Dot indicator */}
                      <div className={`w-8.5 h-8.5 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-all ${
                        isCurrent 
                          ? 'bg-brand-primary text-white scale-110 ring-4 ring-blue-100'
                          : isDone
                          ? 'bg-emerald-600 text-white'
                          : 'bg-gray-100 text-gray-400'
                      }`}>
                        {i + 1}
                      </div>
                      
                      {/* Text Description */}
                      <div className="space-y-0.5">
                        <h4 className={`text-sm font-bold uppercase tracking-wide ${
                          isCurrent ? 'text-brand-primary' : isDone ? 'text-emerald-700' : 'text-gray-400'
                        }`}>
                          {step.label}
                        </h4>
                        <p className="text-xs text-gray-500 leading-normal">{step.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer Helpline contact for tracking */}
              <div className="bg-gray-50 p-4 rounded-xl text-center text-xs text-gray-500">
                <span>Any questions or delayed delivery? Call helpline: <strong>{supportNum}</strong></span>
              </div>
            </>
          ) : (
            <div className="text-center py-6 space-y-3">
              <MapPin className="w-10 h-10 text-red-500 mx-auto" />
              <h4 className="font-display font-bold text-brand-text uppercase">No Shipment Record Found</h4>
              <p className="text-xs text-gray-500 max-w-xs mx-auto">
                We couldn't locate any active delivery matched with Order ID <strong>{trackOrderId}</strong> and phone <strong>{trackPhone}</strong>. Please check your spelling and try again.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
