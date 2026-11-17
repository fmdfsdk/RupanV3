import { createClient } from '@supabase/supabase-js';

// Setup Supabase Client with Service Role Key to bypass RLS for write operations
const supabaseUrl = 
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  '';
const supabaseServiceKey = 
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY ||
  '';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

// Color mapping helper to convert text names to UI tailwind classes and hex codes
const getColorMetadata = (colorName: string) => {
  const name = colorName.trim().toLowerCase();
  const colorMap: Record<string, { class: string; hex: string }> = {
    black: { class: 'bg-black', hex: '#000000' },
    white: { class: 'bg-white border border-gray-200', hex: '#ffffff' },
    red: { class: 'bg-red-500', hex: '#ef4444' },
    blue: { class: 'bg-blue-600', hex: '#2563eb' },
    green: { class: 'bg-green-600', hex: '#16a34a' },
    yellow: { class: 'bg-yellow-400', hex: '#facc15' },
    gray: { class: 'bg-gray-400', hex: '#9ca3af' },
    pink: { class: 'bg-pink-400', hex: '#f472b6' },
    purple: { class: 'bg-purple-600', hex: '#9333ea' },
    orange: { class: 'bg-orange-500', hex: '#f97316' },
    brown: { class: 'bg-amber-800', hex: '#92400e' },
    navy: { class: 'bg-blue-950', hex: '#172554' },
    maroon: { class: 'bg-rose-950', hex: '#4c0519' },
    olive: { class: 'bg-lime-900', hex: '#3f6212' },
    beige: { class: 'bg-[#f5f5dc]', hex: '#f5f5dc' },
    gold: { class: 'bg-[#ffd700]', hex: '#ffd700' },
    silver: { class: 'bg-[#c0c0c0]', hex: '#c0c0c0' }
  };
  return colorMap[name] || { class: 'bg-gray-300', hex: '#d1d5db' };
};

// Sanitizes strings recursively to prevent PostgreSQL json/jsonb parsing errors on bad control characters
function sanitizeStringForJsonb(str: string): string {
  // Strip control characters (0-31) except tab (9), newline (10), carriage return (13)
  return str.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '');
}

function sanitizeForJsonb(obj: any): any {
  if (typeof obj === 'string') {
    return sanitizeStringForJsonb(obj);
  }
  if (Array.isArray(obj)) {
    return obj.map(sanitizeForJsonb);
  }
  if (obj !== null && typeof obj === 'object') {
    const cleaned: any = {};
    for (const key of Object.keys(obj)) {
      cleaned[key] = sanitizeForJsonb(obj[key]);
    }
    return cleaned;
  }
  return obj;
}

// Detect product gender dynamically based on category and name
function detectProductGender(category: string, name: string): 'Men' | 'Women' | 'Couple' | 'Kids' | 'Accessories' {
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

  return 'Accessories';
}

// Extends subcategory detection dynamically based on product tags and name
function extractSubCategory(name: string, category: string): string {
  const n = name.toLowerCase();
  if (n.includes('three piece') || n.includes('three-piece')) return 'Three Piece';
  if (n.includes('hoodie')) return 'Hoodie';
  if (n.includes('speaker')) return 'Speaker';
  if (n.includes('microphone') || n.includes('mic')) return 'Microphone';
  if (n.includes('adapter') || n.includes('charger')) return 'Adapter';
  if (n.includes('watch')) return 'Watch';
  if (n.includes('saree') || n.includes('sari')) return 'Saree';
  if (n.includes('panjabi')) return 'Panjabi';
  if (n.includes('shirt')) return 'Shirt';
  if (n.includes('t-shirt') || n.includes('tshirt')) return 'T-Shirt';
  if (n.includes('kurti') || n.includes('kurtis')) return 'Kurti';
  
  // Fallback default
  return '';
}

export default async function handler(req: any, res: any) {
  // Configure CORS
  const origin = req.headers.origin;
  const allowedOrigins = ['https://myrupan.com', 'https://admin.myrupan.com'];
  const isLocal = origin && (origin.includes('localhost') || origin.includes('127.0.0.1'));
  
  if (origin && (allowedOrigins.includes(origin) || isLocal)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else if (!origin) {
    res.setHeader('Access-Control-Allow-Origin', 'https://admin.myrupan.com');
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Authentication check to secure the endpoint
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Unauthorized: Missing or invalid token.' });
  }
  const token = authHeader.split(' ')[1];
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  
  if (authError || !user) {
    return res.status(401).json({ success: false, error: `Unauthorized: ${authError?.message || 'Invalid user session.'}` });
  }
  
  // Check if the user is authorized (role in profiles)
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role, is_active')
    .eq('id', user.id)
    .single();
    
  if (profileError || !profile) {
    return res.status(403).json({ success: false, error: 'Forbidden: Profile not found.' });
  }
  
  if (!profile.is_active) {
    return res.status(403).json({ success: false, error: 'Forbidden: Account is deactivated.' });
  }
  
  const authorizedRoles = ['Super Admin', 'Admin', 'Manager', 'Editor'];
  if (!authorizedRoles.includes(profile.role)) {
    return res.status(403).json({ success: false, error: 'Forbidden: Insufficient privileges.' });
  }

  const { source = 'mohasagor', page = '1' } = req.query;
  const startedAt = new Date().toISOString();

  // Create temporary sync log record
  let logId: string | null = null;

  try {
    // 1. Fetch source credentials from database
    const { data: sourceConfig, error: configError } = await supabase
      .from('sync_sources')
      .select('*')
      .eq('id', source)
      .single();

    if (configError || !sourceConfig) {
      return res.status(404).json({ success: false, error: `Sync source '${source}' not found or database offline.` });
    }

    if (!sourceConfig.is_active) {
      return res.status(400).json({ success: false, error: `Sync source '${source}' is currently disabled.` });
    }

    // Insert running log record
    const { data: newLog } = await supabase
      .from('sync_logs')
      .insert([{
        source_id: source,
        status: 'running',
        items_fetched: 0,
        items_imported: 0,
        items_updated: 0,
        started_at: startedAt
      }])
      .select('id')
      .single();
    
    if (newLog) logId = newLog.id;

    // 2. Fetch products from third-party API
    const response = await fetch(`${sourceConfig.api_url}?page=${page}`, {
      method: 'GET',
      headers: {
        'api-key': sourceConfig.api_key,
        'secret-key': sourceConfig.secret_key,
        'API-KEY': sourceConfig.api_key,
        'SECRET-KEY': sourceConfig.secret_key,
        'Accept': 'application/json'
      }
    });

    if (response.status === 429) {
      const errorText = await response.text();
      let retryAfter = 20;
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.retry_after) {
          retryAfter = Number(errorJson.retry_after);
        }
      } catch (_) {}

      if (logId) {
        await supabase
          .from('sync_logs')
          .update({
            status: 'failed',
            error_message: `Rate limit hit (429): ${errorText}`,
            completed_at: new Date().toISOString()
          })
          .eq('id', logId);
      }

      return res.status(429).json({
        success: false,
        rateLimited: true,
        retry_after: retryAfter,
        message: 'Rate limit exceeded. Maximum 5 requests allowed per minute.',
        error: errorText
      });
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API fetch failed with status ${response.status}: ${errorText}`);
    }

    const payload = await response.json();
    const productsArray = payload.products || payload.data || [];
    const lastPage = payload.last_page || payload.totalPages || 1;
    const totalItems = payload.total || productsArray.length;

    if (!Array.isArray(productsArray)) {
      throw new Error('API response does not contain a valid products array.');
    }

    const markup = sourceConfig.config?.markup_percentage || 0;
    const autoPublish = sourceConfig.config?.auto_publish !== false;

    // Fetch site settings to get active pricing config, category margins and default margin overrides
    let deductionPercentage = 25; // Default 25% deduction
    let defaultMarginType: 'percentage' | 'fixed' = 'percentage';
    let defaultMargin = markup > 0 ? markup : 10;
    let categoryMargins: Record<string, any> = {};

    try {
      const { data: settingsData } = await supabase
        .from('settings')
        .select('homepage_config, pricing_config')
        .eq('id', 1)
        .maybeSingle();
      
      const pConfig = settingsData?.pricing_config || {};
      const hConfig = settingsData?.homepage_config || {};

      if (pConfig.deduction_percentage !== undefined) {
        deductionPercentage = Number(pConfig.deduction_percentage);
      } else if (hConfig.deduction_percentage !== undefined) {
        deductionPercentage = Number(hConfig.deduction_percentage);
      }

      if (pConfig.default_margin_type) {
        defaultMarginType = pConfig.default_margin_type;
      }
      if (pConfig.default_margin_value !== undefined) {
        defaultMargin = Number(pConfig.default_margin_value);
      } else if (hConfig.default_margin !== undefined) {
        defaultMargin = Number(hConfig.default_margin);
      }

      if (pConfig.category_margins) {
        categoryMargins = pConfig.category_margins;
      } else if (hConfig.category_margins) {
        categoryMargins = hConfig.category_margins;
      }
    } catch (_) {}

    let importedCount = 0;
    let updatedCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    // Helper to format/normalize image URLs
    const normalizeImageUrl = (url: any): string | null => {
      if (!url || typeof url !== 'string') return null;
      const trimmed = url.trim();
      if (!trimmed) return null;
      if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
      if (trimmed.startsWith('images/')) return `https://mohasagor.com.bd/public/storage/${trimmed}`;
      if (trimmed.startsWith('/storage/')) return `https://mohasagor.com.bd/public${trimmed}`;
      if (trimmed.startsWith('public/storage/')) return `https://mohasagor.com.bd/${trimmed}`;
      return `https://mohasagor.com.bd/public/storage/images/products/${trimmed}`;
    };

    // 3. Process products in batch
    const categoriesMap = new Map<string, string>();
    const upsertBuffer: any[] = [];

    for (const rawItem of productsArray) {
      try {
        if (!rawItem.id || !rawItem.name) {
          failedCount++;
          errors.push(`Skipped row missing id/name: ${JSON.stringify(rawItem).substring(0, 100)}`);
          continue;
        }

        // Sanitize the raw item recursively to strip PostgreSQL json/jsonb control characters
        const item = sanitizeForJsonb(rawItem);

        // Map images: thumbnail is index 0
        const imagesSet = new Set<string>();
        const mainThumb = normalizeImageUrl(item.thumbnail_img);
        if (mainThumb) imagesSet.add(mainThumb);

        const rawImages = item.product_images || item.product_image;
        if (Array.isArray(rawImages)) {
          rawImages.forEach((img: any) => {
            const rawUrl = typeof img === 'string' ? img : (img.product_image || img.image || img.url);
            const normalized = normalizeImageUrl(rawUrl);
            if (normalized) imagesSet.add(normalized);
          });
        }
        const images = Array.from(imagesSet);
        if (images.length === 0) {
          // Fallback image
          images.push('https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80&w=600');
        }

        // Parse color & size attributes from variants
        const colorsMap = new Map<string, { name: string; class: string; hex: string }>();
        const sizesSet = new Set<string>();

        const rawVariants = item.product_variants || item.product_variant;
        if (Array.isArray(rawVariants)) {
          rawVariants.forEach((v: any) => {
            const attr = String(v.attribute || v.attribute_name || '').trim().toLowerCase();
            const val = String(v.variant || v.variant_name || v.name || '').trim();
            if (attr === 'color' || attr === 'colour') {
              const meta = getColorMetadata(val);
              colorsMap.set(val.toLowerCase(), { name: val, class: meta.class, hex: meta.hex });
            } else if (attr === 'size') {
              sizesSet.add(val);
            }
          });
        }

        const colors = Array.from(colorsMap.values());
        const sizes = Array.from(sizesSet);
        // Only retain genuine variant sizes provided by API; do not inject dummy sizes

        const variantsList: any[] = [];
        if (sizes.length > 0) {
          variantsList.push({
            id: 'var_size',
            title: 'Size',
            mandatory: false,
            options: sizes.map((s: string) => ({ value: s, extraPrice: 0 }))
          });
        }
        if (colors.length > 0) {
          variantsList.push({
            id: 'var_color',
            title: 'Color',
            mandatory: false,
            options: colors.map((c: any) => ({ value: c.name, extraPrice: 0 }))
          });
        }

        // Parse category for margin lookup
        const rawCategory = (item.category || 'General').trim();
        const rawCategoryLower = rawCategory.toLowerCase();
        
        // Mohasagor Pricing Calculation:
        // sale_price = Wholesale Reseller Cost (purchase_price)
        // price = Maximum Retail Price (MSRP)
        const regularMSRP = Number(item.price || 0);
        const wholesaleCost = Number(item.sale_price || item.price || 0);

        // Step 1: Calculate Price Difference X = price - sale_price
        const diffX = Math.max(0, regularMSRP - wholesaleCost);

        // Step 2: Calculate Website Final Price (Floor Price)
        // Website Price = price - (0.25 * X)
        const websiteFinalPrice = Math.round(regularMSRP - (deductionPercentage / 100) * diffX);

        // Step 3: Apply Profit Margin (Selling Price = Final Price + Margin)
        let marginType = defaultMarginType;
        let marginVal = defaultMargin;

        for (const [catKey, marginSetting] of Object.entries(categoryMargins)) {
          if (rawCategoryLower.includes(catKey.toLowerCase()) || catKey.toLowerCase().includes(rawCategoryLower)) {
            if (typeof marginSetting === 'object' && marginSetting !== null) {
              marginType = (marginSetting as any).type || 'percentage';
              marginVal = Number((marginSetting as any).value || 0);
            } else {
              marginType = 'percentage';
              marginVal = Number(marginSetting);
            }
            break;
          }
        }

        let marginAmount = 0;
        if (marginType === 'fixed') {
          marginAmount = marginVal;
        } else {
          marginAmount = Math.round(websiteFinalPrice * (marginVal / 100));
        }

        const calculatedSellingPrice = websiteFinalPrice + marginAmount;

        let finalPrice = calculatedSellingPrice;
        let finalDiscountPrice: number | null = null;

        // If regular retail MSRP is higher than our selling price, 
        // present MSRP as strikethrough price and calculatedSellingPrice as discount_price
        if (regularMSRP > calculatedSellingPrice) {
          finalPrice = regularMSRP;
          finalDiscountPrice = calculatedSellingPrice;
        } else {
          finalPrice = calculatedSellingPrice;
          finalDiscountPrice = null;
        }

        // Parse and register category ID
        const categoryName = (item.category || 'General').trim();
        const categoryId = categoryName.toLowerCase();
        categoriesMap.set(categoryId, categoryName);

        // Generate clean tags
        const tags = [categoryName];

        // Determine stock availability
        const isOutOfStock = 
          item.stock_status === 'out_of_stock' || 
          item.stock_status === 'unavailable' ||
          item.status === 'inactive' ||
          (item.stock !== undefined && item.stock !== null && Number(item.stock) === 0);
          
        const stock = isOutOfStock ? 0 : (Number(item.stock) > 0 ? Number(item.stock) : 50);

        // Map fields into final products schema
        const cleanName = (item.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const baseSlug = cleanName || 'product';
        const code = item.product_code || item.id;
        const productRow = {
          id: `${source}-${item.id}`,
          name: item.name,
          slug: item.slug || `${baseSlug}-${code}`,
          sku: item.product_code ? `${source.toUpperCase()}-${item.product_code}` : `${source.toUpperCase()}-${item.id}`,
          brand: item.brand || 'Rupan',
          category: categoryId,
          sub_category: extractSubCategory(item.name, categoryName),
          tags: tags,
          gender: detectProductGender(categoryName, item.name),
          price: finalPrice,
          discount_price: finalDiscountPrice,
          purchase_price: wholesaleCost,
          final_price: websiteFinalPrice,
          rating: 5.0,
          reviews_count: 0,
          images: images,
          colors: colors,
          sizes: sizes,
          variants: variantsList,
          variant_stock: {},
          variant_images: {},
          description: item.details || item.name,
          short_description: item.details ? item.details.substring(0, 150) + '...' : item.name,
          features: [],
          stock: stock,
          low_stock_warning: 5,
          weight: 0.35,
          material: 'Premium Quality Blend',
          status: autoPublish ? 'published' : 'draft',
          is_featured: false,
          is_trending: false,
          is_new: true,
          is_best_seller: false,
          is_flash_sale: false,
          source_id: source,
          source_product_id: String(item.id),
          updated_at: new Date().toISOString()
        };

        upsertBuffer.push(productRow);
      } catch (err: any) {
        failedCount++;
        errors.push(`Error processing item ID ${rawItem?.id || 'unknown'}: ${err.message}`);
      }
    }

    // 3.5. Ensure all categories exist in the categories table first to satisfy FK constraint
    if (categoriesMap.size > 0) {
      const categoryRows = Array.from(categoriesMap.entries()).map(([id, name]) => ({
        id: id,
        name: name,
        slug: id.replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        is_active: true
      }));

      // Use ignoreDuplicates: true to preserve existing categories and their parent_id hierarchy
      const { error: catError } = await supabase
        .from('categories')
        .upsert(categoryRows, { onConflict: 'id', ignoreDuplicates: true });
        
      if (catError) {
        console.warn("Category upsert failed during sync:", catError.message);
      }
    }

    // 4. Perform bulk database upsert
    if (upsertBuffer.length > 0) {
      // Fetch full existing rows to preserve all admin customizations, flags, categories, and variant stocks
      const idsToUpsert = upsertBuffer.map(p => p.id);
      const { data: existingProducts } = await supabase
        .from('products')
        .select('*')
        .in('id', idsToUpsert);

      const existingMap = new Map((existingProducts || []).map(p => [p.id, p]));
      const existingIds = new Set(existingProducts?.map(p => p.id) || []);
      
      // Preserve admin modifications on existing products
      upsertBuffer.forEach(p => {
        const existing = existingMap.get(p.id);
        if (existing) {
          // 1. Preserve URL slug
          if (existing.slug) p.slug = existing.slug;

          // 2. Preserve Merchandising & Feature Flags
          if (existing.is_featured !== undefined && existing.is_featured !== null) {
            p.is_featured = existing.is_featured;
          }
          if (existing.is_trending !== undefined && existing.is_trending !== null) {
            p.is_trending = existing.is_trending;
          }
          if (existing.is_best_seller !== undefined && existing.is_best_seller !== null) {
            p.is_best_seller = existing.is_best_seller;
          }
          if (existing.is_flash_sale !== undefined && existing.is_flash_sale !== null) {
            p.is_flash_sale = existing.is_flash_sale;
            p.flash_sale_limit = existing.flash_sale_limit ?? p.flash_sale_limit;
            p.flash_sale_sold = existing.flash_sale_sold ?? p.flash_sale_sold;
          }
          if (existing.is_new !== undefined && existing.is_new !== null) {
            p.is_new = existing.is_new;
          }

          // 3. Preserve Admin Status & Visibility (e.g. if draft or archived)
          if (existing.status) {
            p.status = existing.status;
          }

          // 4. Preserve Category & Sub-category (if admin assigned to organized hierarchy)
          if (existing.category) {
            p.category = existing.category;
          }
          if (existing.sub_category) {
            p.sub_category = existing.sub_category;
          }

          // 5. Preserve Variants & Variant-wise Stock
          if (existing.maintain_variant_stock !== undefined && existing.maintain_variant_stock !== null) {
            p.maintain_variant_stock = existing.maintain_variant_stock;
          }
          if (existing.variant_stock && typeof existing.variant_stock === 'object' && Object.keys(existing.variant_stock).length > 0) {
            p.variant_stock = existing.variant_stock;
          }
          if (existing.variant_images && typeof existing.variant_images === 'object' && Object.keys(existing.variant_images).length > 0) {
            p.variant_images = existing.variant_images;
          }
          if (existing.variants && Array.isArray(existing.variants) && existing.variants.length > 0) {
            p.variants = existing.variants;
          }

          // 6. Preserve Custom SEO & Reviews overrides
          if (existing.seo_title) p.seo_title = existing.seo_title;
          if (existing.seo_description) p.seo_description = existing.seo_description;
          if (existing.rating !== undefined && existing.rating !== null) p.rating = existing.rating;
          if (existing.reviews_count !== undefined && existing.reviews_count !== null) p.reviews_count = existing.reviews_count;
        }
      });
      
      const { error: upsertError } = await supabase
        .from('products')
        .upsert(upsertBuffer, { onConflict: 'id' });

      if (upsertError) {
        console.warn(`Bulk upsert failed for page ${page}, falling back to individual inserts: ${upsertError.message}`);
        
        // Attempt individual upserts to isolate the problematic product(s)
        for (const row of upsertBuffer) {
          const { error: indError } = await supabase
            .from('products')
            .upsert([row], { onConflict: 'id' });
            
          if (indError) {
            failedCount++;
            errors.push(`Product ID ${row.id} failed: ${indError.message}`);
          } else {
            if (existingIds.has(row.id)) {
              updatedCount++;
            } else {
              importedCount++;
            }
          }
        }
      } else {
        // Bulk upsert succeeded
        upsertBuffer.forEach(p => {
          if (existingIds.has(p.id)) {
            updatedCount++;
          } else {
            importedCount++;
          }
        });
      }
    }

    const completedAt = new Date().toISOString();
    
    // 5. Update logs & credentials sync state
    if (logId) {
      await supabase
        .from('sync_logs')
        .update({
          status: 'success',
          items_fetched: productsArray.length,
          items_imported: importedCount,
          items_updated: updatedCount,
          items_failed: failedCount,
          details: { errors, total_items_api: totalItems },
          completed_at: completedAt
        })
        .eq('id', logId);
    }

    await supabase
      .from('sync_sources')
      .update({ last_sync_at: completedAt })
      .eq('id', source);

    return res.status(200).json({
      success: true,
      source,
      page: Number(page),
      last_page: Number(lastPage),
      total_items_source: Number(totalItems),
      items_fetched: productsArray.length,
      imported: importedCount,
      updated: updatedCount,
      failed: failedCount,
      errors: errors.slice(0, 10) // return up to 10 warnings
    });

  } catch (error: any) {
    console.error('[Sync Worker Error]:', error);
    const completedAt = new Date().toISOString();

    if (logId) {
      await supabase
        .from('sync_logs')
        .update({
          status: 'failed',
          error_message: error.message,
          completed_at: completedAt
        })
        .eq('id', logId);
    }

    return res.status(500).json({
      success: false,
      error: error.message,
      started_at: startedAt,
      failed_at: completedAt
    });
  }
}
