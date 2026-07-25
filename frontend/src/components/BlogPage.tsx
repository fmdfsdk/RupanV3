import React, { useEffect, useState } from 'react';
import { Clock, Calendar, ArrowLeft, BookOpen, MessageSquare, Heart, Share2, Rocket, Layers } from 'lucide-react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { BlogPost } from '../types';
import { useSEO, buildBlogPostingSchema } from '../hooks/useSEO';

export const getBlogTargetUrl = (blog: BlogPost) => {
  if (!blog || !blog.id) return '/blog';
  const id = String(blog.id).trim();
  if (id.startsWith('/')) return id;
  if (blog.category === '__landing_page__') return `/${id}`;
  return `/blog/${id}`;
};

export default function BlogPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const BLOGS = useStore((state) => state.dbBlogs) || [];
  const [selectedTab, setSelectedTab] = useState<'all' | 'articles' | 'landing'>('all');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id, location.pathname]);

  const cleanIdPattern = (path: string) => {
    return path
      .toLowerCase()
      .replace(/^\//, '')
      .replace(/^(blog|offer|product|landing|blogs|offers|products)\//, '')
      .replace(/^blog-/, '')
      .replace(/(^-|-$)/g, '');
  };

  // Find active blog post (match either location pathname or parameterized ID, immune to slash/hyphen/prefix variations)
  const activePost = BLOGS.find((b) => {
    const cleanDb = cleanIdPattern(b.id);
    const cleanTarget = id ? cleanIdPattern(id) : '';
    const cleanPath = cleanIdPattern(location.pathname);
    return cleanDb === cleanTarget || cleanDb === cleanPath || b.id === location.pathname || b.id === id || b.id === `/blog/${id}`;
  });

  // Parse metadata block
  const isLandingPage = activePost?.category === '__landing_page__';
  const blogSettings = (() => {
    if (!activePost || isLandingPage) return { layout: isLandingPage ? 'blank' : 'standard', seoEnabled: true, marketingEnabled: true };
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
  const isBlankLayout = blogSettings.layout === 'blank' || isLandingPage;

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

  const dbSettings = useStore((state) => state.dbSettings);

  if (activePost) {
    const otherPosts = BLOGS.filter((b) => b.id !== activePost.id && b.category !== '__landing_page__').slice(0, 2);

    if (isBlankLayout) {
      let cleanedHTML = activePost.content
        .replace(/^<!-- layout:\s*(blank|standard)\s*-->\s*/i, '')
        .replace(/^<!-- metadata:\s*({.*?})\s*-->\s*/is, '');

      // Replace placeholders
      const pixelId = dbSettings?.metaPixelId || dbSettings?.meta_pixel_id || '';
      const capiToken = dbSettings?.metaCapiAccessToken || dbSettings?.meta_capi_access_token || '';
      const testCode = dbSettings?.metaTestEventCode || dbSettings?.meta_test_event_code || '';
      const gtmId = dbSettings?.googleTagManagerId || dbSettings?.google_tag_manager_id || '';
      const gaId = dbSettings?.googleAnalyticsId || dbSettings?.google_analytics_id || '';
      const insideDhaka = String(dbSettings?.shippingFeeInsideDhaka || dbSettings?.inside_dhaka_shipping || '60');
      const outsideDhaka = String(dbSettings?.shippingFeeOutsideDhaka || dbSettings?.outside_dhaka_shipping || '120');
      const freeShippingMin = String(dbSettings?.freeShippingMinOrder || dbSettings?.free_shipping_min_order || '3000');
      const supUrl = (window as any).SUPABASE_URL || (window as any).location.origin || '';
      const supKey = (window as any).SUPABASE_ANON_KEY || '';

      cleanedHTML = cleanedHTML
        .replace(/RUPAN_META_PIXEL_ID|META_PIXEL_ID|YOUR_PIXEL_ID|YOUR_PIXEL_ID_HERE|YOUR_FACEBOOK_PIXEL_ID|FB_PIXEL_ID/g, pixelId)
        .replace(/RUPAN_META_CAPI_TOKEN|META_CAPI_TOKEN|YOUR_CAPI_TOKEN/g, capiToken)
        .replace(/RUPAN_META_TEST_CODE|META_TEST_CODE|YOUR_TEST_CODE/g, testCode)
        .replace(/RUPAN_GTM_ID|GTM_ID|YOUR_GTM_ID|YOUR_GTM_CONTAINER_ID/g, gtmId)
        .replace(/RUPAN_GA4_ID|GA4_ID|YOUR_GA4_ID|YOUR_GA_ID/g, gaId)
        .replace(/RUPAN_INSIDE_DHAKA_SHIPPING/g, insideDhaka)
        .replace(/RUPAN_OUTSIDE_DHAKA_SHIPPING/g, outsideDhaka)
        .replace(/RUPAN_FREE_SHIPPING_MIN/g, freeShippingMin)
        .replace(/RUPAN_SUPABASE_URL|SUPABASE_URL/g, supUrl)
        .replace(/RUPAN_SUPABASE_KEY|SUPABASE_KEY/g, supKey);

      // Inject Meta Pixel script if enabled and not present
      if (blogSettings.marketingEnabled !== false && pixelId && !cleanedHTML.includes('connect.facebook.net') && !cleanedHTML.includes(pixelId)) {
        const metaPixelScript = `
<!-- Dynamic Meta Pixel Code (Rupan) -->
<script>
  !function(f,b,e,v,n,t,s)
  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
  n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t,s)}(window, document,'script',
  'https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', '${pixelId}');
  fbq('track', 'PageView');
</script>
<noscript><img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1"/></noscript>
`;
        const headIdx = cleanedHTML.search(/<head>/i);
        if (headIdx !== -1) {
          cleanedHTML = cleanedHTML.slice(0, headIdx + 6) + metaPixelScript + cleanedHTML.slice(headIdx + 6);
        } else {
          cleanedHTML = metaPixelScript + cleanedHTML;
        }
      }

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
            <button 
              onClick={handleShare}
              className="flex items-center gap-1 text-brand-primary hover:underline cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              Share Article
            </button>
          </div>
        </div>

        {/* Featured Banner Image */}
        {activePost.image && (
          <div className="aspect-16/9 rounded-3xl overflow-hidden shadow-sm bg-gray-50 border border-gray-100">
            <img 
              src={activePost.image} 
              alt={activePost.title}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        )}

        {/* Main Content Area */}
        <article className="prose prose-lg max-w-none text-gray-700 font-sans leading-relaxed space-y-6">
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
          <button className="flex items-center gap-1.5 text-brand-primary hover:underline cursor-pointer" onClick={handleShare}>
            <Share2 className="w-4 h-4" />
            Share
          </button>
        </div>

        {/* Related Guides */}
        {otherPosts.length > 0 && (
          <div className="pt-8 space-y-6 border-t border-gray-100">
            <h3 className="font-display text-lg font-bold text-brand-text uppercase tracking-wider">
              More Style Notes & Guides
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {otherPosts.map((guide) => (
                <Link
                  key={guide.id}
                  to={getBlogTargetUrl(guide)}
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
        )}

      </div>
    );
  }

  // Filter posts based on selected tab
  const filteredPosts = BLOGS.filter((post) => {
    const isLanding = post.category === '__landing_page__';
    if (selectedTab === 'articles') return !isLanding;
    if (selectedTab === 'landing') return isLanding;
    return true; // 'all'
  });

  const landingCount = BLOGS.filter(b => b.category === '__landing_page__').length;
  const articleCount = BLOGS.filter(b => b.category !== '__landing_page__').length;

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
            Style Journal & Campaigns
          </span>
          <h1 className="font-display text-3xl md:text-4xl font-extrabold text-[#111] uppercase">
            Style Guides, Articles & Landing Pages
          </h1>
        </div>
        <p className="text-sm text-gray-500">
          Discover premium style notes, traditional fabric care guides, insights, and exclusive campaign landing pages.
        </p>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap justify-center gap-2 pt-4">
          <button
            onClick={() => setSelectedTab('all')}
            className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedTab === 'all'
                ? 'bg-[#ff5c00] text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>All ({BLOGS.length})</span>
          </button>
          <button
            onClick={() => setSelectedTab('articles')}
            className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedTab === 'articles'
                ? 'bg-[#ff5c00] text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Style Journal ({articleCount})</span>
          </button>
          <button
            onClick={() => setSelectedTab('landing')}
            className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedTab === 'landing'
                ? 'bg-[#ff5c00] text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Rocket className="w-3.5 h-3.5 text-amber-300" />
            <span>Landing Pages ({landingCount})</span>
          </button>
        </div>
      </div>

      {/* Blogs & Landing Pages list Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {filteredPosts.map((post) => {
          const isLanding = post.category === '__landing_page__';
          const targetUrl = getBlogTargetUrl(post);
          const fallbackImage = isLanding
            ? 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=600&auto=format&fit=crop'
            : 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=600&auto=format&fit=crop';
          const cardImage = post.image || fallbackImage;

          return (
            <Link
              key={post.id}
              to={targetUrl}
              className="group bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col cursor-pointer"
            >
              <div className="aspect-16/10 overflow-hidden bg-gray-50 relative">
                <img
                  src={cardImage}
                  alt={post.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
                <span className={`absolute bottom-4 left-4 font-extrabold text-[10px] px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-md shadow-xs ${
                  isLanding ? 'bg-[#ff5c00] text-white' : 'bg-white/90 text-gray-900'
                }`}>
                  {isLanding ? '🚀 CAMPAIGN PAGE' : (post.readTime || '3 MIN READ')}
                </span>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-[#ff5c00] block uppercase tracking-wider">
                    {isLanding ? 'SPECIAL LANDING PAGE' : `${post.date || 'TODAY'} • FASHION DIARY`}
                  </span>
                  <h3 className="font-display font-bold text-base md:text-lg text-gray-900 group-hover:text-[#ff5c00] transition-colors uppercase leading-snug line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed font-sans line-clamp-2">
                    {post.excerpt || (isLanding ? 'Interactive promotional campaign page.' : 'Discover our latest fashion insights.')}
                  </p>
                </div>

                <span className="text-xs text-[#ff5c00] font-bold hover:underline inline-flex items-center gap-1">
                  {isLanding ? 'Open Campaign Page' : 'Read Article'}
                  <span>→</span>
                </span>
              </div>
            </Link>
          );
        })}
      </div>

    </div>
  );
}
