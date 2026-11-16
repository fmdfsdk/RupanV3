# 11. Open Questions and Required Owner Decisions

This document lists essential questions that cannot be resolved solely through static codebase inspection. They are categorized to help the project owner make high-leverage architectural and operational decisions.

---

## 11.1 Highest-Priority Decisions (Blocks Security Remediation)

### Q1: Guest Order Tracking vs. Database Privacy Policy
- **What is Unknown**: Whether guest customers are expected to track orders indefinitely using only Order ID + Phone Number, or if order lookup should require an SMS OTP or temporary token.
- **Why it Matters**: [`supabase/schema.sql#L275`](file:///Users/Admin/Developer/antigravity/RupanV3/supabase/schema.sql#L275) currently has `select using (true)` on `public.orders` to allow guest tracking. This exposes all customer orders to anyone on the internet.
- **Evidence Missing**: Business policy on customer verification and whether SMS gateways (e.g. Greenweb, SSL Wireless) are available.
- **Decision Needed**: Approve closing `public.orders` RLS to `auth.uid() = user_id` and implementing an authenticated server-side endpoint (`/api/track-order`) for guest lookups with rate limiting.
- **Blocks Remediation**: **Yes**. Blocks closing critical security vulnerability SEC-01.

---

### Q2: Telegram Notification Channel Architecture
- **What is Unknown**: The owner's preference for order notification routing: whether Telegram alerts should go to a private group, a private channel, or an internal admin dashboard.
- **Why it Matters**: Currently, Telegram Bot credentials (`telegram_bot_token`, `telegram_chat_id`) are stored in `public.settings` and dispatched directly by customer browsers. Both the client and serverless function dispatch alerts, causing duplicate messages.
- **Evidence Missing**: Whether the active Telegram bot token has already been compromised or leaked to public users.
- **Decision Needed**:
  1. Authorize rotating the active Telegram Bot Token via `@BotFather`.
  2. Confirm moving the token to Vercel environment variables (`TELEGRAM_BOT_TOKEN`) and disabling client-side dispatch.
- **Blocks Remediation**: **Yes**. Blocks closing critical secret leakage SEC-03.

---

### Q3: Meta Conversions API Access Token Storage
- **What is Unknown**: Whether marketing managers need to update the Meta CAPI token from the admin UI (`SeoMarketingTab`), or if it can be configured as a fixed server environment variable in Vercel.
- **Why it Matters**: Storing `meta_capi_access_token` in `public.settings` exposes it to anyone reading the website settings.
- **Evidence Missing**: How frequently marketing staff rotate the Meta dataset token.
- **Decision Needed**: Decide whether to store `META_CAPI_ACCESS_TOKEN` strictly in Vercel Project Settings, or build an encrypted server-only table with admin-only RLS.
- **Blocks Remediation**: **Yes**. Blocks closing critical secret leakage SEC-03.

---

### Q4: Product Price Enforcement & Supplier Cost Thresholds
- **What is Unknown**: The intended business rule when an item's supplier cost changes between cart addition and order submission.
- **Why it Matters**: The database trigger `validate_order_total()` currently does not assign calculated totals. If the database strictly overwrites `new.total := calc_subtotal + shipping - discount`, the client total and database total must align perfectly.
- **Evidence Missing**: How coupon discounts and flash sales should be verified database-side.
- **Decision Needed**: Authorize fixing `validate_order_total()` to strictly enforce server-computed prices and reject orders with mismatched totals.
- **Blocks Remediation**: **Yes**. Blocks fixing financial integrity issue SEC-05.

---

## 11.2 Business Rules and Operational Decisions

### Q5: Reseller Supplier Dependence (Mohasagor)
- **What is Unknown**: Whether Mohasagor is the sole dropshipping supplier or if additional supplier APIs or warehouse management systems (WMS) will be introduced.
- **Why it Matters**: `admin/api/sync.ts` is tightly coupled to Mohasagor's JSON schema and URL structures.
- **Evidence Missing**: Supplier contracts or plans for multi-vendor dropshipping.
- **Decision Needed**: Clarify if the sync architecture should remain dedicated to Mohasagor or be generalized into an extensible provider adapter pattern.
- **Blocks Modernization**: No, but guides Phase 2 monorepo architecture.

---

### Q6: Legacy Product ID 3000 Offset Tolerance
- **What is Unknown**: Why the 3000 offset tolerance mapping (`searchNum +/- 3000`) was introduced for product IDs (e.g. in `landing.ts` and `productService.ts`).
- **Why it Matters**: Code checks both exact ID and IDs shifted by 3,000. It is unclear whether Mohasagor changed their numeric ID sequence historically or if this was an ad-hoc fix for specific marketing links.
- **Evidence Missing**: Documentation or historical logs explaining the origin of the 3,000 offset.
- **Decision Needed**: Confirm whether this legacy offset mapping is still actively required for current advertising links or if it can be phased out.
- **Blocks Modernization**: No.

---

### Q7: Customer Account Authentication Strategy
- **What is Unknown**: Whether Rupan intends to encourage customer account registration or remain primarily a guest-checkout brand.
- **Why it Matters**: Default store state currently auto-logs in dummy customer data. If customer accounts are prioritized, phone number OTP login (common in Bangladesh) would replace email/password.
- **Evidence Missing**: Percentage of repeat customers vs. one-time guest purchasers.
- **Decision Needed**: Decide whether to implement Supabase Phone Auth (SMS OTP) for customer accounts or keep the guest-first checkout focus.
- **Blocks Modernization**: No.

---

### Q8: Image Optimization & Infrastructure Hosting
- **What is Unknown**: The monthly image bandwidth budget and whether the owner wants to continue relying on the free `wsrv.nl` proxy.
- **Why it Matters**: `wsrv.nl` is a third-party single point of failure without an SLA.
- **Evidence Missing**: Store image traffic volume and CDN cost tolerance.
- **Decision Needed**: Decide whether to migrate image proxying to Cloudflare Images / Cloudflare Workers, or keep `wsrv.nl` with an automated fallback to original supplier URLs.
- **Blocks Modernization**: No.

---

## 11.3 Summary of Required Owner Actions

| Action Item | Target Component | Urgency | Impact of Approval |
| :--- | :--- | :--- | :--- |
| **1. Rotate Secrets** | Mohasagor API, Meta CAPI, Telegram Bot | **Immediate** | Neutralizes currently exposed tokens. |
| **2. Approve RLS Tightening** | `orders`, `profiles`, `settings`, storage | **Immediate** | Stops unauthorized public data access and deletes. |
| **3. Approve Test Data Purge** | Storefront Checkout & Account Forms | **Immediate** | Eliminates dummy customer values from customer checkout forms. |
| **4. Choose Monorepo Path** | Standardize on pnpm monorepo vs. in-place refactor | **Medium** | Governs Phase 2 engineering implementation. |
