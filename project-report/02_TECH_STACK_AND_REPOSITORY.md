# 02. Technology Stack and Repository Inventory

## 2.1 Technology Stack Inventory

All dependency versions below are verified directly from [`frontend/package.json`](file:///Users/Admin/Developer/antigravity/RupanV3/frontend/package.json), [`admin/package.json`](file:///Users/Admin/Developer/antigravity/RupanV3/admin/package.json), and their respective `package-lock.json` manifests.

| Layer / Concern | Technology | Version | Verified Location | Notes & Operational Context |
| :--- | :--- | :--- | :--- | :--- |
| **Language** | TypeScript | `~5.8.2` | `devDependencies` (both packages) | Modern strict TypeScript compiler. Both `frontend/tsconfig.json` and `admin/tsconfig.json` configure `"jsx": "react-jsx"`, `"target": "ES2022"`, and `"moduleResolution": "bundler"`. |
| **UI Framework** | React | `^19.0.1` | `dependencies` (both packages) | React 19 production release with JSX transforms and automatic batching. |
| **DOM Renderer** | React DOM | `^19.0.1` | `dependencies` (both packages) | Standard DOM bindings for React 19. |
| **Bundler & Dev Server** | Vite | `^6.2.3` | `dependencies` & `devDependencies` | Vite 6 build engine utilizing ES modules for local dev and Rollup for production bundle generation. |
| **Vite React Plugin** | `@vitejs/plugin-react` | `^5.0.4` | `dependencies` (both packages) | Standard Fast Refresh & JSX transformation plugin. |
| **CSS Framework** | Tailwind CSS | `^4.1.14` | `dependencies` & `devDependencies` | Modern Tailwind CSS v4 using `@tailwindcss/vite` plugin. Configured via CSS `@theme` directives instead of legacy `tailwind.config.js`. |
| **Tailwind Vite Plugin** | `@tailwindcss/vite` | `^4.1.14` | `dependencies` (both packages) | Native Vite integration plugin for Tailwind v4. |
| **Client Routing** | React Router DOM | `^7.18.1` | `dependencies` (both packages) | Modern React Router v7 used in SPA mode with `<BrowserRouter>`, `<Routes>`, `<Route>`, `<Link>`, and hooks (`useNavigate`, `useLocation`, `useSearchParams`). |
| **Global State Management**| Zustand | `^5.0.14` | `dependencies` (both packages) | Lightweight client state manager with custom hooks, localStorage persistence wrappers, and computed selectors. |
| **Iconography** | Lucide React | `^0.546.0` | `dependencies` (both packages) | Tree-shakeable SVG icon collection. |
| **Data Visualization** | Recharts | `^3.9.2` | `dependencies` (both packages) | Composable charting library utilized in `admin/src/components/tabs/OverviewTab.tsx` for sales and order status analytics. |
| **Backend & Database** | Supabase JS Client | `^2.110.0` | `dependencies` (both packages) | Official Supabase isomorphic client (`@supabase/supabase-js`) providing Postgres REST querying, Auth, Storage, and Realtime WebSocket subscriptions. |
| **Serverless Runtime** | `@vercel/node` | `^5.8.23` | `frontend/package.json` (`devDependencies`) | Type definitions and request/response helpers for Vercel Edge/Serverless functions (`landing.ts`, `place-order.ts`, `meta-capi.ts`). *Note: Missing from `admin/package.json`.* |
| **Node Execution / TS** | `tsx` | `^4.21.0` | `devDependencies` (both packages) | TypeScript execution runtime for Node.js scripts. |
| **Build Bundler Core** | `esbuild` | `^0.25.0` | `devDependencies` (both packages) | Underlying fast JS/TS bundler powering Vite. |
| **CSS Autoprefixing** | `autoprefixer` | `^10.4.21` | `devDependencies` (both packages) | PostCSS autoprefixer. |
| **Windows Optional** | `@tailwindcss/oxide-win32-x64-msvc` | `^4.3.2` | `optionalDependencies` | Native Rust-based binary parser for Tailwind v4 on Windows. |

---

## 2.2 Runtime Requirements and Tooling Limitations

1. **Package Management**:
   - The repository is organized as an informal multi-package workspace without a root `package.json` or native npm/yarn/pnpm workspaces manifest.
   - Both `frontend/` and `admin/` maintain independent `package.json` and `package-lock.json` files.
2. **Execution Environment Note**:
   - In the current inspection environment, Node.js and npm binaries are not present in the system PATH (`which node` returned not found).
   - In accordance with absolute rules, build and typecheck verification commands (`npm run build`, `npm run lint`) could not be executed dynamically; all findings are based on static code analysis, configuration inspection, and dependency manifest cross-referencing.

---

## 2.3 Repository Structure and Directory Roles

```text
/Users/Admin/Developer/antigravity/RupanV3
├── .agents/
│   └── AGENTS.md               # User workspace rules (Vercel routing, rewrite priorities, offset mapping)
├── .env.example                # Root environment variables template (contains legacy AI Studio variables)
├── .gitignore                  # Git ignore rules (node_modules, dist, .env, .DS_Store)
├── README.md                   # Legacy project documentation referencing original Google AI Studio template
├── sync-shared.js              # Node.js script synchronizing types, supabase client, and services to apps
├── metadata.json               # App descriptor ("Rupan Clothing", Bangladeshi fashion brand)
├── fixed.png                   # Image asset
├── Rupan Logo part (1).png     # Brand asset
├── Rupan Logo low (2).png      # Brand asset
├── assets/                     # Shared static media directory
├── shared/                     # Canonical shared business logic and service layer
│   ├── types.ts                # TypeScript interfaces (Product, Order, Review, BlogPost, Coupon, etc.)
│   ├── supabase.ts             # Supabase client wrapper and LocalDatabase mock simulator
│   └── services/               # Shared domain service abstractions
│       ├── productService.ts   # Product fetching, catalog indexing, search RPC, and filtering
│       ├── orderService.ts     # Order placement, customer lookups, order tracking
│       ├── blogService.ts      # Blog and landing page CRUD
│       ├── reviewService.ts    # Product review submission and fetching
│       ├── bannerService.ts    # Advertising banner retrieval
│       └── settingsService.ts  # Global website settings and payment parameters
├── supabase/                   # Database schema definitions and SQL migrations
│   ├── schema.sql              # Master DDL: tables, indexes, triggers, RLS policies, RPC functions
│   ├── add_capi_token_migration.sql   # Migration adding meta_capi_access_token to settings
│   └── update_payment_settings.sql    # Migration adding payment gateway settings and banner storage bucket
├── frontend/                   # Customer-facing storefront application (myrupan.com)
│   ├── package.json            # Frontend dependencies and npm scripts
│   ├── package-lock.json       # Lockfile
│   ├── tsconfig.json           # TypeScript configuration
│   ├── vite.config.ts          # Vite configuration with React and Tailwind v4 plugins
│   ├── vercel.json             # Vercel CDN static rewrites and dynamic catch-all serverless fallback
│   ├── generate-sitemap.cjs    # Build-time SEO sitemap generator querying published items
│   ├── index.html              # Storefront SPA HTML entry point
│   ├── public/                 # Static assets (robots.txt, sitemap.xml, payment logos)
│   ├── dist/                   # Production build output (bundled JS/CSS, index.html)
│   ├── api/                    # Vercel Serverless Functions
│   │   ├── landing.ts          # Dynamic landing page injector & product redirect handler
│   │   ├── place-order.ts      # Order persistence endpoint with Telegram bot alert dispatch
│   │   └── meta-capi.ts        # Server-side Meta Conversions API gateway with PII hashing
│   └── src/                    # Frontend React Application Source
│       ├── main.tsx            # React application root entry point
│       ├── App.tsx             # Main router, route definitions, modal controller, telemetry setup
│       ├── index.css           # Global CSS with Tailwind v4 @theme tokens and fonts
│       ├── types.ts            # Local copy of types (synchronized via sync-shared.js)
│       ├── version.ts          # Application version and build timestamp
│       ├── data.ts             # Mock products, reviews, and blog fallback fixtures
│       ├── hooks/
│       │   └── useSEO.ts       # Dynamic document title, meta description, and canonical tag hook
│       ├── lib/
│       │   ├── formatter.ts    # Currency and date formatting helpers
│       │   ├── supabase.ts     # Local copy of Supabase client / simulator wrapper
│       │   └── telemetry.ts    # Dual-channel tracking client (Pixel, CAPI, GA4, GTM)
│       ├── utils/
│       │   └── image.ts        # wsrv.nl image proxy optimizer and slug generator
│       ├── store/
│       │   └── useStore.ts     # Primary Zustand store (cart, catalog, filters, checkout)
│       ├── pages/              # Routed page components
│       │   ├── HomePage.tsx            # Main storefront home
│       │   ├── ShopPage.tsx            # Catalog browsing with multi-facet sidebar
│       │   ├── ProductDetailPage.tsx   # Detailed product view with gallery & variants
│       │   ├── CartPage.tsx            # Cart item manager
│       │   ├── CheckoutPage.tsx        # Single-page checkout with payment methods
│       │   ├── OrderSuccessPage.tsx    # Order confirmation screen
│       │   ├── OrderTrackingPage.tsx   # Live order tracking screen
│       │   ├── WishlistPage.tsx        # Customer wishlist view
│       │   ├── AccountPage.tsx         # Customer login/profile/orders page
│       │   ├── SearchPage.tsx          # Dedicated search page
│       │   ├── OffersPage.tsx          # Promotional sales page
│       │   ├── NewArrivalsPage.tsx     # New collections page
│       │   ├── CategoriesPage.tsx      # Category visual directory
│       │   ├── AboutPage.tsx           # Brand story page
│       │   ├── ContactPage.tsx         # Contact details and inquiry form
│       │   ├── FAQPage.tsx             # Frequently asked questions
│       │   └── PolicyPage.tsx          # Privacy policy, terms, return policy
│       ├── components/         # Reusable storefront UI components
│       │   ├── Header.tsx              # Main navigation header with search and bag counters
│       │   ├── Footer.tsx              # Storefront footer with policy and social links
│       │   ├── MobileBottomMenu.tsx    # Sticky mobile navigation bar
│       │   ├── ProductCard.tsx         # Reusable product grid card with hover image
│       │   ├── ProductDetail.tsx       # Core product presentation component
│       │   ├── ProductImage.tsx        # Image component with shimmer loading fallback
│       │   ├── QuickViewModal.tsx      # Quick product preview popup
│       │   ├── SizeGuideModal.tsx      # Measurement charts for Panjabi, Saree, etc.
│       │   ├── WhatsAppButton.tsx      # Floating WhatsApp direct chat widget
│       │   ├── ToastContainer.tsx      # Floating toast notification portal
│       │   ├── ErrorBoundary.tsx       # React error boundary preventing white-screen crashes
│       │   ├── BlogPage.tsx            # Standard blog article reader
│       │   ├── home/                   # Homepage subsection modules
│       │   │   ├── HeroCarousel.tsx    # Main advertising slider
│       │   │   ├── CategoryGrid.tsx    # Interactive category cards
│       │   │   ├── FlashSale.tsx       # Countdown timer flash sale module
│       │   │   ├── ValueProps.tsx      # Delivery, return, and authenticity banners
│       │   │   └── BlogPreview.tsx     # Recent articles snippet
│       │   ├── AdminPanel.tsx          # [ORPHANED] 3,301-line dead admin panel
│       │   └── tabs/                   # [ORPHANED] 12 dead admin tab components
│       └── services/           # Service layer copied from shared/
├── admin/                      # Administrative Hub application (admin.myrupan.com)
│   ├── package.json            # Admin dependencies and npm scripts
│   ├── package-lock.json       # Lockfile
│   ├── tsconfig.json           # TypeScript configuration
│   ├── vite.config.ts          # Vite configuration
│   ├── vercel.json             # Admin rewrite configuration (rewrites non-API paths to index.html)
│   ├── index.html              # Admin SPA HTML entry point
│   ├── public/                 # Static assets
│   ├── dist/                   # Production build output
│   ├── api/                    # Admin Serverless Functions
│   │   ├── sync.ts             # Reseller catalog ingestion worker (Mohasagor API)
│   │   ├── place-order.ts      # [DRIFTED COPY] Older duplicate of frontend place-order
│   │   └── meta-capi.ts        # [DRIFTED COPY] Older duplicate of frontend meta-capi
│   └── src/                    # Admin React Application Source
│       ├── main.tsx            # Application root
│       ├── App.tsx             # Admin login gate, RBAC role verification, connection monitor
│       ├── index.css           # Styling
│       ├── types.ts            # Admin types (diverged from shared/types.ts)
│       ├── version.ts          # Version constants
│       ├── data.ts             # Fixtures
│       ├── lib/
│       │   └── supabase.ts     # Supabase client / offline simulator wrapper
│       ├── components/
│       │   ├── AdminPanel.tsx  # Central administrative controller (3,701 lines)
│       │   ├── ErrorBoundary.tsx
│       │   └── tabs/           # Active administrative module tabs
│       │       ├── OverviewTab.tsx      # High-level analytics and business KPIs
│       │       ├── ProductsTab.tsx      # Master catalog CRUD and status management
│       │       ├── OrdersTab.tsx        # Realtime order processing and invoice printer
│       │       ├── InventoryTab.tsx     # Stock level adjustments and low-stock alerts
│       │       ├── MarginsTab.tsx       # Profit markup rules by category and SKU
│       │       ├── LandingPagesTab.tsx  # Raw HTML landing page builder with preview
│       │       ├── SyncTab.tsx          # Mohasagor catalog synchronization runner
│       │       ├── CustomersTab.tsx     # Registered user profiles and spend tracking
│       │       ├── CouponsTab.tsx       # Discount coupon management
│       │       ├── HomepageTab.tsx      # Homepage category and featured SKU arranger
│       │       ├── BlogsTab.tsx         # Blog article composer
│       │       ├── ReviewsTab.tsx       # Customer review moderation
│       │       ├── SeoMarketingTab.tsx  # Meta Pixel, GA4, GTM, and CAPI credentials
│       │       └── SettingsTab.tsx      # Store identity, shipping fees, payment toggles
│       └── services/           # Service layer copied from shared/
└── scratch/                    # Developer scripts and diagnostic utilities
    ├── analyze_project.js      # Directory and line count analyzer
    ├── check_log.js            # Sync log validator
    ├── completed_landing.html  # Diagnostic landing page sample
    ├── get_blogs.js            # Blog query utility
    ├── merge.js                # Content merge utility
    ├── test_blog_crud.js       # Blog CRUD tester
    └── test_supabase_rest.js   # Supabase REST endpoint tester
```

---

## 2.4 Environment Variables Inventory

The table below documents every environment variable identified across source code, configuration files, and serverless functions. In accordance with security guidelines, no secret values are exposed.

| Variable Name | Declared / Referenced Files | Target Environment | Intended Purpose | Security Sensitivity |
| :--- | :--- | :--- | :--- | :--- |
| `VITE_SUPABASE_URL` | `.env.example`, `frontend/src/lib/supabase.ts`, `admin/src/lib/supabase.ts`, `frontend/api/landing.ts`, `admin/api/sync.ts` | Frontend Client, Admin Client, Serverless Functions | The public HTTPS project URL for the Supabase instance (e.g. `https://xyz.supabase.co`). | Low (Publicly bundled in client assets). |
| `VITE_SUPABASE_ANON_KEY` | `.env.example`, `frontend/src/lib/supabase.ts`, `admin/src/lib/supabase.ts`, `frontend/api/landing.ts`, `admin/api/sync.ts` | Frontend Client, Admin Client, Serverless Functions | Public anon/publishable JWT for Supabase PostgREST client, subject to Row Level Security. | Low (Publicly bundled in client assets). |
| `SUPABASE_URL` | `frontend/api/place-order.ts`, `admin/api/place-order.ts`, `generate-sitemap.cjs` | Vercel Serverless Functions | Non-Vite prefixed URL for serverless functions where `VITE_` variables may not be automatically forwarded by Vercel. | Low (Project reference URL). |
| `SUPABASE_ANON_KEY` | `frontend/api/place-order.ts`, `admin/api/place-order.ts` | Vercel Serverless Functions | Non-Vite prefixed anon key fallback for serverless execution. | Low (Public anon key). |
| `SUPABASE_SERVICE_ROLE_KEY` | `frontend/api/place-order.ts`, `admin/api/sync.ts`, `frontend/api/landing.ts` | Vercel Serverless Functions (Backend Only) | Privileged admin service key that **completely bypasses Row Level Security (RLS)**. Required by `sync.ts` to bulk write products and sync logs. | **CRITICAL**: Privileged administrative key. Must never be exposed to browser bundles. |
| `NEXT_PUBLIC_SUPABASE_URL` | `frontend/api/place-order.ts` | Vercel Serverless Functions | Fallback variable name commonly used in Next.js/Vercel projects. | Low. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `frontend/api/place-order.ts` | Vercel Serverless Functions | Fallback variable name commonly used in Next.js/Vercel projects. | Low. |
| `TELEGRAM_BOT_TOKEN` | `frontend/api/place-order.ts`, `admin/api/place-order.ts` | Vercel Serverless Functions | API authentication token issued by Telegram `@BotFather` to send dispatch alert messages. | **HIGH**: Private Bot Token. *(Note: Code also attempts to read this from `public.settings` table).* |
| `TELEGRAM_CHAT_ID` | `frontend/api/place-order.ts`, `admin/api/place-order.ts` | Vercel Serverless Functions | Target chat or channel ID where order dispatch notifications are posted. | Medium (Private channel ID). |
| `DISABLE_HMR` | `frontend/vite.config.ts`, `admin/vite.config.ts` | Development Server | When set to `'true'`, disables Vite Hot Module Replacement and file watchers to reduce CPU load during agent edits. | None (Dev flag). |
| `GEMINI_API_KEY` | `.env.example`, `frontend/.env.example`, `admin/.env.example`, `README.md` | Legacy Template | Legacy variable inherited from original Google AI Studio app export. Not referenced in application source code. | None in current app (Dead config). |
| `APP_URL` | `.env.example`, `frontend/.env.example`, `admin/.env.example` | Legacy Template | Legacy variable from AI Studio Cloud Run hosting template. Not referenced in application source code. | None in current app (Dead config). |

---

## 2.5 Build, Dev, and Script Commands

The repository declares the following scripts in `frontend/package.json` and `admin/package.json`:

```json
// frontend/package.json
"scripts": {
  "dev": "node ../sync-shared.js && vite --port=3000 --host=0.0.0.0",
  "build": "node ../sync-shared.js && node generate-sitemap.cjs && vite build",
  "preview": "vite preview",
  "clean": "rm -rf dist server.js",
  "lint": "tsc --noEmit"
}

// admin/package.json
"scripts": {
  "dev": "node ../sync-shared.js && vite --port=3001 --host=0.0.0.0",
  "build": "node ../sync-shared.js && vite build",
  "preview": "vite preview",
  "clean": "rm -rf dist server.js",
  "lint": "tsc --noEmit"
}
```

### Script Execution Observations
1. **Port Allocation**: Storefront binds to port `3000`; Admin binds to port `3001`.
2. **Coupled Synchronization**: Both `dev` and `build` commands prepend `node ../sync-shared.js`. As documented in Section 1.3, this causes files in `frontend/src/` and `admin/src/` to be overwritten by `shared/` upon build or startup.
3. **Sitemap Generation**: Storefront `build` script executes `node generate-sitemap.cjs`, which attempts to connect to Supabase at build time to produce static `sitemap.xml` entries. If credentials are missing in the build container, it writes fallback placeholder URLs.
4. **Testing Absence**: Neither package contains a `"test"` script, test framework (`vitest`, `jest`), or end-to-end test runner (`playwright`, `cypress`).
