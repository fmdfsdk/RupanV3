import { supabase } from '../lib/supabase';
import { Review } from '../types';

export const reviewService = {
  /**
   * Fetches all approved product reviews from Supabase.
   */
  async fetchReviews(): Promise<Review[]> {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('status', 'approved');

    if (error) {
      throw new Error(`Failed to fetch reviews: ${error.message}`);
    }
    return data || [];
  },

  /**
   * Submits a new review to Supabase (pending approval).
   */
  async submitReview(review: Omit<Review, 'id' | 'date' | 'status'>): Promise<void> {
    const { error } = await supabase
      .from('reviews')
      .insert([{
        productId: review.productId,
        userName: review.userName,
        rating: review.rating,
        comment: review.comment,
        status: 'pending' // default status in db
      }]);

    if (error) {
      throw new Error(`Failed to submit review: ${error.message}`);
    }
  }
};
