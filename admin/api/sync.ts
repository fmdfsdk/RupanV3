import { createClient } from '@supabase/supabase-js';

// Setup Supabase Client with Service Role Key to bypass RLS for write operations
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

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
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
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
        'API-KEY': sourceConfig.api_key,
        'SECRET-KEY': sourceConfig.secret_key
      }
    });

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

    let importedCount = 0;
    let updatedCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    // 3. Process products in batch
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
        if (item.thumbnail_img) imagesSet.add(item.thumbnail_img);
        if (Array.isArray(item.product_images)) {
          item.product_images.forEach((img: any) => {
            if (img.product_image) imagesSet.add(img.product_image);
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

        if (Array.isArray(item.product_variants)) {
          item.product_variants.forEach((v: any) => {
            const attr = String(v.attribute).trim().toLowerCase();
            const val = String(v.variant).trim();
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

        // Fallback default sizes if none provided (only for clothing categories)
        const clothingCategories = ['panjabi', 'saree', 'kurti', 'shirt', 'polo', 'clothing', 'women', 'men', 'couple', 'fashion', 'kids'];
        const itemCategoryLower = (item.category || '').toLowerCase();
        const isClothing = clothingCategories.some(c => itemCategoryLower.includes(c));

        if (sizes.length === 0 && isClothing) {
          sizes.push('M', 'L', 'XL');
        }

        // Pricing calculation (purchase price + markup percentage)
        const purchasePrice = Number(item.sale_price || item.price || 0);
        const regularPrice = Number(item.price || 0);
        
        // If markup is defined, apply it on top of Rupan's cost (sale_price). 
        // Otherwise, retail price is the supplier regular price.
        const price = markup > 0
          ? Math.round(purchasePrice * (1 + markup / 100))
          : regularPrice;

        const discountPrice = markup > 0 && regularPrice > purchasePrice
          ? Math.round(regularPrice) // if marked up, make original retail price the "discounted from" reference if higher
          : undefined;

        // Generate clean tags
        const tags = [item.category || 'Reseller'];

        // Determine stock availability
        const isOutOfStock = 
          item.stock_status === 'out_of_stock' || 
          item.stock_status === 'unavailable' ||
          item.status === 'inactive';
          
        const stock = isOutOfStock ? 0 : 50;

        // Map fields into final products schema
        const productRow = {
          id: `${source}-${item.id}`,
          name: item.name,
          slug: item.slug || `${item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}-${item.id}`,
          sku: item.product_code ? `${source.toUpperCase()}-${item.product_code}` : `${source.toUpperCase()}-${item.id}`,
          brand: item.brand || 'Rupan Reseller',
          category: item.category || 'General',
          sub_category: extractSubCategory(item.name, item.category),
          tags: tags,
          gender: 'Men', // Default, editable from dashboard
          price: price,
          discount_price: discountPrice || null,
          purchase_price: purchasePrice,
          rating: 5.0,
          reviews_count: 0,
          images: images,
          colors: colors,
          sizes: sizes,
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
        errors.push(`Error processing item ID ${item?.id || 'unknown'}: ${err.message}`);
      }
    }

    // 4. Perform bulk database upsert
    if (upsertBuffer.length > 0) {
      // Fetch existing rows to calculate exact insert vs update count
      const idsToUpsert = upsertBuffer.map(p => p.id);
      const { data: existingProducts } = await supabase
        .from('products')
        .select('id')
        .in('id', idsToUpsert);

      const existingIds = new Set(existingProducts?.map(p => p.id) || []);
      
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
