import { supabase } from '../lib/supabase';
import { Product } from '../types';

export const productService = {
  /**
   * Fetches all published products from Supabase.
   * Optimizes columns query for lightweight load.
   */
  async fetchProducts(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('id, name, price, discount_price, category, sub_category, brand, images, stock, status, is_featured, is_trending, is_new, is_best_seller, is_flash_sale, created_at')
      .eq('status', 'published')
      .limit(5000);

    if (error) {
      throw new Error(`Failed to fetch products: ${error.message}`);
    }
    return data || [];
  },

  /**
   * Fetches published products matching server-side filters and pagination range.
   */
  async fetchProductsFiltered({
    category,
    gender,
    brands,
    subCategories,
    minPrice,
    maxPrice,
    stock,
    search,
    sortBy,
    page = 1,
    limit = 12
  }: {
    category?: string;
    gender?: string;
    brands?: string[];
    subCategories?: string[];
    minPrice?: number;
    maxPrice?: number;
    stock?: string[];
    search?: string;
    sortBy?: string;
    page?: number;
    limit?: number;
  }): Promise<{ products: Product[]; count: number }> {
    let query = supabase.from('products').select('*', { count: 'exact' });
    
    // Enforce published status
    query = query.eq('status', 'published');
    
    // Category filter
    if (category && category !== 'All') {
      if (category === 'New Arrivals') {
        query = query.eq('is_new', true);
      } else if (category === 'Best Sellers') {
        query = query.eq('is_best_seller', true);
      } else if (category === 'Flash Sale') {
        query = query.eq('is_flash_sale', true);
      } else {
        query = query.eq('category', category);
      }
    }
    
    // Gender filter
    if (gender && gender !== 'All') {
      query = query.eq('gender', gender);
    }
    
    // Brands filter
    if (brands && brands.length > 0) {
      query = query.in('brand', brands);
    }
    
    // Sub-categories filter
    if (subCategories && subCategories.length > 0) {
      query = query.in('sub_category', subCategories);
    }
    
    // Min/Max price filter
    if (minPrice) {
      query = query.gte('price', minPrice);
    }
    if (maxPrice) {
      query = query.lte('price', maxPrice);
    }
    
    // Stock status filter
    if (stock && stock.length > 0) {
      const inStock = stock.includes('In Stock');
      const outStock = stock.includes('Out of Stock');
      if (inStock && !outStock) {
        query = query.gt('stock', 0);
      } else if (outStock && !inStock) {
        query = query.eq('stock', 0);
      }
    }
    
    // Search text filter
    if (search && search.trim()) {
      const queryText = search.trim();
      query = query.or(`name.ilike.%${queryText}%,category.ilike.%${queryText}%,sku.ilike.%${queryText}%`);
    }
    
    // Sort
    if (sortBy === 'Price: Low to High') {
      query = query.order('price', { ascending: true });
    } else if (sortBy === 'Price: High to Low') {
      query = query.order('price', { ascending: false });
    } else if (sortBy === 'Newest Arrivals') {
      query = query.order('created_at', { ascending: false });
    } else if (sortBy === 'Popularity') {
      query = query.order('rating', { ascending: false });
    } else {
      query = query.order('created_at', { ascending: false });
    }
    
    // Pagination range
    const start = (page - 1) * limit;
    const end = start + limit - 1;
    query = query.range(start, end);
    
    const { data, count, error } = await query;
    if (error) {
      throw new Error(`Failed to query products: ${error.message}`);
    }
    
    return {
      products: data || [],
      count: count || 0
    };
  },

  /**
   * Fetches a single product details by ID or Slug.
   */
  async fetchProductByIdOrSlug(idOrSlug: string): Promise<Product | null> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .or(`id.eq."${idOrSlug}",slug.eq."${idOrSlug}"`)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to fetch product detail: ${error.message}`);
    }
    return data;
  },

  /**
   * Performs full-text search on products using the PG search_products RPC function.
   */
  async searchProducts(query: string, limit: number = 20): Promise<Product[]> {
    if (!query || !query.trim()) return [];
    const { data, error } = await supabase.rpc('search_products', {
      search_query: query.trim(),
      match_limit: limit
    });
    if (error) {
      throw new Error(`Failed to search products: ${error.message}`);
    }
    return data || [];
  }
};
