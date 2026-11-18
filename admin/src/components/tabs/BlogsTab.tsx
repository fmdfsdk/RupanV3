import React, { useState } from 'react';
import { Plus, Edit, Trash2, ExternalLink, BookOpen, Layers, Rocket, Sparkles } from 'lucide-react';
import { BlogPost } from '../../types';
import LandingPageGuideModal from './LandingPageGuideModal';

interface BlogsTabProps {
  blogs: BlogPost[];
  products?: any[];
  onOpenBlogForm: (blog: BlogPost | null, isLandingPage?: boolean, initialContent?: string) => void;
  onDeleteBlog: (id: string) => void;
}

export default function BlogsTab({ blogs, products = [], onOpenBlogForm, onDeleteBlog }: BlogsTabProps) {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'articles' | 'landing'>('all');
  const [showGuideModal, setShowGuideModal] = useState(false);

  const filteredBlogs = blogs.filter((b) => {
    const isLanding = b.category === '__landing_page__';
    if (selectedFilter === 'articles') return !isLanding;
    if (selectedFilter === 'landing') return isLanding;
    return true;
  });

  const landingCount = blogs.filter(b => b.category === '__landing_page__').length;
  const articleCount = blogs.filter(b => b.category !== '__landing_page__').length;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-zinc-900 uppercase flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-brand-primary" />
            Blogs & Campaign Landing Pages
          </h1>
          <p className="text-xs text-gray-500 font-medium">Manage all journal articles, campaign pages, and custom HTML landing pages in one place.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowGuideModal(true)}
            className="bg-white border-2 border-orange-500 hover:bg-orange-50 text-orange-600 text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-xl flex items-center space-x-2 transition-all cursor-pointer shadow-xs"
            title="Open Landing Page Architecture, Dynamic Variables Table, and AI Prompt Guide"
          >
            <BookOpen className="w-4 h-4 text-orange-500" />
            <span>📘 ল্যান্ডিং পেজ ও AI গাইড</span>
          </button>
          <button
            onClick={() => onOpenBlogForm(null, false)}
            className="bg-zinc-900 text-white text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-xl flex items-center space-x-2 hover:bg-black transition-all cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>New Blog Article</span>
          </button>
          <button
            onClick={() => onOpenBlogForm(null, true)}
            className="bg-[#ff5c00] text-white text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-xl flex items-center space-x-2 hover:bg-orange-600 transition-all cursor-pointer shadow-md"
          >
            <Rocket className="w-4 h-4" />
            <span>New Campaign Page</span>
          </button>
        </div>
      </div>

      {/* Campaign Landing Pages Banner */}
      <div className="bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50/50 border border-orange-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-orange-500/15 text-orange-600 flex items-center justify-center shrink-0 mt-0.5">
            <Rocket className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-zinc-900">ডাইনামিক ক্যাম্পেইন ও প্রোডাক্ট ল্যান্ডিং পেজ ইঞ্জিন</h4>
            <p className="text-[11px] text-zinc-600 mt-0.5 leading-relaxed">
              যেকোনো নির্দিষ্ট প্রোডাক্ট বা অফারের জন্য কাস্টম HTML/CSS ল্যান্ডিং পেজ তৈরি করতে পারবেন। এতে ডাইনামিক মেটা পিক্সেল, শিপিং চার্জ এবং সরাসরি ডাটাবেজ অর্ডার সাবমিশন সাপোর্ট রয়েছে।
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowGuideModal(true)}
          className="bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-sm shadow-orange-200"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>গাইডলাইন, ভেরিয়েবল ও ডেমো কোড &rarr;</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-3 text-xs font-bold">
        <button
          onClick={() => setSelectedFilter('all')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
            selectedFilter === 'all'
              ? 'bg-brand-primary text-white shadow-xs'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>All Content ({blogs.length})</span>
        </button>

        <button
          onClick={() => setSelectedFilter('articles')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
            selectedFilter === 'articles'
              ? 'bg-brand-primary text-white shadow-xs'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Style Journal ({articleCount})</span>
        </button>

        <button
          onClick={() => setSelectedFilter('landing')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
            selectedFilter === 'landing'
              ? 'bg-[#ff5c00] text-white shadow-xs'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Rocket className="w-3.5 h-3.5" />
          <span>Campaign Landing Pages ({landingCount})</span>
        </button>
      </div>

      {/* Table list */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-[10px] uppercase tracking-wider text-gray-400 font-bold">
                <th className="p-4 w-24">Banner</th>
                <th className="p-4">Title & Target URL Slug</th>
                <th className="p-4 text-center">Type</th>
                <th className="p-4 text-center">Category</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-xs font-medium">
              {filteredBlogs.map((b) => {
                const isLanding = b.category === '__landing_page__';
                const targetUrl = b.id.startsWith('/') ? b.id : (isLanding ? `/${b.id}` : `/blog/${b.id}`);

                return (
                  <tr key={b.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="p-4">
                      {b.image ? (
                        <img src={b.image} alt={b.title} className="w-16 h-12 object-cover rounded-lg border border-gray-100 shadow-2xs" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-16 h-12 bg-gray-50 border border-gray-100 rounded-lg flex items-center justify-center text-[9px] text-gray-400 font-bold">No Image</div>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-zinc-900 leading-snug">{b.title}</div>
                      {b.excerpt && <p className="text-xs text-zinc-400 mt-0.5 truncate max-w-md">{b.excerpt}</p>}
                      <div className="flex items-center gap-1.5 mt-1 text-[11px] font-mono text-brand-primary font-bold">
                        <span>URL: {targetUrl}</span>
                        <a 
                          href={targetUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="hover:underline flex items-center gap-0.5 text-gray-400 hover:text-brand-primary"
                          title="Open live page in new tab"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-wider border ${
                        isLanding 
                          ? 'bg-orange-50 text-[#ff5c00] border-orange-200' 
                          : 'bg-blue-50 text-brand-primary border-blue-200'
                      }`}>
                        {isLanding ? '🚀 CAMPAIGN' : '📝 ARTICLE'}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="uppercase text-[9px] font-bold text-gray-600 bg-gray-100 rounded-md px-2 py-1">
                        {isLanding ? 'Landing Page' : (b.category || 'Journal')}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`px-2 py-1 rounded font-bold uppercase text-[9px] border ${
                        b.status === 'draft' 
                          ? 'bg-yellow-50 text-yellow-700 border-yellow-200' 
                          : 'bg-green-50 text-green-700 border-green-200'
                      }`}>
                        {b.status || 'published'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <a
                          href={targetUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-gray-400 hover:text-brand-primary hover:bg-gray-100 rounded-lg transition-all"
                          title="View Live Page"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => onOpenBlogForm(b, isLanding)}
                          className="p-1.5 text-zinc-500 hover:text-brand-primary hover:bg-gray-100 rounded-lg transition-all cursor-pointer"
                          title="Edit Content"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteBlog(b.id)}
                          className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                          title="Delete Content"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredBlogs.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-gray-400 font-bold">
                    No items found under this filter. Click "New Blog Article" or "New Campaign Page" above to publish!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Guide Modal */}
      <LandingPageGuideModal
        isOpen={showGuideModal}
        products={products}
        onClose={() => setShowGuideModal(false)}
        onLoadDemoTemplate={(code) => {
          onOpenBlogForm(null, true, code);
        }}
      />
    </div>
  );
}
