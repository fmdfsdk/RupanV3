# 01. Project Identity and Business Context

## 1.1 Product Identity

| Dimension | Verified Fact / Implementation Detail |
| :--- | :--- |
| **Project Name** | **Rupan** (referred to in metadata and headers as *Rupan Clothing*, *Rupan Bangladesh*, *myrupan.com*) |
| **Live Domain** | `https://www.myrupan.com` (Storefront), `https://admin.myrupan.com` (Admin Hub / Management Dashboard) |
| **Product Category** | E-commerce Storefront, Admin Operations Hub, and Dropshipping / Reseller Catalog Synchronization System |
| **Core Purpose** | Direct-to-consumer (D2C) retail e-commerce focused on Bangladeshi fashion (Panjabis, Sarees, Salwar Kameez, Couple Collections, Western Wear, Kids Fashion) with integrated reseller dropshipping ingestion from Mohasagor. |
| **Geographic Market** | Bangladesh (primarily Dhaka metropolitan and all 64 national districts). |
| **Currency Handling** | Bangladeshi Taka (`৳` / BDT), strictly formatted and calculated in BDT with discrete shipping tiers: Inside Dhaka (`৳60.00`) and Outside Dhaka (`৳120.00`), with free shipping threshold at `৳3,000.00`. |
| **Customer Segments** | 1. **Retail Bangladeshi Online Shoppers**: Purchasing lifestyle fashion and festival wear via cash-on-delivery (COD) or mobile financial services (bKash, Nagad, Bangla QR).<br>2. **Social Media / Ad Campaign Traffic**: Visitors arriving from Facebook/Instagram ads directly to dynamic landing pages (`/eid-sale`, `/offer/...`).<br>3. **Internal Brand Operators & Managers**: Warehouse, marketing, and order fulfillment personnel running inventory, margin calculations, and order dispatch. |
| **Business Model & Revenue** | Retail markup on sourced and dropshipped products. Profit is generated via dynamic margin calculation applied over supplier purchase prices (default markup 25%, configurable per category in `settings.homepage_config`). |
| **Customer Problems Solved** | - Frictionless guest checkout without mandatory password registration (instant 1-page checkout).<br>- Hyper-local payment options familiar to Bangladeshi consumers (Bangla QR, bKash Personal Send-Money, Nagad Personal Send-Money, Cash on Delivery).<br>- Transparent delivery options split by Inside Dhaka vs. Outside Dhaka.<br>- Real-time parcel tracking via Order ID and Phone Number. |
| **Main Business Objectives** | 1. Rapidly launch marketing campaign landing pages directly from admin without deploying new code.<br>2. Automatically import, price-markup, and synchronize thousands of inventory SKUs from reseller partner Mohasagor.<br>3. Track advertising ROI and customer conversions via dual-channel Meta Pixel + Meta Conversions API (CAPI).<br>4. Notify fulfillment staff instantly via Telegram bot alerts for every placed order. |
| **Differentiating Features** | - **Dual SPA & Dynamic Landing Engine**: Standard e-commerce catalog coexisting with standalone full-HTML landing pages served by Vercel serverless function (`api/landing.ts`) with automated SEO and ad script injection.<br>- **Bangla QR Direct Integration**: Instant QR scan payment gateway tailored for Bangladesh Bank's unified Bangla QR standard.<br>- **Offline Simulator Sandbox**: Browser-based LocalStorage mock database engine that allows previewing the entire application without a live Supabase connection. |

---

## 1.2 Current Product Capabilities

The application divides its capabilities between the customer storefront (`frontend/`) and the administrative hub (`admin/`). Below is the comprehensive capability inventory verified from code inspection.

| Capability / Module | Target Users | Implementation Files | Dependencies & Integrations | Verification Status | Functional Summary |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Storefront Homepage** | Public Customers | [`HomePage.tsx`](file:///Users/Admin/Developer/antigravity/RupanV3/frontend/src/pages/HomePage.tsx), [`HeroCarousel.tsx`](file:///Users/Admin/Developer/antigravity/RupanV3/frontend/src/components/home/HeroCarousel.tsx), [`CategoryGrid.tsx`](file:///Users/Admin/Developer/antigravity/RupanV3/frontend/src/components/home/CategoryGrid.tsx) | `public.banners`, `public.settings`, `public.products`, `useStore` | **Verified** | Displays promotional banners, category navigation, trending/featured products, and value propositions. |
| **Catalog & Shop Filters** | Public Customers | [`ShopPage.tsx`](file:///Users/Admin/Developer/antigravity/RupanV3/frontend/src/pages/ShopPage.tsx), [`productService.ts`](file:///Users/Admin/Developer/antigravity/RupanV3/frontend/src/services/productService.ts) | `public.products`, `wsrv.nl` image CDN proxy | **Verified** | Filter by category, gender, brand, price range, stock status; sorts by price, popularity, and arrival date. |
| **Product Detail & Variants** | Public Customers | [`ProductDetailPage.tsx`](file:///Users/Admin/Developer/antigravity/RupanV3/frontend/src/pages/ProductDetailPage.tsx), [`ProductDetail.tsx`](file:///Users/Admin/Developer/antigravity/RupanV3/frontend/src/components/ProductDetail.tsx) | `public.products`, `public.reviews`, `wsrv.nl` | **Verified** | Image gallery, variant selection (size/color), stock level indicator, delivery fee calculator, size guide modal, and review submission. |
| **Shopping Cart** | Public Customers | [`CartPage.tsx`](file:///Users/Admin/Developer/antigravity/RupanV3/frontend/src/pages/CartPage.tsx), [`useStore.ts`](file:///Users/Admin/Developer/antigravity/RupanV3/frontend/src/store/useStore.ts) | Browser `localStorage` (`rup_cart`) | **Verified** | Quantity adjustment, item removal, free-shipping progress meter, subtotal computation. |
| **Single-Page Checkout** | Public Customers | [`CheckoutPage.tsx`](file:///Users/Admin/Developer/antigravity/RupanV3/frontend/src/pages/CheckoutPage.tsx), [`place-order.ts`](file:///Users/Admin/Developer/antigravity/RupanV3/frontend/api/place-order.ts) | `public.orders`, `public.order_items`, `public.settings`, Telegram Bot API | **Verified** | Delivery address input, Dhaka shipping selector, coupon redemption, payment method selection (Bangla QR, bKash, Nagad, COD), order dispatch. |
| **Order Placement & Fallback** | Public Customers | [`place-order.ts`](file:///Users/Admin/Developer/antigravity/RupanV3/frontend/api/place-order.ts), [`orderService.ts`](file:///Users/Admin/Developer/antigravity/RupanV3/frontend/src/services/orderService.ts) | Supabase DB, Vercel Serverless, Telegram API | **Verified** | Dual insertion path: client calls `/api/place-order` serverless function with Telegram alert; client also attempts direct Supabase REST fallback. |
| **Order Tracking** | Public Customers | [`OrderTrackingPage.tsx`](file:///Users/Admin/Developer/antigravity/RupanV3/frontend/src/pages/OrderTrackingPage.tsx), [`orderService.ts`](file:///Users/Admin/Developer/antigravity/RupanV3/frontend/src/services/orderService.ts) | `public.orders` | **Verified** | Look up order status by Order ID and Phone Number. Shows delivery timeline (Pending -> Shipped -> Delivered). |
| **Customer Account & History** | Registered Customers | [`AccountPage.tsx`](file:///Users/Admin/Developer/antigravity/RupanV3/frontend/src/pages/AccountPage.tsx) | Supabase Auth, `public.orders`, `public.profiles` | **Partially Verified** | Login, register, profile update, past order list. *Note: Pre-filled with dummy 'test' credentials in default state.* |
| **Dynamic Landing Engine** | Ad Traffic / Public | [`landing.ts`](file:///Users/Admin/Developer/antigravity/RupanV3/frontend/api/landing.ts), `vercel.json` | `public.blogs` (`category = '__landing_page__'`), `public.settings` | **Verified** | Intercepts unmatched routes via rewrite, fetches HTML from `blogs` table, injects Meta Pixel, GA4, GTM, and serves raw HTML. |
| **Product ID Query Redirect** | Legacy Links / Reseller URLs | [`landing.ts`](file:///Users/Admin/Developer/antigravity/RupanV3/frontend/api/landing.ts), [`App.tsx`](file:///Users/Admin/Developer/antigravity/RupanV3/frontend/src/App.tsx) | `public.products` | **Verified** | Redirects `/product?id=...` with exact match or +/-3000 offset tolerance mapping to `/product/{slug}-{id}` via 301 HTTP redirect. |
| **Admin Authentication & RBAC** | Admin Staff | [`App.tsx`](file:///Users/Admin/Developer/antigravity/RupanV3/admin/src/App.tsx), [`schema.sql`](file:///Users/Admin/Developer/antigravity/RupanV3/supabase/schema.sql) | Supabase Auth, `public.profiles`, `is_admin()` SQL function | **Verified** | Role gating (`Super Admin`, `Admin`, `Manager`, `Editor`, `Support`, `Delivery Manager`). Deactivated accounts rejected. |
| **Admin Overview Dashboard** | Admin Staff | [`OverviewTab.tsx`](file:///Users/Admin/Developer/antigravity/RupanV3/admin/src/components/tabs/OverviewTab.tsx) | `public.orders`, `public.products`, `public.profiles`, Recharts | **Verified** | Visual metrics: revenue, order count, average order value, conversion indicators, status breakdowns, and low-stock alerts. |
| **Catalog & Product Management** | Admin Staff | [`ProductsTab.tsx`](file:///Users/Admin/Developer/antigravity/RupanV3/admin/src/components/tabs/ProductsTab.tsx), [`AdminPanel.tsx`](file:///Users/Admin/Developer/antigravity/RupanV3/admin/src/components/AdminPanel.tsx) | `public.products`, `public.categories`, `supabase.storage` | **Verified** | Server-side paginated product table, status filters (Published/Draft/Archived), SKU creator/editor modal with image URL or upload. |
| **Realtime Order Management** | Admin Staff | [`OrdersTab.tsx`](file:///Users/Admin/Developer/antigravity/RupanV3/admin/src/components/tabs/OrdersTab.tsx), [`AdminPanel.tsx`](file:///Users/Admin/Developer/antigravity/RupanV3/admin/src/components/AdminPanel.tsx) | `public.orders`, Supabase Realtime channel | **Verified** | Live-sync order registry listening to Postgres `INSERT` and `UPDATE` events. Status updater, payment status toggler, invoice printer. |
| **Inventory & Stock Tracking** | Admin Staff | [`InventoryTab.tsx`](file:///Users/Admin/Developer/antigravity/RupanV3/admin/src/components/tabs/InventoryTab.tsx) | `public.products` | **Verified** | Filter low-stock and out-of-stock SKUs, inline stock adjustment, warning threshold editor. |
| **Profit Margin Manager** | Admin Staff | [`MarginsTab.tsx`](file:///Users/Admin/Developer/antigravity/RupanV3/admin/src/components/tabs/MarginsTab.tsx) | `public.settings`, `public.products` | **Verified** | Category-level and product-level markup rules applied over wholesale purchase prices. |
| **Landing Page Visual Builder** | Admin Staff | [`LandingPagesTab.tsx`](file:///Users/Admin/Developer/antigravity/RupanV3/admin/src/components/tabs/LandingPagesTab.tsx) | `public.blogs` | **Verified** | Full HTML/CSS/JS code editor with preview mode, metadata toggles (SEO/marketing script injection), and live compilation viewer. |
| **Reseller API Synchronization** | Admin Staff | [`SyncTab.tsx`](file:///Users/Admin/Developer/antigravity/RupanV3/admin/src/components/tabs/SyncTab.tsx), [`sync.ts`](file:///Users/Admin/Developer/antigravity/RupanV3/admin/api/sync.ts) | `public.sync_sources`, `public.sync_logs`, Mohasagor API | **Verified** | Batch product fetch from Mohasagor endpoint, dynamic category markup, color/size normalization, bulk upsert into `public.products`. |
| **Coupon Code System** | Admin & Customers | [`CouponsTab.tsx`](file:///Users/Admin/Developer/antigravity/RupanV3/admin/src/components/tabs/CouponsTab.tsx), [`useStore.ts`](file:///Users/Admin/Developer/antigravity/RupanV3/frontend/src/store/useStore.ts) | `public.coupons` | **Verified** | Percentage, fixed amount, and free shipping coupons with minimum order amount, usage limits, and expiry dates. |
| **Ad Pixel & Telemetry** | System / Marketers | [`telemetry.ts`](file:///Users/Admin/Developer/antigravity/RupanV3/frontend/src/lib/telemetry.ts), [`meta-capi.ts`](file:///Users/Admin/Developer/antigravity/RupanV3/frontend/api/meta-capi.ts) | Meta Graph API (v21.0), Google Tag Manager, GA4 | **Verified** | Dual-event emission: client-side `fbq` + serverless `/api/meta-capi` with SHA-256 hashed user data (`em`, `ph`, `fn`, `ln`, `ct`). |
| **Offline Sandbox Simulator** | Developers / Local Preview | [`supabase.ts`](file:///Users/Admin/Developer/antigravity/RupanV3/shared/supabase.ts) | Browser `localStorage`, `data.ts` | **Verified** | Client-side `LocalDatabase` and `MockAuth` simulating table queries, latency, and auth sessions when Supabase keys are missing. |

---

## 1.3 Product Gaps and Architectural Inconsistencies

1. **Test Data Contamination in Production State**:
   - In [`frontend/src/store/useStore.ts#L208-L233`](file:///Users/Admin/Developer/antigravity/RupanV3/frontend/src/store/useStore.ts#L208-L233), initial store state for `currentUser` and `checkoutForm` is hardcoded with placeholder values:
     - `name: 'test'`
     - `phone: '534534563453'`
     - `address: 'test'`
     - `email: 'phone-534534563453-nz9rfv2h@rupan.invalid'`
   - In [`frontend/src/pages/AccountPage.tsx#L18-L33`](file:///Users/Admin/Developer/antigravity/RupanV3/frontend/src/pages/AccountPage.tsx#L18-L33), username, password, and email fields are pre-populated with `'test'` and `'phone-534534563453-nz9rfv2h@borbila.invalid'`.
   - **Impact**: Real customers who navigate to checkout see these test inputs pre-filled unless cleared, creating trust breakdown and invalid checkout submissions.

2. **Database Trigger Price Enforcement Failure**:
   - In [`supabase/schema.sql#L382-L447`](file:///Users/Admin/Developer/antigravity/RupanV3/supabase/schema.sql#L382-L447), trigger function `validate_order_total()` computes `calc_subtotal` by querying `public.products` and checking stock.
   - However, lines 440-444 only verify `if new.total < 0 then new.total := 0; end if; return new;`.
   - The trigger **never assigns** `new.subtotal := calc_subtotal` or `new.total := calc_subtotal + shipping`.
   - **Impact**: Any direct API or REST client can submit an order with `total: 1` or arbitrary prices, and the database accepts it without recalculating or rejecting the manipulated price.

3. **Orphaned Dead Admin Code in Frontend Distribution**:
   - [`frontend/src/components/AdminPanel.tsx`](file:///Users/Admin/Developer/antigravity/RupanV3/frontend/src/components/AdminPanel.tsx) (3,301 lines) and all 12 tab components under [`frontend/src/components/tabs/`](file:///Users/Admin/Developer/antigravity/RupanV3/frontend/src/components/tabs/) are present in the frontend package but never imported in [`frontend/src/App.tsx`](file:///Users/Admin/Developer/antigravity/RupanV3/frontend/src/App.tsx).
   - Route `/admin` in frontend redirects to `/account`.
   - **Impact**: Clutters codebase and creates maintenance confusion, risk of accidental leakage, and asset build overhead.

4. **Codebase Synchronization Drift (`sync-shared.js`)**:
   - The root script [`sync-shared.js`](file:///Users/Admin/Developer/antigravity/RupanV3/sync-shared.js) only synchronizes `types.ts`, `supabase.ts`, and `services/` from `shared/` to `frontend/` and `admin/`.
   - Inspection reveals that active updates have occurred in `frontend/src/types.ts`, `frontend/src/lib/supabase.ts`, and `frontend/src/services/orderService.ts` that were **not** backported to `shared/`.
   - Running `npm run build` or `npm run dev` in `frontend` executes `node ../sync-shared.js`, which will **overwrite and wipe out** un-synced fixes.
   - Furthermore, `api/` directories (`place-order.ts`, `meta-capi.ts`) are **not** managed by `sync-shared.js` and have significantly diverged between frontend and admin.

5. **Customer Order Security & Privacy Gaps**:
   - In [`supabase/schema.sql#L275`](file:///Users/Admin/Developer/antigravity/RupanV3/supabase/schema.sql#L275), Row Level Security (RLS) on `public.orders` is defined as:
     ```sql
     create policy "Allow public tracking query" on public.orders for select using (true);
     ```
   - While the UI performs a filtered lookup using ID and Phone number, any anonymous user holding the public Supabase anon key can query `supabase.from('orders').select('*')` and dump every customer's name, phone, physical address, and purchase records.
   - Similarly, [`supabase/schema.sql#L41`](file:///Users/Admin/Developer/antigravity/RupanV3/supabase/schema.sql#L41) allows public read of `public.profiles` (`using (true)`), exposing all registered user emails, roles, and spending figures.

6. **Public Exposure of Server Secrets via `public.settings`**:
   - `meta_capi_access_token`, `telegram_bot_token`, and `telegram_chat_id` are stored as columns in `public.settings`.
   - RLS on `public.settings` allows public read (`using (true)`).
   - In [`frontend/src/services/settingsService.ts#L10`](file:///Users/Admin/Developer/antigravity/RupanV3/frontend/src/services/settingsService.ts#L10), the frontend client issues `select('*')`, loading the Meta CAPI token and Telegram bot credentials directly into browser memory and `localStorage`.
