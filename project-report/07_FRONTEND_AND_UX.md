# 07. Frontend Architecture, UI/UX, and Accessibility

## 7.1 Page and Route Inventory

The storefront application (`frontend/`) routes are defined in [`frontend/src/App.tsx#L239-L266`](file:///Users/Admin/Developer/antigravity/RupanV3/frontend/src/App.tsx#L239-L266) using React Router v7 and lazy loaded page components.

| Path / Route | Component | Lazy Loaded? | Verified Purpose & User Capabilities |
| :--- | :--- | :--- | :--- |
| `/` | [`HomePage.tsx`](file:///Users/Admin/Developer/antigravity/RupanV3/frontend/src/pages/HomePage.tsx) | Yes (`React.lazy`) | Storefront home: hero banner slider, category circular grid, flash sale countdown, trending products, value propositions, recent blog preview. |
| `/shop` | [`ShopPage.tsx`](file:///Users/Admin/Developer/antigravity/RupanV3/frontend/src/pages/ShopPage.tsx) | Yes | Master catalog view: multi-facet filtering (categories, subcategories, brands, price range, stock status) and sorting. |
| `/product` | `ProductRedirect` in [`App.tsx`](file:///Users/Admin/Developer/antigravity/RupanV3/frontend/src/App.tsx) | No (Direct) | Fallback client-side redirect for `/product?id=...` applying 3000 offset tolerance mapping. |
| `/product/:id` | [`ProductDetailPage.tsx`](file:///Users/Admin/Developer/antigravity/RupanV3/frontend/src/pages/ProductDetailPage.tsx) | Yes | Product page: gallery slider, color/size selection, stock badges, delivery calculator, size guide modal, customer reviews. |
| `/cart` | [`CartPage.tsx`](file:///Users/Admin/Developer/antigravity/RupanV3/frontend/src/pages/CartPage.tsx) | Yes | Bag manager: item quantities, variant tags, free-shipping threshold bar, coupon entry. |
| `/checkout` | [`CheckoutPage.tsx`](file:///Users/Admin/Developer/antigravity/RupanV3/frontend/src/pages/CheckoutPage.tsx) | Yes | Single-page checkout: address input, Inside/Outside Dhaka selection, payment method selection, order placement. |
| `/order-success` | [`OrderSuccessPage.tsx`](file:///Users/Admin/Developer/antigravity/RupanV3/frontend/src/pages/OrderSuccessPage.tsx) | Yes | Post-purchase confirmation: shows order number, summary invoice, and tracking link. |
| `/track-order` | [`OrderTrackingPage.tsx`](file:///Users/Admin/Developer/antigravity/RupanV3/frontend/src/pages/OrderTrackingPage.tsx) | Yes | Public parcel tracking: order ID & phone number lookup, step-by-step fulfillment timeline. |
| `/wishlist` | [`WishlistPage.tsx`](file:///Users/Admin/Developer/antigravity/RupanV3/frontend/src/pages/WishlistPage.tsx) | Yes | Customer saved items list with direct "Move to Bag" actions. |
| `/account`, `/my-account`, `/register` | [`AccountPage.tsx`](file:///Users/Admin/Developer/antigravity/RupanV3/frontend/src/pages/AccountPage.tsx) | Yes | Customer portal: order history, saved addresses, profile info, login/register tabs. |
| `/product-search` | [`SearchPage.tsx`](file:///Users/Admin/Developer/antigravity/RupanV3/frontend/src/pages/SearchPage.tsx) | Yes | Dedicated full-text catalog search interface with recent searches and real-time autocomplete. |
| `/offers`, `/offer` | [`OffersPage.tsx`](file:///Users/Admin/Developer/antigravity/RupanV3/frontend/src/pages/OffersPage.tsx) | Yes | Filtered view showing products with active discount pricing (`discount_price < price`). |
| `/new-arrivals`, `/new-arrival` | [`NewArrivalsPage.tsx`](file:///Users/Admin/Developer/antigravity/RupanV3/frontend/src/pages/NewArrivalsPage.tsx) | Yes | Curated collection of newly imported or created SKUs (`is_new = true`). |
| `/categories` | [`CategoriesPage.tsx`](file:///Users/Admin/Developer/antigravity/RupanV3/frontend/src/pages/CategoriesPage.tsx) | Yes | Visual catalog directory organized by gender and style categories. |
| `/about-us` | [`AboutPage.tsx`](file:///Users/Admin/Developer/antigravity/RupanV3/frontend/src/pages/AboutPage.tsx) | Yes | Brand heritage, craft philosophy, and mission statement. |
| `/contact-us` | [`ContactPage.tsx`](file:///Users/Admin/Developer/antigravity/RupanV3/frontend/src/pages/ContactPage.tsx) | Yes | Customer support details, telephone numbers, operational hours, inquiry form. |
| `/faq`, `/faqs` | [`FAQPage.tsx`](file:///Users/Admin/Developer/antigravity/RupanV3/frontend/src/pages/FAQPage.tsx) | Yes | Accordion list of delivery, payment, size, and exchange questions. |
| `/policy` | [`PolicyPage.tsx`](file:///Users/Admin/Developer/antigravity/RupanV3/frontend/src/pages/PolicyPage.tsx) | Yes | Return, refund, replacement, privacy policy, and terms of service. |
| `/blog`, `/blogs`, `/blog/:id` | [`BlogPage.tsx`](file:///Users/Admin/Developer/antigravity/RupanV3/frontend/src/components/BlogPage.tsx) | Yes | Fashion and lifestyle editorial articles. |
| `/*` | `CatchAllRoute` in [`App.tsx`](file:///Users/Admin/Developer/antigravity/RupanV3/frontend/src/App.tsx) | No (Direct) | Resolves custom landing pages matching blog IDs; falls back to 404 page if no record matches. |

---

## 7.2 Component Hierarchy and Layout Structure

```
<App> (BrowserRouter)
  └── <AppLayout>
        ├── <Header> (Navigation, Search Modal trigger, Cart Drawer count, Wishlist badge)
        ├── <main> (Wrapped in <ErrorBoundary> & <Suspense>)
        │     └── <Routes>
        │           ├── <Route path="/" element={<HomePage />} />
        │           │     ├── <HeroCarousel />
        │           │     ├── <CategoryGrid />
        │           │     ├── <FlashSale />
        │           │     ├── <ValueProps />
        │           │     └── <BlogPreview />
        │           ├── <Route path="/shop" element={<ShopPage />} />
        │           ├── <Route path="/product/:id" element={<ProductDetailPage />} />
        │           │     └── <ProductDetail />
        │           ├── <Route path="/cart" element={<CartPage />} />
        │           ├── <Route path="/checkout" element={<CheckoutPage />} />
        │           └── ... (Other lazy loaded pages)
        ├── <Footer> (Category links, policy links, social links, payment icons)
        ├── <MobileBottomMenu> (Sticky bottom bar on viewports < 768px: Home, Shop, Bag, Wishlist, Account)
        ├── <WhatsAppButton> (Floating action button opening direct wa.me chat)
        ├── <QuickViewModal> (Product card quick view popup)
        ├── <SizeGuideModal> (Size chart tabbed modal for ethnic wear)
        └── <ToastContainer> (Floating animated toast notification portal)
```

### Layout Suppression for Blank Landing Pages
In [`App.tsx#L194-L209`](file:///Users/Admin/Developer/antigravity/RupanV3/frontend/src/App.tsx#L194-L209), the layout engine detects whether the current path belongs to a blog or landing page that specifies `<!-- layout: blank -->` or `<!-- metadata: {"layout":"blank"} -->`. When detected, `<Header>`, `<Footer>`, `<MobileBottomMenu>`, and `<WhatsAppButton>` are completely unmounted, allowing standalone landing pages to render edge-to-edge without storefront framing.

---

## 7.3 Design Tokens, Brand Colors, and Typography

Design tokens are declared using Tailwind CSS v4 `@theme` directives in [`frontend/src/index.css#L4-L14`](file:///Users/Admin/Developer/antigravity/RupanV3/frontend/src/index.css#L4-L14):

```css
@theme {
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
  --font-display: "Space Grotesk", sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, SFMono-Regular, monospace;

  --color-brand-primary: #ff5c00;    /* Rupan signature vibrant orange */
  --color-brand-secondary: #FFFFFF;  /* Crisp clean white */
  --color-brand-accent: #ff5c00;     /* Highlight orange */
  --color-brand-bg: #F8F9FA;         /* Soft off-white neutral background */
  --color-brand-text: #222222;       /* Charcoal primary body text */
}
```

- **Bengali Typography**: Pages dynamically load `Hind Siliguri` and `Fredoka` from Google Fonts in custom error and landing page templates.
- **Responsive Breakpoints**: Standard Tailwind breakpoints (`sm: 640px`, `md: 768px`, `lg: 1024px`, `xl: 1280px`, `2xl: 1536px`).
- **Mobile Navigation**: Mobile bottom bar (`<MobileBottomMenu>`) is fixed at viewport bottom with `z-40` for screen widths below `768px` (`md:hidden`).

---

## 7.4 Forms, Validation, and User Feedback States

| Form / Interaction | Fields & Validation Rules | Loading State | Error Feedback | Success Feedback |
| :--- | :--- | :--- | :--- | :--- |
| **Checkout Delivery Form** | `name` (required), `phone` (required, tel format), `address` (required, min 10 chars recommended), `area` (radio: Inside/Outside Dhaka). | Spinner on submit button (`Processing Order...`). | Toast notification (`Please fill out all required fields...`). | Redirects to `/order-success`. |
| **Payment Verification** | - `bKash` / `Nagad`: requires non-empty `transactionId`.<br>- `Bangla QR`: requires `paidConfirm` checkbox toggle. | Inline validation check on submit. | Toast notification (`Please enter your Transaction ID for bKash...`). | Included in order payload. |
| **Coupon Code Redemption** | Input text string. Verifies against `public.coupons` (`is_active`, `min_order`, `expiry_date`, `usage_limit`). | Inline button spinner. | Toast notification (`Invalid or expired coupon code`). | Green badge with discount amount deducted from subtotal. |
| **Order Tracking Lookup** | `orderId` (required), `phone` (required). | Full container spinner with text `Locating parcel...`. | Error text block (`No matching order found...`). | Step-by-step visual fulfillment timeline. |
| **Product Review Submission** | `userName` (required), `rating` (1–5 stars), `comment` (text). | Submit button disabled with spinner. | Inline error message on network failure. | Toast notification (`Review submitted for moderation!`). |

---

## 7.5 SEO, Structured Data, and Image Optimization

1. **Dynamic SEO Hook (`useSEO.ts`)**:
   - Location: [`frontend/src/hooks/useSEO.ts`](file:///Users/Admin/Developer/antigravity/RupanV3/frontend/src/hooks/useSEO.ts).
   - Manages `document.title`, `meta[name="description"]`, `meta[property="og:title"]`, `meta[property="og:description"]`, and canonical link tag (`link[rel="canonical"]`).
   - For `/checkout`, explicitly injects `<meta name="robots" content="noindex, nofollow">` to prevent search engine indexing of transactional paths.
2. **Dynamic XML Sitemap Generator (`generate-sitemap.cjs`)**:
   - Executes during `npm run build`.
   - Connects to Supabase, queries all published products and blogs, and writes clean XML to `frontend/public/sitemap.xml`.
   - Generates clean canonical product slugs in the format `/product/{slug}-{numericId}`.
3. **Image CDN Proxy & Shimmer Animation**:
   - In [`frontend/src/utils/image.ts`](file:///Users/Admin/Developer/antigravity/RupanV3/frontend/src/utils/image.ts), external image URLs from third-party resellers (e.g. Mohasagor) are rewritten to use `wsrv.nl` with WebP transcoding:
     `https://wsrv.nl/?url=${encodeURIComponent(cleanUrl)}&w=600&q=80&output=webp`
   - [`ProductImage.tsx`](file:///Users/Admin/Developer/antigravity/RupanV3/frontend/src/components/ProductImage.tsx) wraps images with an animated CSS gradient shimmer placeholder (`@keyframes shimmer`) until `onLoad` triggers.

---

## 7.6 Verified Performance Bottlenecks & UI Defects

1. **Initial 1,000 Product Query on Storefront Mount**:
   - In [`frontend/src/services/productService.ts#L9-L16`](file:///Users/Admin/Developer/antigravity/RupanV3/frontend/src/services/productService.ts#L9-L16), `fetchProducts()` loads up to 1,000 published products into client memory immediately upon first page load.
   - This creates an unnecessarily large initial JSON payload over mobile networks.
2. **Full Catalog Index Chunking Loop**:
   - In [`frontend/src/services/productService.ts#L29-L59`](file:///Users/Admin/Developer/antigravity/RupanV3/frontend/src/services/productService.ts#L29-L59), `fetchProductCatalogIndex()` loops in 1,000-item chunks to download the entire product catalog index into memory. As the catalog scales, this creates client-side memory bloat and CPU spikes.
3. **Dead Admin Code in Frontend Distribution**:
   - [`frontend/src/components/AdminPanel.tsx`](file:///Users/Admin/Developer/antigravity/RupanV3/frontend/src/components/AdminPanel.tsx) (3,301 lines) and all 12 tab components under [`frontend/src/components/tabs/`](file:///Users/Admin/Developer/antigravity/RupanV3/frontend/src/components/tabs/) are bundled in the frontend codebase despite having no active route.
4. **Third-Party CDN Single Point of Failure**:
   - All product images depend on `wsrv.nl`. An outage of this free external proxy breaks all product visuals across the storefront.
5. **Accessibility Gaps (WCAG 2.1)**:
   - Color contrast: The signature brand orange (`#ff5c00`) on white background yields a contrast ratio of ~2.9:1, which falls below the WCAG AA minimum threshold (4.5:1) for normal text.
   - Screen readers: Form inputs lack explicit `aria-describedby` associations for validation error messages.
