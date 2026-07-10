import React from 'react';
import { BlogPost } from '../../types';

interface BlogsTabProps {
  blogs: BlogPost[];
}

export default function BlogsTab({ blogs }: BlogsTabProps) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Editorial & Blog Posts</h1>
          <p className="text-xs text-gray-500">Edit, structure, and publish rich content articles to increase site SEO and organic visibility.</p>
        </div>
      </div>

      {/* Blogs list */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-[10px] uppercase tracking-wider text-gray-400 font-bold">
                <th className="p-4">Featured Image</th>
                <th className="p-4">Title & Excerpt</th>
                <th className="p-4 text-center">Read Time</th>
                <th className="p-4 text-center">Category</th>
                <th className="p-4 text-right">Workflow Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-xs">
              {blogs.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50/50">
                  <td className="p-4">
                    <img src={b.image || undefined} alt={b.title} className="w-16 h-12 object-cover rounded-md" referrerPolicy="no-referrer" />
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-zinc-955 leading-tight">{b.title}</div>
                    <p className="text-xs text-zinc-400 mt-1 truncate max-w-sm">{b.excerpt}</p>
                  </td>
                  <td className="p-4 text-center font-semibold text-gray-500">{b.readTime || '4 min read'}</td>
                  <td className="p-4 text-center">
                    <span className="uppercase text-[9px] font-bold text-brand-primary bg-blue-50/50 rounded-full px-2 py-0.5 w-fit">
                      {b.category || 'Fashion'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <span className="bg-green-50 text-green-700 px-2 py-1 rounded font-bold uppercase text-[9px] border border-green-100">
                      {b.status || 'published'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
