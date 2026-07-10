import React from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { BlogPost } from '../../types';

interface BlogsTabProps {
  blogs: BlogPost[];
  onOpenBlogForm: (blog: BlogPost | null) => void;
  onDeleteBlog: (id: string) => void;
}

export default function BlogsTab({ blogs, onOpenBlogForm, onDeleteBlog }: BlogsTabProps) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Editorial & Blog Posts</h1>
          <p className="text-xs text-gray-500">Edit, structure, and publish rich content articles to increase site SEO and organic visibility.</p>
        </div>
        <button
          onClick={() => onOpenBlogForm(null)}
          className="bg-brand-primary text-white text-xs font-bold uppercase tracking-wider px-5 py-3 rounded-xl flex items-center space-x-2 hover:bg-blue-900 transition-all cursor-pointer shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>Create Blog Post</span>
        </button>
      </div>

      {/* Blogs list */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-[10px] uppercase tracking-wider text-gray-400 font-bold">
                <th className="p-4 w-24">Featured Image</th>
                <th className="p-4">Title & Excerpt</th>
                <th className="p-4 text-center">Read Time</th>
                <th className="p-4 text-center">Category</th>
                <th className="p-4 text-center">Workflow Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-xs">
              {blogs.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50/50">
                  <td className="p-4">
                    {b.image ? (
                      <img src={b.image} alt={b.title} className="w-16 h-12 object-cover rounded-md border border-gray-100" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-16 h-12 bg-gray-50 border border-gray-100 rounded-md flex items-center justify-center text-[10px] text-gray-400 font-bold">No Image</div>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-zinc-900 leading-snug">{b.title}</div>
                    <p className="text-xs text-zinc-400 mt-1 truncate max-w-md">{b.excerpt}</p>
                    <span className="text-[10px] font-mono text-gray-400 mt-1 block">Slug: {b.id}</span>
                  </td>
                  <td className="p-4 text-center font-semibold text-gray-500">{b.readTime || '4 min read'}</td>
                  <td className="p-4 text-center">
                    <span className="uppercase text-[9px] font-bold text-brand-primary bg-blue-50/50 rounded-full px-2 py-0.5 w-fit">
                      {b.category || 'Uncategorized'}
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
                      <button
                        onClick={() => onOpenBlogForm(b)}
                        className="p-1.5 text-zinc-500 hover:text-brand-primary hover:bg-gray-100 rounded-lg transition-all cursor-pointer"
                        title="Edit Blog"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteBlog(b.id)}
                        className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                        title="Delete Blog"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {blogs.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-400 font-bold">
                    No articles found. Click "Create Blog Post" to add your first post.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
