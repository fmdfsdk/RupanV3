import React from 'react';
import { Link, RefreshCw, BarChart3, Loader2, StopCircle, Info, Clock, AlertTriangle } from 'lucide-react';

interface SyncTabProps {
  syncSources: any[];
  activeSource: string;
  setActiveSource: (id: string) => void;
  syncing: boolean;
  syncProgress: number;
  syncPage: number;
  syncLastPage: number;
  syncStats: {
    fetched: number;
    imported: number;
    updated: number;
    failed: number;
  };
  syncLogs: any[];
  setSelectedLog: (log: any) => void;
  runSync: () => void;
  syncStatusMessage?: string;
  syncScope?: 'recent' | 'all' | 'custom';
  setSyncScope?: (scope: 'recent' | 'all' | 'custom') => void;
  customStartPage?: number;
  setCustomStartPage?: (page: number) => void;
  customEndPage?: number;
  setCustomEndPage?: (page: number) => void;
  stopSync?: () => void;
  isSupabaseOnline?: boolean;
  dbSettings?: any;
}

export default function SyncTab({
  syncSources,
  activeSource,
  setActiveSource,
  syncing,
  syncProgress,
  syncPage,
  syncLastPage,
  syncStats,
  syncLogs,
  setSelectedLog,
  runSync,
  syncStatusMessage = '',
  syncScope = 'recent',
  setSyncScope,
  customStartPage = 1,
  setCustomStartPage,
  customEndPage = 5,
  setCustomEndPage,
  stopSync,
  isSupabaseOnline = false,
  dbSettings
}: SyncTabProps) {
  const pricingConfig = dbSettings?.pricing_config || {};
  const deductionPct = pricingConfig.deduction_percentage !== undefined ? Number(pricingConfig.deduction_percentage) : 50;
  const marginVal = pricingConfig.default_margin_value !== undefined ? Number(pricingConfig.default_margin_value) : 10;
  const marginType = pricingConfig.default_margin_type || 'percentage';
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Synchronization Manager</h1>
          <p className="text-xs text-gray-500">Import and sync product directories from third-party wholesale APIs and reseller configurations.</p>
        </div>

        {/* Database Connectivity Status Badge */}
        <div>
          {isSupabaseOnline ? (
            <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-1.5 rounded-xl text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live Database Connected</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-800 px-3 py-1.5 rounded-xl text-xs font-bold">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>Simulated Demo Mode (Offline)</span>
            </div>
          )}
        </div>
      </div>

      {!isSupabaseOnline && (
        <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 text-xs text-amber-900 leading-relaxed font-semibold">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-black block uppercase tracking-wide text-amber-950 mb-0.5">
              সিমুলেটেড ডেমো সিঙ্ক মোড (Simulated Sync Notice)
            </span>
            বর্তমানে ব্রাউজারে লাইভ Supabase ডেটাবেজ কানেক্টেড নেই। তাই সিঙ্ক বাটনে চাপ দিলে এটি মহাসাগর API-এর ২,৭৪৭টি প্রোডাক্টের প্রসেসিং <strong>সিমুলেট</strong> করে এবং ডেমো লগ তৈরি করে। কিন্তু ডেটাবেজ সক্রিয় না থাকায় আসল ২,৭৪৭টি প্রোডাক্ট সরাসরি ডাটাবেজে স্টোর হচ্ছে না। লাইভ সাইটে (Vercel-এ ডেপ্লয় করার পর) আসল প্রোডাক্ট সিঙ্ক সম্পন্ন হয়ে ডেটাবেজে সংরক্ষিত হবে।
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sync Sources Panel */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4 lg:col-span-1">
          <h3 className="font-bold text-sm uppercase tracking-wide text-gray-500 border-b border-gray-100 pb-2 flex items-center gap-2">
            <Link className="w-4 h-4 text-brand-primary" />
            Connected Sources
          </h3>

          <div className="space-y-3">
            {syncSources.map((source) => (
              <div 
                key={source.id}
                onClick={() => !syncing && setActiveSource(source.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  activeSource === source.id 
                    ? 'bg-orange-50/50 border-[#ff5c00] text-[#ff5c00]' 
                    : 'bg-gray-50 border-gray-100 text-gray-700 hover:bg-gray-100/50'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black uppercase tracking-wider">{source.name}</span>
                  <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                    source.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {source.is_active ? 'Active' : 'Disabled'}
                  </span>
                </div>
                <p className="text-[10px] text-gray-400 mt-1 truncate">{source.api_url || 'Manual Entry source'}</p>
                <div className="flex justify-between items-center mt-3 text-[9px] text-gray-400 font-semibold">
                  <span>Markup: +{source.config?.markup_percentage || 0}%</span>
                  <span>Sync: {source.last_sync_at ? String(source.last_sync_at).substring(0, 10) : 'Never'}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Sync Controls */}
          <div className="pt-4 border-t border-gray-100 space-y-4">
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-2">
              <span className="text-[9px] font-extrabold uppercase text-gray-400 block">Active Source Specs</span>
              {syncSources.find(s => s.id === activeSource) ? (
                <div className="text-xs space-y-1 font-semibold text-gray-700">
                  <p>Type: <span className="text-gray-500 uppercase">{syncSources.find(s => s.id === activeSource).type}</span></p>
                  <p>Auto Publish: <span className="text-gray-500">{syncSources.find(s => s.id === activeSource).config?.auto_publish !== false ? 'Yes' : 'No'}</span></p>
                  <p className="break-all">Target URL: <span className="text-gray-500 font-mono text-[10px] block mt-0.5">{syncSources.find(s => s.id === activeSource).api_url}</span></p>
                </div>
              ) : (
                <p className="text-xs text-gray-500">No source selected.</p>
              )}
            </div>

            {/* Sync Scope Selection */}
            {setSyncScope && (
              <div className="space-y-2">
                <label className="text-[10px] font-extrabold uppercase text-gray-500 block">Sync Scope</label>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    disabled={syncing}
                    onClick={() => setSyncScope('recent')}
                    className={`py-2 px-1 text-center rounded-xl text-[10px] font-bold uppercase transition-all ${
                      syncScope === 'recent'
                        ? 'bg-[#ff5c00] text-white shadow-xs'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200/70'
                    }`}
                  >
                    Recent (1–5)
                  </button>
                  <button
                    type="button"
                    disabled={syncing}
                    onClick={() => setSyncScope('all')}
                    className={`py-2 px-1 text-center rounded-xl text-[10px] font-bold uppercase transition-all ${
                      syncScope === 'all'
                        ? 'bg-[#ff5c00] text-white shadow-xs'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200/70'
                    }`}
                  >
                    Full (All)
                  </button>
                  <button
                    type="button"
                    disabled={syncing}
                    onClick={() => setSyncScope('custom')}
                    className={`py-2 px-1 text-center rounded-xl text-[10px] font-bold uppercase transition-all ${
                      syncScope === 'custom'
                        ? 'bg-[#ff5c00] text-white shadow-xs'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200/70'
                    }`}
                  >
                    Custom
                  </button>
                </div>

                {syncScope === 'custom' && setCustomStartPage && setCustomEndPage && (
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <div>
                      <span className="text-[9px] font-bold text-gray-400 block mb-1">Start Page</span>
                      <input
                        type="number"
                        min="1"
                        disabled={syncing}
                        value={customStartPage}
                        onChange={(e) => setCustomStartPage(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full text-xs font-mono font-bold bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-[#ff5c00]"
                      />
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-gray-400 block mb-1">End Page</span>
                      <input
                        type="number"
                        min={customStartPage}
                        disabled={syncing}
                        value={customEndPage}
                        onChange={(e) => setCustomEndPage(Math.max(customStartPage, parseInt(e.target.value) || customStartPage))}
                        className="w-full text-xs font-mono font-bold bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-[#ff5c00]"
                      />
                    </div>
                  </div>
                )}

                {/* Quick Presets for Custom Pages */}
                {syncScope === 'custom' && setCustomStartPage && setCustomEndPage && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1.5">
                    <span className="text-[9px] font-bold text-gray-400">Presets:</span>
                    <button
                      type="button"
                      disabled={syncing}
                      onClick={() => { setCustomStartPage(11); setCustomEndPage(11); }}
                      className="px-2 py-0.5 rounded-lg bg-orange-50 hover:bg-orange-100 text-[#ff5c00] border border-orange-200 text-[10px] font-bold transition-all cursor-pointer"
                      title="Sync Page 11 (includes Product 5080)"
                    >
                      Page 11 (Code 5080)
                    </button>
                    <button
                      type="button"
                      disabled={syncing}
                      onClick={() => { setCustomStartPage(1); setCustomEndPage(10); }}
                      className="px-2 py-0.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-[10px] font-medium transition-all cursor-pointer"
                    >
                      Pages 1–10
                    </button>
                    <button
                      type="button"
                      disabled={syncing}
                      onClick={() => { setCustomStartPage(11); setCustomEndPage(20); }}
                      className="px-2 py-0.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-[10px] font-medium transition-all cursor-pointer"
                    >
                      Pages 11–20
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Live Pricing Recalculation Engine Banner */}
            <div className="p-3 bg-gradient-to-br from-emerald-50/90 to-teal-50/60 border border-emerald-200 rounded-xl space-y-1.5">
              <div className="flex items-center justify-between text-emerald-900 text-[10px] font-black">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  অটো প্রাইসিং ও মার্জিন রিক্যালকুলেশন সক্রিয়
                </span>
                <span className="bg-emerald-200/60 text-emerald-800 px-1.5 py-0.5 rounded text-[9px] font-mono">
                  {deductionPct}% ডিডাকশন
                </span>
              </div>
              <p className="text-[9px] text-emerald-800/90 leading-relaxed font-medium">
                সাপ্লায়ার Mohasagor API-তে যে দামই (MSRP / Wholesale Cost) দিক না কেন, সিঙ্ক করার সাথে সাথে বর্তমান <strong>{deductionPct}% ডিডাকশন</strong> ও <strong>{marginVal}{marginType === 'percentage' ? '%' : '৳'} মার্জিন</strong> ফর্মুলা অনুযায়ী ফাইনাল প্রাইস (Floor) ও বিক্রয়মূল্য স্বয়ংক্রিয়ভাবে রিক্যালকুলেট হয়ে ডাটাবেজে আপডেট হয়ে যাবে। সাপ্লায়ার দাম বাড়ালে আমাদের বিক্রয়মূল্যও স্বয়ংক্রিয়ভাবে বৃদ্ধি পাবে।
              </p>
            </div>

            {/* Rate Limit Protection Notice */}
            <div className="p-3 bg-amber-50/70 border border-amber-200/70 rounded-xl space-y-1">
              <div className="flex items-center space-x-1.5 text-amber-800 text-[10px] font-bold">
                <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Rate Limit Protection</span>
              </div>
              <p className="text-[9px] text-amber-700 leading-relaxed">
                Mohasagor allows max <strong>5 requests/min</strong>. The sync engine automatically enforces a ~12.5s buffer between pages and retries automatically if rate limited.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <button
                onClick={runSync}
                disabled={syncing}
                className="w-full bg-[#ff5c00] hover:bg-orange-600 disabled:bg-orange-800/50 text-white text-xs font-bold uppercase tracking-wider py-3.5 rounded-xl flex items-center justify-center space-x-2 hover:shadow-md transition-all cursor-pointer disabled:cursor-not-allowed"
              >
                <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                <span>{syncing ? 'Syncing...' : 'Trigger Sync Now'}</span>
              </button>

              {syncing && stopSync && (
                <button
                  onClick={stopSync}
                  type="button"
                  className="w-full bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-bold uppercase tracking-wider py-2.5 rounded-xl flex items-center justify-center space-x-2 transition-all cursor-pointer"
                >
                  <StopCircle className="w-4 h-4 text-rose-500" />
                  <span>Stop / Pause Sync</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Sync Logs and Progress Panel */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4 lg:col-span-2">
          <h3 className="font-bold text-sm uppercase tracking-wide text-gray-500 border-b border-gray-100 pb-2 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-emerald-500" />
            Sync Telemetry & Logs
          </h3>

          {/* Real-time Progress Bar */}
          {syncing && (
            <div className="p-5 bg-gradient-to-br from-orange-50/60 via-white to-amber-50/40 border border-orange-100 rounded-2xl space-y-4 animate-in fade-in slide-in-from-top-2 duration-300 shadow-2xs">
              <div className="flex justify-between items-center text-xs">
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-3.5 h-3.5 text-[#ff5c00] animate-spin" />
                  <span className="font-extrabold text-orange-600 uppercase tracking-wider text-[10px]">Syncing Mohasagor API...</span>
                </div>
                <span className="font-extrabold text-orange-600 font-mono text-[11px] bg-orange-100 px-2 py-0.5 rounded-full">{syncProgress}%</span>
              </div>
              
              {/* Sleek animated line progress bar */}
              <div className="w-full bg-orange-100 h-2.5 rounded-full overflow-hidden relative">
                <div 
                  className="bg-gradient-to-r from-orange-500 via-[#ff5c00] to-amber-500 h-full transition-all duration-300 rounded-full relative"
                  style={{ width: `${Math.max(5, syncProgress)}%` }}
                >
                  <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0.15)_75%,transparent_75%,transparent)] bg-[length:1rem_1rem] animate-[pulse_1.5s_infinite]"></div>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-[10px] text-orange-600/80 font-medium">
                <span>Processing Page {syncPage} of {syncLastPage}</span>
                <span className="font-mono">{syncStats.fetched.toLocaleString()} Items Fetched</span>
              </div>

              {/* Status & Countdown Live Banner */}
              {syncStatusMessage && (
                <div className="p-2.5 bg-orange-500/10 border border-orange-500/20 rounded-xl flex items-center space-x-2 text-[10px] font-semibold text-orange-800 animate-in fade-in duration-200">
                  <Clock className="w-3.5 h-3.5 text-[#ff5c00] shrink-0 animate-pulse" />
                  <span className="truncate">{syncStatusMessage}</span>
                </div>
              )}

              {/* Live Statistics Cards Grid */}
              <div className="grid grid-cols-3 gap-2.5 pt-1">
                <div className="bg-emerald-50/50 border border-emerald-100/50 rounded-xl p-2.5 text-center">
                  <span className="text-[9px] uppercase font-bold text-emerald-600 tracking-wider block">Imported</span>
                  <span className="text-sm font-black text-emerald-700 font-mono">{syncStats.imported}</span>
                </div>
                <div className="bg-blue-50/50 border border-blue-100/50 rounded-xl p-2.5 text-center">
                  <span className="text-[9px] uppercase font-bold text-blue-600 tracking-wider block">Updated</span>
                  <span className="text-sm font-black text-blue-700 font-mono">{syncStats.updated}</span>
                </div>
                <div className="bg-red-50/50 border border-red-100/50 rounded-xl p-2.5 text-center">
                  <span className="text-[9px] uppercase font-bold text-red-600 tracking-wider block">Failed</span>
                  <span className="text-sm font-black text-red-700 font-mono">{syncStats.failed}</span>
                </div>
              </div>
            </div>
          )}

          {/* Logs Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600 border-collapse">
              <thead>
                <tr className="border-b border-gray-100 font-bold uppercase text-[10px] text-gray-400">
                  <th className="py-3">Started</th>
                  <th className="py-3">Source</th>
                  <th className="py-3">Status</th>
                  <th className="py-3 text-center">Fetched</th>
                  <th className="py-3 text-center">Upserted</th>
                  <th className="py-3 text-center">Failed</th>
                  <th className="py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {syncLogs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-400 italic">No sync logs found.</td>
                  </tr>
                ) : (
                  syncLogs.map((log) => (
                    <tr key={log.id} className="border-b border-gray-50 hover:bg-gray-50/30">
                      <td className="py-3 font-medium">{log.started_at ? String(log.started_at).substring(0, 16) : 'N/A'}</td>
                      <td className="py-3 font-semibold uppercase">{log.source_id}</td>
                      <td className="py-3">
                        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${
                          log.status === 'success' ? 'bg-green-50 text-green-700 border border-green-100' :
                          log.status === 'failed' ? 'bg-red-50 text-red-700 border border-red-100' :
                          'bg-blue-50 text-blue-700 border border-blue-100 animate-pulse'
                        }`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="py-3 text-center font-mono">{log.items_fetched ?? 0}</td>
                      <td className="py-3 text-center font-mono text-emerald-600 font-semibold">
                        {Number(log.items_imported ?? 0) + Number(log.items_updated ?? 0)}
                      </td>
                      <td className="py-3 text-center font-mono text-red-500 font-semibold">{log.items_failed ?? 0}</td>
                      <td className="py-3 text-right">
                        <button 
                          onClick={() => setSelectedLog(log)}
                          className="text-[#ff5c00] hover:underline font-bold text-[10px] uppercase tracking-wider cursor-pointer"
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
