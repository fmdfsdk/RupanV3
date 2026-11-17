# Workspace Customizations & Rules

## Vercel Routing and Rewrites

To maintain compatibility with both static React SPA routing and dynamic Supabase landing pages without causing serverless function overhead or infinite redirects, follow these rules:

1. **Standard SPA Routes (Static CDN Rewrite)**:
   - All standard React routes (e.g., `/shop`, `/cart`, `/checkout`, `/about-us`, `/product/:id*`, etc.) must be listed explicitly in `vercel.json` rewrites to point directly to `/index.html`.
   - This ensures Vercel's CDN serves them statically. Bypassing the serverless function prevents direct page refreshes/loads from throwing file-not-found errors and redirecting to the homepage.

2. **Custom Landing Pages & Blogs (Dynamic Fallback Rewrite)**:
   - Keep the catch-all rewrite rule `"source": "/:path*"` -> `"destination": "/api/landing?__path=/:path*"` at the very bottom of the rewrites list.
   - Any path not matched by standard SPA routes will fall through to this rule, allowing `api/landing.ts` to query Supabase for dynamic landing pages (`category === '__landing_page__'`) and inject scripts correctly.

3. **Product ID Query Parameter Redirects**:
   - `/product?id=...` matches the fallback `/api/landing` routing.
   - `landing.ts` detects `/product` with an `id` query parameter, resolves the target product using offset tolerance mapping (3000 offset, prefix matching), and issues a `301` HTTP redirect to the correct slugged path (e.g., `/product/a9-pro-app-supported-anc-enc-display-touch-control-earbuds-5184`).
   - A client-side route fallback is registered under `<Route path="/product" element={<ProductRedirect />} />` in `App.tsx` for local dev environment support.

## Database Standards & Schema Persistence

1. **No Fragile Bypasses for Core eCommerce Data**:
   - Any setting, flag, catalog attribute, or feature state (e.g., categories, stock maintenance flags, variants, inventory, pricing settings, order statuses) must be modeled and stored directly in Supabase database tables and columns.
   - Do NOT bypass database storage with temporary client-side memory or ad-hoc localStorage workarounds when a proper database column or table is required to maintain a standard, professional eCommerce backend.

2. **Strict SQL Notification Requirement**:
   - Whenever code changes introduce a new column, new table, schema migration, RLS policy, or permission grant, the agent **MUST strictly and explicitly instruct the user to run the required SQL**.
   - The response must provide:
     * A clear notice stating that SQL execution is required in the Supabase Dashboard.
     * The complete, copy-pasteable SQL snippet.
     * The version-controlled `.sql` migration file path saved inside `supabase/`.
   - Never silently assume migrations have run or omit alerting the user when database changes are needed.
