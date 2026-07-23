import React from 'react';
import { BlogPost } from '../../types';

interface BlogPreviewProps {
  blogs: BlogPost[];
  navigate: (path: string) => void;
}

export const getBlogTargetUrl = (blog: BlogPost) => {
  if (!blog || !blog.id) return '/blog';
  const id = String(blog.id).trim();

  // 1. If ID already starts with '/', use it directly
  if (id.startsWith('/')) {
    return id;
  }

  // 2. If it's a landing page category
  if (blog.category === '__landing_page__') {
    return `/${id}`;
  }

  // 3. Standard blog article
  return `/blog/${id}`;
};

export default function BlogPreview({ blogs, navigate }: BlogPreviewProps) {
  const blogsToShow = blogs.slice(0, 6);

  if (blogsToShow.length === 0) return null;

  return (
    <section className="w-full max-w-[1750px] mx-auto px-4 sm:px-8 lg:px-12">
      <div className="flex items-center justify-between mb-8 pb-3 border-b border-gray-100">
        <div>
          <h2 className="font-sans text-xl sm:text-2xl font-black text-gray-900 uppercase tracking-tight text-left">
            Style Journal & Campaigns
          </h2>
          <p className="text-xs text-gray-400 font-medium text-left">Explore latest fashion insights, style notes, and campaign pages.</p>
        </div>
        <button 
          onClick={() => navigate('/blog')}
          className="bg-black text-white hover:bg-gray-800 text-[11px] font-bold px-4 py-2 rounded-full uppercase tracking-wider transition-colors cursor-pointer shrink-0"
        >
          View All
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {blogsToShow.map((blog) => {
          const isLanding = blog.category === '__landing_page__';
          const targetUrl = getBlogTargetUrl(blog);
          return (
            <article 
              key={blog.id}
              onClick={() => navigate(targetUrl)}
              className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-2xs hover:shadow-md transition-all duration-300 cursor-pointer flex flex-col group"
            >
              <div className="relative aspect-video overflow-hidden bg-gray-50">
                <img 
                  src={blog.image || (isLanding ? 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=600&auto=format&fit=crop' : 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=600&auto=format&fit=crop')} 
                  alt={blog.title} 
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" 
                  referrerPolicy="no-referrer" 
                />
                <span className={`absolute top-3 left-3 text-white text-[10px] font-black px-2.5 py-1 rounded-sm uppercase tracking-wider shadow-xs ${
                  isLanding ? 'bg-[#ff5c00]' : 'bg-zinc-900'
                }`}>
                  {isLanding ? '🚀 CAMPAIGN' : 'BLOGS'}
                </span>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <h3 className="font-sans font-extrabold text-sm text-gray-900 group-hover:text-[#ff5c00] transition-colors leading-snug line-clamp-2 uppercase text-left">
                    {blog.title}
                  </h3>
                  <p className="text-xs text-gray-400 line-clamp-3 leading-relaxed text-left font-sans font-normal">
                    {blog.excerpt || (isLanding ? 'Exclusive interactive promotional campaign landing page.' : 'Discover our latest fashion insights.')}
                  </p>
                </div>

                <div className="pt-3 border-t border-gray-50 flex items-center justify-between text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  <span>{blog.date || 'TODAY'}</span>
                  <span className="text-[#ff5c00] group-hover:underline flex items-center gap-1 font-extrabold">
                    {isLanding ? 'OPEN CAMPAIGN »' : 'READ MORE »'}
                  </span>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
