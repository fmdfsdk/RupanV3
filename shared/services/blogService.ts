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
  }
};
