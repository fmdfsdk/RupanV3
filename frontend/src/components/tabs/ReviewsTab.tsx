import React from 'react';
import { Review } from '../../types';
import { supabase } from '../../lib/supabase';

interface ReviewsTabProps {
  reviews: Review[];
  setReviews: (r: Review[]) => void;
}

export default function ReviewsTab({ reviews, setReviews }: ReviewsTabProps) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Customer Reviews Board</h1>
          <p className="text-xs text-gray-500">Moderate product review submittals, reply to consumer queries, and approve verified badges.</p>
        </div>
      </div>

      {/* Reviews List */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden divide-y divide-gray-100">
        {reviews.map((r) => (
          <div key={r.id} className="p-5 flex flex-col md:flex-row md:items-start justify-between gap-4 hover:bg-gray-50/30 transition-colors">
            <div className="flex gap-4">
              <img 
                src={r.userPhoto || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150'} 
                alt={r.userName} 
                className="w-10 h-10 rounded-full object-cover shrink-0" 
                referrerPolicy="no-referrer"
              />
              <div className="space-y-1.5">
                <div className="flex items-center space-x-2">
                  <h4 className="font-bold text-sm text-zinc-950">{r.userName}</h4>
                  <span className="text-[10px] font-mono text-gray-400">{r.date}</span>
                  {r.verified && (
                    <span className="bg-emerald-50 text-emerald-700 text-[9px] font-bold px-1.5 py-0.2 rounded border border-emerald-100">
                      Verified Purchase
                    </span>
                  )}
                </div>
                
                <div className="flex text-amber-400 text-xs">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i}>{i < r.rating ? '★' : '☆'}</span>
                  ))}
                </div>
                
                <p className="text-xs text-zinc-600 leading-relaxed max-w-2xl">{r.comment}</p>
              </div>
            </div>

            <div className="flex gap-2 shrink-0 self-end md:self-start">
              <button 
                onClick={async () => {
                  const updated = reviews.map(rev => rev.id === r.id ? { ...rev, status: 'approved' as const } : rev);
                  await supabase.from('reviews').update({ status: 'approved' }).eq('id', r.id);
                  setReviews(updated);
                  alert("Review approved for publication on the storefront!");
                }}
                className="bg-green-50 text-green-700 px-3 py-1.5 rounded-lg text-xs font-bold border border-green-100 hover:bg-green-100 transition-all cursor-pointer"
              >
                Approve
              </button>
              
              <button 
                onClick={async () => {
                  const updated = reviews.filter(rev => rev.id !== r.id);
                  await supabase.from('reviews').delete().eq('id', r.id);
                  setReviews(updated);
                  alert("Review deleted successfully.");
                }}
                className="bg-red-50 text-red-600 px-3 py-1.5 rounded-lg text-xs font-bold border border-red-100 hover:bg-red-100 transition-all cursor-pointer"
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
