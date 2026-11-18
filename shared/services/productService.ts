import { supabase } from '../lib/supabase';
import { Product } from '../types';

function detectProductGender(
  category: string = '',
  name: string = '',
  existingGender?: string
): 'Men' | 'Women' | 'Couple' | 'Kids' | 'Accessories' {
  const cat = (category || '').toLowerCase();
  const title = (name || '').toLowerCase();
  const text = `${cat} ${title}`;

  if (cat.includes('kid')) return 'Kids';

  const isCouple = /(couple|combo)/i.test(text);
  if (isCouple) return 'Couple';

  if (cat.includes('women') || cat.includes('female') || cat.includes('ladies')) return 'Women';
  if (cat.includes('men') && !cat.includes('women')) return 'Men';

  const isFemale = /(women|female|saree|sari|three\s*piece|three-piece|kurti|kurtis|lehenga|salwar|kamiz|kameez|hijab|abaya|borqa|borkha|ladies|girl|bra|panties)/i.test(title);
  if (isFemale) return 'Women';

  const isKids = /(kids|baby|children|child|toddler|infant|boy\'s|girls\')/i.test(title);
  if (isKids) return 'Kids';

  const isMale = /(\bmen\b|\bmale\b|panjabi|punjabi|\bshirt\b|\bpolo\b|t-shirt|tshirt|\bboy\b|\bgents\b)/i.test(title);
  if (isMale) return 'Men';

  const isAccessoryCategory = /(gadget|electronic|home|lifestyle|gift|food|kitchen|living|decor|mug|speaker|watch|bottle|phone|cable|charger|cleaner|light|device|other)/i.test(cat);
  if (isAccessoryCategory) {
    return 'Accessories';
  }

  if (existingGender && ['Women', 'Couple', 'Kids', 'Accessories'].includes(existingGender)) {
    return existingGender as any;
  }
  if (existingGender === 'Men' && !isAccessoryCategory) {
    return 'Men';
  }

  return 'Accessories';
}

function formatProductRow(p: any): Product {
  if (!p) return p;
  const regPrice = Number(p.price || 0);
  const purchPrice = Number(p.purchase_price ?? p.purchasePrice ?? regPrice);
  const diffX = Math.max(0, regPrice - purchPrice);
  const calcFloor = Math.round(regPrice - 0.25 * diffX);
  const accurateGender = detectProductGender(p.category, p.name, p.gender);

  return {
    ...p,
    gender: accurateGender,
    discountPrice: p.discount_price !== undefined ? p.discount_price : p.discountPrice,
    purchasePrice: p.purchase_price !== undefined ? p.purchase_price : p.purchasePrice,
    finalPrice: p.final_price !== undefined ? p.final_price : (p.finalPrice ?? calcFloor),
    isFeatured: Boolean(p.is_featured ?? p.isFeatured),
    isTrending: Boolean(p.is_trending ?? p.isTrending),
    isNew: p.is_new !== undefined ? Boolean(p.is_new) : (p.isNew !== undefined ? Boolean(p.isNew) : true),
    isBestSeller: Boolean(p.is_best_seller ?? p.isBestSeller),
    isFlashSale: Boolean(p.is_flash_sale ?? p.isFlashSale),
    sourceId: p.source_id ?? p.sourceId,
    source_id: p.source_id ?? p.sourceId,
    sourceProductId: p.source_product_id ?? p.sourceProductId,
    source_product_id: p.source_product_id ?? p.sourceProductId
  };
}

export const productService = {
  /**
   * Fetches first 1000 published products (full fields) for the initial browsing experience.
   * Fast: single query, used to render shop/homepage on first load.
   */
  async fetchProducts(): Promise<Product[]> {
    const columns = 'id, name, price, discount_price, purchase_price, final_price, category, sub_category, brand, images, colors, sizes, variants, stock, status, is_featured, is_trending, is_new, is_best_seller, is_flash_sale, created_at, slug, gender, sku, source_id, source_product_id';
    let { data, error } = await supabase
      .from('products')
      .select(columns)
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(1000);

    if (error) {
      console.warn("Product fetch with variants failed, falling back to base columns:", error.message);
      const fallbackColumns = 'id, name, price, discount_price, category, sub_category, brand, images, stock, status, is_featured, is_trending, is_new, is_best_seller, is_flash_sale, created_at, slug, gender, sku, source_id, source_product_id';
      const fallbackRes = await supabase
        .from('products')
        .select(fallbackColumns)
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(1000);
      data = fallbackRes.data;
    }

    // Always guarantee that all published items marked as featured are included, even if outside first 1000
    try {
      const { data: featuredItems } = await supabase
        .from('products')
        .select(columns)
        .eq('status', 'published')
        .eq('is_featured', true);
      if (featuredItems && featuredItems.length > 0) {
        const currentIds = new Set((data || []).map((p: any) => p.id));
        for (const item of featuredItems) {
          if (!currentIds.has(item.id)) {
            data = [item, ...(data || [])];
            currentIds.add(item.id);
          }
        }
      }
    } catch (featErr: any) {
      console.warn("Failed to fetch extra featured products:", featErr.message);
    }

    return (data || []).map(formatProductRow);
  },

  /**
   * Fetches the complete lightweight catalog index (ALL products, minimal fields).
   * Used to power search, product ID resolution, and featured product matching.
   * Runs in parallel background chunks after initial load.
   */
  async fetchProductCatalogIndex(): Promise<Product[]> {
    const columns = 'id, name, slug, sku, category, images, price, discount_price, purchase_price, final_price, stock, is_featured, is_trending, is_new, is_best_seller, is_flash_sale, gender, source_id, source_product_id';
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
          const mappedPage = (data || []).map(formatProductRow);
          allItems = allItems.concat(mappedPage as Product[]);
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
   * Fetches a single product details by ID, Slug, or SKU.
   */
  async fetchProductByIdOrSlug(idOrSlug: string): Promise<Product | null> {
    const cleanId = idOrSlug.trim();
    
    // 1. Try exact match on ID, slug, or SKU first
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .or(`id.eq.${cleanId},slug.eq.${cleanId},sku.eq.${cleanId}`)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to fetch product detail: ${error.message}`);
    }
    
    if (data) return formatProductRow(data);

    // 2. Exact match by extracted numeric ID (without offset)
    const numMatch = cleanId.match(/\d+$/);
    if (numMatch) {
      const num = numMatch[0];
      // 2a. Match product ID by numeric part (mohasagor-{num} or {num})
      const { data: numIdData } = await supabase
        .from('products')
        .select('*')
        .or(`id.eq.mohasagor-${num},id.eq.${num}`)
        .maybeSingle();

      if (numIdData) return formatProductRow(numIdData);

      // 2b. Match product SKU by numeric part (MOHASAGOR-{num} or {num})
      const { data: numSkuData } = await supabase
        .from('products')
        .select('*')
        .or(`sku.eq.MOHASAGOR-${num},sku.eq.${num}`)
        .maybeSingle();

      if (numSkuData) return formatProductRow(numSkuData);
    }

    // 3. Fallback ONLY — If no product exists with that ID, slug, or SKU anywhere,
    // apply 3000 offset tolerance mapping for legacy external links
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
            
          if (altData) return formatProductRow(altData);
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
              
            if (altData) return formatProductRow(altData);
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

    const results = (data || []).map(formatProductRow);

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
            results.push(formatProductRow(p));
          }
        }
      }
    }

    return results;
  }
};
