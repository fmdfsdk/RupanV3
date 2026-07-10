import { supabase } from '../lib/supabase';
import { BlogPost } from '../types';

export const blogService = {
  /**
   * Fetches all published blog posts from Supabase.
   */
  async fetchBlogs(): Promise<BlogPost[]> {
    const { data, error } = await supabase
      .from('blogs')
      .select('*')
      .eq('status', 'published');

    if (error) {
      throw new Error(`Failed to fetch blogs: ${error.message}`);
    }
    return data || [];
  },

  /**
   * Fetches all blog posts (including drafts) for admin panel.
   */
  async fetchAdminBlogs(): Promise<BlogPost[]> {
    const { data, error } = await supabase
      .from('blogs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch admin blogs: ${error.message}`);
    }
    return data || [];
  },

  /**
   * Creates a new blog post.
   */
  async createBlog(blog: any): Promise<BlogPost> {
    const { data, error } = await supabase
      .from('blogs')
      .insert([blog])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create blog post: ${error.message}`);
    }
    return data;
  },

  /**
   * Updates an existing blog post.
   */
  async updateBlog(id: string, blog: any): Promise<BlogPost> {
    const { data, error } = await supabase
      .from('blogs')
      .update(blog)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update blog post: ${error.message}`);
    }
    return data;
  },

  /**
   * Deletes a blog post.
   */
  async deleteBlog(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('blogs')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete blog post: ${error.message}`);
    }
    return true;
  }
};
