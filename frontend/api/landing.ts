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
      // ✅ Serve the custom HTML/CSS/JS page DIRECTLY — no React wrapper needed
      const html = pageRow.content || '';
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
      return res.status(200).send(html);
    } else {
      // Regular blog post — serve index.html and let React's BlogPage render it
      // The React app will find it in the store after Supabase loads
      return serveIndexHtml(res);
    }
  }

  // 3. Nothing found — serve index.html (React's CatchAllRoute shows 404)
  return serveIndexHtml(res);
}
