import { supabase } from '../lib/supabase';

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  category: string;
  isActive: boolean;
}

export const bannerService = {
  /**
   * Fetches active advertising banners from Supabase.
   */
  async fetchBanners(): Promise<Banner[]> {
    const { data, error } = await supabase
      .from('banners')
      .select('*')
      .eq('is_active', true);

    if (error) {
      throw new Error(`Failed to fetch banners: ${error.message}`);
    }
    return data || [];
  }
};
