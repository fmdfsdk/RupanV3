# 04. Complete User Journeys and Business Logic

## 4.1 Investigation: Test Customer Details & Placeholder Data

### Critical Finding: Hardcoded Test Data in Active State
Static inspection of [`frontend/src/store/useStore.ts#L208-L233`](file:///Users/Admin/Developer/antigravity/RupanV3/frontend/src/store/useStore.ts#L208-L233) confirms that **real customer sessions are populated with test data by default**.

```typescript
// frontend/src/store/useStore.ts (lines 208-233)
currentUser: {
  username: 'test',
  displayName: 'test',
  email: 'phone-534534563453-nz9rfv2h@rupan.invalid',
  phone: '534534563453',
  billingAddress: 'test',
  shippingAddress: 'test',
  city: 'Dhaka',
  zip: '1000'
},
appliedCoupon: null,
lastPlacedOrder: null,
recentlyViewedIds: (() => {
  const cached = localStorage.getItem('rup_recently_viewed');
  return cached ? JSON.parse(cached) : [];
})(),
checkoutForm: {
  name: 'test',
  phone: '534534563453',
  address: 'test',
  area: 'Inside Dhaka',
  paymentMethod: 'Bangla QR',
  email: 'phone-534534563453-nz9rfv2h@rupan.invalid',
  transactionId: '',
  paidConfirm: false
},
```

Furthermore, in [`frontend/src/pages/AccountPage.tsx#L18-L33`](file:///Users/Admin/Developer/antigravity/RupanV3/frontend/src/pages/AccountPage.tsx#L18-L33):
```typescript
// Login States initialized with 'test'
const [loginUsername, setLoginUsername] = useState<string>('test');
const [loginPassword, setLoginPassword] = useState<string>('test');
...
// Account Details initialized with 'test'
const [profileFirstName, setProfileFirstName] = useState<string>('test');
const [profileEmail, setProfileEmail] = useState<string>('phone-534534563453-nz9rfv2h@borbila.invalid');
```

### Impact & Customer Experience
1. When a new customer lands on `myrupan.com` and navigates to `/checkout`, the input fields (`Name`, `Phone`, `Address`, `Email`) are pre-populated with:
   - Name: `test`
   - Phone: `534534563453`
   - Delivery Address: `test`
   - Email: `phone-534534563453-nz9rfv2h@rupan.invalid`
2. If the user does not delete each field manually, submitting the order registers an order with phone number `534534563453` and delivery address `test`.
3. When navigating to `/account`, the login username and password fields already display `test`, and the dummy profile from an earlier project name (`@borbila.invalid`) appears in the profile view.

---

## 4.2 Customer Journeys

### Journey C1: Initial Visit and Storefront Navigation
1. **Entry Point**: Customer requests `https://www.myrupan.com/` or `https://www.myrupan.com/shop`.
2. **Routes & Components**:
   - Route `/`: [`HomePage.tsx`](file:///Users/Admin/Developer/antigravity/RupanV3/frontend/src/pages/HomePage.tsx), [`Header.tsx`](file:///Users/Admin/Developer/antigravity/RupanV3/frontend/src/components/Header.tsx), [`HeroCarousel.tsx`](file:///Users/Admin/Developer/antigravity/RupanV3/frontend/src/components/home/HeroCarousel.tsx), [`CategoryGrid.tsx`](file:///Users/Admin/Developer/antigravity/RupanV3/frontend/src/components/home/CategoryGrid.tsx), [`Footer.tsx`](file:///Users/Admin/Developer/antigravity/RupanV3/frontend/src/components/Footer.tsx).
3. **State Management**:
   - `useStore.loadInitialData()` executes in [`App.tsx#L146`](file:///Users/Admin/Developer/antigravity/RupanV3/frontend/src/App.tsx#L146).
   - Telemetry initializes from `localStorage.getItem('rup_db_settings')` before network responses arrive.
4. **Service & API Calls**:
   - `checkSupabaseConnection()` calls `getSupabaseConnectionError()` (`SELECT id FROM products LIMIT 1`).
   - `productService.fetchProducts()` (`SELECT ... FROM products WHERE status = 'published' LIMIT 1000`).
   - `productService.fetchProductCatalogIndex()` (paginated background loop fetching all IDs & slugs).
   - `settingsService.fetchSettings()` (`SELECT * FROM settings WHERE id = 1`).
   - `bannerService.fetchBanners()` (`SELECT * FROM banners WHERE is_active = true`).
5. **Database Reads & Writes**:
   - Reads: `products`, `settings`, `banners`, `blogs`, `reviews`.
   - Writes: None.
6. **Validation & Business Rules**:
   - If Supabase returns error or offline status, client sets `isSupabaseOnline = false` and reads from `MOCK_PRODUCTS` and `localStorage` cache.
7. **Success Behavior**: Homepage renders hero banner slider, category circles, and product carousels (Trending, Best Sellers, Flash Sale).
8. **Error Behavior**: React `ErrorBoundary` wraps main content; shows fallback reload banner if rendering fails.
9. **Authorization Checks**: None (Public).
10. **Edge Cases**: Slow network connection triggers background loading spinners while cached `localStorage` data renders immediately.
11. **Related Tests**: None in repository.
12. **Unverified Assumptions**: Assumes `wsrv.nl` image CDN responds promptly for all product imagery.

---

### Journey C2: Product Discovery, Filtering & Search
1. **Entry Point**: Customer clicks category, nav link, or visits `/shop`, `/product-search`.
2. **Routes & Components**:
   - [`ShopPage.tsx`](file:///Users/Admin/Developer/antigravity/RupanV3/frontend/src/pages/ShopPage.tsx), [`SearchPage.tsx`](file:///Users/Admin/Developer/antigravity/RupanV3/frontend/src/pages/SearchPage.tsx), [`ProductCard.tsx`](file:///Users/Admin/Developer/antigravity/RupanV3/frontend/src/components/ProductCard.tsx).
3. **State Management**:
   - Filters stored in `useStore`: `checkedCategories`, `checkedSubCategories`, `selectedBrands`, `minPrice`, `maxPrice`, `selectedStock`, `sortBy`, `searchQuery`.
4. **Service & API Calls**:
   - Server-side filter mode: `productService.fetchProductsFiltered(...)` executing Postgres queries with `.in()`, `.gte()`, `.lte()`, `.ilike()`, `.order()`, and `.range()`.
   - RPC search mode: `productService.searchProducts(query)` calling PostgreSQL `search_products` RPC function with `ts_rank` and tsvector full-text matching.
5. **Database Reads & Writes**:
   - Reads: `products` table via PostgREST and RPC function.
   - Writes: None.
6. **Validation & Business Rules**:
   - Published status enforced (`status = 'published'`).
   - Price range bounds validation.
7. **Success Behavior**: Grid of product cards rendered with primary image, secondary hover image, pricing badges (regular vs discount), and quick action buttons.
8. **Error Behavior**: If search returns 0 matches, fallback SKU search executes (`ilike %query%`). If still 0, shows "No products found" empty state with "Reset Filters" action.
9. **Authorization Checks**: None.
10. **Edge Cases**: URL query parameter `?category=...` syncs into store state upon direct navigation.
11. **Related Tests**: None.
12. **Unverified Assumptions**: Assumes full-text search index (`idx_products_search`) is created in the production Supabase database.

---

### Journey C3: Product Details and Variant Selection
1. **Entry Point**: Customer navigates to `/product/:id` (e.g. `/product/royal-panjabi-4083`).
2. **Routes & Components**:
   - [`ProductDetailPage.tsx`](file:///Users/Admin/Developer/antigravity/RupanV3/frontend/src/pages/ProductDetailPage.tsx), [`ProductDetail.tsx`](file:///Users/Admin/Developer/antigravity/RupanV3/frontend/src/components/ProductDetail.tsx), [`SizeGuideModal.tsx`](file:///Users/Admin/Developer/antigravity/RupanV3/frontend/src/components/SizeGuideModal.tsx).
3. **State Management**:
   - Active product, selected size, selected color, selected quantity.
   - Telemetry tracks `trackViewContent(product)` via Meta Pixel and CAPI.
4. **Service & API Calls**:
   - `productService.fetchProductByIdOrSlug(idOrSlug)`:
     1. Exact match on `id` or `slug`.
     2. 3000 offset tolerance mapping on trailing number (`searchNum +/- 3000`).
   - `reviewService.fetchReviews()` (`SELECT * FROM reviews WHERE status = 'approved' AND product_id = ...`).
5. **Database Reads & Writes**:
   - Reads: `products`, `reviews`.
   - Writes: None (unless customer posts a review, which inserts into `reviews` with `status: 'pending'`).
6. **Validation & Business Rules**:
   - Size selection is mandatory before adding clothing to cart.
   - Stock level check: if `stock === 0`, "Add to Bag" button is disabled and displays "Out of Stock".
7. **Success Behavior**: Displays high-resolution gallery, interactive color swatches, size selector, delivery fee calculator preview, description, features list, and customer reviews.
8. **Error Behavior**: If product ID fails exact match and offset tolerance resolution, displays 404 screen with link to `/shop`.
9. **Authorization Checks**: None.
10. **Edge Cases**: Bengali slugs or legacy reseller IDs with offset differences (e.g., Mohasagor IDs shifted by 3,000) are resolved transparently.
11. **Related Tests**: None.
12. **Unverified Assumptions**: Assumes reseller offset mapping remains fixed at +/- 3000.

---

### Journey C4: Shopping Bag and Cart Management
1. **Entry Point**: Customer clicks bag icon in header or navigates to `/cart`.
2. **Routes & Components**:
   - [`CartPage.tsx`](file:///Users/Admin/Developer/antigravity/RupanV3/frontend/src/pages/CartPage.tsx), [`Header.tsx`](file:///Users/Admin/Developer/antigravity/RupanV3/frontend/src/components/Header.tsx).
3. **State Management**:
   - `cart: CartItem[]` in `useStore`. Synchronized with `localStorage.setItem('rup_cart', ...)`.
4. **Service & API Calls**: None (pure client-side state).
5. **Database Reads & Writes**: None.
6. **Validation & Business Rules**:
   - Item key is compound: `${productId}-${selectedSize}-${selectedColor}`.
   - Updating quantity clamps at min 1. Removal cleans item from array.
   - Dynamic free-shipping calculation: compares `subtotal` against `settings.free_shipping_min_order` (`৳3,000`).
7. **Success Behavior**: Shows items list with thumbnails, variant labels, item price, subtotal, shipping fee estimate, and "Proceed to Checkout" button.
8. **Error Behavior**: Empty bag state renders empty cart illustration and "Explore Catalog" CTA.
9. **Authorization Checks**: None.
10. **Edge Cases**: Multiple variants of the same product maintain distinct lines in the cart.
11. **Related Tests**: None.
12. **Unverified Assumptions**: Assumes product prices in cart remain consistent with database prices.

---

### Journey C5: Checkout Form & Order Submission
1. **Entry Point**: Customer navigates to `/checkout`.
2. **Routes & Components**:
   - [`CheckoutPage.tsx`](file:///Users/Admin/Developer/antigravity/RupanV3/frontend/src/pages/CheckoutPage.tsx), [`useStore.ts`](file:///Users/Admin/Developer/antigravity/RupanV3/frontend/src/store/useStore.ts), [`place-order.ts`](file:///Users/Admin/Developer/antigravity/RupanV3/frontend/api/place-order.ts).
3. **State Management**:
   - `checkoutForm` in `useStore`.
   - `trackInitiateCheckout(cart, total)` fired via Telemetry.
4. **Service & API Calls**:
   - Coupon verification: `useStore.applyCoupon(code)` queries `public.coupons` where `is_active = true` and checks `min_order` and `expiry_date`.
   - Order submission: `fetch('/api/place-order', { method: 'POST', body: JSON.stringify({ order, metaEventId, isGuest }) })`.
   - Direct client backup: `orderService.createOrder(...)` direct insert into Supabase `orders` and `order_items`.
   - Direct Telegram call: `fetch('https://api.telegram.org/bot' + token + '/sendMessage')`.
5. **Database Reads & Writes**:
   - Reads: `coupons`, `settings`.
   - Writes: `INSERT INTO orders`, `INSERT INTO order_items`.
   - Trigger execution: `on_order_created` executes `validate_order_total()`, which loops items and deducts stock from `products`.
6. **Validation & Business Rules**:
   - Required fields: `name`, `phone`, `address`.
   - Payment validation:
     - `bKash` / `Nagad`: requires `transactionId` input.
     - `Bangla QR`: requires `paidConfirm` checkbox toggle.
     - `Cash on Delivery`: no transaction ID required.
   - Shipping fee: `৳60` for Inside Dhaka, `৳120` for Outside Dhaka; waived if `subtotal >= ৳3,000` or free-shipping coupon applied.
7. **Success Behavior**:
   - Order stored in database.
   - Telegram notification sent to brand operators.
   - Meta CAPI `Purchase` event transmitted.
   - Cart emptied, `lastPlacedOrder` saved in store, redirects to `/order-success`.
8. **Error Behavior**:
   - If `/api/place-order` fails, client falls back to direct Supabase insert.
   - If all network requests fail, order is saved in `localStorage.setItem('rupan_local_orders', ...)`.
9. **Authorization Checks**: None. Guest checkout is permitted for all users.
10. **Edge Cases**:
    - **Test Data Vulnerability**: Form pre-populates with `test` and `534534563453`.
    - **Price Tampering**: Client computes total; backend trigger does not enforce calculated total.
11. **Related Tests**: None.
12. **Unverified Assumptions**: Assumes Vercel serverless function has access to `SUPABASE_SERVICE_ROLE_KEY` or `SUPABASE_ANON_KEY`.

---

### Journey C6: Customer Order Tracking
1. **Entry Point**: Customer navigates to `/track-order`.
2. **Routes & Components**:
   - [`OrderTrackingPage.tsx`](file:///Users/Admin/Developer/antigravity/RupanV3/frontend/src/pages/OrderTrackingPage.tsx), [`orderService.ts`](file:///Users/Admin/Developer/antigravity/RupanV3/frontend/src/services/orderService.ts).
3. **State Management**:
   - Tracking form state: `orderIdInput`, `phoneInput`, `trackedOrder`, `loading`, `error`.
4. **Service & API Calls**:
   - `orderService.fetchOrderByIdAndPhone(orderId, phone)`:
     ```typescript
     supabase.from('orders').select('*').eq('id', id).eq('phone', phone).maybeSingle()
     ```
5. **Database Reads & Writes**:
   - Reads: `orders` table.
   - Writes: None.
6. **Validation & Business Rules**:
   - Both Order ID (e.g. `RUP-1082`) and Phone Number are required.
7. **Success Behavior**: Displays visual status timeline (Pending -> Confirmed -> Processing -> Packed -> Shipped -> Delivered -> Cancelled), order items, and shipping summary.
8. **Error Behavior**: Displays "No matching order found. Please verify your Order ID and Phone Number."
9. **Authorization Checks**: Handled in application query (`eq id and eq phone`), but RLS policy on table allows public read.
10. **Edge Cases**: Order ID prefixes (case sensitivity handled by exact match).
11. **Related Tests**: None.
12. **Unverified Assumptions**: Assumes customer enters the exact phone number provided at checkout.

---

### Journey C7: Dynamic Landing Page Access & Ingestion
1. **Entry Point**: User clicks an ad with URL `https://myrupan.com/eid-sale` or `https://myrupan.com/offer/special`.
2. **Routes & Components**:
   - Handled at edge by `vercel.json` catch-all rewrite to [`frontend/api/landing.ts`](file:///Users/Admin/Developer/antigravity/RupanV3/frontend/api/landing.ts).
3. **State Management**: None (Serverless HTML generation).
4. **Service & API Calls**:
   - `landing.ts` queries Supabase `blogs` table for `id = '/eid-sale'` and `status = 'published'`.
   - Fetches global settings from `settings` table.
5. **Database Reads & Writes**:
   - Reads: `blogs`, `settings`.
   - Writes: None.
6. **Validation & Business Rules**:
   - If `pageRow.category === '__landing_page__'`, parses `<!-- metadata: {...} -->` block.
   - Injects SEO meta tags (`title`, `description`, `og:image`).
   - Injects Meta Pixel, GTM, and GA4 scripts.
   - Replaces template placeholders (`RUPAN_META_PIXEL_ID`, `RUPAN_INSIDE_DHAKA_SHIPPING`, etc.).
7. **Success Behavior**: Returns raw standalone compiled HTML document with `Content-Type: text/html` and `Cache-Control: s-maxage=60, stale-while-revalidate=300`.
8. **Error Behavior**: If database is offline or unhandled exception occurs, returns custom branded Bengali error page with "Return to Homepage" button.
9. **Authorization Checks**: Public.
10. **Edge Cases**:
    - **Security Exposure**: If template contains `RUPAN_META_CAPI_TOKEN`, the private CAPI token is string-replaced and exposed in HTML source.
11. **Related Tests**: None.
12. **Unverified Assumptions**: Assumes landing page creator authored valid HTML/CSS.

---

## 4.3 Administrator Journeys

### Journey A1: Admin Login and Access Control
1. **Entry Point**: Staff visits `https://admin.myrupan.com/`.
2. **Routes & Components**:
   - [`admin/src/App.tsx`](file:///Users/Admin/Developer/antigravity/RupanV3/admin/src/App.tsx), [`AdminPanel.tsx`](file:///Users/Admin/Developer/antigravity/RupanV3/admin/src/components/AdminPanel.tsx).
3. **State Management**:
   - `session`, `profile`, `isSupabaseOnline`, `loading`.
4. **Service & API Calls**:
   - `supabase.auth.signInWithPassword({ email, password })`.
   - `supabase.from('profiles').select('*').eq('id', user.id).single()`.
5. **Database Reads & Writes**:
   - Reads: `auth.users`, `public.profiles`.
   - Writes: If profile does not exist, inserts fallback customer profile.
6. **Validation & Business Rules**:
   - Allowed roles: `'Super Admin'`, `'Admin'`, `'Manager'`, `'Editor'`, `'Support'`, `'Delivery Manager'`.
   - Must have `is_active === true`.
7. **Success Behavior**: Renders full administrative hub with sidebar navigation and module tabs.
8. **Error Behavior**: Rejects unauthenticated visitors; shows "Forbidden: Insufficient privileges" or "Account is deactivated".
9. **Authorization Checks**: Enforced in `App.tsx` and mirrored in backend API `/api/sync.ts`.
10. **Edge Cases**: If Supabase connection fails, falls back to Demo mode with mock Super Admin (`admin@rupan.com`).
11. **Related Tests**: None.
12. **Unverified Assumptions**: Assumes Supabase Auth JWT refresh token persists in client session storage.

---

### Journey A2: Realtime Order Fulfillment & Invoice Printing
1. **Entry Point**: Admin clicks "Orders" tab in sidebar.
2. **Routes & Components**:
   - [`OrdersTab.tsx`](file:///Users/Admin/Developer/antigravity/RupanV3/admin/src/components/tabs/OrdersTab.tsx), Order Invoice Modal in [`AdminPanel.tsx`](file:///Users/Admin/Developer/antigravity/RupanV3/admin/src/components/AdminPanel.tsx).
3. **State Management**:
   - `orders: Order[]` state updated via Supabase Realtime WebSocket subscription (`admin-orders-realtime`).
4. **Service & API Calls**:
   - `supabase.from('orders').select('*').order('created_at', { ascending: false })`.
   - `supabase.from('orders').update({ status }).eq('id', id)`.
   - `supabase.from('orders').update({ payment_status }).eq('id', id)`.
5. **Database Reads & Writes**:
   - Reads: `orders`.
   - Writes: `UPDATE orders SET status = ...`, `UPDATE orders SET payment_status = ...`.
6. **Validation & Business Rules**:
   - Status transitions: `Pending` -> `Confirmed` -> `Processing` -> `Packed` -> `Shipped` -> `Delivered` (or `Cancelled` / `Returned`).
   - Payment status: `Unpaid` -> `Paid` -> `Refunded`.
7. **Success Behavior**: Instant UI badge update; Realtime broadcasts changes to all active admin tabs. Invoice modal formats thermal or A4 customer delivery invoice with barcode/QR and item details.
8. **Error Behavior**: Toast notification on update failure; rollback state.
9. **Authorization Checks**: Roles `Super Admin`, `Admin`, `Manager`, `Support`, `Delivery Manager` permitted by RLS.
10. **Edge Cases**: High volume order inserts automatically prepend to top of list without requiring manual page refresh.
11. **Related Tests**: None.
12. **Unverified Assumptions**: Assumes Supabase Realtime replication is enabled for `public.orders` in the Supabase Dashboard.

---

### Journey A3: Reseller Data Synchronization (Mohasagor)
1. **Entry Point**: Admin navigates to "Sync" tab and selects "Mohasagor Reseller API".
2. **Routes & Components**:
   - [`SyncTab.tsx`](file:///Users/Admin/Developer/antigravity/RupanV3/admin/src/components/tabs/SyncTab.tsx), [`admin/api/sync.ts`](file:///Users/Admin/Developer/antigravity/RupanV3/admin/api/sync.ts).
3. **State Management**:
   - `syncing`, `syncProgress`, `syncPage`, `syncLastPage`, `syncStats`.
4. **Service & API Calls**:
   - `fetch('/api/sync?source=mohasagor&page=' + page, { headers: { Authorization: 'Bearer ' + token } })`.
   - Serverless worker fetches third-party endpoint: `https://mohasagor.com.bd/api/reseller/product?page=...`.
5. **Database Reads & Writes**:
   - Reads: `sync_sources`, `settings`, `products`.
   - Writes: `INSERT INTO sync_logs`, `UPSERT INTO categories`, `UPSERT INTO products`, `UPDATE sync_sources`.
6. **Validation & Business Rules**:
   - Pricing markup rule: `sellingPrice = Math.round(purchasePrice * (1 + margin / 100))`.
   - Auto-publish flag in `sync_sources.config`: if true, sets `status: 'published'`; else `'draft'`.
   - Control character stripping to prevent Postgres JSONB parse exceptions.
7. **Success Behavior**: Products upserted into database; sync log record updated with counts (`items_fetched`, `items_imported`, `items_updated`, `items_failed`).
8. **Error Behavior**: If bulk upsert fails due to malformed SKU or data, falls back to individual row upserts to isolate bad records; logs error message in `sync_logs`.
9. **Authorization Checks**: `sync.ts` validates Bearer JWT and queries `public.profiles` for `role IN ('Super Admin', 'Admin', 'Manager', 'Editor')`.
10. **Edge Cases**: Out-of-stock items at source mapped to `stock = 0`. In-stock items assigned default stock `50`.
11. **Related Tests**: Scratch scripts `check_log.js`, `test_supabase_rest.js`.
12. **Unverified Assumptions**: Assumes Mohasagor API credentials remain valid and active.

---

### Journey A4: Landing Page Creation & Management
1. **Entry Point**: Admin navigates to "Landing Pages" tab and clicks "Create Landing Page".
2. **Routes & Components**:
   - [`LandingPagesTab.tsx`](file:///Users/Admin/Developer/antigravity/RupanV3/admin/src/components/tabs/LandingPagesTab.tsx).
3. **State Management**:
   - Code editor mode (`visual` vs `html`), preview viewport (`desktop` vs `mobile`), live compiled code modal.
4. **Service & API Calls**:
   - `blogService.createBlog(...)` or `blogService.updateBlog(...)`.
5. **Database Reads & Writes**:
   - Reads: `blogs` (`WHERE category = '__landing_page__'`).
   - Writes: `INSERT INTO blogs` or `UPDATE blogs`.
6. **Validation & Business Rules**:
   - Target URL path format: must start with `/` (e.g. `/eid-special`).
   - Category is locked to `'__landing_page__'`.
   - Metadata embedded in content as: `<!-- metadata: {"layout":"blank","seoEnabled":true,"marketingEnabled":true} -->`.
7. **Success Behavior**: Page saved; accessible immediately on public storefront via `/eid-special`. Live preview iframe updates in real time.
8. **Error Behavior**: Validation errors displayed inline; prevents submitting empty URL path.
9. **Authorization Checks**: Roles `Super Admin`, `Admin`, `Manager`, `Editor`.
10. **Edge Cases**: "Show Final Compiled Code" modal renders exact HTML with injected scripts for developer inspection.
11. **Related Tests**: Scratch script `test_blog_crud.js`.
12. **Unverified Assumptions**: Assumes Vercel CDN cache invalidation (`s-maxage=60`) clears within 60 seconds of update.
