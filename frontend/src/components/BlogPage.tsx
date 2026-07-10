import React, { useEffect } from 'react';
import { Clock, Calendar, ArrowLeft, BookOpen, MessageSquare, Heart, Share2 } from 'lucide-react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { BlogPost } from '../types';
import { useSEO, buildBlogPostingSchema } from '../hooks/useSEO';

export default function BlogPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const BLOGS = useStore((state) => state.dbBlogs) || [];

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id, location.pathname]);

  // Find active blog post (match either location pathname or parameterized ID)
  const activePost = BLOGS.find((b) => b.id === location.pathname || b.id === id || b.id === `/blog/${id}`);

  // Parse metadata block
  const blogSettings = (() => {
    if (!activePost) return { layout: 'standard', seoEnabled: true, marketingEnabled: true };
    const match = (activePost.content || '').match(/^<!-- metadata:\s*({.*?})\s*-->/s);
    if (match) {
      try {
        const parsed = JSON.parse(match[1]);
        return {
          layout: parsed.layout || 'standard',
          seoEnabled: parsed.seoEnabled !== false,
          marketingEnabled: parsed.marketingEnabled !== false
        };
      } catch (e) {}
    }
    const isBlankLegacy = (activePost.content || '').startsWith('<!-- layout: blank -->') || (activePost.content || '').startsWith('<!-- layout:blank -->');
    return {
      layout: isBlankLegacy ? 'blank' : 'standard',
      seoEnabled: true,
      marketingEnabled: true
    };
  })();

  const isSeoEnabled = blogSettings.seoEnabled;
  const isBlankLayout = blogSettings.layout === 'blank';

  // SEO — must be called unconditionally at top level
  const blogSeoTitle = activePost && isSeoEnabled
    ? (activePost.seoTitle || `${activePost.title} | Rupan Blog`)
    : 'Style Guides & Fashion Journal | Rupan Blog';
  const blogSeoDesc = activePost && isSeoEnabled
    ? (activePost.seoDescription || activePost.excerpt || activePost.title)
    : "Rupan-এর মাস্টার ডিজাইনারদের তৈরি প্রিমিয়াম স্টাইল গাইড, ট্র্যাডিশনাল ফ্যাব্রিক কেয়ার গাইড ও ফ্যাশন ইনসাইট।";

  useSEO({
    title: blogSeoTitle,
    description: blogSeoDesc,
    canonical: activePost ? (activePost.id.startsWith('/') ? activePost.id : `/blog/${activePost.id}`) : '/blog',
    ogImage: activePost?.image,
    ogType: activePost ? 'article' : 'website',
    publishedTime: activePost?.date,
    author: 'Rupan Editorial',
    jsonLd: activePost && isSeoEnabled
      ? [buildBlogPostingSchema({
          id: activePost.id,
          title: activePost.title,
          excerpt: activePost.excerpt,
          content: activePost.content,
          image: activePost.image,
          date: activePost.date,
          category: activePost.category,
        })]
      : undefined,
  });

  // Handle share link
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Blog post link copied to your clipboard!');
  };

  if (activePost) {
    const otherPosts = BLOGS.filter((b) => b.id !== activePost.id).slice(0, 2);

    if (isBlankLayout) {
      const cleanedHTML = activePost.content
        .replace(/^<!-- layout:\s*(blank|standard)\s*-->\s*/i, '')
        .replace(/^<!-- metadata:\s*({.*?})\s*-->\s*/is, '');
      return (
        <iframe 
          title={activePost.title}
          srcDoc={cleanedHTML}
          className="fixed inset-0 w-full h-full border-none m-0 p-0 block bg-white z-50"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        />
      );
    }

    return (
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-10 animate-in fade-in duration-300">
        {/* Back Link */}
        <button
          onClick={() => {
            navigate('/blog');
          }}
          className="flex items-center gap-2 text-xs md:text-sm font-bold text-gray-400 hover:text-brand-primary transition-colors cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" />
          Back to Journal Articles
        </button>

        {/* Hero Header */}
        <div className="space-y-4 text-center md:text-left">
          <span className="inline-block bg-blue-50 text-brand-primary font-bold text-[10px] md:text-xs px-3.5 py-1.5 rounded-full uppercase tracking-widest">
            Style Journal
          </span>
          <h1 className="font-display text-2xl md:text-4xl lg:text-5xl font-black text-brand-text leading-tight uppercase">
            {activePost.title}
          </h1>
          
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-gray-400 font-semibold pt-1 border-b border-gray-100 pb-5">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {activePost.date}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              {activePost.readTime}
            </span>
            <span>•</span>
            <span className="text-brand-primary">Fashion & Clothing</span>
          </div>
        </div>

        {/* Main Cover Image */}
        {activePost.image && (
          <div className="aspect-16/9 rounded-3xl overflow-hidden bg-gray-50 border border-gray-100 shadow-sm relative">
            <img
              src={activePost.image}
              alt={activePost.title}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        )}

        {/* Content body */}
        <article className="prose max-w-none font-sans text-sm md:text-base text-gray-600 leading-relaxed space-y-6">
          {activePost.excerpt && (
            <p className="font-bold text-brand-primary text-base md:text-lg italic border-l-4 border-brand-accent pl-4 py-1 bg-gray-50/50 rounded-r-xl">
              "{activePost.excerpt}"
            </p>
          )}
          
          {/* Detailed structured content using HTML */}
          <div dangerouslySetInnerHTML={{ __html: activePost.content.replace(/^<!-- metadata:\s*({.*?})\s*-->\s*/is, '') }} />
        </article>

        {/* Action Share widgets */}
        <div className="flex justify-between items-center border-y border-gray-100 py-4 text-xs font-bold text-gray-400">
          <div className="flex gap-4">
            <button className="flex items-center gap-1.5 hover:text-red-500 transition-colors cursor-pointer" onClick={() => alert('Thanks for the love!')}>
              <Heart className="w-4 h-4" />
              Helpful (284)
            </button>
            <button className="flex items-center gap-1.5 hover:text-brand-primary transition-colors cursor-pointer" onClick={() => alert('Comments will open in future app updates!')}>
              <MessageSquare className="w-4 h-4" />
              Comments (12)
            </button>
          </div>
          <button onClick={handleShare} className="flex items-center gap-1.5 hover:text-brand-primary transition-colors cursor-pointer">
            <Share2 className="w-4 h-4" />
            Share Article
          </button>
        </div>

        {/* Related Journal pieces */}
        <div className="space-y-6 pt-6">
          <h3 className="font-display text-lg font-black text-brand-text uppercase">
            Related Style Guides
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {otherPosts.map((guide) => (
              <Link
                key={guide.id}
                to={`/blog/${guide.id}`}
                className="group bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col md:flex-row cursor-pointer"
              >
                <img
                  src={guide.image}
                  alt={guide.title}
                  className="w-full md:w-28 h-32 object-cover shrink-0"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
                <div className="p-4 flex flex-col justify-between">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-gray-400 block mb-1">{guide.date} • {guide.readTime}</span>
                    <h4 className="text-xs md:text-sm font-bold text-brand-text group-hover:text-brand-primary transition-colors line-clamp-2 uppercase leading-snug">
                      {guide.title}
                    </h4>
                  </div>
                  <span className="text-[10px] text-brand-primary font-bold hover:underline block mt-2">
                    Read Article
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    );
  }

  // Render Full Blog Listing View
  return (
    <div className="w-full max-w-[1750px] mx-auto px-4 md:px-12 lg:px-16 py-12 space-y-10 animate-in fade-in duration-300">
      
      {/* Page Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <span className="inline-flex p-3 bg-blue-50 text-brand-primary rounded-full">
          <BookOpen className="w-6 h-6" />
        </span>
        <div className="space-y-1">
          <span className="text-xs font-bold text-brand-primary uppercase tracking-widest block">
            Style Journal
          </span>
          <h1 className="font-display text-3xl md:text-4xl font-extrabold text-[#111] uppercase">
            Style Guides & Fashion Journal
          </h1>
        </div>
        <p className="text-sm text-gray-500">
          Discover premium style notes, traditional fabric care guides, coordination pairings, and insights compiled directly by our master designers.
        </p>
      </div>

      {/* Blogs list Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {BLOGS.map((post) => (
          <Link
            key={post.id}
            to={`/blog/${post.id}`}
            className="group bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col cursor-pointer"
          >
            <div className="aspect-16/10 overflow-hidden bg-gray-50 relative">
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                referrerPolicy="no-referrer"
                loading="lazy"
              />
              <span className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md text-brand-text font-bold text-[10px] px-3 py-1 rounded-full uppercase tracking-wider">
                {post.readTime}
              </span>
            </div>

            <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-brand-accent block uppercase tracking-wider">
                  {post.date} • FASHION DIARY
                </span>
                <h3 className="font-display font-bold text-base md:text-lg text-brand-text group-hover:text-brand-primary transition-colors uppercase leading-snug line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed font-sans line-clamp-2">
                  {post.excerpt}
                </p>
              </div>

              <span className="text-xs text-brand-primary font-bold hover:underline inline-flex items-center gap-1">
                Read Article
                <span>→</span>
              </span>
            </div>
          </Link>
        ))}
      </div>

    </div>
  );
}
