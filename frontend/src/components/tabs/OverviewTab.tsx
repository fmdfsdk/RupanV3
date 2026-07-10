import React from 'react';
import { Calendar, AlertTriangle } from 'lucide-react';
import { 
  ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend 
} from 'recharts';
import { Order } from '../../types';

interface OverviewTabProps {
  stats: {
    totalSales: number;
    conversionRate: number;
    visitorsCount: number;
    lowStockCount: number;
  };
  orders: Order[];
  setActiveTab: (tab: string) => void;
}

export default function OverviewTab({ stats, orders, setActiveTab }: OverviewTabProps) {
  const salesChartData = [
    { date: 'Jun 29', Sales: 34200, Orders: 8, Visitors: 420 },
    { date: 'Jun 30', Sales: 52000, Orders: 12, Visitors: 510 },
    { date: 'Jul 01', Sales: 41000, Orders: 10, Visitors: 480 },
    { date: 'Jul 02', Sales: 61500, Orders: 14, Visitors: 580 },
    { date: 'Jul 03', Sales: 78000, Orders: 18, Visitors: 690 },
    { date: 'Jul 04', Sales: 92400, Orders: 21, Visitors: 780 },
    { date: 'Jul 05', Sales: stats.totalSales, Orders: orders.length, Visitors: 850 },
  ];

  const categoryPieData = [
    { name: 'Panjabi', value: 45 },
    { name: 'Saree', value: 25 },
    { name: 'Shirts', value: 15 },
    { name: 'Couple Sets', value: 10 },
    { name: 'Accessories', value: 5 },
  ];

  const trafficSourceData = [
    { name: 'Facebook Ads', value: 55 },
    { name: 'Organic Search', value: 20 },
    { name: 'WhatsApp Direct', value: 15 },
    { name: 'Instagram Shop', value: 10 },
  ];

  const COLORS = ['#1E3A8A', '#D4AF37', '#10B981', '#EF4444', '#8B5CF6'];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-300">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Analytics Dashboard</h1>
          <p className="text-sm text-gray-500">Realtime operations metrics aggregated from cloud sessions.</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-3 flex items-center space-x-3">
          <Calendar className="w-5 h-5 text-gray-400" />
          <span className="text-xs font-bold font-mono">Today, Jul 05, 2026</span>
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
            <span>+14.8% from yesterday</span>
          </div>
        </div>

        {/* Stat Card 2: Orders */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs relative overflow-hidden">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Orders</span>
          <h3 className="text-3xl font-black tracking-tight mt-2 text-zinc-950">
            {orders.length}
          </h3>
          <div className="flex items-center mt-3 text-xs text-green-600 font-bold">
            <span>+2 new orders today</span>
          </div>
        </div>

        {/* Stat Card 3: Conversion Rate */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs relative overflow-hidden">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Store Conversion</span>
          <h3 className="text-3xl font-black tracking-tight mt-2 text-indigo-600 font-mono">
            {stats.conversionRate}%
          </h3>
          <div className="flex items-center mt-3 text-xs text-zinc-500 font-medium">
            <span>Avg visitor value: ৳1,450</span>
          </div>
        </div>

        {/* Stat Card 4: Visitors */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs relative overflow-hidden">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Store Traffic</span>
          <h3 className="text-3xl font-black tracking-tight mt-2 text-brand-accent">
            {stats.visitorsCount.toLocaleString()}
          </h3>
          <div className="flex items-center mt-3 text-xs text-emerald-600 font-bold">
            <span>+120 active sessions</span>
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
                <Line type="monotone" dataKey="Sales" stroke="#1E3A8A" strokeWidth={3} activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="Visitors" stroke="#D4AF37" strokeWidth={2} />
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
          <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-gray-500 mt-4">
            {categoryPieData.map((item, idx) => (
              <div key={idx} className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                <span className="truncate">{item.name} ({item.value}%)</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Bottom Stats: Traffic & Third Party Integrations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Traffic source */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
          <h3 className="font-bold text-sm uppercase tracking-wide text-gray-500 mb-4">Traffic Channel Performance</h3>
          <div className="space-y-4">
            {trafficSourceData.map((item, index) => (
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
            <p className="text-xs text-gray-400">Manage tags and analytic pixels for social marketing.</p>
            
            <div className="space-y-3 mt-4">
              <div className="flex items-center justify-between p-2.5 bg-blue-50/50 rounded-xl border border-blue-100">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  <span className="text-xs font-bold">Google Analytics 4 (GA4)</span>
                </div>
                <span className="text-[10px] font-bold text-gray-400 uppercase">Connected</span>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-blue-50/50 rounded-xl border border-blue-100">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  <span className="text-xs font-bold">Meta Pixel (Facebook Ads)</span>
                </div>
                <span className="text-[10px] font-bold text-gray-400 uppercase font-mono">10284812841</span>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-zinc-50 rounded-xl border border-zinc-200">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-zinc-400 rounded-full"></span>
                  <span className="text-xs font-bold text-gray-400">TikTok Pixel</span>
                </div>
                <span className="text-[10px] font-bold text-gray-400 uppercase">Disabled</span>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-3 flex justify-between items-center text-xs">
            <span className="text-gray-400 font-semibold">Future Ready API Nodes:</span>
            <span className="bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded text-[10px]">Active</span>
          </div>
        </div>

      </div>

    </div>
  );
}
