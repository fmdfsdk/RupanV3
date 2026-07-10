import React from 'react';
import { Save, Image, Smartphone, Truck, UserCheck, Tag } from 'lucide-react';
import { WebsiteSettings } from '../../types';

interface SettingsTabProps {
  settings: any;
  setSettings: (s: any) => void;
  permissions: {
    products: boolean;
    orders: boolean;
    coupons: boolean;
    settings: boolean;
  };
  setPermissions: (p: any) => void;
  handleSaveSettings: () => void;
}

export default function SettingsTab({
  settings,
  setSettings,
  permissions,
  setPermissions,
  handleSaveSettings
}: SettingsTabProps) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Global Configurations</h1>
          <p className="text-xs text-gray-500">Calibrate branding layouts, shipping logistics tiers, support channels, and payment settings.</p>
        </div>
        <button
          onClick={handleSaveSettings}
          className="bg-brand-primary text-white text-xs font-bold uppercase tracking-wider px-6 py-3 rounded-xl flex items-center space-x-2 hover:bg-blue-900 transition-all cursor-pointer shadow-md"
        >
          <Save className="w-4 h-4" />
          <span>Save Configs</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Visual & Logo Setup Card */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
          <h3 className="font-bold text-sm uppercase tracking-wide text-gray-500 border-b border-gray-100 pb-2 flex items-center gap-2">
            <Image className="w-4 h-4 text-brand-primary" />
            Branding Parameters
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-600">Logo text</label>
              <input 
                type="text" 
                value={settings.logoText}
                onChange={(e) => setSettings({ ...settings, logoText: e.target.value })}
                className="bg-gray-50 border border-gray-200 text-xs rounded-xl px-3 py-2.5 w-full focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-600">Logo Accent character</label>
              <input 
                type="text" 
                value={settings.logoAccent}
                onChange={(e) => setSettings({ ...settings, logoAccent: e.target.value })}
                className="bg-gray-50 border border-gray-200 text-xs rounded-xl px-3 py-2.5 w-full focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-600">Tagline slogan</label>
            <input 
              type="text" 
              value={settings.tagline}
              onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
              className="bg-gray-50 border border-gray-200 text-xs rounded-xl px-3 py-2.5 w-full focus:outline-none"
            />
          </div>
        </div>

        {/* Customer Support channels */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
          <h3 className="font-bold text-sm uppercase tracking-wide text-gray-500 border-b border-gray-100 pb-2 flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-emerald-500" />
            Customer Service Channels
          </h3>

          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-600">Official WhatsApp (International format)</label>
            <input 
              type="text" 
              value={settings.whatsappNumber}
              onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
              className="bg-gray-50 border border-gray-200 text-xs rounded-xl px-3 py-2.5 w-full focus:outline-none font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-600">Customer Support Hotline</label>
            <input 
              type="text" 
              value={settings.supportNumber}
              onChange={(e) => setSettings({ ...settings, supportNumber: e.target.value })}
              className="bg-gray-50 border border-gray-200 text-xs rounded-xl px-3 py-2.5 w-full focus:outline-none font-mono"
            />
          </div>
        </div>

        {/* Shipping logistics setup */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
          <h3 className="font-bold text-sm uppercase tracking-wide text-gray-500 border-b border-gray-100 pb-2 flex items-center gap-2">
            <Truck className="w-4 h-4 text-brand-accent" />
            Logistics & Shipping Fees
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-600">Inside Dhaka (৳)</label>
              <input 
                type="number" 
                value={settings.insideDhakaShipping}
                onChange={(e) => setSettings({ ...settings, insideDhakaShipping: parseInt(e.target.value) || 0 })}
                className="bg-gray-50 border border-gray-200 text-xs rounded-xl px-3 py-2.5 w-full focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-600">Outside Dhaka (৳)</label>
              <input 
                type="number" 
                value={settings.outsideDhakaShipping}
                onChange={(e) => setSettings({ ...settings, outsideDhakaShipping: parseInt(e.target.value) || 0 })}
                className="bg-gray-50 border border-gray-200 text-xs rounded-xl px-3 py-2.5 w-full focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-600">Free Shipping Limit Minimum Order (৳)</label>
            <input 
              type="number" 
              value={settings.freeShippingMinOrder}
              onChange={(e) => setSettings({ ...settings, freeShippingMinOrder: parseInt(e.target.value) || 0 })}
              className="bg-gray-50 border border-gray-200 text-xs rounded-xl px-3 py-2.5 w-full focus:outline-none"
            />
          </div>
        </div>

        {/* Roles Configuration */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
          <h3 className="font-bold text-sm uppercase tracking-wide text-gray-500 border-b border-gray-100 pb-2 flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-indigo-500" />
            Interactive Staff Permissions
          </h3>
          
          <div className="space-y-3">
            <p className="text-[11px] text-gray-400">Manage fine-tuned permissions for store agents below.</p>
            
            <div className="grid grid-cols-2 gap-3.5 text-xs font-semibold">
              <label className="flex items-center space-x-2.5">
                <input 
                  type="checkbox" 
                  checked={permissions.products} 
                  onChange={(e) => setPermissions({ ...permissions, products: e.target.checked })}
                  className="rounded border-gray-300 text-brand-primary" 
                />
                <span>Edit products SKU</span>
              </label>

              <label className="flex items-center space-x-2.5">
                <input 
                  type="checkbox" 
                  checked={permissions.orders} 
                  onChange={(e) => setPermissions({ ...permissions, orders: e.target.checked })}
                  className="rounded border-gray-300 text-brand-primary" 
                />
                <span>Fulfill Order states</span>
              </label>

              <label className="flex items-center space-x-2.5">
                <input 
                  type="checkbox" 
                  checked={permissions.coupons} 
                  onChange={(e) => setPermissions({ ...permissions, coupons: e.target.checked })}
                  className="rounded border-gray-300 text-brand-primary" 
                />
                <span>Manage Coupon pools</span>
              </label>

              <label className="flex items-center space-x-2.5">
                <input 
                  type="checkbox" 
                  checked={permissions.settings} 
                  onChange={(e) => setPermissions({ ...permissions, settings: e.target.checked })}
                  className="rounded border-gray-300 text-brand-primary" 
                />
                <span>Update server setting</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
