import React from 'react';
import { Save, Tag, Globe, Sparkles, AlertCircle, Database } from 'lucide-react';
import { WebsiteSettings } from '../../types';

interface SeoMarketingTabProps {
  settings: WebsiteSettings;
  setSettings: (s: WebsiteSettings) => void;
  handleSaveSettings: () => void;
}

export default function SeoMarketingTab({
  settings,
  setSettings,
  handleSaveSettings
}: SeoMarketingTabProps) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black tracking-tight">SEO & Marketing Integrations</h1>
          <p className="text-xs text-gray-500">Inject advertising tracking pixels, manage tag parameters, and index your storefront sitemap.</p>
        </div>
        <button
          onClick={handleSaveSettings}
          className="bg-brand-primary text-white text-xs font-bold uppercase tracking-wider px-6 py-3 rounded-xl flex items-center space-x-2 hover:bg-blue-900 transition-all cursor-pointer shadow-md"
        >
          <Save className="w-4 h-4" />
          <span>Save Changes</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Marketing Ad Integrations Card */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-5 lg:col-span-2">
          <h3 className="font-bold text-sm uppercase tracking-wide text-gray-500 border-b border-gray-100 pb-2 flex items-center gap-2">
            <Tag className="w-4 h-4 text-brand-primary" />
            Marketing Telemetry & Ad Integrations
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-600">Meta Pixel (Facebook Ads) ID</label>
              <input 
                type="text" 
                placeholder="e.g. 10284812841"
                value={settings.metaPixelId || ''}
                onChange={(e) => setSettings({ ...settings, metaPixelId: e.target.value })}
                className="bg-gray-50 border border-gray-200 text-xs rounded-xl px-3 py-2.5 w-full focus:outline-none font-mono"
              />
              <p className="text-[10px] text-gray-400">Triggers standard events (PageView, AddToCart, InitiateCheckout, Purchase) on Meta.</p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-600">Meta Test Event Code</label>
              <input 
                type="text" 
                placeholder="e.g. TEST12345"
                value={settings.metaTestEventCode || ''}
                onChange={(e) => setSettings({ ...settings, metaTestEventCode: e.target.value })}
                className="bg-gray-50 border border-gray-200 text-xs rounded-xl px-3 py-2.5 w-full focus:outline-none font-mono"
              />
              <p className="text-[10px] text-gray-400">Used for checking pixel event activity in Meta Events Manager.</p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-600">Google Tag Manager (GTM) ID</label>
              <input 
                type="text" 
                placeholder="e.g. GTM-XXXXXX"
                value={settings.googleTagManagerId || ''}
                onChange={(e) => setSettings({ ...settings, googleTagManagerId: e.target.value })}
                className="bg-gray-50 border border-gray-200 text-xs rounded-xl px-3 py-2.5 w-full focus:outline-none font-mono"
              />
              <p className="text-[10px] text-gray-400">Allows deploying custom tags and container configurations instantly.</p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-600">Google Analytics 4 (GA4) Measurement ID</label>
              <input 
                type="text" 
                placeholder="e.g. G-XXXXXXXXXX"
                value={settings.googleAnalyticsId || ''}
                onChange={(e) => setSettings({ ...settings, googleAnalyticsId: e.target.value })}
                className="bg-gray-50 border border-gray-200 text-xs rounded-xl px-3 py-2.5 w-full focus:outline-none font-mono"
              />
              <p className="text-[10px] text-gray-400">Measures page views, user engagement, and custom e-commerce funnels.</p>
            </div>
          </div>
        </div>

        {/* SEO Sitemap Settings Card */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4 lg:col-span-2">
          <h3 className="font-bold text-sm uppercase tracking-wide text-gray-500 border-b border-gray-100 pb-2 flex items-center gap-2">
            <Globe className="w-4 h-4 text-emerald-500" />
            Search Engine Sitemap Indexing
          </h3>

          <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl space-y-2">
            <div className="flex items-center space-x-2 text-emerald-800 text-xs font-bold">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              <span>Sitemap Generator Configured</span>
            </div>
            <p className="text-xs text-emerald-700">
              The storefront sitemap is built dynamically during project deployment to search crawlers. It includes all active products, categorizations, and editorial blog posts automatically.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-600">Sitemap Address</label>
            <div className="flex">
              <input 
                type="text" 
                readOnly
                value="https://www.myrupan.com/sitemap.xml"
                className="bg-gray-100 border border-gray-200 text-xs rounded-l-xl px-3 py-2.5 w-full focus:outline-none font-mono text-gray-500 select-all"
              />
              <button 
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText("https://www.myrupan.com/sitemap.xml");
                  alert("Sitemap link copied to clipboard!");
                }}
                className="bg-gray-200 hover:bg-gray-300 border border-gray-200 border-l-0 text-zinc-700 text-xs font-bold px-4 rounded-r-xl transition-all cursor-pointer"
              >
                Copy Link
              </button>
            </div>
            <div className="flex items-start space-x-2 text-[10px] text-gray-400 mt-2">
              <AlertCircle className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />
              <span>Submit this link to Google Search Console (GSC) and Bing Webmaster Tools to index products faster.</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
