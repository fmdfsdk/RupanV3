import React, { useState } from 'react';
import { Save, Tag, Globe, Sparkles, AlertCircle, HelpCircle, Check, Copy, ExternalLink, Code } from 'lucide-react';
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
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <Globe className="w-6 h-6 text-brand-primary" />
            SEO & Marketing Hub
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Configure search engine meta tags, sitemaps, and link your store to Meta (Facebook) Pixel/Datasets, Google Tag Manager, and Google Analytics.
          </p>
        </div>
        <button
          onClick={handleSaveSettings}
          className="bg-brand-primary hover:bg-blue-900 text-white text-xs font-bold uppercase tracking-wider px-6 py-3.5 rounded-xl flex items-center space-x-2 transition-all cursor-pointer shadow-md active:scale-95"
        >
          <Save className="w-4 h-4" />
          <span>Save Configuration</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Form Settings */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Tracking Pixels Settings Card */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-5">
            <h3 className="font-bold text-xs uppercase tracking-wider text-gray-400 border-b border-gray-100 pb-3 flex items-center gap-2">
              <Tag className="w-4 h-4 text-brand-primary" />
              Ad Tracking & Analytics Integration
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Meta Pixel/Dataset ID */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-zinc-700 flex items-center gap-1">
                    Meta Pixel / Dataset ID
                    <span className="text-red-500">*</span>
                  </label>
                  <a 
                    href="https://business.facebook.com/events_manager2" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[10px] text-brand-primary hover:underline flex items-center gap-0.5"
                  >
                    Events Manager <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
                <input 
                  type="text" 
                  placeholder="e.g. 10284812841"
                  value={settings.metaPixelId || ''}
                  onChange={(e) => setSettings({ ...settings, metaPixelId: e.target.value })}
                  className="bg-gray-50 border border-gray-200 text-xs rounded-xl px-3.5 py-2.5 w-full focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary font-mono transition-all"
                />
                <p className="text-[10px] text-gray-400">
                  Connects Meta Pixel or Dataset to track PageView, AddToCart, and Purchases.
                </p>
              </div>

              {/* Meta Test Code */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-700 flex items-center gap-1">
                  Meta Test Event Code
                  <span className="text-gray-400 text-[10px] font-normal">(Optional)</span>
                </label>
                <input 
                  type="text" 
                  placeholder="e.g. TEST12345"
                  value={settings.metaTestEventCode || ''}
                  onChange={(e) => setSettings({ ...settings, metaTestEventCode: e.target.value })}
                  className="bg-gray-50 border border-gray-200 text-xs rounded-xl px-3.5 py-2.5 w-full focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary font-mono transition-all"
                />
                <p className="text-[10px] text-gray-400">
                  Enter code from the "Test Events" tab in Meta to debug pixel setup live.
                </p>
              </div>

              {/* GTM Container ID */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-700">Google Tag Manager (GTM) ID</label>
                <input 
                  type="text" 
                  placeholder="e.g. GTM-XXXXXX"
                  value={settings.googleTagManagerId || ''}
                  onChange={(e) => setSettings({ ...settings, googleTagManagerId: e.target.value })}
                  className="bg-gray-50 border border-gray-200 text-xs rounded-xl px-3.5 py-2.5 w-full focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary font-mono transition-all"
                />
                <p className="text-[10px] text-gray-400">
                  Injects Google Tag Manager containers across all storefront pages.
                </p>
              </div>

              {/* GA4 ID */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-700">Google Analytics 4 (GA4) ID</label>
                <input 
                  type="text" 
                  placeholder="e.g. G-XXXXXXXXXX"
                  value={settings.googleAnalyticsId || ''}
                  onChange={(e) => setSettings({ ...settings, googleAnalyticsId: e.target.value })}
                  className="bg-gray-50 border border-gray-200 text-xs rounded-xl px-3.5 py-2.5 w-full focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary font-mono transition-all"
                />
                <p className="text-[10px] text-gray-400">
                  Connects GA4 property for tracking visitor behavior and traffic sources.
                </p>
              </div>
            </div>
          </div>

          {/* Search Engine Optimization (Sitemap) Card */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-gray-400 border-b border-gray-100 pb-3 flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-500" />
              Sitemap & Search Console Indexing
            </h3>

            <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl flex items-start gap-2.5">
              <Sparkles className="w-4.5 h-4.5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-emerald-800">Dynamic Sitemap Configured</p>
                <p className="text-[11px] text-emerald-700 mt-0.5">
                  Rupan automatically updates your sitemap (`/sitemap.xml`) every time you add or update products, categories, or blog posts. No manual sitemap generation is needed.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-700">Sitemap Address URL</label>
              <div className="flex">
                <input 
                  type="text" 
                  readOnly
                  value="https://www.myrupan.com/sitemap.xml"
                  className="bg-gray-50 border border-gray-200 text-xs rounded-l-xl px-3.5 py-2.5 w-full focus:outline-none font-mono text-gray-500 select-all"
                />
                <button 
                  type="button"
                  onClick={() => handleCopy("https://www.myrupan.com/sitemap.xml", "sitemap")}
                  className="bg-gray-100 hover:bg-gray-200 border border-gray-200 border-l-0 text-zinc-700 text-xs font-bold px-4 rounded-r-xl transition-all cursor-pointer flex items-center gap-1"
                >
                  {copiedId === 'sitemap' ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === 'sitemap' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <div className="flex items-start space-x-1.5 text-[10px] text-gray-400 mt-2">
                <AlertCircle className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                <span>Submit this sitemap URL in your Google Search Console to index new products in hours.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Setup Guides */}
        <div className="space-y-6">
          {/* Meta Pixel Connection Guide Card */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-gray-400 border-b border-gray-100 pb-3 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-brand-primary" />
              Meta Integration Instructions
            </h3>
            
            <div className="space-y-3.5 text-xs text-zinc-600">
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-blue-50 text-brand-primary flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">1</div>
                <div>
                  <p className="font-bold text-gray-900">Find your Dataset / Pixel ID</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Go to <strong>Meta Events Manager</strong> → Select your Business Account → Copy the 15-digit ID listed under your Dataset/Pixel name.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-blue-50 text-brand-primary flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">2</div>
                <div>
                  <p className="font-bold text-gray-900">Paste & Save</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Paste the ID into the <strong>Meta Pixel / Dataset ID</strong> field on the left and click <strong>Save Configuration</strong>.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-blue-50 text-brand-primary flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">3</div>
                <div>
                  <p className="font-bold text-gray-900">Verify Connection</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Install the <strong>Meta Pixel Helper</strong> extension in Chrome. Open your site in a new tab, click the extension icon to verify events (e.g. <code>PageView</code>) are showing green.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-gray-100">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-1.5">
                <Code className="w-3.5 h-3.5" />
                Deduplication & Event IDs
              </h4>
              <p className="text-[10px] text-gray-400 leading-relaxed">
                Rupan automatically generates unique Event IDs (e.g. <code>evt-pageview-...</code>) for all browser events. This guarantees deduplication and high event quality scores on Meta.
              </p>
            </div>
          </div>

          {/* Test Event helper code snippet */}
          <div className="bg-gray-950 p-5 rounded-2xl text-gray-200 border border-gray-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-brand-primary uppercase tracking-widest">
                Meta Diagnostics
              </span>
              <span className="text-[10px] text-gray-500 font-mono">
                Telemetry Active
              </span>
            </div>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              When navigating your store, the following debug console prints are triggered for verification:
            </p>
            <pre className="text-[10px] font-mono bg-gray-900 p-2.5 rounded-lg text-emerald-400 overflow-x-auto">
              {`[Telemetry] Fired Meta Pixel: PageView\n{ page_path: "/" }\n\n[Telemetry] Fired Meta Pixel: Purchase\n{ value: 1250, currency: "BDT" }`}
            </pre>
          </div>
        </div>

      </div>
    </div>
  );
}
