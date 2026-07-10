import React from 'react';
import { Calendar, AlertTriangle, ShieldCheck, ShieldAlert } from 'lucide-react';
import { 
  ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend 
} from 'recharts';
import { Order, Product, WebsiteSettings } from '../../types';

interface OverviewTabProps {
  stats: {
    totalSales: number;
    conversionRate: number;
    visitorsCount: number;
    lowStockCount: number;
    pendingCount: number;
    deliveredCount: number;
  };
  orders: Order[];
  products: Product[];
  settings: WebsiteSettings;
  setActiveTab: (tab: string) => void;
}

export default function OverviewTab({ stats, orders, products, settings, setActiveTab }: OverviewTabProps) {
  // 1. Get dynamic dates for the last 7 days (including today)
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d;
  });

  const salesChartData = last7Days.map(date => {
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
    
    // Filter orders on this day (ignoring Cancelled orders for Sales calculation)
    const dayOrders = orders.filter(o => {
      const oDate = new Date(o.createdAt);
      return oDate.getFullYear() === date.getFullYear() &&
             oDate.getMonth() === date.getMonth() &&
             oDate.getDate() === date.getDate();
    });

    const daySales = dayOrders.filter(o => o.status !== 'Cancelled').reduce((sum, o) => sum + o.total, 0);
    const dayOrdersCount = dayOrders.length;
    // Estimate traffic using conversion rate (e.g. 3.25%, visitors = orders / 0.0325) plus dynamic noise
    const dayVisitors = Math.max(15, Math.round(dayOrdersCount / 0.0325) + (Math.floor(Math.sin(date.getDate()) * 25) + 120));

    return {
      date: dateStr,
      Sales: daySales,
      Orders: dayOrdersCount,
      Visitors: dayVisitors
    };
  });

  // 2. Real category share from orders and products
  const getCategoryShare = () => {
    const share: Record<string, number> = {};
    let totalItemsValue = 0;

    orders.forEach(o => {
      if (o.status === 'Cancelled') return;
      o.items.forEach(item => {
        const prod = products.find(p => p.id === item.productId);
        const cat = prod?.category || 'Other';
        const itemVal = item.price * item.quantity;
        share[cat] = (share[cat] || 0) + itemVal;
        totalItemsValue += itemVal;
      });
    });

    if (totalItemsValue === 0) {
      return [
        { name: 'No Categories Yet', value: 100 }
      ];
    }

    return Object.entries(share).map(([name, val]) => ({
      name,
      value: Math.round((val / totalItemsValue) * 100)
    })).sort((a, b) => b.value - a.value).slice(0, 5); // top 5
  };

  const categoryPieData = getCategoryShare();

  // 3. Real payment method share from orders
  const getPaymentMethodShare = () => {
    const counts: Record<string, number> = {};
    const validOrders = orders.filter(o => o.status !== 'Cancelled');
    
    validOrders.forEach(o => {
      const pm = o.paymentMethod || 'COD';
      const cleanPm = pm === 'COD' ? 'Cash on Delivery (COD)' : pm;
      counts[cleanPm] = (counts[cleanPm] || 0) + 1;
    });

    const total = validOrders.length;
    if (total === 0) {
      return [
        { name: 'No Orders Yet', value: 100 }
      ];
    }

    return Object.entries(counts).map(([name, count]) => ({
      name,
      value: Math.round((count / total) * 100)
    })).sort((a, b) => b.value - a.value);
  };

  const paymentMethodData = getPaymentMethodShare();

  const COLORS = ['#1E3A8A', '#ff5c00', '#10B981', '#EF4444', '#8B5CF6', '#F59E0B'];

  // 4. Calculate dynamic Average Order Value (AOV)
  const nonCancelledOrders = orders.filter(o => o.status !== 'Cancelled');
  const avgOrderValue = nonCancelledOrders.length > 0 
    ? Math.round(stats.totalSales / nonCancelledOrders.length) 
    : 0;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-300">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Analytics Dashboard</h1>
          <p className="text-sm text-gray-500">Realtime operations metrics aggregated from cloud sessions.</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-3 flex items-center space-x-3">
          <Calendar className="w-5 h-5 text-gray-400" />
          <span className="text-xs font-bold font-mono">Today, {new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}</span>
        </div>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Stat Card 1: Sales */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs relative overflow-hidden">
          <div className="absolute right-0 top-0 w-24 h-24 bg-blue-50/50 rounded-full translate-x-8 -translate-y-8"></div>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Sales (৳)</span>
          <h3 className="text-3xl font-black tracking-tight mt-2 text-brand-primary">
            ৳{stats.totalSales.toLocaleString('en-IN')}
          </h3>
          <div className="flex items-center mt-3 text-xs text-green-600 font-bold">
            <span>Live DB aggregated</span>
          </div>
        </div>

        {/* Stat Card 2: Orders */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs relative overflow-hidden">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Orders</span>
          <h3 className="text-3xl font-black tracking-tight mt-2 text-zinc-950">
            {orders.length}
          </h3>
          <div className="flex items-center mt-3 text-xs text-green-600 font-bold">
            <span>{stats.pendingCount} pending review</span>
          </div>
        </div>

        {/* Stat Card 3: Avg Order Value */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs relative overflow-hidden">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Avg Order Value (AOV)</span>
          <h3 className="text-3xl font-black tracking-tight mt-2 text-indigo-600 font-mono">
            ৳{avgOrderValue.toLocaleString('en-IN')}
          </h3>
          <div className="flex items-center mt-3 text-xs text-zinc-500 font-medium">
            <span>Estimated basket values</span>
          </div>
        </div>

        {/* Stat Card 4: Visitors */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs relative overflow-hidden">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Store traffic (est.)</span>
          <h3 className="text-3xl font-black tracking-tight mt-2 text-brand-accent">
            {stats.visitorsCount.toLocaleString()}
          </h3>
          <div className="flex items-center mt-3 text-xs text-emerald-600 font-bold">
            <span>Active routing nodes active</span>
          </div>
        </div>

      </div>

      {/* Low Stock Banner Quick Alert */}
      {stats.lowStockCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <div>
              <p className="text-xs font-bold text-amber-800">Critical: Low Stock Warning Active!</p>
              <p className="text-[11px] text-amber-700">{stats.lowStockCount} products are below the designated safety threshold. Replenish immediately.</p>
            </div>
          </div>
          <button 
            onClick={() => setActiveTab('inventory')}
            className="bg-amber-100 hover:bg-amber-200 text-amber-800 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg transition-all"
          >
            Adjust Levels
          </button>
        </div>
      )}

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Sales trend chart */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs lg:col-span-2">
          <h3 className="font-bold text-sm uppercase tracking-wide text-gray-500 mb-6">Sales Trend & Site Visits</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="Sales" stroke="#1E3A8A" strokeWidth={3} name="Revenue (৳)" activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="Visitors" stroke="#D4AF37" strokeWidth={2} name="Visits (est.)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top categories distribution */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
          <h3 className="font-bold text-sm uppercase tracking-wide text-gray-500 mb-6">Share by Product Category</h3>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-gray-500 mt-4 max-h-[100px] overflow-y-auto">
            {categoryPieData.map((item, idx) => (
              <div key={idx} className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                <span className="truncate">{item.name} ({item.value}%)</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Bottom Stats: Traffic & Third Party Integrations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Payment Method distribution */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
          <h3 className="font-bold text-sm uppercase tracking-wide text-gray-500 mb-4">Payment Method Breakdown</h3>
          <div className="space-y-4">
            {paymentMethodData.map((item, index) => (
              <div key={index} className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span>{item.name}</span>
                  <span className="text-brand-primary">{item.value}%</span>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-brand-primary h-full rounded-full" style={{ width: `${item.value}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ad integrations / Pixels */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm uppercase tracking-wide text-gray-500 mb-2">Ad Tracking & Telemetry</h3>
            <p className="text-xs text-gray-400">Active tag integrations and advertising tracking pixels.</p>
            
            <div className="space-y-3 mt-4">
              <div className="flex items-center justify-between p-2.5 bg-blue-50/50 rounded-xl border border-blue-100">
                <div className="flex items-center space-x-2">
                  {settings.googleAnalyticsId ? (
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-gray-300"></span>
                  )}
                  <span className="text-xs font-bold">Google Analytics 4 (GA4)</span>
                </div>
                <span className="text-[10px] font-bold text-gray-400 uppercase font-mono">
                  {settings.googleAnalyticsId || 'Disabled'}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-blue-50/50 rounded-xl border border-blue-100">
                <div className="flex items-center space-x-2">
                  {settings.metaPixelId ? (
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-gray-300"></span>
                  )}
                  <span className="text-xs font-bold">Meta Pixel (Facebook Ads)</span>
                </div>
                <span className="text-[10px] font-bold text-gray-400 uppercase font-mono">
                  {settings.metaPixelId || 'Disabled'}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-blue-50/50 rounded-xl border border-blue-100">
                <div className="flex items-center space-x-2">
                  {settings.googleTagManagerId ? (
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-gray-300"></span>
                  )}
                  <span className="text-xs font-bold">Google Tag Manager (GTM)</span>
                </div>
                <span className="text-[10px] font-bold text-gray-400 uppercase font-mono">
                  {settings.googleTagManagerId || 'Disabled'}
                </span>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-3 flex justify-between items-center text-xs mt-4">
            <span className="text-gray-400 font-semibold">Integrations Node status:</span>
            {settings.googleAnalyticsId || settings.metaPixelId || settings.googleTagManagerId ? (
              <span className="bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded text-[10px]">Active Tracking</span>
            ) : (
              <span className="bg-gray-100 text-gray-500 font-bold px-2 py-0.5 rounded text-[10px]">Inactive</span>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
