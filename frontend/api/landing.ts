import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as fs from 'fs';
import * as path from 'path';

// Known React SPA routes — these should always serve index.html directly
// without hitting the database. Add any new top-level routes here.
const REACT_ROUTES = new Set([
  '/', '/shop', '/cart', '/checkout', '/account', '/about', '/contact',
  '/blog', '/search', '/wishlist', '/order-success', '/order-tracking',
  '/offers', '/new-arrivals', '/categories', '/faq', '/policy',
  '/about-us', '/contact-us', '/track-order', '/offer', '/new-arrival',
  '/faqs', '/my-account', '/register', '/blogs', '/product-search'
]);

const REACT_ROUTE_PREFIXES = [
  '/product/', '/shop/', '/account/', '/order/', '/category/',
];

function isKnownReactRoute(urlPath: string): boolean {
  const pathname = urlPath.split('?')[0];
  if (REACT_ROUTES.has(pathname)) return true;
  for (const prefix of REACT_ROUTE_PREFIXES) {
    if (pathname.startsWith(prefix)) return true;
  }
  return false;
}

function serveIndexHtml(res: VercelResponse) {
  const pathsToTry = [
    path.join(process.cwd(), 'dist', 'index.html'),
    path.join(process.cwd(), 'index.html'),
    path.join(__dirname, '..', 'dist', 'index.html'),
    path.join(__dirname, 'dist', 'index.html'),
    path.join(__dirname, 'index.html'),
    path.join(process.cwd(), 'frontend', 'dist', 'index.html'),
    path.join(process.cwd(), '..', 'dist', 'index.html'),
  ];

  let html = '';
  let resolvedPath = '';
  let lastError: any = null;

  for (const p of pathsToTry) {
    try {
      if (fs.existsSync(p)) {
        html = fs.readFileSync(p, 'utf-8');
        resolvedPath = p;
        break;
      }
    } catch (err: any) {
      lastError = err;
    }
  }

  if (html) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
    return res.status(200).send(html);
  } else {
    console.error(`serveIndexHtml failed. Tried paths: ${pathsToTry.join(', ')}. Last error: ${lastError?.message}`);
    // Fallback: redirect to root and let Vercel serve it
    res.setHeader('Location', '/');
    return res.status(302).end();
  }
}

/**
 * Dynamically injects SEO Meta Tags and Marketing/Tracking Scripts (GTM, GA4, Meta Pixel)
 * into the landing page HTML.
 */
function injectMarketingAndSEO(html: string, page: any, settings: any, metadata: any): string {
  const seoEnabled = metadata.seoEnabled !== false;

  const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

  let modifiedHtml = html;

  // 1. Perform placeholder replacements
  if (settings) {
    modifiedHtml = modifiedHtml
      .replace(/RUPAN_META_PIXEL_ID/g, settings.meta_pixel_id || '')
      .replace(/RUPAN_META_CAPI_TOKEN/g, settings.meta_capi_access_token || '')
      .replace(/RUPAN_META_TEST_CODE/g, settings.meta_test_event_code || '')
      .replace(/RUPAN_GTM_ID/g, settings.google_tag_manager_id || '')
      .replace(/RUPAN_GA4_ID/g, settings.google_analytics_id || '')
      .replace(/RUPAN_INSIDE_DHAKA_SHIPPING/g, String(settings.inside_dhaka_shipping || '60'))
      .replace(/RUPAN_OUTSIDE_DHAKA_SHIPPING/g, String(settings.outside_dhaka_shipping || '120'))
      .replace(/RUPAN_FREE_SHIPPING_MIN/g, String(settings.free_shipping_min_order || '3000'));
  }

  modifiedHtml = modifiedHtml
    .replace(/RUPAN_SUPABASE_URL/g, supabaseUrl)
    .replace(/RUPAN_SUPABASE_KEY/g, supabaseKey);

  // 2. Inject SEO Tools if enabled
  if (seoEnabled) {
    const title = page.seo_title || page.title || 'Rupan';
    const description = page.seo_description || 'Rupan - Premium Bangladeshi Fashion Brand';
    
    const headInjections = `
    <!-- Dynamic SEO Meta Tags -->
    <title>${title}</title>
    <meta name="description" content="${description}" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary_large_image" />
    `;

    const headTagIndex = modifiedHtml.search(/<head>/i);
    if (headTagIndex !== -1) {
      modifiedHtml = modifiedHtml.slice(0, headTagIndex + 6) + headInjections + modifiedHtml.slice(headTagIndex + 6);
    }
  }

  return modifiedHtml;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Get the original URL path (Vercel passes it in req.url)
  // vercel.json rewrites pass the full original URL as ?__path= 
  const rawUrl = req.url || '/';
  const urlObj = new URL(rawUrl, 'http://localhost');
  const pathParam = urlObj.searchParams.get('__path') || (req.query.__path as string);
  const rawPath = pathParam ? pathParam.split('?')[0] : urlObj.pathname;
  const urlPath = rawPath.startsWith('/') ? rawPath : '/' + rawPath;
  const cleanPath = urlPath.split('?')[0];

  // A. Handle redirect for /product?id=Mohasagor8184
  const productId = req.query.id as string;
  if (cleanPath === '/product' && productId) {
    const cleanId = productId.trim();
    const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

    if (supabaseUrl && supabaseKey) {
      const supabaseClient = createClient(supabaseUrl, supabaseKey, {
        auth: { persistSession: false, autoRefreshToken: false }
      });

      try {
        let product: any = null;

        // 1. Try exact match first
        const { data: exact } = await supabaseClient
          .from('products')
          .select('id, slug')
          .or(`id.eq.${cleanId},slug.eq.${cleanId}`)
          .maybeSingle();

        if (exact) {
          product = exact;
        } else {
          // 2. If exact match fails, apply 3000 offset tolerance mapping
          const numMatch = cleanId.match(/\d+$/);
          if (numMatch) {
            const searchNum = parseInt(numMatch[0], 10);
            const prefixMatch = cleanId.match(/^[a-zA-Z]+/);
            const prefix = prefixMatch ? prefixMatch[0].toLowerCase() : 'mohasagor';

            const offsets = [-3000, 3000];
            let foundAlt = false;
            for (const offset of offsets) {
              const altNum = searchNum + offset;
              if (altNum > 0) {
                const altId = `${prefix}-${altNum}`;
                const { data: altData } = await supabaseClient
                  .from('products')
                  .select('id, slug')
                  .or(`id.eq.${altId},id.eq.${altNum}`)
                  .maybeSingle();

                if (altData) {
                  product = altData;
                  foundAlt = true;
                  break;
                }
              }
            }

            if (!foundAlt && !prefixMatch) {
              for (const offset of offsets) {
                const altNum = searchNum + offset;
                if (altNum > 0) {
                  const altId = `mohasagor-${altNum}`;
                  const { data: altData } = await supabaseClient
                    .from('products')
                    .select('id, slug')
                    .eq('id', altId)
                    .maybeSingle();

                  if (altData) {
                    product = altData;
                    break;
                  }
                }
              }
            }
          }
        }

        if (product) {
          const destination = `/product/${product.slug || product.id}`;
          res.setHeader('Location', destination);
          return res.status(301).end();
        }
      } catch (err) {
        console.error('Error resolving product redirect:', err);
      }
    }

    // Fallback: redirect to /shop if product resolution fails
    res.setHeader('Location', '/shop');
    return res.status(302).end();
  }

  // 1. If it's a known React SPA route, serve index.html immediately (no DB lookup)
  if (isKnownReactRoute(cleanPath)) {
    return serveIndexHtml(res);
  }

  // 2. Check Supabase for a custom page at this exact path
  const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

  if (!supabaseUrl || !supabaseKey) {
    // No Supabase credentials — serve index.html and let React handle it
    return serveIndexHtml(res);
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });

  // --- Strategy: try multiple slug matching approaches ---

  // Build slug variants to try: exact, and then by stripping common prefixes
  const slugVariants: string[] = [urlPath];

  // Also try stripping any /<prefix>/ from the beginning
  const slugWithoutPrefix = urlPath
    .replace(/^\//, '')
    .replace(/^[^/]+\//, '/');  // strip first segment → e.g. /offer26/foo → /foo
  if (slugWithoutPrefix !== urlPath) {
    slugVariants.push(slugWithoutPrefix);
  }

  // Also try extracting just the last segment as a slug suffix match
  const lastSegment = '/' + urlPath.replace(/^\//, '').replace(/.*\//, '');
  if (lastSegment !== urlPath) {
    slugVariants.push(lastSegment);
  }

  let pageRow: any = null;

  for (const variant of slugVariants) {
    // Try exact match
    const { data: exact } = await supabase
      .from('blogs')
      .select('id, title, content, category, status, seo_title, seo_description')
      .eq('id', variant)
      .eq('status', 'published')
      .maybeSingle();

    if (exact) {
      pageRow = exact;
      break;
    }

    // Try ending-with match (e.g. DB has /blog/q86-... user visits /offer26/q86-...)
    const slug = variant.replace(/^\//, '');
    if (slug) {
      const { data: endsWith } = await supabase
        .from('blogs')
        .select('id, title, content, category, status, seo_title, seo_description')
        .ilike('id', `%/${slug}`)
        .eq('status', 'published')
        .maybeSingle();

      if (endsWith) {
        pageRow = endsWith;
        break;
      }
    }
  }

  if (pageRow) {
    if (pageRow.category === '__landing_page__') {
      // Extract layout/marketing/SEO metadata comments
      const rawContent = pageRow.content || '';
      let metadata: any = { seoEnabled: true, marketingEnabled: true };
      const metadataMatch = rawContent.match(/^<!-- metadata:\s*({.*?})\s*-->/s);
      
      if (metadataMatch) {
        try {
          metadata = JSON.parse(metadataMatch[1]);
        } catch (e) {
          console.error("Failed to parse page metadata:", e);
        }
      }

      // Fetch global settings for Marketing integration keys
      let settings: any = null;
      try {
        const { data: settingsRow } = await supabase
          .from('settings')
          .select('*')
          .maybeSingle();
        settings = settingsRow;
      } catch (err) {
        console.error("Failed to fetch settings for marketing integration:", err);
      }

      // Clean metadata comments from raw HTML
      const cleanedHTML = rawContent
        .replace(/^<!-- layout:\s*(blank|standard)\s*-->\s*/i, '')
        .replace(/^<!-- metadata:\s*({.*?})\s*-->\s*/is, '');

      // Inject GTM, GA4, Meta Pixel scripts and meta tags
      const finalHtml = injectMarketingAndSEO(cleanedHTML, pageRow, settings, metadata);

      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
      return res.status(200).send(finalHtml);
    } else {
      // Regular blog post — serve index.html and let React's BlogPage render it
      return serveIndexHtml(res);
    }
  }

  // 3. Nothing found — serve index.html (React's CatchAllRoute shows 404)
  return serveIndexHtml(res);
}
