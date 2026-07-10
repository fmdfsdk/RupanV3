import React from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Coupon } from '../../types';
import { supabase } from '../../lib/supabase';

interface CouponsTabProps {
  coupons: Coupon[];
  setCoupons: (c: Coupon[]) => void;
  setEditingCoupon: (c: Coupon | null) => void;
  setCouponModalOpen: (open: boolean) => void;
  onDeleteCoupon: (code: string) => void;
}

export default function CouponsTab({
  coupons,
  setCoupons,
  setEditingCoupon,
  setCouponModalOpen,
  onDeleteCoupon
}: CouponsTabProps) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Coupon Engine</h1>
          <p className="text-xs text-gray-500">Add percentage cuts, flat waivers, and shipping exclusions dynamically.</p>
        </div>
        <button
          onClick={() => {
            setEditingCoupon(null);
            setCouponModalOpen(true);
          }}
          className="bg-brand-primary text-white text-xs font-bold uppercase tracking-wider px-5 py-3 rounded-xl flex items-center space-x-2 hover:bg-blue-900 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create Coupon</span>
        </button>
      </div>

      {/* Coupons list */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-[10px] uppercase tracking-wider text-gray-400 font-bold">
                <th className="p-4">Coupon Code</th>
                <th className="p-4">Discount Scheme</th>
                <th className="p-4 text-center">Minimum Purchase</th>
                <th className="p-4 text-center">Limit Status</th>
                <th className="p-4 text-center">Expiration Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-xs">
              {coupons.map((c) => (
                <tr key={c.code} className="hover:bg-gray-50/50">
                  <td className="p-4">
                    <div className="font-mono font-black text-sm text-brand-primary tracking-wider uppercase bg-blue-50 border border-blue-100 rounded px-2 py-0.5 w-fit">
                      {c.code}
                    </div>
                  </td>
                  <td className="p-4 font-bold text-zinc-900">
                    {c.type === 'percentage' ? `${c.value}% Off Basket` : c.type === 'fixed' ? `৳${c.value} Flat Waiver` : 'Free Shipping'}
                  </td>
                  <td className="p-4 text-center font-semibold text-gray-500">৳{c.minOrder}</td>
                  <td className="p-4 text-center">
                    <span className="font-semibold text-zinc-600">
                      {c.usedCount || 0} / {c.usageLimit || '∞'} uses
                    </span>
                  </td>
                  <td className="p-4 text-center font-mono text-gray-400 font-semibold">{c.expiryDate || 'No Expiration'}</td>
                  <td className="p-4 text-right flex items-center justify-end space-x-2.5">
                    {/* Active Toggle */}
                    <button 
                      onClick={async () => {
                        const updated = coupons.map(cop => cop.code === c.code ? { ...cop, isActive: !cop.isActive } : cop);
                        await supabase.from('coupons').update({ isActive: !c.isActive }).eq('code', c.code);
                        setCoupons(updated);
                      }}
                      className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                        c.isActive 
                          ? 'bg-green-50 hover:bg-green-100 text-green-700 border border-green-200' 
                          : 'bg-red-50 hover:bg-red-100 text-red-600 border border-red-200'
                      }`}
                    >
                      {c.isActive ? 'Active' : 'Disabled'}
                    </button>

                    {/* Edit button */}
                    <button
                      onClick={() => {
                        setEditingCoupon(c);
                        setCouponModalOpen(true);
                      }}
                      className="p-1.5 text-zinc-500 hover:text-brand-primary hover:bg-gray-100 rounded-lg transition-all cursor-pointer"
                      title="Edit Coupon"
                    >
                      <Edit className="w-4 h-4" />
                    </button>

                    {/* Delete button */}
                    <button
                      onClick={() => onDeleteCoupon(c.code)}
                      className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                      title="Delete Coupon"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
