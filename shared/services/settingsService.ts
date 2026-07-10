import { supabase } from '../lib/supabase';

export const settingsService = {
  /**
   * Fetches settings configuration from Supabase.
   */
  async fetchSettings(): Promise<any> {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to fetch settings: ${error.message}`);
    }
    return data;
  }
};
