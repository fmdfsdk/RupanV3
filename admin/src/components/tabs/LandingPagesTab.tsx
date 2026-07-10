import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, Edit, Trash2, Eye, Globe, Code, Save, X, 
  Layout, Monitor, Smartphone, ExternalLink, Copy,
  ChevronRight, Loader2, CheckCircle
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface LandingPage {
  id: string;         // Full URL path e.g. /eid-sale
  title: string;
  content: string;    // Raw HTML/CSS/JS
  status: 'published' | 'draft';
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

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formPath, setFormPath] = useState('');
  const [formContent, setFormContent] = useState(DEFAULT_TEMPLATE);
  const [formStatus, setFormStatus] = useState<'published' | 'draft'>('published');

  const previewRef = useRef<HTMLIFrameElement>(null);
  const codeRef = useRef<HTMLTextAreaElement>(null);

  const [saveMsg, setSaveMsg] = useState('');

  // Fetch pages from the blogs table (with a special marker in category)
  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .eq('category', '__landing_page__')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mapped: LandingPage[] = (data || []).map((r: any) => ({
        id: r.id,
        title: r.title,
        content: r.content,
        status: r.status || 'published',
        created_at: r.created_at,
        updated_at: r.updated_at
      }));
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
    setPreviewMode('editor');
    setEditorOpen(true);
  };

  const openEditPage = (page: LandingPage) => {
    setEditingPage(page);
    setFormTitle(page.title);
    setFormPath(page.id);
    setFormContent(page.content);
    setFormStatus(page.status);
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
      const payload = {
        id: path,
        title: formTitle.trim(),
        content: formContent,
        category: '__landing_page__',
        status: formStatus,
        excerpt: '',
        image: '',
        read_time: null,
        seo_title: null,
        seo_description: null
      };

      if (editingPage) {
        const { error } = await supabase.from('blogs').update(payload).eq('id', editingPage.id);
        if (error) throw error;
        setPages(prev => prev.map(p => p.id === editingPage.id ? { ...p, ...payload } : p));
        setSaveMsg('Landing page updated!');
      } else {
        // Check for duplicate
        if (pages.some(p => p.id === path)) {
          alert('A page with this URL path already exists!');
          setSaving(false);
          return;
        }
        const { error } = await supabase.from('blogs').insert([payload]);
        if (error) throw error;
        const newPage: LandingPage = { id: path, title: formTitle, content: formContent, status: formStatus };
        setPages(prev => [newPage, ...prev]);
        setSaveMsg('Landing page created!');
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
      const { error } = await supabase.from('blogs').delete().eq('id', id);
      if (error) throw error;
      setPages(prev => prev.filter(p => p.id !== id));
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
              <div className={`flex-1 flex items-center justify-center p-4 min-h-0 overflow-auto`}>
                <iframe
                  title="Landing Page Preview"
                  srcDoc={formContent}
                  className={`bg-white shadow-xl border border-gray-300 rounded-lg transition-all duration-300 ${deviceView === 'mobile' ? 'w-[375px] h-[667px]' : 'w-full h-full'}`}
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- List View ---
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
            <Layout className="w-6 h-6 text-brand-primary" />
            Landing Pages
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Create standalone HTML/CSS/JS landing pages with any URL path. Paste any advanced page builder code here.
          </p>
        </div>
        <button
          onClick={openNewPage}
          className="bg-brand-primary text-white text-xs font-bold uppercase tracking-wider px-5 py-3 rounded-xl flex items-center space-x-2 hover:bg-blue-900 transition-all cursor-pointer shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>New Landing Page</span>
        </button>
      </div>

      {/* Info banner */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-start gap-3">
        <Code className="w-5 h-5 text-brand-primary shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-bold text-brand-primary">Fully Custom HTML/CSS/JS Landing Pages</p>
          <p className="text-xs text-gray-500 mt-0.5">
            Paste complete HTML documents here including CSS and JavaScript. Pages are rendered in an isolated sandbox — 
            your custom code won't conflict with Rupan's styling. Set any URL path (e.g. <code className="bg-blue-100 px-1 rounded font-mono">/eid-sale</code>, <code className="bg-blue-100 px-1 rounded font-mono">/campaign</code>).
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
                  <td colSpan={5} className="p-12 text-center">
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
    </div>
  );
}
