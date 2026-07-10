import React from 'react';
import { Link, RefreshCw, BarChart3, Loader2 } from 'lucide-react';

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
  runSync
}: SyncTabProps) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Synchronization Manager</h1>
          <p className="text-xs text-gray-500">Import and sync product directories from third-party wholesale APIs and reseller configurations.</p>
        </div>
      </div>

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

            <button
              onClick={runSync}
              disabled={syncing}
              className="w-full bg-[#ff5c00] hover:bg-orange-600 disabled:bg-orange-800/50 text-white text-xs font-bold uppercase tracking-wider py-3.5 rounded-xl flex items-center justify-center space-x-2 hover:shadow-md transition-all cursor-pointer disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
              <span>{syncing ? 'Syncing...' : 'Trigger Sync Now'}</span>
            </button>
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
                  style={{ width: `${syncProgress}%` }}
                >
                  <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0.15)_75%,transparent_75%,transparent)] bg-[length:1rem_1rem] animate-[pulse_1.5s_infinite]"></div>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-[10px] text-orange-600/80 font-medium">
                <span>Processing Page {syncPage} of {syncLastPage}</span>
                <span className="font-mono">{syncStats.fetched.toLocaleString()} Items Fetched</span>
              </div>

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
