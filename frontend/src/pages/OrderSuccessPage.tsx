import React from 'react';
import { CheckCircle } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useNavigate } from 'react-router-dom';

export default function OrderSuccessPage() {
  const navigate = useNavigate();
  const lastPlacedOrder = useStore((state) => state.lastPlacedOrder);

  if (!lastPlacedOrder) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
        <h1 className="font-display text-2xl font-extrabold uppercase text-red-600">
          No Order Placed
        </h1>
        <p className="text-sm text-gray-500">
          You haven't placed any order in the current session.
        </p>
        <button
          onClick={() => navigate('/shop')}
          className="bg-brand-primary hover:bg-blue-950 text-white font-bold text-sm px-6 py-3 rounded-xl cursor-pointer"
        >
          Go to Shop
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
      <span className="inline-flex p-4 bg-emerald-50 text-emerald-600 rounded-full">
        <CheckCircle className="w-10 h-10" />
      </span>
      <div className="space-y-2">
        <h1 className="font-display text-2xl md:text-3xl font-extrabold uppercase text-brand-text">
          Your Order has been Placed!
        </h1>
        <p className="text-sm text-gray-500">
          Alhamdulillah! Thank you for choosing us. We have registered your delivery request and are currently packing your items.
        </p>
      </div>

      {/* Order specifications card */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs text-left divide-y divide-gray-100 space-y-4">
        <div className="flex justify-between pb-3 text-sm">
          <div>
            <span className="block text-xs text-gray-400 font-semibold uppercase">Order ID</span>
            <strong className="text-brand-primary font-mono text-base">{lastPlacedOrder.id}</strong>
          </div>
          <div className="text-right">
            <span className="block text-xs text-gray-400 font-semibold uppercase">Est. Delivery</span>
            <strong className="text-brand-text">1-3 Working Days</strong>
          </div>
        </div>

        <div className="py-3 text-xs space-y-2">
          <span className="block font-bold text-gray-400 uppercase">Shipping Details</span>
          <p className="text-gray-700"><strong>Name:</strong> {lastPlacedOrder.customerName}</p>
          <p className="text-gray-700"><strong>Phone:</strong> {lastPlacedOrder.phone}</p>
          <p className="text-gray-700"><strong>Address:</strong> {lastPlacedOrder.address}</p>
          <p className="text-gray-700"><strong>Method:</strong> {lastPlacedOrder.paymentMethod}</p>
        </div>

        <div className="pt-3 flex justify-between text-sm font-bold text-brand-primary">
          <span>Amount Payable</span>
          <span>৳{lastPlacedOrder.total.toLocaleString('en-IN')}</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-center justify-center pt-4">
        <button
          onClick={() => {
            navigate(`/track-order?id=${lastPlacedOrder.id}&phone=${lastPlacedOrder.phone}`);
          }}
          className="w-full sm:w-auto bg-brand-primary hover:bg-blue-950 text-white font-bold text-sm px-6 py-3 rounded-xl cursor-pointer"
        >
          Track My Delivery Status
        </button>
        <button
          onClick={() => {
            navigate('/shop');
          }}
          className="w-full sm:w-auto bg-white hover:bg-gray-50 text-gray-600 font-bold text-sm px-6 py-3 border border-gray-200 rounded-xl cursor-pointer"
        >
          Continue Shopping
        </button>
      </div>
    </div>
  );
}
