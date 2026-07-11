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
]);

const REACT_ROUTE_PREFIXES = [
  '/product/', '/shop/', '/account/', '/order/', '/category/',
];

function isKnownReactRoute(urlPath: string): boolean {
  if (REACT_ROUTES.has(urlPath)) return true;
  for (const prefix of REACT_ROUTE_PREFIXES) {
    if (urlPath.startsWith(prefix)) return true;
  }
  return false;
}

function serveIndexHtml(res: VercelResponse) {
  try {
    // Vercel places the built files at project root / dist
    const indexPath = path.join(process.cwd(), 'dist', 'index.html');
    const html = fs.readFileSync(indexPath, 'utf-8');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
    return res.status(200).send(html);
  } catch {
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
  const marketingEnabled = metadata.marketingEnabled !== false;

  let headInjections = '';
  let bodyInjections = '';

  // 1. Inject SEO Tools if enabled
  if (seoEnabled) {
    const title = page.seo_title || page.title || 'Rupan';
    const description = page.seo_description || 'Rupan - Premium Bangladeshi Fashion Brand';
    
    headInjections += `
    <!-- Dynamic SEO Meta Tags -->
    <title>${title}</title>
    <meta name="description" content="${description}" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary_large_image" />
    `;
  }

  // 2. Inject Marketing / Ad Tracking Tools if enabled and settings exist
  if (marketingEnabled && settings) {
    const gtmId = settings.google_tag_manager_id;
    const gaId = settings.google_analytics_id;
    const pixelId = settings.meta_pixel_id;

    // Google Tag Manager (GTM)
    if (gtmId) {
      headInjections += `
    <!-- Google Tag Manager -->
    <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','${gtmId}');</script>
    <!-- End Google Tag Manager -->
      `;

      bodyInjections += `
    <!-- Google Tag Manager (noscript) -->
    <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${gtmId}"
    height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
    <!-- End Google Tag Manager (noscript) -->
      `;
    }

    // Google Analytics 4 (GA4)
    if (gaId) {
      headInjections += `
    <!-- Google Analytics (gtag.js) -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=${gaId}"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${gaId}');
    </script>
      `;
    }

    // Meta Pixel
    if (pixelId) {
      headInjections += `
    <!-- Meta Pixel Code -->
    <script>
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', '${pixelId}');
      fbq('track', 'PageView');
    </script>
    <!-- End Meta Pixel Code -->
      `;

      bodyInjections += `
    <!-- Meta Pixel noscript -->
    <noscript><img height="1" width="1" style="display:none"
    src="https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1"
    /></noscript>
      `;
    }

    // Future-proof generic custom header / footer scripts from settings
    // If you add header_script / footer_script columns to settings in the future, they are automatically injected here!
    if (settings.header_script) {
      headInjections += `\n<!-- Settings Custom Header Script -->\n${settings.header_script}\n`;
    }
    if (settings.footer_script) {
      bodyInjections += `\n<!-- Settings Custom Footer Script -->\n${settings.footer_script}\n`;
    }
  }

  // Inject into HTML content
  let modifiedHtml = html;

  // Insert head injections
  if (headInjections) {
    const headTagIndex = modifiedHtml.search(/<head>/i);
    if (headTagIndex !== -1) {
      // Insert right after <head> tag
      modifiedHtml = modifiedHtml.slice(0, headTagIndex + 6) + headInjections + modifiedHtml.slice(headTagIndex + 6);
    } else {
      // No head tag found, prepended to beginning
      modifiedHtml = headInjections + modifiedHtml;
    }
  }

  // Insert body injections
  if (bodyInjections) {
    const bodyTagIndex = modifiedHtml.search(/<body>/i);
    if (bodyTagIndex !== -1) {
      // Insert right after <body> tag
      modifiedHtml = modifiedHtml.slice(0, bodyTagIndex + 6) + bodyInjections + modifiedHtml.slice(bodyTagIndex + 6);
    } else {
      // No body tag found, appended to end
      modifiedHtml = modifiedHtml + bodyInjections;
    }
  }

  // 3. Automatically replace placeholder values if they exist in the pasted code
  if (settings) {
    if (settings.meta_pixel_id) {
      modifiedHtml = modifiedHtml.replace(/YOUR_PIXEL_ID|YOUR-PIXEL-ID|YOUR_FACEBOOK_PIXEL_ID/g, settings.meta_pixel_id);
    }
    if (settings.google_tag_manager_id) {
      modifiedHtml = modifiedHtml.replace(/YOUR_GTM_ID|YOUR-GTM-ID/g, settings.google_tag_manager_id);
    }
    if (settings.google_analytics_id) {
      modifiedHtml = modifiedHtml.replace(/YOUR_GA_ID|YOUR-GA-ID|YOUR_GA4_ID|YOUR-GA4-ID/g, settings.google_analytics_id);
    }
  }

  return modifiedHtml;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Get the original URL path (Vercel passes it in req.url)
  // vercel.json rewrites pass the full original URL as ?__path= 
  const rawPath = (req.query.__path as string) || req.url?.split('?')[0] || '/';
  const urlPath = rawPath.startsWith('/') ? rawPath : '/' + rawPath;

  // 1. If it's a known React SPA route, serve index.html immediately (no DB lookup)
  if (isKnownReactRoute(urlPath)) {
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
