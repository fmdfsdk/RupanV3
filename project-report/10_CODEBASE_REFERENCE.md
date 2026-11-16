# 10. Complete Codebase and Symbol Reference

This reference catalogs the primary files, classes, functions, and symbols governing business logic, security, database access, and external integrations in Rupan.

---

## 10.1 Core Serverless Endpoints (`api/`)

### 1. `frontend/api/landing.ts`
- **Path**: [`frontend/api/landing.ts`](file:///Users/Admin/Developer/antigravity/RupanV3/frontend/api/landing.ts)
- **Primary Responsibility**: Dynamic HTML landing page serving, script injection (Meta Pixel, GA4, GTM), and product ID query parameter redirection.
- **Key Exported Symbols & Functions**:
  - `default async function handler(req: VercelRequest, res: VercelResponse)`: Primary serverless entry point.
  - `function isKnownReactRoute(urlPath: string): boolean`: Determines if route belongs to static React SPA.
  - `function serveIndexHtml(res: VercelResponse)`: Reads and returns `dist/index.html`.
  - `function injectMarketingAndSEO(html, page, settings, metadata): string`: Injects Meta Pixel, GTM, GA4, and SEO meta tags, and performs placeholder replacements.
  - `function renderErrorHtml(res, title, message)`: Returns custom branded Bengali error page.
- **Key Callers & Dependencies**: Vercel CDN catch-all rewrite (`/:path*`), `@supabase/supabase-js`, `fs`, `path`.
- **Related Database Tables**: `public.blogs` (`category = '__landing_page__'`), `public.products`, `public.settings`.
- **Risks & Caveats**: Replaces `RUPAN_META_CAPI_TOKEN` with live token from `settings`, exposing secret Graph API token to client browsers.

---

### 2. `frontend/api/place-order.ts`
- **Path**: [`frontend/api/place-order.ts`](file:///Users/Admin/Developer/antigravity/RupanV3/frontend/api/place-order.ts) (and diverged copy [`admin/api/place-order.ts`](file:///Users/Admin/Developer/antigravity/RupanV3/admin/api/place-order.ts))
- **Primary Responsibility**: Server-side order persistence and Telegram notification dispatch.
- **Key Exported Symbols & Functions**:
  - `default async function handler(req: any, res: any)`: API request handler.
  - `function escapeTelegramHtml(text: string): string`: Sanitizes customer text for Telegram HTML parse mode.
- **Key Callers & Dependencies**: Called by [`frontend/src/services/orderService.ts`](file:///Users/Admin/Developer/antigravity/RupanV3/frontend/src/services/orderService.ts).
- **Related Database Tables**: `public.orders`, `public.order_items`, `public.settings`.
- **Risks & Caveats**: No authentication, open CORS (`*`), no server-side price recalculation.

---

### 3. `frontend/api/meta-capi.ts`
- **Path**: [`frontend/api/meta-capi.ts`](file:///Users/Admin/Developer/antigravity/RupanV3/frontend/api/meta-capi.ts) (and diverged copy [`admin/api/meta-capi.ts`](file:///Users/Admin/Developer/antigravity/RupanV3/admin/api/meta-capi.ts))
- **Primary Responsibility**: Meta Conversions API gateway.
- **Key Exported Symbols & Functions**:
  - `default async function handler(req: VercelRequest, res: VercelResponse)`: Gateway handler.
  - `function sha256(value: string): string`: Normalizes and hashes customer PII.
  - `function hashPhone(phone: string): string`: Strips non-digits and SHA-256 hashes phone numbers.
  - `function hashEmail(email: string): string`: Lowercases and hashes email addresses.
  - `function getClientIp(req: VercelRequest): string | undefined`: Derives IP address from `x-forwarded-for`.
- **Key Callers & Dependencies**: Called by [`frontend/src/lib/telemetry.ts`](file:///Users/Admin/Developer/antigravity/RupanV3/frontend/src/lib/telemetry.ts).
- **Related Database Tables**: `public.settings` (optional fallback for token).
- **Risks & Caveats**: Client transmits access token in request body.

---

### 4. `admin/api/sync.ts`
- **Path**: [`admin/api/sync.ts`](file:///Users/Admin/Developer/antigravity/RupanV3/admin/api/sync.ts)
- **Primary Responsibility**: Reseller product ingestion from Mohasagor API.
- **Key Exported Symbols & Functions**:
  - `default async function handler(req: any, res: any)`: Ingestion handler.
  - `function getColorMetadata(colorName: string)`: Maps text color names to Tailwind CSS classes and hex codes.
  - `function sanitizeForJsonb(obj: any): any`: Strips PostgreSQL JSONB control characters (ASCII 0–31).
  - `function extractSubCategory(name: string, category: string): string`: Rule-based subcategory classifier.
- **Key Callers & Dependencies**: Called by [`admin/src/components/tabs/SyncTab.tsx`](file:///Users/Admin/Developer/antigravity/RupanV3/admin/src/components/tabs/SyncTab.tsx). Uses `SUPABASE_SERVICE_ROLE_KEY`.
- **Related Database Tables**: `public.sync_sources`, `public.sync_logs`, `public.categories`, `public.products`, `public.settings`.
- **Risks & Caveats**: Hardcoded fallback credentials in DDL; execution time vulnerable to Vercel 10s function timeout on slow upstream responses.

---

## 10.2 Shared and Core Domain Layer (`shared/`)

### 5. `shared/supabase.ts`
- **Path**: [`shared/supabase.ts`](file:///Users/Admin/Developer/antigravity/RupanV3/shared/supabase.ts) (copied to `frontend/src/lib/supabase.ts` and `admin/src/lib/supabase.ts`)
- **Primary Responsibility**: Dual-mode database client providing Supabase PostgREST connectivity or browser `LocalStorage` mock simulation.
- **Key Exported Symbols & Classes**:
  - `class LocalDatabase`: Browser-based mock engine managing tables `rup_db_*` in `localStorage`.
  - `class MockAuth`: Simulates user sessions and auto-logs in demo Super Admin (`admin@rupan.com`).
  - `class QueryBuilderWrapper`: PostgREST query builder translating camelCase to snake_case.
  - `class SupabaseClientWrapper`: Top-level client delegating between mock and real client.
  - `export const supabase`: Active client instance.
  - `export const checkSupabaseConnection(): Promise<boolean>`: Connection test runner.
  - `export const getSupabaseConnectionError(): Promise<string | null>`: Diagnostic error extractor.
- **Risks & Caveats**: Substantial drift exists between `shared/supabase.ts` and app copies; `sync-shared.js` will overwrite app copies upon build.

---

### 6. `shared/services/productService.ts`
- **Path**: [`shared/services/productService.ts`](file:///Users/Admin/Developer/antigravity/RupanV3/shared/services/productService.ts)
- **Primary Responsibility**: Product catalog fetching, filtering, full-text search, and offset resolution.
- **Key Exported Symbols & Functions**:
  - `fetchProducts(): Promise<Product[]>`: Fetches first 1,000 published products.
  - `fetchProductCatalogIndex(): Promise<Product[]>`: Fetches all product IDs and slugs via chunked pagination.
  - `fetchProductsFiltered(filters): Promise<{ products, count }>`: Executes server-side filtered queries.
  - `fetchProductByIdOrSlug(idOrSlug): Promise<Product | null>`: Exact match + 3000 offset tolerance mapping.
  - `searchProducts(query, limit): Promise<Product[]>`: Executes PostgreSQL `search_products` RPC function.
- **Key Callers & Dependencies**: [`useStore.ts`](file:///Users/Admin/Developer/antigravity/RupanV3/frontend/src/store/useStore.ts), [`ShopPage.tsx`](file:///Users/Admin/Developer/antigravity/RupanV3/frontend/src/pages/ShopPage.tsx), [`ProductDetailPage.tsx`](file:///Users/Admin/Developer/antigravity/RupanV3/frontend/src/pages/ProductDetailPage.tsx).
- **Related Database Tables**: `public.products`.

---

### 7. `shared/services/orderService.ts`
- **Path**: [`shared/services/orderService.ts`](file:///Users/Admin/Developer/antigravity/RupanV3/shared/services/orderService.ts) (and diverged copy [`frontend/src/services/orderService.ts`](file:///Users/Admin/Developer/antigravity/RupanV3/frontend/src/services/orderService.ts))
- **Primary Responsibility**: Order creation, customer order history, and tracking.
- **Key Exported Symbols & Functions**:
  - `createOrder(order, metaEventId, isGuest): Promise<void>`: Calls `/api/place-order`, saves to `rupan_local_orders`, and attempts fallback direct DB insert.
  - `fetchOrdersByCustomer(username): Promise<Order[]>`: Fetches orders by customer name.
  - `fetchOrdersByUserId(userId): Promise<Order[]>`: Fetches orders by user UUID.
  - `fetchOrderByIdAndPhone(id, phone): Promise<Order | null>`: Resolves order for public tracking.
- **Key Callers & Dependencies**: [`CheckoutPage.tsx`](file:///Users/Admin/Developer/antigravity/RupanV3/frontend/src/pages/CheckoutPage.tsx), [`OrderTrackingPage.tsx`](file:///Users/Admin/Developer/antigravity/RupanV3/frontend/src/pages/OrderTrackingPage.tsx), [`useStore.ts`](file:///Users/Admin/Developer/antigravity/RupanV3/frontend/src/store/useStore.ts).
- **Related Database Tables**: `public.orders`, `public.order_items`.

---

## 10.3 State, Telemetry, and Utility Layer

### 8. `frontend/src/store/useStore.ts`
- **Path**: [`frontend/src/store/useStore.ts`](file:///Users/Admin/Developer/antigravity/RupanV3/frontend/src/store/useStore.ts)
- **Primary Responsibility**: Central client state manager (cart, catalog, filters, user session, checkout).
- **Key Exported Symbols & Functions**:
  - `useStore`: Primary Zustand hook.
  - `loadInitialData()`: Initializes store from database or cache.
  - `addToCart(product, size, color, qty)`: Adds items to cart.
  - `applyCoupon(code)`: Verifies coupon discount rules.
  - `placeOrder(formInputs)`: Orchestrates order placement, Telegram alert, and CAPI `Purchase` event.
  - `addToast(message, type)`: Floating alert portal manager.
- **Risks & Caveats**: Hardcoded test customer data in default state (`currentUser`, `checkoutForm`). Dispatches Telegram bot message directly from browser client.

---

### 9. `frontend/src/lib/telemetry.ts`
- **Path**: [`frontend/src/lib/telemetry.ts`](file:///Users/Admin/Developer/antigravity/RupanV3/frontend/src/lib/telemetry.ts)
- **Primary Responsibility**: Dual-channel marketing and conversion tracking integration.
- **Key Exported Symbols & Functions**:
  - `initializeTelemetry(config)`: Injects Meta Pixel, GTM, and GA4 scripts.
  - `generateEventId(eventName)`: Creates unique ID for event deduplication.
  - `trackPageView(url, eventId, testCode)`: Dual fires pageview.
  - `trackViewContent(product, eventId, testCode)`: Dual fires product view.
  - `trackAddToCart(product, size, color, qty, eventId, testCode)`: Dual fires cart addition.
  - `trackInitiateCheckout(cart, total, eventId, testCode)`: Dual fires checkout start.
  - `trackPurchase(order, eventId, testCode)`: Dual fires purchase conversion.
- **Key Callers & Dependencies**: [`App.tsx`](file:///Users/Admin/Developer/antigravity/RupanV3/frontend/src/App.tsx), [`ProductDetail.tsx`](file:///Users/Admin/Developer/antigravity/RupanV3/frontend/src/components/ProductDetail.tsx), [`CheckoutPage.tsx`](file:///Users/Admin/Developer/antigravity/RupanV3/frontend/src/pages/CheckoutPage.tsx).

---

### 10. `frontend/src/utils/image.ts`
- **Path**: [`frontend/src/utils/image.ts`](file:///Users/Admin/Developer/antigravity/RupanV3/frontend/src/utils/image.ts)
- **Primary Responsibility**: Image proxying, WebP compression, and SEO slug formatting.
- **Key Exported Symbols & Functions**:
  - `getOptimizedImageUrl(url: string, width = 600): string`: Rewrites external URLs to `https://wsrv.nl/?url=...&output=webp`.
  - `getProductSlug(name: string, productId: string): string`: Produces SEO-friendly URL slug with numeric ID appended (e.g. `royal-panjabi-4083`).
- **Risks & Caveats**: Complete reliance on external free proxy `wsrv.nl`.
