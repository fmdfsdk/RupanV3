import React from 'react';
import { Save, Image, Smartphone, Truck, UserCheck, Tag, CreditCard } from 'lucide-react';
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
  uploadingQrImage?: boolean;
  handleUploadQrImage?: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
}

export default function SettingsTab({
  settings,
  setSettings,
  permissions,
  setPermissions,
  handleSaveSettings,
  uploadingQrImage,
  handleUploadQrImage
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

        {/* Payment Gateways & Wallets */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4 lg:col-span-2">
          <h3 className="font-bold text-sm uppercase tracking-wide text-gray-500 border-b border-gray-100 pb-2 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-orange-500" />
            Payment Gateways & Wallet Configurations
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Enable/Disable payment methods */}
            <div className="space-y-3.5">
              <h4 className="text-xs font-black uppercase text-gray-400 tracking-wider">Active Payment Methods</h4>
              <div className="grid grid-cols-2 gap-3 font-semibold text-xs text-gray-750">
                <label className="flex items-center space-x-2.5 p-3 rounded-xl border border-gray-150 hover:border-gray-300 cursor-pointer bg-gray-50/50">
                  <input 
                    type="checkbox" 
                    checked={settings.paymentBanglaQrEnabled} 
                    onChange={(e) => setSettings({ ...settings, paymentBanglaQrEnabled: e.target.checked })}
                    className="rounded border-gray-300 text-[#ff5c00]" 
                  />
                  <span>Bangla QR</span>
                </label>
                <label className="flex items-center space-x-2.5 p-3 rounded-xl border border-gray-150 hover:border-gray-300 cursor-pointer bg-gray-50/50">
                  <input 
                    type="checkbox" 
                    checked={settings.paymentBkashEnabled} 
                    onChange={(e) => setSettings({ ...settings, paymentBkashEnabled: e.target.checked })}
                    className="rounded border-gray-300 text-[#ff5c00]" 
                  />
                  <span>bKash Wallet</span>
                </label>
                <label className="flex items-center space-x-2.5 p-3 rounded-xl border border-gray-150 hover:border-gray-300 cursor-pointer bg-gray-50/50">
                  <input 
                    type="checkbox" 
                    checked={settings.paymentNagadEnabled} 
                    onChange={(e) => setSettings({ ...settings, paymentNagadEnabled: e.target.checked })}
                    className="rounded border-gray-300 text-[#ff5c00]" 
                  />
                  <span>Nagad Wallet</span>
                </label>
                <label className="flex items-center space-x-2.5 p-3 rounded-xl border border-gray-150 hover:border-gray-300 cursor-pointer bg-gray-50/50">
                  <input 
                    type="checkbox" 
                    checked={settings.paymentCodEnabled} 
                    onChange={(e) => setSettings({ ...settings, paymentCodEnabled: e.target.checked })}
                    className="rounded border-gray-300 text-[#ff5c00]" 
                  />
                  <span>Cash on Delivery</span>
                </label>
              </div>

              {/* MFS numbers */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-650">bKash Personal Number</label>
                  <input 
                    type="text" 
                    value={settings.paymentBkashNumber || ''}
                    onChange={(e) => setSettings({ ...settings, paymentBkashNumber: e.target.value })}
                    className="bg-gray-50 border border-gray-250 text-xs rounded-xl px-3 py-2.5 w-full focus:outline-none font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-655">Nagad Personal Number</label>
                  <input 
                    type="text" 
                    value={settings.paymentNagadNumber || ''}
                    onChange={(e) => setSettings({ ...settings, paymentNagadNumber: e.target.value })}
                    className="bg-gray-50 border border-gray-250 text-xs rounded-xl px-3 py-2.5 w-full focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* Bangla QR Code Image Preview and Upload */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-bold text-zinc-650 block">Bangla QR Code Scanner Image</label>
                
                <div className="flex items-center space-x-4">
                  {/* Image Preview Window */}
                  <div className="w-20 h-20 rounded-xl border border-gray-250 bg-gray-50 flex items-center justify-center overflow-hidden shadow-inner shrink-0 relative group">
                    {settings.paymentBanglaQrImage ? (
                      <img 
                        src={settings.paymentBanglaQrImage} 
                        alt="Bangla QR Preview" 
                        className="w-full h-full object-contain p-1"
                      />
                    ) : (
                      <span className="text-[9px] text-gray-400 font-bold text-center px-2">No Image</span>
                    )}
                  </div>

                  {/* Upload Actions */}
                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center space-x-2">
                      <label className="bg-zinc-900 text-white hover:bg-zinc-800 text-[10px] font-black uppercase tracking-wider px-3.5 py-2 rounded-xl cursor-pointer shadow-sm transition-all select-none border border-zinc-900">
                        <span>Upload New QR</span>
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={handleUploadQrImage}
                          disabled={uploadingQrImage}
                          className="hidden" 
                        />
                      </label>
                      
                      {uploadingQrImage && (
                        <span className="text-[10px] text-[#ff5c00] font-extrabold animate-pulse">
                          Uploading...
                        </span>
                      )}
                    </div>
                    <p className="text-[9.5px] text-gray-400 font-semibold leading-tight">
                      Upload your Bangla QR image (PNG, JPG, or WEBP). Customers scan this QR to pay.
                    </p>
                    
                    {/* Fallback Manual Text Input (In case they want to paste a URL instead) */}
                    <input 
                      type="text" 
                      value={settings.paymentBanglaQrImage || ''}
                      onChange={(e) => setSettings({ ...settings, paymentBanglaQrImage: e.target.value })}
                      placeholder="Or enter image URL path manually"
                      className="bg-gray-50 border border-gray-255 text-[9.5px] rounded-lg px-2.5 py-1.5 w-full focus:outline-none font-mono mt-1"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Instruction Texts */}
            <div className="space-y-4">
              <h4 className="text-xs font-black uppercase text-gray-400 tracking-wider">Instruction Guidelines</h4>
              
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-zinc-550 uppercase tracking-wide">Bangla QR Instructions</label>
                  <textarea 
                    rows={2}
                    value={settings.paymentBanglaQrInstruction || ''}
                    onChange={(e) => setSettings({ ...settings, paymentBanglaQrInstruction: e.target.value })}
                    className="bg-gray-50 border border-gray-250 text-xs rounded-xl px-3 py-2 w-full focus:outline-none font-sans leading-relaxed"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-zinc-550 uppercase tracking-wide flex items-center justify-between">
                    <span>MFS Instructions</span>
                    <span className="text-[9px] text-[#ff5c00] lowercase font-semibold">Use {'{amount}'} template</span>
                  </label>
                  <textarea 
                    rows={2}
                    value={settings.paymentMfsInstruction || ''}
                    onChange={(e) => setSettings({ ...settings, paymentMfsInstruction: e.target.value })}
                    className="bg-gray-50 border border-gray-250 text-xs rounded-xl px-3 py-2 w-full focus:outline-none font-sans leading-relaxed"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-zinc-550 uppercase tracking-wide">Cash on Delivery Instructions</label>
                  <textarea 
                    rows={2}
                    value={settings.paymentCodInstruction || ''}
                    onChange={(e) => setSettings({ ...settings, paymentCodInstruction: e.target.value })}
                    className="bg-gray-50 border border-gray-250 text-xs rounded-xl px-3 py-2 w-full focus:outline-none font-sans leading-relaxed"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
