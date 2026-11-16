import React from 'react';
import { Save, Image, Smartphone, Truck, UserCheck, Tag, CreditCard, Share2, Send, Sparkles, ShieldCheck } from 'lucide-react';
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
  const [isSaving, setIsSaving] = React.useState(false);
  const [saveSuccess, setSaveSuccess] = React.useState(false);

  const onSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await handleSaveSettings();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      alert("Website configurations saved successfully!");
    } catch (err: any) {
      alert(`Error saving settings: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Global Configurations</h1>
          <p className="text-xs text-gray-500">Calibrate branding layouts, shipping logistics tiers, support channels, and payment settings.</p>
        </div>
        <button
          onClick={onSave}
          disabled={isSaving}
          className={`${saveSuccess ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-brand-primary hover:bg-blue-900'} text-white text-xs font-bold uppercase tracking-wider px-6 py-3 rounded-xl flex items-center space-x-2 transition-all cursor-pointer shadow-md disabled:opacity-50 select-none`}
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Saving...' : saveSuccess ? 'Saved!' : 'Save Configs'}</span>
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
            <label className="text-xs font-bold text-zinc-650 font-sans">Official WhatsApp (International format)</label>
            <input 
              type="text" 
              value={settings.whatsappNumber || ''}
              onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
              className="bg-gray-50 border border-gray-200 text-xs rounded-xl px-3 py-2.5 w-full focus:outline-none font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-655 font-sans">Customer Support Hotline</label>
            <input 
              type="text" 
              value={settings.supportNumber || ''}
              onChange={(e) => setSettings({ ...settings, supportNumber: e.target.value })}
              className="bg-gray-50 border border-gray-200 text-xs rounded-xl px-3 py-2.5 w-full focus:outline-none font-mono"
            />
          </div>
        </div>

        {/* Social Media Links */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
          <h3 className="font-bold text-sm uppercase tracking-wide text-gray-500 border-b border-gray-100 pb-2 flex items-center gap-2">
            <Share2 className="w-4 h-4 text-blue-500" />
            Social Media Handles
          </h3>

          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-600">Facebook Page URL</label>
            <input 
              type="text" 
              value={settings.socialFacebook || ''}
              onChange={(e) => setSettings({ ...settings, socialFacebook: e.target.value })}
              className="bg-gray-50 border border-gray-200 text-xs rounded-xl px-3 py-2.5 w-full focus:outline-none font-mono"
              placeholder="https://www.facebook.com/rupanbd"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-600">Instagram Profile URL</label>
            <input 
              type="text" 
              value={settings.socialInstagram || ''}
              onChange={(e) => setSettings({ ...settings, socialInstagram: e.target.value })}
              className="bg-gray-50 border border-gray-200 text-xs rounded-xl px-3 py-2.5 w-full focus:outline-none font-mono"
              placeholder="https://www.instagram.com/rupanbd"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-600">YouTube Channel URL</label>
            <input 
              type="text" 
              value={settings.socialYoutube || ''}
              onChange={(e) => setSettings({ ...settings, socialYoutube: e.target.value })}
              className="bg-gray-50 border border-gray-200 text-xs rounded-xl px-3 py-2.5 w-full focus:outline-none font-mono"
              placeholder="https://youtube.com"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-600">Twitter / X URL</label>
            <input 
              type="text" 
              value={settings.socialTwitter || ''}
              onChange={(e) => setSettings({ ...settings, socialTwitter: e.target.value })}
              className="bg-gray-50 border border-gray-200 text-xs rounded-xl px-3 py-2.5 w-full focus:outline-none font-mono"
              placeholder="https://twitter.com"
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

          <div className="space-y-2 pt-2 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-zinc-700 cursor-pointer flex items-center gap-2">
                <input 
                  type="checkbox"
                  checked={Boolean(settings.freeShippingEnabled)}
                  onChange={(e) => setSettings({ ...settings, freeShippingEnabled: e.target.checked })}
                  className="rounded border-gray-300 text-brand-primary cursor-pointer w-4 h-4"
                />
                <span>General Free Shipping Threshold (কুপন ছাড়া সাধারণ ফ্রি শিপিং)</span>
              </label>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${settings.freeShippingEnabled ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-500'}`}>
                {settings.freeShippingEnabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            {settings.freeShippingEnabled && (
              <div className="space-y-1 pl-6">
                <label className="text-[11px] font-semibold text-gray-500">Minimum Order Amount for Free Shipping (৳)</label>
                <input 
                  type="number" 
                  value={settings.freeShippingMinOrder || ''}
                  placeholder="e.g. 3000"
                  onChange={(e) => setSettings({ ...settings, freeShippingMinOrder: parseInt(e.target.value) || 0 })}
                  className="bg-gray-50 border border-gray-200 text-xs rounded-xl px-3 py-2.5 w-full focus:outline-none font-bold"
                />
              </div>
            )}
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

              {/* Payment Proof / Screenshot Verification Toggle */}
              <div className="p-3.5 rounded-xl border border-gray-200 bg-gray-50/80 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-800">পেমেন্ট প্রুফ / স্ক্রিনশট আপলোড</span>
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${settings.paymentScreenshotEnabled !== false ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-600'}`}>
                        {settings.paymentScreenshotEnabled !== false ? 'সক্রিয় (Enabled)' : 'নিষ্ক্রিয় (Disabled)'}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 leading-tight">
                      চেকআউটে কাস্টমারদের পেমেন্ট রসিদ বা স্ক্রিনশট আপলোড করার অপশন প্রদর্শন বা বন্ধ রাখুন।
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input 
                      type="checkbox" 
                      checked={settings.paymentScreenshotEnabled !== false} 
                      onChange={(e) => setSettings({ ...settings, paymentScreenshotEnabled: e.target.checked })}
                      className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>
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

        {/* Online Payment Discount Settings */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="font-bold text-sm uppercase tracking-wide text-gray-700 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              অনলাইন পেমেন্ট ডিসকাউন্ট (Online Payment Discount)
            </h3>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Bangla QR • bKash • Nagad
            </span>
          </div>
          
          <p className="text-xs text-gray-500 leading-relaxed font-semibold">
            কাস্টমার যদি ক্যাশ অন ডেলিভারি (COD) এর বদলে ডিজিটাল মাধ্যমে (Bangla QR, bKash, অথবা Nagad) অগ্রিম পেমেন্ট করে, তবে তাকে পণ্য মার্জিনের নির্ধারিত % বিশেষ ছাড় প্রদান করুন। এটি ক্যাশ অন ডেলিভারিতে কখনো প্রযোজ্য হবে না।
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
            <div className="space-y-3">
              <label className="flex items-center space-x-2.5 p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/50 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={settings.onlinePaymentDiscountEnabled ?? false} 
                  onChange={(e) => setSettings({ ...settings, onlinePaymentDiscountEnabled: e.target.checked })}
                  className="rounded border-gray-300 text-emerald-600 w-4 h-4" 
                />
                <div>
                  <span className="text-xs font-black text-emerald-950 block">অনলাইন পেমেন্ট ডিসকাউন্ট সক্রিয় করুন</span>
                  <span className="text-[10px] text-emerald-700 font-semibold block mt-0.5">Bangla QR, bKash ও Nagad পেমেন্টে প্রযোজ্য হবে</span>
                </div>
              </label>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-700 flex items-center justify-between">
                <span>মার্জিনের কত শতাংশ ছাড় দেওয়া হবে (%)</span>
                <span className="text-emerald-600 font-mono font-bold text-xs">{settings.onlinePaymentDiscountPercent ?? 50}%</span>
              </label>
              <div className="relative">
                <input 
                  type="number" 
                  min="5" 
                  max="100" 
                  step="5"
                  value={settings.onlinePaymentDiscountPercent ?? 50}
                  onChange={(e) => setSettings({ ...settings, onlinePaymentDiscountPercent: Number(e.target.value) })}
                  className="bg-gray-50 border border-gray-250 text-xs rounded-xl pl-3 pr-8 py-2.5 w-full focus:outline-none font-mono font-bold"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">%</span>
              </div>
              <p className="text-[10px] text-gray-400 font-semibold">
                ডিফল্ট: ৫০% (অর্থাৎ পণ্যের মোট লাভের অর্ধেক কাস্টমারকে ডিসকাউন্ট দেওয়া হবে)।
              </p>
            </div>
          </div>
        </div>

        {/* Telegram Bot Notifications */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4 lg:col-span-2">
          <h3 className="font-bold text-sm uppercase tracking-wide text-gray-500 border-b border-gray-100 pb-2 flex items-center gap-2">
            <Send className="w-4 h-4 text-sky-500" />
            Telegram Order Notifications
          </h3>
          <p className="text-[11px] text-gray-400 leading-relaxed">
            প্রতিটি নতুন অর্ডারের সাথে সাথে আপনার Telegram Channel বা Chat-এ Notification পাঠান। Bot Token এবং Chat ID যোগ করুন।
          </p>

          {/* Security Recommendation Banner */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-amber-900">
            <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5 leading-relaxed font-semibold">
              <span className="font-black text-[11px] uppercase tracking-wide block text-amber-950">Security Recommendation</span>
              Telegram Bot Token সরাসরি Vercel Environment Variable হিসেবে (<code>TELEGRAM_BOT_TOKEN</code> এবং <code>TELEGRAM_CHAT_ID</code>) কনফিগার করা সর্বোত্তম। সার্ভারলেস ফাংশন স্বয়ংক্রিয়ভাবে Vercel Env Variable থেকে টোকেন গ্রহণ করে কাজ করবে।
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-600">Telegram Bot Token</label>
              <input
                type="password"
                value={(settings as any).telegramBotToken || (settings as any).telegram_bot_token || ''}
                onChange={(e) => setSettings({ ...settings, telegramBotToken: e.target.value, telegram_bot_token: e.target.value })}
                placeholder="e.g. 7812345678:AAFxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                className="bg-gray-50 border border-gray-200 text-xs rounded-xl px-3 py-2.5 w-full focus:outline-none font-mono"
              />
              <p className="text-[9.5px] text-gray-400">@BotFather থেকে Bot তৈরি করে Token নিন।</p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-600">Telegram Chat ID / Channel ID</label>
              <input
                type="text"
                value={(settings as any).telegramChatId || (settings as any).telegram_chat_id || ''}
                onChange={(e) => setSettings({ ...settings, telegramChatId: e.target.value, telegram_chat_id: e.target.value })}
                placeholder="e.g. -1001234567890 or @yourchannel"
                className="bg-gray-50 border border-gray-200 text-xs rounded-xl px-3 py-2.5 w-full focus:outline-none font-mono"
              />
              <p className="text-[9.5px] text-gray-400">Channel-এর জন্য -100 দিয়ে শুরু হওয়া ID বা @username।</p>
            </div>
          </div>

          <label className="flex items-center gap-2.5 cursor-pointer w-fit">
            <input
              type="checkbox"
              checked={(settings as any).telegramNotificationsEnabled ?? (settings as any).telegram_notifications_enabled ?? true}
              onChange={(e) => setSettings({ ...settings, telegramNotificationsEnabled: e.target.checked, telegram_notifications_enabled: e.target.checked })}
              className="rounded border-gray-300 text-sky-500 w-4 h-4"
            />
            <span className="text-xs font-bold text-gray-700">Telegram Notifications সক্রিয় রাখুন</span>
          </label>
        </div>

      </div>
    </div>
  );
}
