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

function renderErrorHtml(res: VercelResponse, title: string = 'সাময়িক সমস্যা হয়েছে', message: string = 'দুঃখিত, পেজটি লোড করতে সাময়িক টেকনিক্যাল সমস্যা হয়েছে। দয়া করে মেইন ওয়েবসাইটে ফিরে যান।', statusCode: number = 500) {
  const html = `<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Rupan | ${title}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@600;700&family=Hind+Siliguri:wght@400;600&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Hind Siliguri', sans-serif; }
    h1, a { font-family: 'Fredoka', 'Hind Siliguri', sans-serif; }
  </style>
</head>
<body class="bg-slate-50 text-slate-800 min-h-screen flex items-center justify-center p-4">
  <div class="max-w-md w-full bg-white rounded-3xl p-8 text-center shadow-xl border border-slate-100">
    <div class="w-20 h-20 bg-orange-50 text-[#ff5c00] rounded-full flex items-center justify-center mx-auto mb-6 text-3xl font-bold">
      ⚠️
    </div>
    <h1 class="text-2xl font-bold text-slate-900 mb-2">${title}</h1>
    <p class="text-slate-500 text-sm mb-8 leading-relaxed">
      ${message}
    </p>
    <a href="https://www.myrupan.com" class="inline-flex items-center justify-center gap-2 bg-[#ff5c00] hover:bg-orange-600 text-white font-bold text-base px-8 py-3.5 rounded-full transition-all shadow-lg hover:shadow-orange-200 cursor-pointer">
      🏠 হোমপেজে ফিরে যান (Return to Homepage)
    </a>
  </div>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  return res.status(statusCode).send(html);
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
    return renderErrorHtml(res, 'পেজটি লোড হতে সমস্যা হয়েছে', 'অনুরোধকৃত পেজটি সার্ভ করতে সমস্যা হচ্ছে। দয়া করে হোমপেজে ফিরে যান।');
  }
}

/**
 * Dynamically injects SEO Meta Tags and Marketing/Tracking Scripts (GTM, GA4, Meta Pixel)
 * into the landing page HTML.
 */
function injectMarketingAndSEO(html: string, page: any, settings: any, metadata: any): string {
  const seoEnabled = metadata.seoEnabled !== false;
  const marketingEnabled = metadata.marketingEnabled !== false;

  const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

  let modifiedHtml = html;

  // 1. Perform placeholder replacements (both RUPAN_* and standard aliases e.g. META_PIXEL_ID)
  if (settings) {
    const pixelId = settings.meta_pixel_id || '';
    const capiToken = settings.meta_capi_access_token || '';
    const testCode = settings.meta_test_event_code || '';
    const gtmId = settings.google_tag_manager_id || '';
    const gaId = settings.google_analytics_id || '';
    const insideDhaka = String(settings.inside_dhaka_shipping || '60');
    const outsideDhaka = String(settings.outside_dhaka_shipping || '120');
    const freeShippingMin = String(settings.free_shipping_min_order || '3000');

    modifiedHtml = modifiedHtml
      .replace(/RUPAN_META_PIXEL_ID|META_PIXEL_ID|YOUR_PIXEL_ID|YOUR_PIXEL_ID_HERE|YOUR_FACEBOOK_PIXEL_ID|FB_PIXEL_ID/g, pixelId)
      .replace(/RUPAN_META_CAPI_TOKEN|META_CAPI_TOKEN|YOUR_CAPI_TOKEN/g, capiToken)
      .replace(/RUPAN_META_TEST_CODE|META_TEST_CODE|YOUR_TEST_CODE/g, testCode)
      .replace(/RUPAN_GTM_ID|GTM_ID|YOUR_GTM_ID|YOUR_GTM_CONTAINER_ID/g, gtmId)
      .replace(/RUPAN_GA4_ID|GA4_ID|YOUR_GA4_ID|YOUR_GA_ID/g, gaId)
      .replace(/RUPAN_INSIDE_DHAKA_SHIPPING/g, insideDhaka)
      .replace(/RUPAN_OUTSIDE_DHAKA_SHIPPING/g, outsideDhaka)
      .replace(/RUPAN_FREE_SHIPPING_MIN/g, freeShippingMin);
  }

  modifiedHtml = modifiedHtml
    .replace(/RUPAN_SUPABASE_URL|SUPABASE_URL/g, supabaseUrl)
    .replace(/RUPAN_SUPABASE_KEY|SUPABASE_KEY/g, supabaseKey);

  // 2. Inject SEO Tools if enabled
  if (seoEnabled) {
    const title = page.seo_title || page.title || 'Rupan';
    const description = page.seo_description || 'Rupan - Premium Bangladeshi Fashion Brand';
    
    const headSeoInjections = `
    <!-- Dynamic SEO Meta Tags -->
    <title>${title}</title>
    <meta name="description" content="${description.replace(/"/g, '&quot;')}" />
    <meta property="og:title" content="${title.replace(/"/g, '&quot;')}" />
    <meta property="og:description" content="${description.replace(/"/g, '&quot;')}" />
    <meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary_large_image" />
    `;

    const headTagIndex = modifiedHtml.search(/<head>/i);
    if (headTagIndex !== -1) {
      modifiedHtml = modifiedHtml.slice(0, headTagIndex + 6) + headSeoInjections + modifiedHtml.slice(headTagIndex + 6);
    }
  }

  // 3. Inject Marketing Scripts (Meta Pixel, GTM, GA4, Header/Footer Scripts) if marketingEnabled !== false
  if (marketingEnabled && settings) {
    let headMarketingScripts = '';
    let bodyMarketingScripts = '';

    // A. Meta Pixel Injection
    if (settings.meta_pixel_id && !modifiedHtml.includes('connect.facebook.net') && !modifiedHtml.includes(settings.meta_pixel_id)) {
      headMarketingScripts += `
<!-- Dynamic Meta Pixel Code (Rupan) -->
<script>
  !function(f,b,e,v,n,t,s)
  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
  n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t,s)}(window, document,'script',
  'https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', '${settings.meta_pixel_id}');
  fbq('track', 'PageView');
</script>
<noscript><img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${settings.meta_pixel_id}&ev=PageView&noscript=1"/></noscript>
<!-- End Meta Pixel Code -->
`;
    }

    // B. Google Tag Manager Injection
    if (settings.google_tag_manager_id && !modifiedHtml.includes('gtm.js')) {
      headMarketingScripts += `
<!-- Dynamic Google Tag Manager (Rupan) -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${settings.google_tag_manager_id}');</script>
<!-- End Google Tag Manager -->
`;
      bodyMarketingScripts += `
<!-- Dynamic Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${settings.google_tag_manager_id}"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->
`;
    }

    // C. GA4 Injection
    if (settings.google_analytics_id && !modifiedHtml.includes('googletagmanager.com/gtag/js')) {
      headMarketingScripts += `
<!-- Dynamic Google Analytics GA4 (Rupan) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${settings.google_analytics_id}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '${settings.google_analytics_id}');
</script>
`;
    }

    // D. Custom Header Script Injection
    if (settings.header_script) {
      headMarketingScripts += `\n<!-- Dynamic Custom Header Script -->\n${settings.header_script}\n`;
    }

    // E. Custom Footer Script Injection
    if (settings.footer_script) {
      bodyMarketingScripts += `\n<!-- Dynamic Custom Footer Script -->\n${settings.footer_script}\n`;
    }

    // Inject Head Scripts
    if (headMarketingScripts) {
      const headIdx = modifiedHtml.search(/<head>/i);
      if (headIdx !== -1) {
        modifiedHtml = modifiedHtml.slice(0, headIdx + 6) + headMarketingScripts + modifiedHtml.slice(headIdx + 6);
      } else {
        modifiedHtml = headMarketingScripts + modifiedHtml;
      }
    }

    // Inject Body Scripts
    if (bodyMarketingScripts) {
      const bodyEndIdx = modifiedHtml.search(/<\/body>/i);
      if (bodyEndIdx !== -1) {
        modifiedHtml = modifiedHtml.slice(0, bodyEndIdx) + bodyMarketingScripts + modifiedHtml.slice(bodyEndIdx);
      } else {
        modifiedHtml += bodyMarketingScripts;
      }
    }
  }

  return modifiedHtml;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Get the original URL path (Vercel passes it in req.url)
    // vercel.json rewrites pass the full original URL as ?__path= 
    const rawUrl = req.url || '/';
    const urlObj = new URL(rawUrl, 'http://localhost');
    const pathParam = urlObj.searchParams.get('__path') || (req.query.__path as string);
    const rawPath = pathParam ? pathParam.split('?')[0] : urlObj.pathname;
    const urlPath = rawPath.startsWith('/') ? rawPath : '/' + rawPath;
    const cleanPath = urlPath.split('?')[0];

    // Reject /api/ routes so landing never intercepts serverless endpoints
    if (cleanPath.startsWith('/api/')) {
      return res.status(404).json({ error: 'API route not handled by landing renderer' });
    }

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
            let targetSlug = product.slug || product.id;
            if (targetSlug.startsWith('-')) {
              targetSlug = `product${targetSlug}`;
            }
            const destination = `/product/${targetSlug}`;
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
  } catch (err: any) {
    console.error("Unhandled exception in landing.ts serverless handler:", err);
    return renderErrorHtml(res, 'পেজটি লোড হতে সমস্যা হয়েছে', 'অনুরোধকৃত পেজটি লোড করতে সাময়িক টেকনিক্যাল সমস্যা হয়েছে। দয়া করে মেইন ওয়েবসাইটে ফিরে যান।');
  }
}
