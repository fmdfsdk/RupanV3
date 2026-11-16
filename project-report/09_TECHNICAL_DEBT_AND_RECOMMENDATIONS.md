# 09. Technical Debt and Strategic Modernization

## 9.1 Prioritized Technical Debt Inventory

| ID | Issue Title | Category | Severity | Confidence | Affected Files | Business & Customer Impact | Recommended Remedy | Effort / Risk |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **DEBT-01** | **Customer Order PII Exposed via Open RLS Policy** | Security / Privacy | **CRITICAL** | Confirmed | [`supabase/schema.sql#L275`](file:///Users/Admin/Developer/antigravity/RupanV3/supabase/schema.sql#L275) | Any caller holding the public anon key can run `SELECT * FROM orders` and extract all customer names, phone numbers, delivery addresses, and purchasing histories. | Replace `using (true)` policy with restricted policy allowing only authenticated users (`auth.uid() = user_id`) and admin roles. Move guest tracking lookups to an authenticated RPC or rate-limited serverless function. | Low Effort / Low Risk |
| **DEBT-02** | **Customer Profiles & Admin Emails Exposed via Open RLS** | Security / Privacy | **CRITICAL** | Confirmed | [`supabase/schema.sql#L41`](file:///Users/Admin/Developer/antigravity/RupanV3/supabase/schema.sql#L41) | Complete user list including email addresses, full names, roles, and spending figures is publicly queryable. | Alter policy to `USING (auth.uid() = id OR public.is_admin(auth.uid()))`. | Low Effort / Low Risk |
| **DEBT-03** | **Third-Party API Secrets Stored in Public Settings Table** | Security / Secrets | **CRITICAL** | Confirmed | [`supabase/schema.sql#L148`](file:///Users/Admin/Developer/antigravity/RupanV3/supabase/schema.sql#L148), [`frontend/src/services/settingsService.ts#L10`](file:///Users/Admin/Developer/antigravity/RupanV3/frontend/src/services/settingsService.ts#L10) | Meta CAPI access token and Telegram Bot token are fetched into browser memory and saved in client `localStorage`. | Remove secret columns from `public.settings`. Store tokens strictly as Vercel server-side environment variables. | Medium Effort / Low Risk |
| **DEBT-04** | **Hardcoded Mohasagor API Credentials in Database DDL** | Security / Secrets | **HIGH** | Confirmed | [`supabase/schema.sql#L217-L219`](file:///Users/Admin/Developer/antigravity/RupanV3/supabase/schema.sql#L217-L219) | Supplier API key and secret key are committed in plain text in the repository. | Rotate credentials with Mohasagor; inject credentials via server environment variables. | Low Effort / Low Risk |
| **DEBT-05** | **Arbitrary Storage Deletion in Banners Bucket** | Security / Storage | **HIGH** | Confirmed | [`supabase/update_payment_settings.sql#L50-L52`](file:///Users/Admin/Developer/antigravity/RupanV3/supabase/update_payment_settings.sql#L50-L52) | Storage RLS allows anonymous users to delete or overwrite media files. | Restrict `INSERT`, `UPDATE`, `DELETE` storage policies to authenticated admin staff (`is_admin()`). | Low Effort / Low Risk |
| **DEBT-06** | **Order Price Verification Failure in SQL Trigger** | Financial Integrity | **HIGH** | Confirmed | [`supabase/schema.sql#L382-L447`](file:///Users/Admin/Developer/antigravity/RupanV3/supabase/schema.sql#L382-L447) | Database computes subtotal but never assigns it to `new.total`. Direct API callers can submit orders with `total: 1` and stock is deducted. | Update `validate_order_total()` trigger to calculate `calc_subtotal + shipping - discount` and assign directly to `new.subtotal` and `new.total`. | Low Effort / Medium Risk |
| **DEBT-07** | **Test Customer Data Pre-filled in Storefront Checkout** | User Experience | **HIGH** | Confirmed | [`frontend/src/store/useStore.ts#L208-L233`](file:///Users/Admin/Developer/antigravity/RupanV3/frontend/src/store/useStore.ts#L208-L233), [`AccountPage.tsx#L18-L33`](file:///Users/Admin/Developer/antigravity/RupanV3/frontend/src/pages/AccountPage.tsx#L18-L33) | Real customers see `test`, `534534563453`, and `phone-534534563453-nz9rfv2h@rupan.invalid` pre-filled in checkout form fields. | Clear initial state in `useStore.ts` and `AccountPage.tsx` to empty strings; read user profile only upon authenticated login. | Low Effort / Zero Risk |
| **DEBT-08** | **Destructive Codebase Synchronization (`sync-shared.js`)** | Architecture / Build | **HIGH** | Confirmed | [`sync-shared.js`](file:///Users/Admin/Developer/antigravity/RupanV3/sync-shared.js), `package.json` build scripts | Running `npm run build` or `npm run dev` overwrites un-synced fixes in `frontend/src` and `admin/src` with older code from `shared/`. | Backport all frontend/admin updates into `shared/`, or transition to a standard npm/pnpm workspace monorepo. | Medium Effort / Medium Risk |
| **DEBT-09** | **Unmanaged Serverless API Divergence** | Architecture / Drift | **MEDIUM** | Confirmed | `frontend/api/place-order.ts` vs `admin/api/place-order.ts` | Bug fixes applied to frontend API endpoints are missing from admin API endpoints. | Consolidate API endpoints into a shared backend module or single Vercel serverless layer. | Medium Effort / Low Risk |
| **DEBT-10** | **3,300+ Lines of Orphaned Dead Admin Code in Frontend** | Code Health / Bundle | **MEDIUM** | Confirmed | [`frontend/src/components/AdminPanel.tsx`](file:///Users/Admin/Developer/antigravity/RupanV3/frontend/src/components/AdminPanel.tsx), [`frontend/src/components/tabs/`](file:///Users/Admin/Developer/antigravity/RupanV3/frontend/src/components/tabs/) | Dead code sitting in frontend repository causes confusion and bundle maintenance drag. | Delete `frontend/src/components/AdminPanel.tsx` and unused frontend tab components. | Low Effort / Zero Risk |
| **DEBT-11** | **Initial 1,000 Product Load & Heavy Catalog Ingestion** | Performance | **MEDIUM** | Confirmed | [`frontend/src/services/productService.ts#L9-L59`](file:///Users/Admin/Developer/antigravity/RupanV3/frontend/src/services/productService.ts#L9-L59) | Downloads 1,000 product rows on storefront mount, then paginates entire catalog into browser memory. | Implement genuine on-demand server-side pagination with React Query or SWR (fetch only 12–24 items per page). | High Effort / Medium Risk |
| **DEBT-12** | **External Image Proxy Single Point of Failure** | Reliability | **MEDIUM** | Confirmed | [`frontend/src/utils/image.ts#L17`](file:///Users/Admin/Developer/antigravity/RupanV3/frontend/src/utils/image.ts#L17) | Storefront images depend on free third-party proxy `wsrv.nl`. An outage or rate-limit disables all catalog images. | Host images on Cloudflare Images, Supabase Storage, or dedicated image optimization CDN. | Medium Effort / Low Risk |
| **DEBT-13** | **Zero Automated Testing Across Applications** | QA / Reliability | **MEDIUM** | Confirmed | `frontend/`, `admin/` | No unit, integration, or E2E tests exist. Regressions can only be detected via manual testing. | Introduce Vitest for unit testing critical pricing/discount calculations; add Playwright for core checkout journey. | High Effort / Low Risk |

---

## 9.2 Evaluation of Strategic Modernization Approaches

### Strategic Options Comparison Matrix

| Evaluation Dimension | Approach A: Targeted Refactoring | Approach B: Incremental Replacement (Recommended) | Approach C: Full Rebuild from Scratch |
| :--- | :--- | :--- | :--- |
| **Description** | Fix critical security vulnerabilities (RLS, secrets, price trigger, test data) in place without altering architecture. | Phase 1 security hardening, followed by modular decomposition (pnpm monorepo, clean API layer, server-side pagination). | Discard existing codebase and rewrite application from scratch using a modern full-stack framework (e.g. Next.js App Router). |
| **Business Disruption** | **Zero**: Deployed incrementally in hours with no downtime to customer storefront. | **Near Zero**: Incremental updates deployed behind canary or stage branches. Store remains live. | **High**: Months of development; pause on new marketing campaigns and reseller catalog expansion. |
| **Development Effort** | **Minimal**: ~2 to 3 engineering days. | **Moderate**: ~2 to 4 engineering weeks across phased sprints. | **Extensive**: ~2 to 3 engineering months. |
| **Security Improvement** | Solves critical PII leaks and secret exposure immediately. | Solves all security risks and establishes robust server-side enforcement. | Solves security risks if built properly, but risks introducing new authorization bugs. |
| **Long-Term Maintainability** | Fair: Monorepo drift and large monolithic components remain. | **High**: Clean monorepo structure, unified shared services, elimination of duplicate dead code. | High initially, but costly to duplicate existing features (e.g. offset tolerance, Bangla QR, landing page engine). |
| **Data Integrity & Risk** | High safety: Existing Postgres tables, product slugs, and order history preserved intact. | **High safety**: Schemas remain backward compatible; triggers and policies strengthened. | Risky: Requires complex data migration of historical orders, users, and product slugs. |
| **Regression Risk** | **Low**: Changes are targeted strictly at security policies and form defaults. | **Low to Moderate**: Isolated by module boundaries with test coverage. | **High**: High risk of breaking complex business rules (offset 3000 tolerance, Bangla QR flow, landing script injection). |
| **Total Cost of Ownership** | Very Low upfront; higher ongoing tech debt maintenance. | **Optimal**: Balanced upfront investment with permanent reduction in operational overhead. | Very High: Sunk cost of re-engineering working e-commerce capabilities. |

---

## 9.3 Strategic Recommendation: Phased Modular Modernization

The codebase currently works in production, serves live orders, synchronizes reseller products, and renders high-converting dynamic landing pages. **A complete rewrite is unnecessary and economically inadvisable.**

The optimal strategy for Rupan is **Approach B: Incremental Modular Replacement**, executed in three distinct phases:

### Phase 1: Immediate Security & Customer Experience Hotfixes (Days 1–3)
1. **Fix Open RLS Policies**: Restrict `public.orders` and `public.profiles` to authenticated users and admin roles.
2. **Purge Test Data**: Remove default `'test'` and `'534534563453'` values from [`useStore.ts`](file:///Users/Admin/Developer/antigravity/RupanV3/frontend/src/store/useStore.ts) and [`AccountPage.tsx`](file:///Users/Admin/Developer/antigravity/RupanV3/frontend/src/pages/AccountPage.tsx).
3. **Correct Order Validation Trigger**: Fix [`validate_order_total()`](file:///Users/Admin/Developer/antigravity/RupanV3/supabase/schema.sql#L382) to recalculate and assign `new.subtotal` and `new.total`.
4. **Secure Storage Policies**: Restrict `INSERT`, `UPDATE`, `DELETE` in the `banners` bucket to verified admin roles.
5. **Migrate Secrets**: Move `meta_capi_access_token` and `telegram_bot_token` out of `public.settings` into Vercel server environment variables.
6. **Remove Client Telegram Dispatch**: Disable direct browser `fetch` to `api.telegram.org` from [`useStore.ts`](file:///Users/Admin/Developer/antigravity/RupanV3/frontend/src/store/useStore.ts).

### Phase 2: Monorepo Consolidation & Code Hygiene (Weeks 1–2)
1. **Synchronize Shared Layer**: Backport all active changes from `frontend/src` and `admin/src` into `shared/` to eliminate build overwrite destruction.
2. **Delete Dead Code**: Remove `frontend/src/components/AdminPanel.tsx` (3,301 lines) and `frontend/src/components/tabs/` from the storefront application.
3. **Unify API Functions**: Consolidate `frontend/api/` and `admin/api/` into a single authoritative backend directory to eliminate drift in `place-order.ts` and `meta-capi.ts`.
4. **Decompose AdminPanel Modals**: Extract the ~1,500 lines of modal code from `admin/src/components/AdminPanel.tsx` into dedicated, testable modal components.

### Phase 3: Scalability & Performance Hardening (Weeks 3–4)
1. **Server-Side Pagination**: Replace initial 1,000-item catalog download with standard page-by-page fetching (12–24 items per request).
2. **Dedicated Image CDN**: Migrate from public `wsrv.nl` to Cloudflare Images or an enterprise CDN with automated fallback.
3. **Automated Testing Suite**: Implement Vitest unit tests for pricing, discount rules, and shipping thresholds, accompanied by Playwright E2E tests for the guest checkout journey.

---

## 9.4 Component Roadmap: Preserve, Refactor, Replace, or Investigate

| Module / Component | Roadmap Decision | Rationale |
| :--- | :--- | :--- |
| **`frontend/api/landing.ts`** | **Preserve & Harden** | Proven high-value marketing asset. Serves dynamic landing pages and handles product redirects accurately. Needs security hardening against CAPI token injection. |
| **Bangla QR & MFS Checkout** | **Preserve** | Excellent cultural fit for Bangladesh. Works reliably with bKash, Nagad, and Bangla QR standard. |
| **Mohasagor Reseller Ingestion (`sync.ts`)** | **Preserve & Refactor** | Core business capability. Clean up error isolation and migrate credentials from DDL to environment variables. |
| **Zustand Store (`useStore.ts`)** | **Refactor** | Purge hardcoded test customer data; decouple direct Telegram and API calls from state mutations. |
| **Database DDL (`schema.sql`)** | **Refactor** | Fix order price calculation trigger; tighten RLS policies on orders, profiles, and storage. |
| **`sync-shared.js`** | **Replace** | Replace fragile file-copying script with native pnpm workspaces and TypeScript project references. |
| **`frontend/src/components/AdminPanel.tsx`** | **Delete (Replace)** | 3,301 lines of dead orphaned code in customer storefront. |
| **Initial 1,000 Catalog Fetch** | **Replace** | Replace in-memory catalog loading with server-side paginated queries. |
| **Offline Sandbox (`LocalDatabase`)** | **Preserve** | Excellent developer preview tool for local testing when cloud credentials are unavailable. |
