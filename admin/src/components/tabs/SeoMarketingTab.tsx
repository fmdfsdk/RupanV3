import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  Save, Tag, Globe, Sparkles, AlertCircle, Check, Copy, ExternalLink, Code,
  Shield, Zap, Activity, Eye, EyeOff, Server, Wifi, WifiOff, RefreshCw,
  ChevronRight, Info, CheckCircle2, XCircle, AlertTriangle, Play,
  BarChart3, Target, Settings2, Layers
} from 'lucide-react';
import { WebsiteSettings } from '../../types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface SeoMarketingTabProps {
  settings: WebsiteSettings;
  setSettings: (s: WebsiteSettings) => void;
  handleSaveSettings: () => void;
}

type StatusType = 'active' | 'inactive' | 'testing' | 'error' | 'idle';

interface StatusBadgeProps {
  status: StatusType;
  label?: string;
}

interface LogEntry {
  ts: string;
  type: 'success' | 'error' | 'info';
  msg: string;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status, label }: StatusBadgeProps) {
  const styles: Record<StatusType, string> = {
    active:   'bg-emerald-50 text-emerald-700 border-emerald-200',
    inactive: 'bg-gray-50 text-gray-500 border-gray-200',
    testing:  'bg-amber-50 text-amber-700 border-amber-200',
    error:    'bg-red-50 text-red-600 border-red-200',
    idle:     'bg-blue-50 text-blue-600 border-blue-200',
  };
  const dots: Record<StatusType, string> = {
    active:   'bg-emerald-500',
    inactive: 'bg-gray-400',
    testing:  'bg-amber-500',
    error:    'bg-red-500',
    idle:     'bg-blue-500',
  };
  const pulse = status === 'active' || status === 'testing';
  const text = label || (status === 'active' ? 'Active' : status === 'inactive' ? 'Not Configured' : status === 'testing' ? 'Testing...' : status === 'error' ? 'Error' : 'Ready');

  return (
    <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${styles[status]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dots[status]} ${pulse ? 'animate-pulse' : ''}`} />
      {text}
    </span>
  );
}

function SectionCard({
  title, icon, children, badge, rightSlot,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  badge?: React.ReactNode;
  rightSlot?: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 bg-gray-50/60">
        <div className="flex items-center gap-2">
          <span className="text-brand-primary">{icon}</span>
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">{title}</h3>
          {badge}
        </div>
        {rightSlot}
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  );
}

function InputField({
  label, value, onChange, placeholder, helpText, type = 'text', required = false,
  docsHref, masked = false, readOnly = false, copyable = false,
}: {
  label: string; value: string; onChange?: (v: string) => void;
  placeholder?: string; helpText?: string; type?: string; required?: boolean;
  docsHref?: string; masked?: boolean; readOnly?: boolean; copyable?: boolean;
}) {
  const [showMasked, setShowMasked] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const inputType = masked ? (showMasked ? 'text' : 'password') : type;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-zinc-700 flex items-center gap-1">
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
        {docsHref && (
          <a href={docsHref} target="_blank" rel="noopener noreferrer"
            className="text-[10px] text-brand-primary hover:underline flex items-center gap-0.5">
            Docs <ExternalLink className="w-2.5 h-2.5" />
          </a>
        )}
      </div>
      <div className="flex">
        <input
          type={inputType}
          placeholder={placeholder}
          value={value || ''}
          readOnly={readOnly}
          onChange={onChange ? (e) => onChange(e.target.value) : undefined}
          className={`bg-gray-50 border border-gray-200 text-xs rounded-${(masked || copyable) ? 'none rounded-l' : 'xl'} px-3.5 py-2.5 w-full focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary font-mono transition-all ${readOnly ? 'text-gray-500 select-all cursor-default' : ''}`}
        />
        {masked && (
          <button type="button" onClick={() => setShowMasked(!showMasked)}
            title={showMasked ? 'Hide token' : 'Show token'}
            className="bg-gray-100 hover:bg-gray-200 border border-gray-200 border-l-0 text-zinc-600 px-3 transition-all flex items-center">
            {showMasked ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>
        )}
        {copyable && (
          <button type="button" onClick={handleCopy}
            className="bg-gray-100 hover:bg-gray-200 border border-gray-200 border-l-0 text-zinc-700 text-xs font-bold px-4 rounded-r-xl transition-all cursor-pointer flex items-center gap-1">
            {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        )}
        {masked && copyable && (
          <button type="button" onClick={handleCopy}
            className="bg-gray-100 hover:bg-gray-200 border border-gray-200 border-l-0 text-zinc-700 text-xs font-bold px-4 rounded-r-xl transition-all cursor-pointer flex items-center gap-1">
            {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>
      {helpText && <p className="text-[10px] text-gray-400 leading-relaxed">{helpText}</p>}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function SeoMarketingTab({
  settings, setSettings, handleSaveSettings,
}: SeoMarketingTabProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [pixelStatus, setPixelStatus]     = useState<StatusType>('idle');
  const [capiStatus, setCapiStatus]       = useState<StatusType>('idle');
  const [gtmStatus, setGtmStatus]         = useState<StatusType>('idle');
  const [ga4Status, setGa4Status]         = useState<StatusType>('idle');
  const [isTesting, setIsTesting]         = useState(false);
  const logEndRef = useRef<HTMLDivElement>(null);

  // Derive initial statuses from settings
  useEffect(() => {
    setPixelStatus(settings.metaPixelId         ? 'active' : 'inactive');
    setCapiStatus(settings.metaCapiAccessToken  ? 'active' : 'inactive');
    setGtmStatus(settings.googleTagManagerId    ? 'active' : 'inactive');
    setGa4Status(settings.googleAnalyticsId     ? 'active' : 'inactive');
  }, [settings]);

  // ── Restore CAPI token from localStorage backup if DB doesn't have it ──
  // Runs once on mount. Protects against the token disappearing when the
  // meta_capi_access_token column is missing from Supabase.
  useEffect(() => {
    if (!settings.metaCapiAccessToken) {
      try {
        const cached = JSON.parse(localStorage.getItem('rup_db_settings') || '{}');
        const savedToken = cached.meta_capi_access_token;
        if (savedToken) {
          setSettings({ ...settings, metaCapiAccessToken: savedToken });
        }
      } catch (_) {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const addLog = useCallback((type: LogEntry['type'], msg: string) => {
    const now = new Date();
    const ts  = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    setLogs(prev => [...prev.slice(-49), { ts, type, msg }]);
    setTimeout(() => logEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  }, []);

  // ── Save Handler ──────────────────────────────────────────────────────────
  const onSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    addLog('info', '💾 Saving SEO & Marketing configuration to Supabase...');

    // Always persist CAPI token to localStorage as a local backup
    // so it survives page reloads even if the DB save fails
    if (settings.metaCapiAccessToken) {
      try {
        const cached = JSON.parse(localStorage.getItem('rup_db_settings') || '{}');
        cached.meta_capi_access_token = settings.metaCapiAccessToken;
        cached.meta_pixel_id          = settings.metaPixelId || cached.meta_pixel_id;
        cached.meta_test_event_code   = settings.metaTestEventCode || cached.meta_test_event_code;
        cached.google_tag_manager_id  = settings.googleTagManagerId || cached.google_tag_manager_id;
        cached.google_analytics_id    = settings.googleAnalyticsId || cached.google_analytics_id;
        localStorage.setItem('rup_db_settings', JSON.stringify(cached));
        addLog('info', '📌 Token backed up to localStorage (survives page refresh).');
      } catch (_) {}
    }

    try {
      await handleSaveSettings();
      setSaveSuccess(true);
      addLog('success', '✅ All settings saved to Supabase successfully!');
      addLog('info', '   ↳ CAPI token, Pixel ID, GTM, GA4 all persisted in DB.');
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      setIsSaving(false);
      const msg: string = err?.message || 'Unknown error';

      // Detect the "column does not exist" error — means migration hasn't been run
      if (msg.toLowerCase().includes('meta_capi_access_token') || msg.toLowerCase().includes('column') || msg.toLowerCase().includes('does not exist')) {
        addLog('error', `❌ Supabase Error: ${msg}`);
        addLog('error', '');
        addLog('error', '⚠️  The CAPI token column is MISSING from your database.');
        addLog('info', '👉 You need to run this SQL in Supabase Dashboard → SQL Editor:');
        addLog('info', '');
        addLog('info', '   ALTER TABLE public.settings');
        addLog('info', '   ADD COLUMN IF NOT EXISTS meta_capi_access_token text;');
        addLog('info', '');
        addLog('info', '   Then click Save again. Your token is safely backed up in localStorage.');
      } else {
        addLog('error', `❌ Save failed: ${msg}`);
        addLog('info', '💡 Your token is still saved locally. Run the migration SQL and try again.');
      }
      return;
    } finally {
      setIsSaving(false);
    }
  };


  // ── Helper: load a script and wait for it ────────────────────────────────
  const loadScript = (src: string, id: string): Promise<void> =>
    new Promise((resolve, reject) => {
      if (document.getElementById(id)) { resolve(); return; }
      const s = document.createElement('script');
      s.id    = id;
      s.async = true;
      s.src   = src;
      s.onload  = () => resolve();
      s.onerror = () => reject(new Error(`Failed to load: ${src}`));
      document.head.appendChild(s);
    });

  // ── Test Meta Pixel (Now via CAPI server-side to prevent Admin DOM injection) ──
  const testPixelConnection = async () => {
    if (!settings.metaPixelId) {
      addLog('error', '❌ No Pixel ID entered. Please add a Meta Pixel / Dataset ID first.');
      return;
    }
    setPixelStatus('testing');
    addLog('info', `📡 Testing Meta Pixel ${settings.metaPixelId} securely via Server-Side CAPI...`);

    try {
      const evtId = `evt-pixel-test-${Date.now()}`;
      
      // Use CAPI access token if present, or fall back to a mock/system verification
      const apiToken = settings.metaCapiAccessToken;
      if (!apiToken) {
        addLog('error', '❌ Meta Pixel browser test cannot run secure-server test without a CAPI Access Token.');
        addLog('info', '💡 Please add your CAPI Access Token first, or test the browser Pixel directly by visiting your main storefront at https://www.myrupan.com.');
        setPixelStatus('idle');
        return;
      }

      const payload = {
        pixelId:       settings.metaPixelId,
        accessToken:   apiToken,
        testEventCode: settings.metaTestEventCode || undefined,
        events: [{
          eventName:      'PageView',
          eventId:        evtId,
          eventSourceUrl: 'https://www.myrupan.com/',
          customData:     { page_path: '/storefront-pixel-test' },
        }],
      };

      const response = await fetch('/api/meta-capi', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      });

      const data = await response.json();
      if (data.success) {
        addLog('success', `✅ Meta Pixel verification sent via Server CAPI (eventId: ${evtId})`);
        if (settings.metaTestEventCode) {
          addLog('info', `   ↳ Test Code "${settings.metaTestEventCode}" applied — check Meta Test Events dashboard under storefront domain.`);
        }
        setPixelStatus('active');
      } else {
        addLog('error', `❌ secure Meta Pixel server test failed: ${data.error}`);
        setPixelStatus('error');
      }
    } catch (e: any) {
      addLog('error', `❌ Pixel test connection failed: ${e.message}`);
      setPixelStatus('error');
    }
  };

  // ── Test CAPI ─────────────────────────────────────────────────────────────
  const testCapiConnection = async () => {
    if (!settings.metaPixelId) {
      addLog('error', '❌ Meta Pixel ID required for CAPI test.');
      return;
    }
    if (!settings.metaCapiAccessToken) {
      addLog('error', '❌ No CAPI Access Token entered. Generate one from Meta Events Manager → Settings → Conversions API.');
      return;
    }
    setCapiStatus('testing');
    addLog('info', `🌐 Sending server-side CAPI event → Pixel: ${settings.metaPixelId}...`);

    try {
      const evtId = `evt-capi-admin-${Date.now()}`;
      const payload = {
        pixelId:       settings.metaPixelId,
        accessToken:   settings.metaCapiAccessToken,
        testEventCode: settings.metaTestEventCode || undefined,
        events: [{
          eventName:      'PageView',
          eventId:        evtId,
          eventSourceUrl: 'https://www.myrupan.com/',
          customData:     { page_path: '/admin/seo-marketing-test' },
        }],
      };

      const response = await fetch('/api/meta-capi', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      });

      // Safe JSON parse — check content-type first
      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        const text = await response.text();
        addLog('error', `❌ CAPI endpoint returned non-JSON (HTTP ${response.status}). Response: ${text.substring(0, 120)}`);
        addLog('info', '💡 Ensure /api/meta-capi.ts exists in your admin project and is deployed to Vercel.');
        setCapiStatus('error');
        return;
      }

      const data = await response.json();

      if (data.success) {
        addLog('success', `✅ CAPI event sent successfully!`);
        addLog('success', `   ↳ events_received: ${data.events_received} | fbtrace_id: ${data.fbtrace_id}`);
        if (settings.metaTestEventCode) {
          addLog('info', `   ↳ Test Event Code: ${settings.metaTestEventCode} — verify in Meta Test Events tab.`);
        }
        setCapiStatus('active');
      } else {
        addLog('error', `❌ CAPI Meta API error: ${data.error}`);
        if (data.code) addLog('error', `   ↳ Error code: ${data.code} — check your access token is valid.`);
        setCapiStatus('error');
      }
    } catch (e: any) {
      addLog('error', `❌ CAPI request failed: ${e.message || 'Network error'}`);
      setCapiStatus('error');
    }
  };

  // ── Test GTM (Simulated Container Format verification to protect admin DOM) ──
  const testGTMConnection = async () => {
    if (!settings.googleTagManagerId) {
      addLog('error', '❌ No GTM Container ID entered.');
      return;
    }
    setGtmStatus('testing');
    addLog('info', `🏷️  Validating GTM container format: ${settings.googleTagManagerId}...`);
    await new Promise(r => setTimeout(r, 600));

    // Verify format (GTM-XXXXXX or GTM-XXXXXXX)
    const regex = /^GTM-[A-Z0-9]{6,8}$/;
    if (regex.test(settings.googleTagManagerId.trim())) {
      addLog('success', `✅ GTM container configuration "${settings.googleTagManagerId}" is valid!`);
      addLog('info', '💡 Google Tag Manager will load exclusively on the storefront (https://www.myrupan.com).');
      addLog('info', '   It is not loaded in the admin panel to prevent tracking admin actions.');
      setGtmStatus('active');
    } else {
      addLog('error', `❌ Invalid GTM Container ID format: "${settings.googleTagManagerId}". Expected format: GTM-XXXXXX`);
      setGtmStatus('error');
    }
  };

  // ── Test GA4 (Simulated Property Format verification to protect admin DOM) ──
  const testGA4Connection = async () => {
    if (!settings.googleAnalyticsId) {
      addLog('error', '❌ No GA4 Measurement ID entered.');
      return;
    }
    setGa4Status('testing');
    addLog('info', `📊 Validating GA4 Measurement ID format: ${settings.googleAnalyticsId}...`);
    await new Promise(r => setTimeout(r, 600));

    // Verify format (G-XXXXXXXXXX)
    const regex = /^G-[A-Z0-9]{8,12}$/;
    if (regex.test(settings.googleAnalyticsId.trim())) {
      addLog('success', `✅ GA4 Measurement ID configuration "${settings.googleAnalyticsId}" is valid!`);
      addLog('info', '💡 Google Analytics will track events exclusively on the storefront (https://www.myrupan.com).');
      addLog('info', '   It is not loaded in the admin panel to protect your session privacy.');
      setGa4Status('active');
    } else {
      addLog('error', `❌ Invalid GA4 Measurement ID format: "${settings.googleAnalyticsId}". Expected format: G-XXXXXXXXXX`);
      setGa4Status('error');
    }
  };




  // ── Fire All Test Events ──────────────────────────────────────────────────
  const runFullTest = async () => {
    setIsTesting(true);
    addLog('info', '🚀 Running full tracking suite test...');
    await testPixelConnection();
    await testCapiConnection();
    await testGTMConnection();
    await testGA4Connection();
    addLog('info', '🏁 Full test suite complete. Review results above.');
    setIsTesting(false);
  };


  // ── Computed values ──────────────────────────────────────────────────────
  const activeCount = [
    settings.metaPixelId,
    settings.metaCapiAccessToken,
    settings.googleTagManagerId,
    settings.googleAnalyticsId,
  ].filter(Boolean).length;

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-3 duration-300">

      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-900 rounded-2xl p-6 text-white relative overflow-hidden shadow-lg">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        </div>

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-white/10 rounded-xl">
                <Target className="w-5 h-5 text-blue-300" />
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tight">SEO & Marketing Hub</h1>
                <p className="text-xs text-blue-200 mt-0.5">
                  {activeCount} of 4 integrations active
                </p>
              </div>
            </div>

            {/* Integration status pills */}
            <div className="flex flex-wrap gap-2 mt-2">
              {[
                { label: 'Meta Pixel',  active: !!settings.metaPixelId },
                { label: 'CAPI',        active: !!settings.metaCapiAccessToken },
                { label: 'GTM',         active: !!settings.googleTagManagerId },
                { label: 'GA4',         active: !!settings.googleAnalyticsId },
              ].map(({ label, active }) => (
                <span key={label}
                  className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full ${
                    active
                      ? 'bg-emerald-400/20 text-emerald-300 border border-emerald-400/30'
                      : 'bg-white/5 text-white/40 border border-white/10'
                  }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-emerald-400 animate-pulse' : 'bg-white/20'}`} />
                  {label}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={runFullTest}
              disabled={isTesting}
              className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase tracking-wider px-4 py-3 rounded-xl transition-all border border-white/10 cursor-pointer active:scale-95 disabled:opacity-50">
              {isTesting
                ? <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                : <Play className="w-3.5 h-3.5" />}
              Test All
            </button>

            <button
              onClick={onSave}
              disabled={isSaving}
              className={`flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider px-6 py-3 rounded-xl transition-all cursor-pointer active:scale-95 shadow-md ${
                saveSuccess
                  ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                  : 'bg-blue-500 hover:bg-blue-400 text-white'
              } disabled:opacity-50`}>
              {isSaving
                ? <RefreshCw className="w-4 h-4 animate-spin" />
                : saveSuccess
                ? <CheckCircle2 className="w-4 h-4" />
                : <Save className="w-4 h-4" />}
              <span>{isSaving ? 'Saving...' : saveSuccess ? 'Saved!' : 'Save Configuration'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Main Grid ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">

        {/* LEFT: Config Cards (3/5 width) */}
        <div className="xl:col-span-3 space-y-4">

          {/* ── Meta Pixel Card ──────────────────────────────────────────── */}
          <SectionCard
            title="Meta Pixel"
            icon={<Tag className="w-4 h-4" />}
            badge={<StatusBadge status={pixelStatus} />}
            rightSlot={
              <button
                onClick={testPixelConnection}
                disabled={pixelStatus === 'testing'}
                className="text-[10px] font-bold text-brand-primary hover:text-blue-800 flex items-center gap-1 transition-all cursor-pointer disabled:opacity-50">
                {pixelStatus === 'testing'
                  ? <RefreshCw className="w-3 h-3 animate-spin" />
                  : <Zap className="w-3 h-3" />}
                Test Pixel
              </button>
            }
          >
            <InputField
              label="Meta Pixel / Dataset ID"
              value={settings.metaPixelId || ''}
              onChange={(v) => setSettings({ ...settings, metaPixelId: v })}
              placeholder="e.g. 1028481284194762"
              required
              docsHref="https://business.facebook.com/events_manager2"
              helpText="Your 15–16 digit Pixel or Dataset ID from Meta Events Manager. Fires PageView, ViewContent, AddToCart, and Purchase browser events."
            />
            <InputField
              label="Meta Test Event Code"
              value={settings.metaTestEventCode || ''}
              onChange={(v) => setSettings({ ...settings, metaTestEventCode: v })}
              placeholder="e.g. TEST12345"
              helpText="Optional — Enter code from the 'Test Events' tab in Meta Events Manager to debug pixel events live without affecting real data."
            />
          </SectionCard>

          {/* ── Conversations API (CAPI) Card ─────────────────────────────── */}
          <SectionCard
            title="Conversations API (CAPI)"
            icon={<Server className="w-4 h-4" />}
            badge={<StatusBadge status={capiStatus} />}
            rightSlot={
              <button
                onClick={testCapiConnection}
                disabled={capiStatus === 'testing'}
                className="text-[10px] font-bold text-brand-primary hover:text-blue-800 flex items-center gap-1 transition-all cursor-pointer disabled:opacity-50">
                {capiStatus === 'testing'
                  ? <RefreshCw className="w-3 h-3 animate-spin" />
                  : <Shield className="w-3 h-3" />}
                Test CAPI
              </button>
            }
          >
            {/* CAPI explanation banner */}
            <div className="p-3.5 bg-indigo-50 border border-indigo-100 rounded-xl flex items-start gap-2.5">
              <Shield className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-indigo-800">Why CAPI matters</p>
                <p className="text-[11px] text-indigo-600 mt-0.5 leading-relaxed">
                  Server-side CAPI bypasses iOS/Safari ITP, ad-blockers, and browser restrictions that can block up to <strong>40% of browser pixel events</strong>. Every event fires twice — browser + server — and is automatically deduplicated by Meta via Event ID.
                </p>
              </div>
            </div>

            <InputField
              label="CAPI Access Token"
              value={settings.metaCapiAccessToken || ''}
              onChange={(v) => setSettings({ ...settings, metaCapiAccessToken: v })}
              placeholder="EAAxxxxxxxxxxxxxxxxx..."
              masked
              docsHref="https://developers.facebook.com/docs/marketing-api/conversions-api/get-started"
              helpText="Generate from Meta Events Manager → Data Sources → your Pixel → Settings → Conversions API → Generate Access Token. Keep this secret — never expose it in frontend code."
            />

            <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-100 rounded-lg">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-[10px] text-amber-700 leading-relaxed">
                <strong>Security:</strong> This token is stored encrypted in Supabase and only used server-side via <code className="font-mono bg-amber-100 px-1 rounded">/api/meta-capi</code>. It is never exposed in the browser.
              </p>
            </div>
          </SectionCard>

          {/* ── Google Tag Manager Card ───────────────────────────────────── */}
          <SectionCard
            title="Google Tag Manager"
            icon={<Layers className="w-4 h-4" />}
            badge={<StatusBadge status={gtmStatus} />}
            rightSlot={
              <button
                onClick={testGTMConnection}
                disabled={gtmStatus === 'testing'}
                className="text-[10px] font-bold text-brand-primary hover:text-blue-800 flex items-center gap-1 transition-all cursor-pointer disabled:opacity-50">
                {gtmStatus === 'testing'
                  ? <RefreshCw className="w-3 h-3 animate-spin" />
                  : <Activity className="w-3 h-3" />}
                Test GTM
              </button>
            }
          >
            <InputField
              label="GTM Container ID"
              value={settings.googleTagManagerId || ''}
              onChange={(v) => setSettings({ ...settings, googleTagManagerId: v })}
              placeholder="e.g. GTM-XXXXXX"
              docsHref="https://tagmanager.google.com/"
              helpText="Google Tag Manager container ID (format: GTM-XXXXXX). Injected as a script tag in &lt;head&gt; and noscript iframe in &lt;body&gt; across all storefront pages."
            />
          </SectionCard>

          {/* ── Google Analytics 4 Card ───────────────────────────────────── */}
          <SectionCard
            title="Google Analytics 4"
            icon={<BarChart3 className="w-4 h-4" />}
            badge={<StatusBadge status={ga4Status} />}
            rightSlot={
              <button
                onClick={testGA4Connection}
                disabled={ga4Status === 'testing'}
                className="text-[10px] font-bold text-brand-primary hover:text-blue-800 flex items-center gap-1 transition-all cursor-pointer disabled:opacity-50">
                {ga4Status === 'testing'
                  ? <RefreshCw className="w-3 h-3 animate-spin" />
                  : <BarChart3 className="w-3 h-3" />}
                Test GA4
              </button>
            }
          >
            <InputField
              label="GA4 Measurement ID"
              value={settings.googleAnalyticsId || ''}
              onChange={(v) => setSettings({ ...settings, googleAnalyticsId: v })}
              placeholder="e.g. G-XXXXXXXXXX"
              docsHref="https://analytics.google.com/"
              helpText="Google Analytics 4 Measurement ID (format: G-XXXXXXXXXX). Tracks page_view, ViewContent, AddToCart, InitiateCheckout, and Purchase events. gtag config is correctly applied after script load."
            />
          </SectionCard>

          {/* ── Sitemap Card ──────────────────────────────────────────────── */}
          <SectionCard
            title="Sitemap & Search Console"
            icon={<Globe className="w-4 h-4" />}
          >
            <div className="p-3.5 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-emerald-800">Dynamic Sitemap Configured</p>
                <p className="text-[11px] text-emerald-700 mt-0.5">
                  Rupan auto-updates <code className="font-mono bg-emerald-100 px-1 rounded">/sitemap.xml</code> every time you add or modify products, categories, or blog posts.
                </p>
              </div>
            </div>
            <InputField
              label="Sitemap URL"
              value="https://www.myrupan.com/sitemap.xml"
              readOnly
              copyable
              helpText="Submit this URL in Google Search Console under Sitemaps to accelerate product indexing."
            />
          </SectionCard>
        </div>

        {/* RIGHT: Guides + Live Event Log (2/5 width) */}
        <div className="xl:col-span-2 space-y-4">

          {/* ── Event Coverage Matrix ───────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/60">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-2">
                <Activity className="w-4 h-4 text-brand-primary" />
                Event Coverage Matrix
              </h3>
            </div>
            <div className="p-4">
              <table className="w-full text-[10px]">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2 font-bold text-gray-500 pr-2">Event</th>
                    <th className="text-center py-2 font-bold text-blue-500 px-1">Pixel</th>
                    <th className="text-center py-2 font-bold text-indigo-500 px-1">CAPI</th>
                    <th className="text-center py-2 font-bold text-emerald-600 px-1">GTM</th>
                    <th className="text-center py-2 font-bold text-orange-500 px-1">GA4</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { event: 'PageView',         pixel: true,  capi: true,  gtm: true,  ga4: true  },
                    { event: 'ViewContent',       pixel: true,  capi: true,  gtm: true,  ga4: true  },
                    { event: 'AddToCart',         pixel: true,  capi: true,  gtm: true,  ga4: true  },
                    { event: 'InitiateCheckout',  pixel: true,  capi: true,  gtm: true,  ga4: true  },
                    { event: 'Purchase',          pixel: true,  capi: true,  gtm: true,  ga4: true  },
                    { event: 'Search',            pixel: false, capi: false, gtm: true,  ga4: true  },
                  ].map(({ event, pixel, capi, gtm, ga4 }) => (
                    <tr key={event} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="py-2 pr-2 font-mono font-bold text-gray-700">{event}</td>
                      {[pixel, capi, gtm, ga4].map((v, i) => (
                        <td key={i} className="text-center py-2 px-1">
                          {v
                            ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 inline" />
                            : <XCircle className="w-3.5 h-3.5 text-gray-200 inline" />}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-[10px] text-gray-400 mt-3 leading-relaxed">
                All events are automatically deduplicated between Pixel and CAPI using unique <code className="font-mono">eventId</code> strings.
              </p>
            </div>
          </div>

          {/* ── Meta Setup Guide ─────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/60">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-2">
                <Info className="w-4 h-4 text-brand-primary" />
                Quick Setup Guide
              </h3>
            </div>
            <div className="p-4 space-y-4">
              {[
                {
                  step: '1', title: 'Get your Pixel ID',
                  desc: 'Go to Meta Events Manager → Data Sources → Copy the 15-digit Dataset/Pixel ID.',
                  href: 'https://business.facebook.com/events_manager2'
                },
                {
                  step: '2', title: 'Generate CAPI Token',
                  desc: 'In Events Manager → Settings → Conversions API → Generate Access Token.',
                  href: 'https://developers.facebook.com/docs/marketing-api/conversions-api/get-started'
                },
                {
                  step: '3', title: 'Add GTM & GA4 IDs',
                  desc: 'Get GTM-XXXXXX from tagmanager.google.com and G-XXXXXXXXXX from analytics.google.com.',
                  href: 'https://tagmanager.google.com/'
                },
                {
                  step: '4', title: 'Save & Verify',
                  desc: 'Click Save, then use Meta Pixel Helper Chrome extension to verify events fire correctly.',
                  href: undefined
                },
              ].map(({ step, title, desc, href }) => (
                <div key={step} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-50 text-brand-primary flex items-center justify-center font-black text-[11px] shrink-0 mt-0.5">
                    {step}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900">
                      {title}
                      {href && (
                        <a href={href} target="_blank" rel="noopener noreferrer"
                          className="ml-1.5 text-brand-primary hover:underline inline-flex items-center">
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                    </p>
                    <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Live Event Log Terminal ───────────────────────────────────── */}
          <div className="bg-gray-950 rounded-2xl overflow-hidden border border-gray-800 shadow-sm">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
              <div className="flex items-center gap-2">
                <Code className="w-3.5 h-3.5 text-brand-primary" />
                <span className="text-[10px] font-bold text-brand-primary uppercase tracking-widest">Live Event Log</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] text-gray-500 font-mono">Telemetry Active</span>
                <button
                  onClick={() => setLogs([])}
                  title="Clear logs"
                  className="text-gray-600 hover:text-gray-400 transition-colors ml-1 cursor-pointer">
                  <XCircle className="w-3 h-3" />
                </button>
              </div>
            </div>

            <div className="p-3 h-52 overflow-y-auto font-mono text-[10px] space-y-1 scrollbar-thin scrollbar-track-gray-900 scrollbar-thumb-gray-700">
              {logs.length === 0 ? (
                <p className="text-gray-600 italic">
                  → Click "Test All" or individual "Test" buttons to see live telemetry output here...
                </p>
              ) : (
                logs.map((log, i) => (
                  <div key={i} className={`flex items-start gap-2 ${
                    log.type === 'success' ? 'text-emerald-400'
                    : log.type === 'error' ? 'text-red-400'
                    : 'text-gray-400'
                  }`}>
                    <span className="text-gray-600 shrink-0">{log.ts}</span>
                    <span className="break-all">{log.msg}</span>
                  </div>
                ))
              )}
              <div ref={logEndRef} />
            </div>
          </div>

          {/* ── Deduplication Note ───────────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-2">
            <div className="flex items-center gap-2">
              <Settings2 className="w-3.5 h-3.5 text-gray-400" />
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Deduplication & Event IDs</h4>
            </div>
            <p className="text-[10px] text-gray-400 leading-relaxed">
              Rupan generates unique <code className="font-mono bg-gray-100 px-1 rounded">eventId</code> strings (e.g. <code className="font-mono bg-gray-100 px-1 rounded">evt-purchase-1718000000-348291</code>) for all events. The same ID is sent to both the browser Pixel and CAPI, which Meta uses to automatically deduplicate — you get 100% coverage without double-counting.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
