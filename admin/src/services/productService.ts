import { supabase } from '../lib/supabase';
import { Product } from '../types';

export const productService = {
  /**
   * Fetches first 1000 published products (full fields) for the initial browsing experience.
   * Fast: single query, used to render shop/homepage on first load.
   */
  async fetchProducts(): Promise<Product[]> {
    const columns = 'id, name, price, discount_price, category, sub_category, brand, images, stock, status, is_featured, is_trending, is_new, is_best_seller, is_flash_sale, created_at, slug';
    const { data, error } = await supabase
      .from('products')
      .select(columns)
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(1000);

    if (error) {
      throw new Error(`Failed to fetch products: ${error.message}`);
    }
    return data || [];
  },

  /**
   * Fetches the complete lightweight catalog index (ALL products, minimal fields).
   * Used to power search, product ID resolution, and featured product matching.
   * Runs in parallel background chunks after initial load.
   */
  async fetchProductCatalogIndex(): Promise<Product[]> {
    const columns = 'id, name, slug, category, images, price, discount_price, stock, is_featured, is_trending, is_new, is_best_seller, is_flash_sale';
    try {
      let allItems: Product[] = [];
      let page = 0;
      const pageSize = 1000;
      let hasMore = true;

      while (hasMore) {
        const { data, error } = await supabase
          .from('products')
          .select(columns)
          .eq('status', 'published')
          .range(page * pageSize, (page + 1) * pageSize - 1);

        if (error || !data || data.length === 0) {
          hasMore = false;
        } else {
          allItems = allItems.concat(data as Product[]);
          if (data.length < pageSize) {
            hasMore = false;
          } else {
            page++;
          }
        }
      }
      return allItems;
    } catch (error: any) {
      console.error('Failed to fetch catalog index:', error.message);
      return [];
    }
  },



  /**
   * Fetches published products matching server-side filters and pagination range.
   */
  async fetchProductsFiltered({
    category,
    categories,
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
    categories?: string[];
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
    
    // Categories filter (multi-select)
    if (categories && categories.length > 0) {
      query = query.in('category', categories);
    } else if (category && category !== 'All') {
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
    const cleanId = idOrSlug.trim();
    
    // 1. Try exact match first
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .or(`id.eq.${cleanId},slug.eq.${cleanId}`)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to fetch product detail: ${error.message}`);
    }
    
    if (data) return data;

    // 2. If exact match fails, apply 3000 offset tolerance mapping
    const numMatch = cleanId.match(/\d+$/);
    if (numMatch) {
      const searchNum = parseInt(numMatch[0], 10);
      const prefixMatch = cleanId.match(/^[a-zA-Z]+/);
      const prefix = prefixMatch ? prefixMatch[0].toLowerCase() : 'mohasagor';
      
      const offsets = [-3000, 3000];
      for (const offset of offsets) {
        const altNum = searchNum + offset;
        if (altNum > 0) {
          const altId = `${prefix}-${altNum}`;
          const { data: altData } = await supabase
            .from('products')
            .select('*')
            .or(`id.eq.${altId},id.eq.${altNum},slug.eq.${altId},slug.eq.${altNum},slug.eq.-${altNum},slug.eq.product-${altNum}`)
            .maybeSingle();
            
          if (altData) return altData;
        }
      }
      
      // If prefix was just numbers (no prefix), try fallback with 'mohasagor-' prefix and offset
      if (!prefixMatch) {
        for (const offset of offsets) {
          const altNum = searchNum + offset;
          if (altNum > 0) {
            const altId = `mohasagor-${altNum}`;
            const { data: altData } = await supabase
              .from('products')
              .select('*')
              .or(`id.eq.${altId},id.eq.${altNum},slug.eq.${altId},slug.eq.${altNum},slug.eq.-${altNum},slug.eq.product-${altNum}`)
              .maybeSingle();
              
            if (altData) return altData;
          }
        }
      }
    }

    return null;
  },

  /**
   * Performs full-text search on products using the PG search_products RPC function.
   */
  async searchProducts(query: string, limit: number = 20): Promise<Product[]> {
    if (!query || !query.trim()) return [];
    
    // 1. Fetch via search_products RPC (Full-text name/description match)
    const { data, error } = await supabase.rpc('search_products', {
      search_query: query.trim(),
      match_limit: limit
    });
    
    if (error) {
      throw new Error(`Failed to search products: ${error.message}`);
    }

    const results = data || [];

    // 2. If results length is less than limit, fetch matching products by SKU directly
    if (results.length < limit) {
      const { data: skuData } = await supabase
        .from('products')
        .select('*')
        .eq('status', 'published')
        .ilike('sku', `%${query.trim()}%`)
        .limit(limit - results.length);

      if (skuData && skuData.length > 0) {
        const existingIds = new Set(results.map(p => p.id));
        for (const p of skuData) {
          if (!existingIds.has(p.id)) {
            results.push(p);
          }
        }
      }
    }

    return results;
  }
};
