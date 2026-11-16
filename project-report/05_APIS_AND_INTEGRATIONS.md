# 05. API and Integration Catalog

## 5.1 Internal Serverless Endpoints

The system relies on Vercel Serverless Functions deployed under `api/`. Below is the complete catalog of verified internal endpoints.

---

### Endpoint 1: Dynamic Landing Page & Redirect Engine
- **Method & Route**: `GET /api/landing` (and wildcard rewrite `/:path*` via `vercel.json`)
- **Implementation File**: [`frontend/api/landing.ts`](file:///Users/Admin/Developer/antigravity/RupanV3/frontend/api/landing.ts) (`export default async function handler(req: VercelRequest, res: VercelResponse)`)
- **Purpose**:
  1. Catch all paths not matched by static React routes.
  2. Query `public.blogs` for dynamic landing pages (`category === '__landing_page__'`).
  3. Dynamically inject Meta Pixel, GTM, GA4, custom header/footer scripts, and SEO meta tags into HTML.
  4. Intercept `/product?id=...` and issue 301 HTTP permanent redirects using exact match or 3000 offset tolerance mapping.
- **Authentication**: None (Public).
- **Authorization**: None.
- **Input Schema & Validation**:
  - `query.__path` or `req.url`: String URL path.
  - `query.id`: Product ID string (for `/product` query redirect).
- **Output Schema**:
  - Landing page: `200 OK`, `Content-Type: text/html; charset=utf-8`, HTML string.
  - Known React SPA route: `200 OK`, `dist/index.html`.
  - Product query: `301 Moved Permanently`, `Location: /product/{slug}`.
  - Error fallback: `200 OK`, Custom Bengali HTML error page with home link.
- **Database Operations**:
  - `SELECT id, slug FROM products WHERE id = cleanId OR slug = cleanId`
  - `SELECT id, title, content, category, status, seo_title, seo_description FROM blogs WHERE id = variant AND status = 'published'`
  - `SELECT * FROM settings WHERE id = 1`
- **External Services Called**: None directly (injected script tags load assets from Google and Meta in customer browser).
- **Error Responses**: Catches exceptions and returns styled HTML error page (`renderErrorHtml()`) with HTTP 200 to prevent raw Vercel 500 crash pages.
- **Rate Limiting & Abuse Protections**: None implemented.
- **Idempotency**: Safe and idempotent (`GET`).
- **Timeout & Retry Behavior**: Subject to standard Vercel Serverless timeout (10–15s).
- **Logging & Observability**: Console errors logged to Vercel Function logs.
- **Relevant Tests**: Scratch script [`scratch/completed_landing.html`](file:///Users/Admin/Developer/antigravity/RupanV3/scratch/completed_landing.html).
- **Verified Gaps**:
  - If a landing page template contains `RUPAN_META_CAPI_TOKEN`, the private Meta CAPI Graph API access token from `settings.meta_capi_access_token` is injected into the HTML delivered to the customer browser.

---

### Endpoint 2: Order Placement and Dispatch Worker
- **Method & Route**: `POST /api/place-order`
- **Implementation File**: [`frontend/api/place-order.ts`](file:///Users/Admin/Developer/antigravity/RupanV3/frontend/api/place-order.ts) (and diverged copy [`admin/api/place-order.ts`](file:///Users/Admin/Developer/antigravity/RupanV3/admin/api/place-order.ts))
- **Purpose**:
  1. Persist new customer orders into Supabase `orders` and `order_items` tables.
  2. Resolve Telegram bot credentials from `settings` or environment variables.
  3. Send instant HTML-formatted order invoice alert to Telegram dispatch channel.
- **Authentication**: None (Open public endpoint with CORS `Access-Control-Allow-Origin: *`).
- **Authorization**: None.
- **Input Schema & Validation**:
  ```json
  {
    "order": {
      "id": "RUP-1234",
      "customerName": "Customer Name",
      "phone": "01712345678",
      "address": "Delivery Address",
      "area": "Inside Dhaka",
      "paymentMethod": "Cash on Delivery",
      "items": [
        {
          "productId": "mohasagor-4083",
          "productName": "Item Name",
          "color": "Black",
          "size": "XL",
          "price": 2500,
          "quantity": 1,
          "image": "https://..."
        }
      ],
      "subtotal": 2500,
      "shippingFee": 60,
      "total": 2560,
      "status": "Pending",
      "paymentStatus": "Unpaid",
      "transactionId": "TRX123",
      "paidConfirm": true
    },
    "metaEventId": "evt-purchase-12345",
    "isGuest": true
  }
  ```
  - Validation: Only checks `!order || !order.id`. Prices and items are **not** recalculated or validated on the server.
- **Output Schema**:
  - Success: `200 OK` `{ success: true, orderId: "RUP-1234", dbSaved: true, dbErrorMsg: "" }`
  - Error: `400 Bad Request` `{ error: "Invalid order payload" }`
  - Server Error: `500 Internal Server Error` `{ error: "..." }`
- **Database Operations**:
  - `INSERT INTO orders` (Full payload attempt).
  - Fallback: `INSERT INTO orders` (Core columns attempt if full payload fails).
  - `INSERT INTO order_items` (Loop of line items).
  - `SELECT * FROM settings` (To read `telegram_bot_token` and `telegram_chat_id`).
- **External Services Called**:
  - Telegram Bot API: `POST https://api.telegram.org/bot<token>/sendMessage`
  - Fallback logic: Converts negative personal chat ID prefix `-100` to positive ID if Telegram returns `chat not found`.
- **Rate Limiting & Abuse Protections**: **None**. Anyone on the internet can POST arbitrary order payloads and trigger Telegram bot messages.
- **Idempotency**: Not strictly idempotent (duplicate POST with same `id` will fail on primary key constraint if DB insert succeeds).
- **Timeout & Retry Behavior**: Standard serverless timeout (10s); no automated queueing.
- **Logging & Observability**: `console.log` and `console.error` in Vercel logs.
- **Relevant Tests**: None.
- **Verified Gaps**:
  - Total lack of server-side price recalculation (relies entirely on client-provided `order.total`).
  - Open CORS (`*`) allows external sites to trigger order creation and Telegram spam.
  - Code divergence between `frontend/api/place-order.ts` and `admin/api/place-order.ts`.

---

### Endpoint 3: Meta Conversions API (CAPI) Gateway
- **Method & Route**: `POST /api/meta-capi`
- **Implementation File**: [`frontend/api/meta-capi.ts`](file:///Users/Admin/Developer/antigravity/RupanV3/frontend/api/meta-capi.ts) (and diverged copy [`admin/api/meta-capi.ts`](file:///Users/Admin/Developer/antigravity/RupanV3/admin/api/meta-capi.ts))
- **Purpose**: Server-side conversion telemetry proxy. Receives unhashed event data from client, SHA-256 hashes PII, derives IP/User-Agent from Vercel headers, and transmits to Meta Graph API.
- **Authentication**: None.
- **Authorization**: None.
- **Input Schema & Validation**:
  ```typescript
  {
    pixelId: string;
    accessToken?: string;
    testEventCode?: string;
    events: [
      {
        eventName: string;       // e.g. "Purchase", "AddToCart", "PageView"
        eventId: string;         // Unique eventId for deduplication with browser pixel
        eventTime?: number;
        eventSourceUrl?: string;
        userData?: {
          email?: string;
          phone?: string;
          firstName?: string;
          lastName?: string;
          city?: string;
          country?: string;
          externalId?: string;
          clientIpAddress?: string;
          clientUserAgent?: string;
          fbp?: string;
          fbc?: string;
        };
        customData?: Record<string, any>;
      }
    ]
  }
  ```
  - Validation: Requires `pixelId` and non-empty `events` array.
  - Token resolution: If `accessToken` is missing or placeholder (`'RUPAN_META_CAPI_TOKEN'`), queries `settings.meta_capi_access_token` from database.
- **Output Schema**:
  - Success: `200 OK` `{ success: true, events_received: 1, fbtrace_id: "...", messages: [] }`
  - Error: `400 Bad Request` or Meta error status with `{ success: false, error: "..." }`
- **Database Operations**:
  - Optional fallback: `SELECT meta_capi_access_token FROM settings`
- **External Services Called**:
  - Meta Graph API: `POST https://graph.facebook.com/v21.0/{pixelId}/events`
- **Rate Limiting & Abuse Protections**: None.
- **Idempotency**: Event deduplication handled by Meta via matching `event_id` and `event_name`.
- **Timeout & Retry Behavior**: Standard serverless timeout.
- **Logging & Observability**: Logs event names and `fbtrace_id` to Vercel console.
- **Relevant Tests**: None.
- **Verified Gaps**:
  - Open CORS (`*`) allows unauthorized callers to consume Meta Graph API rate limits or send fraudulent conversion events to the store's Pixel dataset.

---

### Endpoint 4: Reseller Catalog Synchronization Worker
- **Method & Route**: `GET /api/sync` or `POST /api/sync`
- **Implementation File**: [`admin/api/sync.ts`](file:///Users/Admin/Developer/antigravity/RupanV3/admin/api/sync.ts)
- **Purpose**: Batch import and update product catalog from Mohasagor reseller endpoint with pricing markups, color/size normalization, and logging.
- **Authentication**: Mandatory Bearer JWT token in `Authorization` header (`supabase.auth.getUser(token)`).
- **Authorization**: Mandatory role check: `public.profiles.role IN ('Super Admin', 'Admin', 'Manager', 'Editor')` and `is_active === true`.
- **Input Schema & Validation**:
  - `query.source`: Sync source identifier (defaults to `'mohasagor'`).
  - `query.page`: Page number string (defaults to `'1'`).
- **Output Schema**:
  ```json
  {
    "success": true,
    "source": "mohasagor",
    "page": 1,
    "last_page": 25,
    "total_items_source": 1250,
    "items_fetched": 50,
    "imported": 10,
    "updated": 40,
    "failed": 0,
    "errors": []
  }
  ```
- **Database Operations**:
  - `SELECT * FROM profiles WHERE id = user.id`
  - `SELECT * FROM sync_sources WHERE id = source`
  - `INSERT INTO sync_logs (status: 'running')`
  - `SELECT homepage_config FROM settings WHERE id = 1`
  - `UPSERT INTO categories (id, name, slug, is_active)`
  - `SELECT id FROM products WHERE id IN (...)`
  - `UPSERT INTO products (...)` (Batch upsert; falls back to single-row upserts if batch fails)
  - `UPDATE sync_logs (status: 'success' | 'failed')`
  - `UPDATE sync_sources SET last_sync_at = now()`
- **External Services Called**:
  - Mohasagor API: `GET https://mohasagor.com.bd/api/reseller/product?page={page}` (Headers: `API-KEY`, `SECRET-KEY`)
- **Rate Limiting & Abuse Protections**: Authenticated with CORS restricted to `https://myrupan.com`, `https://admin.myrupan.com`, and localhost.
- **Idempotency**: Upserts on `products.id` (`${source}-${item.id}`); safe to rerun.
- **Timeout & Retry Behavior**: May hit Vercel 10s execution limit if third-party API responds slowly or batch size is excessive.
- **Logging & Observability**: Complete execution records stored in `public.sync_logs` with timestamps, error strings, and imported/updated counts.
- **Relevant Tests**: Scratch scripts `check_log.js`, `test_supabase_rest.js`.
- **Verified Gaps**:
  - Hardcoded fallback default credentials in `schema.sql`.
  - Single-page execution requires manual pagination or client-orchestrated loop.

---

## 5.2 External Integrations

| External Service | Data Exchanged | Initiating Component | Expected Credential Location | Execution Location | Failure Modes & Resilience |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Meta Graph API (CAPI v21.0)** | Hashed customer PII (`em`, `ph`, `fn`, `ln`, `ct`), `event_id`, purchase amounts, product IDs, `_fbp`, `_fbc` | `api/meta-capi.ts` | `settings.meta_capi_access_token` or `SUPABASE_SERVICE_ROLE_KEY` | Server-Side (Vercel Serverless) | If Meta API fails or token expires, returns 400/500 to caller. Does not block customer checkout completion. |
| **Meta Pixel (Client)** | Browser cookies, page URLs, product IDs, order totals, `event_id` | `frontend/src/lib/telemetry.ts` | `settings.meta_pixel_id` | Client-Side (Browser) | Ad-blockers or Brave shields block `connect.facebook.net`. Server CAPI ensures redundant delivery. |
| **Google Tag Manager** | DataLayer container events (`gtm.js`) | `frontend/src/lib/telemetry.ts` | `settings.google_tag_manager_id` | Client-Side (Browser) | Script load failure logged to console; does not interrupt browsing. |
| **Google Analytics 4** | GA4 measurement hits (`gtag`) | `frontend/src/lib/telemetry.ts` | `settings.google_analytics_id` | Client-Side (Browser) | Onload guard prevents early execution before `gtag.js` is loaded. |
| **Telegram Bot API** | Order summary HTML invoice (Order ID, customer name, phone, address, items, total, payment method) | `api/place-order.ts` AND `frontend/src/store/useStore.ts` | `settings.telegram_bot_token` / `TELEGRAM_BOT_TOKEN`, `telegram_chat_id` / `TELEGRAM_CHAT_ID` | **Dual Execution**: Both Server-Side (`place-order.ts`) and Client-Side (`useStore.ts`) | If Telegram API fails, error is logged; order remains saved in Supabase. Causes **duplicate messages** when both client and server succeed. |
| **Mohasagor Reseller API** | Inbound product catalog JSON (SKUs, titles, descriptions, images, variants, wholesale prices, stock status) | `admin/api/sync.ts` | `public.sync_sources.api_key`, `public.sync_sources.secret_key` | Server-Side (Vercel Serverless) | If Mohasagor API is offline or returns error HTTP status, sync worker writes `'failed'` status into `sync_logs` and halts batch. |
| **wsrv.nl Image CDN Proxy** | Third-party image URLs routed for WebP conversion, resizing, and caching | `frontend/src/utils/image.ts` | None (Public open proxy) | Client-Side (Browser img requests) | If `wsrv.nl` experiences downtime or rate limiting, product images break across storefront. |
| **Supabase Cloud (PostgreSQL & Storage)** | All transactional data, profiles, settings, products, orders, banners | Storefront SPA, Admin SPA, Serverless Functions | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | Mixed (Client PostgREST + Serverless Service Client) | If Supabase is unreachable, frontend falls back to `LocalStorage` sandbox; admin displays connection error banner. |
| **Vercel Edge / CDN** | HTTP requests, route rewrites, static asset delivery | Vercel Platform | Vercel Project Configuration | Edge / Global CDN | Standard edge failover. |
