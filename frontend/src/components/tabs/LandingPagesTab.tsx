import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, Edit, Trash2, Eye, Globe, Code, Save, X, 
  Layout, Monitor, Smartphone, ExternalLink, Copy,
  ChevronRight, Loader2, CheckCircle, Info, ChevronDown, ChevronUp,
  BookOpen, Sparkles
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import LandingPageGuideModal from './LandingPageGuideModal';

interface LandingPage {
  id: string;         // Full URL path e.g. /eid-sale
  title: string;
  content: string;    // Raw HTML/CSS/JS with metadata block
  status: 'published' | 'draft';
  seo_enabled: boolean;
  marketing_enabled: boolean;
  created_at?: string;
  updated_at?: string;
}

interface LandingPagesTabProps {
  storeDomain?: string;
}

const DEFAULT_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>My Landing Page</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', sans-serif; background: #fff; color: #111; }
    .hero { 
      min-height: 100vh; 
      display: flex; flex-direction: column; 
      align-items: center; justify-content: center; 
      background: linear-gradient(135deg, #ff5c00, #ff8c42);
      color: white; text-align: center; padding: 40px 20px;
    }
    .hero h1 { font-size: clamp(2rem, 6vw, 5rem); font-weight: 900; line-height: 1.1; margin-bottom: 1rem; }
    .hero p { font-size: 1.1rem; opacity: 0.9; max-width: 500px; margin-bottom: 2rem; }
    .btn { 
      display: inline-block; padding: 1rem 2.5rem;
      background: white; color: #ff5c00; 
      font-weight: 800; font-size: 1rem;
      border-radius: 50px; text-decoration: none;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .btn:hover { transform: translateY(-3px); box-shadow: 0 20px 40px rgba(0,0,0,0.2); }
  </style>
</head>
<body>
  <div class="hero">
    <h1>Your Landing Page Title</h1>
    <p>Add your compelling message here. This is fully editable with any HTML, CSS and JavaScript.</p>
    <a href="#" class="btn">Shop Now</a>
  </div>
</body>
</html>`;

export default function LandingPagesTab({ storeDomain = 'https://www.myrupan.com' }: LandingPagesTabProps) {
  const [pages, setPages] = useState<LandingPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState<'editor' | 'preview' | 'split'>('editor');
  const [deviceView, setDeviceView] = useState<'desktop' | 'mobile'>('desktop');
  const [editingPage, setEditingPage] = useState<LandingPage | null>(null);
  const [settings, setSettings] = useState<any>(null);

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formPath, setFormPath] = useState('');
  const [formContent, setFormContent] = useState(DEFAULT_TEMPLATE);
  const [formStatus, setFormStatus] = useState<'published' | 'draft'>('published');
  const [formSeoEnabled, setFormSeoEnabled] = useState(true);
  const [formMarketingEnabled, setFormMarketingEnabled] = useState(true);

  // Script & Final Code Modal state
  const [showScriptPreview, setShowScriptPreview] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);
  const [showFinalCodeModal, setShowFinalCodeModal] = useState(false);
  const [copiedFinalCode, setCopiedFinalCode] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);

  const previewRef = useRef<HTMLIFrameElement>(null);
  const codeRef = useRef<HTMLTextAreaElement>(null);
  const [saveMsg, setSaveMsg] = useState('');

  const ALL_PLACEHOLDERS = [
    { 
      key: 'RUPAN_META_PIXEL_ID', 
      aliases: ['META_PIXEL_ID', 'YOUR_PIXEL_ID', 'YOUR_PIXEL_ID_HERE', 'YOUR_FACEBOOK_PIXEL_ID', 'FB_PIXEL_ID'], 
      label: 'Meta Pixel ID', 
      checkRaw: (html: string) => html.includes('fbq(') || html.includes('fbevents.js') || html.includes('connect.facebook.net') 
    },
    { key: 'RUPAN_META_CAPI_TOKEN', aliases: ['META_CAPI_TOKEN', 'YOUR_CAPI_TOKEN'], label: 'Meta CAPI Access Token' },
    { key: 'RUPAN_META_TEST_CODE', aliases: ['META_TEST_CODE', 'YOUR_TEST_CODE'], label: 'Meta CAPI Test Code' },
    { key: 'RUPAN_GTM_ID', aliases: ['GTM_ID', 'YOUR_GTM_ID', 'YOUR_GTM_CONTAINER_ID'], label: 'Google Tag Manager ID', checkRaw: (html: string) => html.includes('gtm.js') },
    { key: 'RUPAN_GA4_ID', aliases: ['GA4_ID', 'YOUR_GA4_ID', 'YOUR_GA_ID'], label: 'Google Analytics 4 ID', checkRaw: (html: string) => html.includes('gtag/js') },
    { key: 'RUPAN_SUPABASE_URL', aliases: ['SUPABASE_URL', 'YOUR_SUPABASE_URL'], label: 'Supabase Database URL' },
    { key: 'RUPAN_SUPABASE_KEY', aliases: ['SUPABASE_KEY', 'YOUR_SUPABASE_KEY'], label: 'Supabase Anon Key' },
    { key: 'RUPAN_INSIDE_DHAKA_SHIPPING', aliases: [], label: 'Inside Dhaka Shipping Cost' },
    { key: 'RUPAN_OUTSIDE_DHAKA_SHIPPING', aliases: [], label: 'Outside Dhaka Shipping Cost' },
    { key: 'RUPAN_FREE_SHIPPING_MIN', aliases: [], label: 'Free Shipping Min Order' }
  ];

  const getPlaceholderAudit = () => {
    const found: any[] = [];
    const missing: any[] = [];
    for (const item of ALL_PLACEHOLDERS) {
      const hasKey = formContent.includes(item.key);
      const hasAlias = item.aliases && item.aliases.some((a: string) => formContent.includes(a));
      const hasRaw = item.checkRaw ? item.checkRaw(formContent) : false;
      const isAutoInjected = formMarketingEnabled && (
        (item.key === 'RUPAN_META_PIXEL_ID' && settings?.meta_pixel_id) ||
        (item.key === 'RUPAN_GTM_ID' && settings?.google_tag_manager_id) ||
        (item.key === 'RUPAN_GA4_ID' && settings?.google_analytics_id)
      );

      if (hasKey || hasAlias || hasRaw || isAutoInjected) {
        let matchedTag = item.key;
        if (hasAlias && !hasKey) matchedTag = item.aliases.find((a: string) => formContent.includes(a)) || item.key;
        if (hasRaw && !hasKey && !hasAlias) matchedTag = `${item.label} (Embedded Script Detected)`;
        if (isAutoInjected && !hasKey && !hasAlias && !hasRaw) matchedTag = `${item.label} (Auto-Injected by Rupan)`;

        found.push({ ...item, matchedTag });
      } else {
        missing.push(item);
      }
    }
    return { found, missing };
  };

  const getPreviewHtml = () => {
    let html = formContent;
    const pixelId = settings?.meta_pixel_id || 'MOCK_PIXEL_ID';
    const capiToken = settings?.meta_capi_access_token || 'MOCK_CAPI_TOKEN';
    const testCode = settings?.meta_test_event_code || 'TEST_CODE';
    const gtmId = settings?.google_tag_manager_id || 'GTM_ID';
    const gaId = settings?.google_analytics_id || 'GA4_ID';
    const insideDhaka = String(settings?.inside_dhaka_shipping || '60');
    const outsideDhaka = String(settings?.outside_dhaka_shipping || '120');
    const freeShippingMin = String(settings?.free_shipping_min_order || '3000');
    const banglaQrImage = settings?.payment_bangla_qr_image || 'https://psedkelwvpcxsmulgwry.supabase.co/storage/v1/object/public/banners/banglaqr-1794762015437.jpg';
    const bkashNumber = settings?.payment_bkash_number || '01600338318';
    const nagadNumber = settings?.payment_nagad_number || '01600338318';
    const whatsappNumber = settings?.whatsapp_number || '+8801974793083';

    html = html
      .replace(/RUPAN_META_PIXEL_ID|META_PIXEL_ID|YOUR_PIXEL_ID|YOUR_PIXEL_ID_HERE|YOUR_FACEBOOK_PIXEL_ID|FB_PIXEL_ID/g, pixelId)
      .replace(/RUPAN_META_CAPI_TOKEN|META_CAPI_TOKEN|YOUR_CAPI_TOKEN/g, capiToken)
      .replace(/RUPAN_META_TEST_CODE|META_TEST_CODE|YOUR_TEST_CODE/g, testCode)
      .replace(/RUPAN_GTM_ID|GTM_ID|YOUR_GTM_ID|YOUR_GTM_CONTAINER_ID/g, gtmId)
      .replace(/RUPAN_GA4_ID|GA4_ID|YOUR_GA4_ID|YOUR_GA_ID/g, gaId)
      .replace(/RUPAN_INSIDE_DHAKA_SHIPPING/g, insideDhaka)
      .replace(/RUPAN_OUTSIDE_DHAKA_SHIPPING/g, outsideDhaka)
      .replace(/RUPAN_FREE_SHIPPING_MIN/g, freeShippingMin)
      .replace(/RUPAN_BANGLA_QR_IMAGE/g, banglaQrImage)
      .replace(/RUPAN_BKASH_NUMBER/g, bkashNumber)
      .replace(/RUPAN_NAGAD_NUMBER/g, nagadNumber)
      .replace(/RUPAN_WHATSAPP_NUMBER/g, whatsappNumber)
      .replace(/RUPAN_STORE_DOMAIN/g, storeDomain || 'https://www.myrupan.com');

    // Get keys from window (or mock if offline/blank)
    const supUrl = (window as any).SUPABASE_URL || (window as any).location.origin || 'https://yourdomain.supabase.co';
    const supKey = (window as any).SUPABASE_ANON_KEY || 'mock-anon-key';
    
    html = html
      .replace(/RUPAN_SUPABASE_URL|SUPABASE_URL/g, supUrl)
      .replace(/RUPAN_SUPABASE_KEY|SUPABASE_KEY/g, supKey);
      
    // Inject Meta Pixel script if marketing enabled and not present
    if (formMarketingEnabled && settings?.meta_pixel_id && !html.includes('connect.facebook.net') && !html.includes(settings.meta_pixel_id)) {
      const metaPixelScript = `
<!-- Dynamic Meta Pixel Code (Preview) -->
<script>
  !function(f,b,e,v,n,t,s)
  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
  n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t,s)}(window, document,'script',
  'https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', '${settings.meta_pixel_id}');
  fbq('track', 'PageView');
</script>
<noscript><img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${settings.meta_pixel_id}&ev=PageView&noscript=1"/></noscript>
`;
      const headIdx = html.search(/<head>/i);
      if (headIdx !== -1) {
        html = html.slice(0, headIdx + 6) + metaPixelScript + html.slice(headIdx + 6);
      } else {
        html = metaPixelScript + html;
      }
    }

    return html;
  };

  // Fetch pages and global settings
  useEffect(() => {
    fetchPages();
    fetchSettings();
  }, []);

  // Keyboard shortcut listener for Esc key to close editor
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && editorOpen) {
        setEditorOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editorOpen]);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase.from('settings').select('*').maybeSingle();
      if (error) throw error;
      setSettings(data);
    } catch (err: any) {
      console.error('Failed to fetch settings:', err.message);
    }
  };

  const fetchPages = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .eq('category', '__landing_page__')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mapped: LandingPage[] = (data || []).map((r: any) => {
        let seoEnabled = true;
        let marketingEnabled = true;
        
        // Parse metadata block if exists
        const match = (r.content || '').match(/^<!-- metadata:\s*({.*?})\s*-->/s);
        if (match) {
          try {
            const parsed = JSON.parse(match[1]);
            seoEnabled = parsed.seoEnabled !== false;
            marketingEnabled = parsed.marketingEnabled !== false;
          } catch (e) {}
        }

        return {
          id: r.id,
          title: r.title,
          content: r.content,
          status: r.status || 'published',
          seo_enabled: seoEnabled,
          marketing_enabled: marketingEnabled,
          created_at: r.created_at,
          updated_at: r.updated_at
        };
      });
      setPages(mapped);
    } catch (err: any) {
      console.error('Failed to fetch landing pages:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const openNewPage = () => {
    setEditingPage(null);
    setFormTitle('');
    setFormPath('/my-landing-page');
    setFormContent(DEFAULT_TEMPLATE);
    setFormStatus('published');
    setFormSeoEnabled(true);
    setFormMarketingEnabled(true);
    setPreviewMode('editor');
    setEditorOpen(true);
  };

  const openEditPage = (page: LandingPage) => {
    setEditingPage(page);
    setFormTitle(page.title);
    setFormPath(page.id);
    
    // Strip layout and metadata comments when editing
    const cleanedHTML = (page.content || '')
      .replace(/^<!-- layout:\s*(blank|standard)\s*-->\s*/i, '')
      .replace(/^<!-- metadata:\s*({.*?})\s*-->\s*/is, '');
    
    setFormContent(cleanedHTML);
    setFormStatus(page.status);
    setFormSeoEnabled(page.seo_enabled);
    setFormMarketingEnabled(page.marketing_enabled);
    setPreviewMode('editor');
    setEditorOpen(true);
  };

  const handleSave = async () => {
    if (!formTitle.trim()) { alert('Please enter a page title'); return; }
    if (!formPath.trim()) { alert('Please enter a URL path'); return; }
    if (!formContent.trim()) { alert('Please paste your HTML content'); return; }

    // Normalize path
    let path = formPath.trim();
    if (!path.startsWith('/')) path = '/' + path;

    setSaving(true);
    try {
      // Serialize configuration metadata into a header comment block
      const metadata = {
        layout: 'blank',
        seoEnabled: formSeoEnabled,
        marketingEnabled: formMarketingEnabled
      };
      
      const cleanedHTML = formContent
        .replace(/^<!-- layout:\s*(blank|standard)\s*-->\s*/i, '')
        .replace(/^<!-- metadata:\s*({.*?})\s*-->\s*/is, '');
        
      const finalContent = `<!-- metadata: ${JSON.stringify(metadata)} -->\n${cleanedHTML}`;

      const payload = {
        id: path,
        title: formTitle.trim(),
        content: finalContent,
        category: '__landing_page__',
        status: formStatus,
        excerpt: '',
        image: '',
        read_time: null,
        seo_title: null,
        seo_description: null
      };

      if (editingPage) {
        if (editingPage.id !== path) {
          const { error: delErr } = await supabase.from('blogs').delete().eq('id', editingPage.id).select();
          if (delErr) console.warn('Could not delete old path:', delErr.message);
        }
        const { data, error } = await supabase.from('blogs').upsert([payload], { onConflict: 'id' }).select();
        if (error) throw error;
        if (!data || data.length === 0) {
          throw new Error('Database update returned empty result. Failed to save changes.');
        }
        setPages(prev => prev.map(p => p.id === editingPage.id ? { 
          ...p, 
          id: path,
          title: formTitle.trim(),
          content: finalContent,
          status: formStatus,
          seo_enabled: formSeoEnabled,
          marketing_enabled: formMarketingEnabled
        } : p));
        setSaveMsg('Landing page updated successfully!');
      } else {
        // Check for duplicate
        if (pages.some(p => p.id === path)) {
          alert('A page with this URL path already exists!');
          setSaving(false);
          return;
        }
        const { data, error } = await supabase.from('blogs').upsert([payload], { onConflict: 'id' }).select();
        if (error) throw error;
        if (!data || data.length === 0) {
          throw new Error('Database insert returned empty result. Failed to create page.');
        }
        const newPage: LandingPage = { 
          id: path, 
          title: formTitle.trim(), 
          content: finalContent, 
          status: formStatus,
          seo_enabled: formSeoEnabled,
          marketing_enabled: formMarketingEnabled
        };
        setPages(prev => [newPage, ...prev]);
        setSaveMsg('Landing page created successfully!');
      }

      setTimeout(() => setSaveMsg(''), 3000);
    } catch (err: any) {
      alert('Error saving page: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this landing page permanently?')) return;
    try {
      let { data, error } = await supabase.from('blogs').delete().eq('id', id).select();

      if (!error && (!data || data.length === 0)) {
        const altId = id.startsWith('/') ? id.substring(1) : '/' + id;
        const res = await supabase.from('blogs').delete().eq('id', altId).select();
        data = res.data;
        error = res.error;
      }

      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('Deletion failed: Record was not found in database or permission was denied.');
      }
      setPages(prev => prev.filter(p => p.id !== id && p.id !== (id.startsWith('/') ? id.substring(1) : '/' + id)));
      alert('Landing page deleted successfully!');
    } catch (err: any) {
      alert('Error deleting page: ' + err.message);
    }
  };

  const handleTabKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const ta = e.currentTarget;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const newVal = formContent.substring(0, start) + '  ' + formContent.substring(end);
      setFormContent(newVal);
      setTimeout(() => { ta.selectionStart = ta.selectionEnd = start + 2; }, 0);
    }
  };

  // Generate code snippet to preview what scripts are injected
  const getMarketingScriptPreview = () => {
    if (!settings) return '<!-- Settings not loaded yet -->';
    const gtmId = settings.google_tag_manager_id;
    const gaId = settings.google_analytics_id;
    const pixelId = settings.meta_pixel_id;

    let code = `<!-- INJECTED IN HEAD -->\n`;
    if (formSeoEnabled) {
      code += `<!-- Meta tags for title, description, and OpenGraph tags -->\n`;
    }
    if (gtmId) {
      code += `<!-- GTM Script -->\n<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});...})(window,document,'script','dataLayer','${gtmId}');</script>\n`;
    }
    if (gaId) {
      code += `<!-- Google Analytics -->\n<script async src="https://www.googletagmanager.com/gtag/js?id=${gaId}"></script>\n<script>gtag('config', '${gaId}');</script>\n`;
    }
    if (pixelId) {
      code += `<!-- Meta Pixel -->\n<script>fbq('init', '${pixelId}'); fbq('track', 'PageView');</script>\n`;
    }
    if (settings.header_script) {
      code += `<!-- Custom Header Script -->\n${settings.header_script}\n`;
    }
    
    code += `\n<!-- INJECTED IN BODY -->\n`;
    if (gtmId) {
      code += `<!-- GTM Noscript iframe -->\n<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${gtmId}" ...></iframe></noscript>\n`;
    }
    if (pixelId) {
      code += `<!-- Meta Pixel Noscript image -->\n<noscript><img src="https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1" .../></noscript>\n`;
    }
    if (settings.footer_script) {
      code += `<!-- Custom Footer Script -->\n${settings.footer_script}\n`;
    }

    return code;
  };

  const copyScriptToClipboard = () => {
    navigator.clipboard.writeText(getMarketingScriptPreview());
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  const liveUrl = (path: string) => `${storeDomain}${path}`;

  if (editorOpen) {
    return (
      <div className="flex flex-col h-[calc(100vh-120px)] animate-in fade-in slide-in-from-bottom-3 duration-300">
        {/* Editor toolbar */}
        <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200 shrink-0 gap-3 flex-wrap">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <button
              onClick={() => setEditorOpen(false)}
              className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all cursor-pointer shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="h-5 w-px bg-gray-200" />
            <div className="flex flex-col min-w-0">
              <input
                type="text"
                value={formTitle}
                onChange={e => setFormTitle(e.target.value)}
                placeholder="Page Title..."
                className="text-sm font-bold text-gray-900 bg-transparent border-none outline-none focus:ring-0 p-0 placeholder-gray-300 min-w-0 w-full"
              />
              <div className="flex items-center gap-1.5">
                <Globe className="w-3 h-3 text-gray-400 shrink-0" />
                <input
                  type="text"
                  value={formPath}
                  onChange={e => setFormPath(e.target.value)}
                  placeholder="/url-path"
                  className="text-[11px] font-mono text-brand-primary bg-transparent border-none outline-none focus:ring-0 p-0 w-full min-w-0"
                />
              </div>
            </div>
          </div>

          {/* Configuration Checkboxes */}
          <div className="flex items-center gap-4 bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-xl text-[11px] font-bold text-gray-600">
            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={formSeoEnabled}
                onChange={e => setFormSeoEnabled(e.target.checked)}
                className="rounded border-gray-300 text-brand-primary focus:ring-brand-primary cursor-pointer w-3.5 h-3.5"
              />
              <span>Enable SEO Tools</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={formMarketingEnabled}
                onChange={e => setFormMarketingEnabled(e.target.checked)}
                className="rounded border-gray-300 text-brand-primary focus:ring-brand-primary cursor-pointer w-3.5 h-3.5"
              />
              <span>Enable Marketing Tools</span>
            </label>
            {formMarketingEnabled && (
              <button
                onClick={() => setShowScriptPreview(!showScriptPreview)}
                className="text-brand-primary hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                <Code className="w-3.5 h-3.5" />
                <span>Injected Script Preview</span>
              </button>
            )}
            <button
              onClick={() => setShowFinalCodeModal(true)}
              className="bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primary px-2.5 py-1 rounded-lg flex items-center gap-1 font-bold text-[10px] uppercase transition-all cursor-pointer"
              title="View full output HTML code with all injected scripts and replaced variables"
            >
              <Code className="w-3.5 h-3.5" />
              <span>Show Final Compiled Code</span>
            </button>
            <button
              onClick={() => setShowGuideModal(true)}
              className="bg-orange-50 hover:bg-orange-100 text-orange-600 border border-orange-200 px-2.5 py-1 rounded-lg flex items-center gap-1 font-bold text-[10px] uppercase transition-all cursor-pointer"
              title="View full guidelines, dynamic variables table, and AI prompt"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>গাইড ও AI প্রম্পট</span>
            </button>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* View mode switcher */}
            <div className="hidden sm:flex bg-gray-100 rounded-lg p-0.5 text-[10px] font-bold">
              {(['editor', 'split', 'preview'] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => setPreviewMode(mode)}
                  className={`px-3 py-1.5 rounded-md transition-all cursor-pointer uppercase tracking-wider ${previewMode === mode ? 'bg-white text-brand-primary shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  {mode === 'editor' ? <><Code className="w-3 h-3 inline mr-1" />Code</> : mode === 'preview' ? <><Eye className="w-3 h-3 inline mr-1" />Preview</> : <><Layout className="w-3 h-3 inline mr-1" />Split</>}
                </button>
              ))}
            </div>

            {/* Device view */}
            {previewMode !== 'editor' && (
              <div className="hidden sm:flex bg-gray-100 rounded-lg p-0.5">
                <button onClick={() => setDeviceView('desktop')} className={`p-1.5 rounded-md transition-all cursor-pointer ${deviceView === 'desktop' ? 'bg-white shadow-sm text-brand-primary' : 'text-gray-400'}`}><Monitor className="w-3.5 h-3.5" /></button>
                <button onClick={() => setDeviceView('mobile')} className={`p-1.5 rounded-md transition-all cursor-pointer ${deviceView === 'mobile' ? 'bg-white shadow-sm text-brand-primary' : 'text-gray-400'}`}><Smartphone className="w-3.5 h-3.5" /></button>
              </div>
            )}

            {/* Status */}
            <select
              value={formStatus}
              onChange={e => setFormStatus(e.target.value as any)}
              className="text-[11px] font-bold border border-gray-200 rounded-lg px-2 py-1.5 text-gray-600 cursor-pointer bg-white"
            >
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>

            {/* Save */}
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 bg-brand-primary text-white text-[11px] font-bold uppercase tracking-wider px-4 py-2 rounded-lg hover:bg-blue-900 transition-all cursor-pointer shadow-md disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              {saving ? 'Saving...' : 'Save'}
            </button>

            {saveMsg && (
              <span className="flex items-center gap-1 text-green-600 text-[11px] font-bold">
                <CheckCircle className="w-3.5 h-3.5" />{saveMsg}
              </span>
            )}
          </div>
        </div>

        {/* Script preview collapsible drawer */}
        {showScriptPreview && formMarketingEnabled && (
          <div className="bg-gray-900 text-gray-100 p-4 border-b border-gray-800 flex flex-col shrink-0 max-h-60 overflow-y-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-300 uppercase tracking-widest flex items-center gap-1.5">
                <Info className="w-4 h-4 text-brand-primary" />
                Dynamic Script Injection Preview
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={copyScriptToClipboard}
                  className="bg-gray-800 hover:bg-gray-700 text-gray-300 text-[10px] font-bold uppercase px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {copiedScript ? 'Copied!' : 'Copy Code'}
                </button>
                <button
                  onClick={() => setShowScriptPreview(false)}
                  className="text-gray-400 hover:text-gray-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <p className="text-[10px] text-gray-400 mb-2">
              Rupan will automatically inject the following tags into your page head/body. Any update to meta pixels or tracking codes in Settings will automatically be reflected here instantly.
            </p>
            <pre className="text-[10px] font-mono bg-gray-950 p-3 rounded-lg overflow-x-auto text-green-400">
              {getMarketingScriptPreview()}
            </pre>
          </div>
        )}

        {/* Instructions and Variable Audit Panel */}
        <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 grid grid-cols-1 lg:grid-cols-2 gap-4 shrink-0 text-xs text-gray-700">
          
          {/* Instructions Box */}
          <div className="space-y-1 bg-white p-3.5 rounded-xl border border-gray-100 shadow-sm">
            <h4 className="font-bold text-gray-900 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-brand-primary" />
              ল্যান্ডিং পেজ ভেরিয়েবল গাইড (Instructions)
            </h4>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              আপনার এইচটিএমএল কোডের যেখানে যেখানে আইডি/কনফিগারেশন বসানো দরকার, সেখানে সরাসরি নিচের ভেরিয়েবল বা প্লেসহোল্ডারগুলো ব্যবহার করুন। ভিজিটর পেজ লোড করার সময় সার্ভার স্বয়ংক্রিয়ভাবে এগুলো আপনার আসল সেটিংস দিয়ে রিপ্লেস করে দেবে।
            </p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 pt-2 text-[10px] font-mono text-gray-600">
              <div><span className="font-bold text-brand-primary">RUPAN_META_PIXEL_ID</span>: Pixel ID</div>
              <div><span className="font-bold text-brand-primary">RUPAN_SUPABASE_URL</span>: DB URL</div>
              <div><span className="font-bold text-brand-primary">RUPAN_SUPABASE_KEY</span>: DB Key</div>
              <div><span className="font-bold text-brand-primary">RUPAN_GTM_ID</span>: GTM Container ID</div>
              <div><span className="font-bold text-brand-primary">RUPAN_GA4_ID</span>: GA4 ID</div>
              <div><span className="font-bold text-brand-primary font-sans">অন্যান্য:</span> <code>RUPAN_INSIDE_DHAKA_SHIPPING</code>, <code>RUPAN_OUTSIDE_DHAKA_SHIPPING</code>, <code>RUPAN_FREE_SHIPPING_MIN</code>, <code>RUPAN_META_TEST_CODE</code></div>
            </div>
            <div className="pt-2 border-t border-gray-100 mt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowGuideModal(true)}
                className="text-[11px] font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>সম্পূর্ণ গাইডলাইন, ভেরিয়েবল টেবিল, AI প্রম্পট ও ডেমো কোড দেখুন &rarr;</span>
              </button>
            </div>
          </div>

          {/* Variables Audit Check */}
          <div className="space-y-2 bg-white p-3.5 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
            <div>
              <h4 className="font-bold text-gray-900 flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                কোড ভেরিয়েবল অডিট (Live Code Check)
              </h4>
              <p className="text-[10px] text-gray-500">কোড লিখার পর এখানে চেক করুন কোন ভেরিয়েবলগুলো পাওয়া গেছে:</p>
            </div>
            
            <div className="space-y-1.5">
              {/* Found list */}
              {getPlaceholderAudit().found.length > 0 && (
                <div className="flex flex-wrap gap-1.5 items-center">
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md shrink-0">পেয়েছি ({getPlaceholderAudit().found.length}):</span>
                  {getPlaceholderAudit().found.map(item => (
                    <span key={item.key} title={item.label} className="font-mono text-[9px] bg-gray-100 hover:bg-gray-200 text-gray-800 px-1.5 py-0.5 rounded border border-gray-200 transition-colors">
                      {item.key}
                    </span>
                  ))}
                </div>
              )}

              {/* Missing list */}
              {getPlaceholderAudit().missing.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 items-center">
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md shrink-0">পাইনি ({getPlaceholderAudit().missing.length}):</span>
                  {getPlaceholderAudit().missing.map(item => (
                    <span key={item.key} title={item.label} className="font-mono text-[9px] bg-red-50 text-red-600 px-1.5 py-0.5 rounded border border-red-100 text-center select-all">
                      {item.key}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" /> অভিনন্দন! সবকটি ভেরিয়েবল কোডে পাওয়া গেছে।
                </div>
              )}
            </div>
            
            <p className="text-[9px] text-gray-400 italic">
              *যেসব ভেরিয়েবল ব্যবহার করবেন না, সেগুলোর সংশ্লিষ্ট ফিচার বা সিস্টেম ল্যান্ডিং পেজে নিষ্ক্রিয় থাকবে।
            </p>
          </div>
        </div>

        {/* Editor + Preview */}
        <div className={`flex-1 flex min-h-0 ${previewMode === 'split' ? 'flex-row' : 'flex-col'}`}>
          {/* Code editor pane */}
          {(previewMode === 'editor' || previewMode === 'split') && (
            <div className={`flex flex-col min-h-0 ${previewMode === 'split' ? 'w-1/2 border-r border-gray-200' : 'flex-1'}`}>
              <div className="flex items-center justify-between px-4 py-2 bg-gray-900 shrink-0">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                  <span className="ml-2 text-[10px] text-gray-400 font-mono">index.html</span>
                </div>
                <span className="text-[10px] text-gray-500 font-mono">{formContent.length.toLocaleString()} chars</span>
              </div>
              <textarea
                ref={codeRef}
                value={formContent}
                onChange={e => setFormContent(e.target.value)}
                onKeyDown={handleTabKey}
                spellCheck={false}
                placeholder="Paste your full HTML, CSS, and JavaScript here..."
                className="flex-1 bg-gray-950 text-gray-100 text-xs font-mono p-4 resize-none outline-none leading-relaxed min-h-0 overflow-auto"
                style={{ tabSize: 2 }}
              />
            </div>
          )}

          {/* Preview pane */}
          {(previewMode === 'preview' || previewMode === 'split') && (
            <div className={`flex flex-col min-h-0 bg-gray-100 ${previewMode === 'split' ? 'w-1/2' : 'flex-1'}`}>
              <div className="flex items-center justify-between px-4 py-2 bg-gray-200 shrink-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Live Preview</span>
                {formPath && (
                  <a
                    href={liveUrl(formPath)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-[10px] font-bold text-brand-primary hover:underline"
                  >
                    <ExternalLink className="w-3 h-3" />Open Live
                  </a>
                )}
              </div>
              <div className="flex-1 w-full min-h-0 p-4 relative bg-gray-100 overflow-auto flex items-center justify-center">
                <iframe
                  title="Landing Page Preview"
                  srcDoc={getPreviewHtml()}
                  className={`bg-white shadow-xl border border-gray-300 rounded-lg transition-all duration-300 ${deviceView === 'mobile' ? 'w-[375px] h-[667px] shrink-0' : 'w-full h-full absolute inset-4 w-[calc(100%-32px)] h-[calc(100%-32px)]'}`}
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                />
              </div>
            </div>
          )}
        </div>

        {/* FINAL COMPILED CODE MODAL */}
        {showFinalCodeModal && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-zinc-900 text-white rounded-3xl w-full max-w-4xl max-h-[85vh] flex flex-col p-6 space-y-4 border border-zinc-800 shadow-2xl animate-in zoom-in-95 duration-150">
              <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <Code className="w-5 h-5 text-brand-primary" />
                  <div>
                    <h3 className="font-extrabold text-sm uppercase tracking-wide">Final Compiled HTML Code</h3>
                    <p className="text-[10px] text-zinc-400 font-mono">Output HTML with replaced variables & injected scripts</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(getPreviewHtml());
                      setCopiedFinalCode(true);
                      setTimeout(() => setCopiedFinalCode(false), 2000);
                    }}
                    className="bg-brand-primary hover:bg-blue-600 text-white text-[10px] font-bold uppercase px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    {copiedFinalCode ? 'Copied to Clipboard!' : 'Copy Final HTML'}
                  </button>
                  <button
                    onClick={() => setShowFinalCodeModal(false)}
                    className="p-1.5 text-zinc-400 hover:text-white rounded-lg cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <p className="text-[11px] text-zinc-400">
                This is the exact final HTML document served to your visitors — including replaced variables (<code className="text-green-400">META_PIXEL_ID</code>, <code className="text-green-400">YOUR_PIXEL_ID</code>, <code className="text-green-400">SUPABASE_URL</code>, etc.), injected Meta Pixel scripts, GTM, GA4, and custom header/footer scripts.
              </p>
              <textarea
                readOnly
                value={getPreviewHtml()}
                className="flex-1 bg-zinc-950 text-green-400 font-mono text-xs p-4 rounded-2xl border border-zinc-800 focus:outline-none resize-none overflow-y-auto leading-relaxed min-h-[350px]"
              />
            </div>
          </div>
        )}

        {/* GUIDE MODAL */}
        <LandingPageGuideModal
          isOpen={showGuideModal}
          onClose={() => setShowGuideModal(false)}
          onLoadDemoTemplate={(code) => {
            setFormContent(code);
          }}
        />
      </div>
    );
  }

  // --- List View ---
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
      {/* Header */}
      <div className="flex justify-between items-start gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
            <Layout className="w-6 h-6 text-brand-primary" />
            Landing Pages
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Create standalone HTML/CSS/JS landing pages with any URL path. Paste any advanced page builder code here.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowGuideModal(true)}
            className="bg-white border border-gray-200 hover:border-orange-500 text-gray-700 hover:text-orange-600 text-xs font-bold px-4 py-3 rounded-xl flex items-center space-x-2 transition-all cursor-pointer shadow-xs"
          >
            <BookOpen className="w-4 h-4 text-orange-500" />
            <span>ল্যান্ডিং পেজ ও AI গাইড</span>
          </button>
          <button
            onClick={openNewPage}
            className="bg-brand-primary text-white text-xs font-bold uppercase tracking-wider px-5 py-3 rounded-xl flex items-center space-x-2 hover:bg-blue-900 transition-all cursor-pointer shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>New Landing Page</span>
          </button>
        </div>
      </div>

      {/* Info banner */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-start gap-3">
        <Code className="w-5 h-5 text-brand-primary shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-xs font-bold text-brand-primary">Fully Custom HTML/CSS/JS Landing Pages</p>
          <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
            Paste complete HTML documents here including CSS and JavaScript. Pages are rendered in an isolated sandbox — 
            your custom code won't conflict with Rupan's styling. Set any URL path (e.g. <code className="bg-blue-100 px-1 rounded font-mono">/eid-sale</code>, <code className="bg-blue-100 px-1 rounded font-mono">/campaign</code>).
            <button 
              onClick={() => setShowGuideModal(true)} 
              className="ml-2 text-brand-primary font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <span>সিস্টেম গাইডলাইন, ভেরিয়েবল টেবিল ও ডেমো কোড দেখুন &rarr;</span>
            </button>
          </p>
        </div>
      </div>

      {/* Pages list */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-6 h-6 animate-spin text-brand-primary" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-[10px] uppercase tracking-wider text-gray-400 font-bold">
                <th className="p-4">Title</th>
                <th className="p-4">URL Path</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-center">SEO / Marketing</th>
                <th className="p-4 text-center">Code Size</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-xs">
              {pages.map((page) => (
                <tr key={page.id} className="hover:bg-gray-50/50">
                  <td className="p-4">
                    <div className="font-bold text-zinc-900">{page.title}</div>
                    <div className="text-[10px] text-gray-400 mt-0.5">Landing Page</div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <code className="text-[11px] font-mono bg-gray-50 border border-gray-200 px-2 py-0.5 rounded text-brand-primary">
                        {page.id}
                      </code>
                      <a
                        href={liveUrl(page.id)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-brand-primary transition-colors cursor-pointer"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <span className={`px-2 py-1 rounded font-bold uppercase text-[9px] border ${
                      page.status === 'draft' 
                        ? 'bg-yellow-50 text-yellow-700 border-yellow-200' 
                        : 'bg-green-50 text-green-700 border-green-200'
                    }`}>
                      {page.status}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <span className={`text-[9px] px-1.5 py-0.5 font-bold rounded ${page.seo_enabled ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' : 'bg-gray-100 text-gray-400'}`}>
                        SEO
                      </span>
                      <span className={`text-[9px] px-1.5 py-0.5 font-bold rounded ${page.marketing_enabled ? 'bg-teal-50 text-teal-600 border border-teal-100' : 'bg-gray-100 text-gray-400'}`}>
                        MKT
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-center text-gray-500 font-mono text-[11px]">
                    {(page.content?.length / 1024).toFixed(1)} KB
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <a
                        href={liveUrl(page.id)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-zinc-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all cursor-pointer"
                        title="Open live page"
                      >
                        <Eye className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => openEditPage(page)}
                        className="p-1.5 text-zinc-500 hover:text-brand-primary hover:bg-gray-100 rounded-lg transition-all cursor-pointer"
                        title="Edit page"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(page.id)}
                        className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                        title="Delete page"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {pages.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-12 text-center">
                    <Layout className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                    <p className="text-sm font-bold text-gray-400">No landing pages yet</p>
                    <p className="text-xs text-gray-300 mt-1">Click "New Landing Page" to create your first custom page</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* GUIDE MODAL (LIST VIEW) */}
      <LandingPageGuideModal
        isOpen={showGuideModal}
        onClose={() => setShowGuideModal(false)}
        onLoadDemoTemplate={(code) => {
          setEditingPage(null);
          setFormTitle('A9 Pro ANC Earbuds Offer');
          setFormPath('/a9-pro');
          setFormContent(code);
          setFormStatus('published');
          setFormSeoEnabled(true);
          setFormMarketingEnabled(true);
          setPreviewMode('editor');
          setEditorOpen(true);
        }}
      />
    </div>
  );
}
