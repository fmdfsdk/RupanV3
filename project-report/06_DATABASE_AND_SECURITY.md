# 06. Database, Data Model, and Security Assessment

## 6.1 Database Architecture and Schema DDL

The database is PostgreSQL 15 managed via Supabase. Schema definitions and migrations are stored in [`supabase/schema.sql`](file:///Users/Admin/Developer/antigravity/RupanV3/supabase/schema.sql), [`supabase/add_capi_token_migration.sql`](file:///Users/Admin/Developer/antigravity/RupanV3/supabase/add_capi_token_migration.sql), and [`supabase/update_payment_settings.sql`](file:///Users/Admin/Developer/antigravity/RupanV3/supabase/update_payment_settings.sql).

### Entity Relationship Diagram

```mermaid
erDiagram
    auth_users ||--|| profiles : "extends (1:1 cascade)"
    products ||--o{ reviews : "has reviews (1:N)"
    sync_sources ||--o{ sync_logs : "records runs (1:N)"
    orders ||--o{ order_items : "contains lines (1:N)"
    categories ||--o{ products : "classifies (1:N)"

    profiles {
        uuid id PK "references auth.users(id)"
        text email "not null"
        text full_name
        text role "check: Super Admin, Admin, Manager, Editor, Support, Delivery Manager, Customer"
        boolean is_active "default true"
        numeric total_spending "numeric(12,2)"
        timestamp last_login
        timestamp created_at
    }

    settings {
        integer id PK "enforced id = 1"
        text logo_text
        text logo_accent
        text tagline
        text whatsapp_number
        text support_number
        text currency_symbol
        numeric inside_dhaka_shipping
        numeric outside_dhaka_shipping
        numeric free_shipping_min_order
        text theme
        text meta_pixel_id
        text meta_test_event_code
        text meta_capi_access_token
        text google_tag_manager_id
        text google_analytics_id
        jsonb homepage_config
        boolean payment_bangla_qr_enabled
        boolean payment_bkash_enabled
        boolean payment_nagad_enabled
        boolean payment_cod_enabled
        text payment_bkash_number
        text payment_nagad_number
        text payment_bangla_qr_image
        text payment_bangla_qr_instruction
        text payment_mfs_instruction
        text payment_cod_instruction
        text telegram_bot_token
        text telegram_chat_id
        boolean telegram_notifications_enabled
        text facebook_url
        text twitter_url
        text youtube_url
        text instagram_url
        timestamp updated_at
    }

    products {
        text id PK "custom ID e.g. mohasagor-4083"
        text name "not null"
        text slug "unique not null"
        text sku "unique"
        text brand
        text category "not null"
        text sub_category
        text_array tags
        text gender "default 'Men'"
        numeric price "numeric(12,2) not null"
        numeric discount_price "numeric(12,2)"
        numeric purchase_price "numeric(12,2)"
        numeric rating "numeric(3,2) default 5.0"
        integer reviews_count "default 0"
        text_array images
        jsonb colors "array of {name, class, hex}"
        text_array sizes
        text description "not null"
        text short_description
        text_array features
        integer stock "not null default 0"
        integer low_stock_warning "default 5"
        numeric weight
        text material
        text status "default 'published'"
        boolean is_featured
        boolean is_trending
        boolean is_new
        boolean is_best_seller
        boolean is_flash_sale
        integer flash_sale_limit
        integer flash_sale_sold
        text seo_title
        text seo_description
        text source_id "default 'manual'"
        text source_product_id
        timestamp created_at
        timestamp updated_at
    }

    sync_sources {
        text id PK
        text name "not null"
        text type "default 'api'"
        text api_url
        text api_key
        text secret_key
        jsonb config
        boolean is_active "default true"
        timestamp last_sync_at
        timestamp created_at
    }

    sync_logs {
        uuid id PK "default gen_random_uuid()"
        text source_id FK "references sync_sources(id)"
        text status "running, success, failed"
        integer items_fetched
        integer items_imported
        integer items_updated
        integer items_failed
        text error_message
        jsonb details
        timestamp started_at
        timestamp completed_at
    }

    orders {
        text id PK "e.g. RUP-1082"
        text customer_name "not null"
        text phone "not null"
        text address "not null"
        text area "not null"
        text payment_method "not null"
        jsonb items "array of item objects"
        numeric subtotal "numeric(12,2) not null"
        numeric shipping_fee "numeric(10,2) not null"
        numeric total "numeric(12,2) not null"
        text status "default 'Pending'"
        text payment_status "default 'Unpaid'"
        text customer_notes
        text admin_notes
        text meta_event_id
        boolean is_guest "default true"
        boolean is_incognito_guest "default false"
        uuid user_id
        text transaction_id
        boolean paid_confirm "default false"
        timestamp created_at
    }

    order_items {
        text id PK
        text order_id
        text product_id
        text product_name
        text color
        text size
        numeric price
        integer quantity
        text image
        timestamp created_at
    }

    reviews {
        uuid id PK "default gen_random_uuid()"
        text user_name "not null"
        integer rating "check 1 to 5"
        text comment "not null"
        boolean verified "default false"
        text user_photo
        text product_id FK "references products(id)"
        text status "default 'pending'"
        text reply
        timestamp created_at
    }

    coupons {
        text code PK
        text type "percentage, fixed, free_shipping"
        numeric value "numeric(10,2) not null"
        numeric min_order "default 0.00"
        numeric max_discount
        date expiry_date
        boolean is_active "default true"
        integer usage_limit
        integer used_count "default 0"
        timestamp created_at
    }

    banners {
        uuid id PK "default gen_random_uuid()"
        text title "not null"
        text subtitle
        text image "not null"
        text cta_text
        text category
        boolean is_active "default true"
        text type "default 'homepage'"
        date publish_date
        timestamp created_at
    }

    blogs {
        text id PK "full URL path e.g. /eid-sale"
        text title "not null"
        text excerpt
        text content "not null (raw HTML)"
        text image
        text read_time
        text category "e.g. '__landing_page__'"
        text status "default 'published'"
        text seo_title
        text seo_description
        timestamp created_at
    }

    categories {
        text id PK
        text name "not null"
        text slug "unique not null"
        boolean is_active "default true"
    }
```

---

### Database Functions and Triggers

#### 1. Order Total Validation & Stock Deduction Trigger
- **Function**: `public.validate_order_total()`
- **Trigger**: `on_order_created` (`BEFORE INSERT ON public.orders FOR EACH ROW`)
- **Location**: [`supabase/schema.sql#L382-L452`](file:///Users/Admin/Developer/antigravity/RupanV3/supabase/schema.sql#L382-L452)
- **Implementation Flaw**:
  ```sql
  for item in select * from jsonb_array_elements(new.items) loop
    ...
    if found then
      actual_price := found_price;
      -- Deduct stock if available
      update public.products set stock = greatest(0, stock - prod_qty) where id = prod_id;
    else
      actual_price := item_price;
    end if;
    calc_subtotal := calc_subtotal + (actual_price * prod_qty);
  end loop;
  
  -- Ensure non-negative total
  if new.total < 0 then
    new.total := 0;
  end if;
  return new;
  ```
  - **Defect**: `calc_subtotal` is accumulated in local variable `calc_subtotal`, but it is **never assigned** to `new.subtotal` or `new.total`.
  - **Consequence**: Stock is decremented on order placement, but the submitted price (`new.total`) is accepted as provided by the client without enforcement or verification!

#### 2. Auth User Sync Trigger
- **Function**: `public.handle_new_user()`
- **Trigger**: `on_auth_user_created` (`AFTER INSERT ON auth.users FOR EACH ROW`)
- **Location**: [`supabase/schema.sql#L361-L379`](file:///Users/Admin/Developer/antigravity/RupanV3/supabase/schema.sql#L361-L379)
- **Behavior**: Automatically creates corresponding row in `public.profiles` with `role = 'Customer'` and `is_active = true`.

#### 3. Full-Text Search Function
- **Function**: `public.search_products(search_query text, match_limit int DEFAULT 20)`
- **Location**: [`supabase/schema.sql#L476-L494`](file:///Users/Admin/Developer/antigravity/RupanV3/supabase/schema.sql#L476-L494)
- **Behavior**: Uses PostgreSQL `to_tsvector('english', ...)` and `plainto_tsquery('english', search_query)` ordered by `ts_rank` and `created_at DESC`.

---

## 6.2 Row-Level Security (RLS) Policy Audit

| Table / Storage Bucket | RLS Status | Operation | Policy Name & Rule Expression | Authorized Roles | Security Assessment & Risk |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `public.profiles` | Enabled | `SELECT` | `"Allow public read of profiles"`<br>`USING (true)` | **Anyone (Public / Anon)** | **CRITICAL LEAK**: Exposes every customer and admin email, full name, role, total spending, and last login to anyone with the anon key. |
| `public.profiles` | Enabled | `UPDATE` | `"Allow individual user profile updates"`<br>`USING (auth.uid() = id)` | Authenticated User | Secure: Users can only update their own record. |
| `public.profiles` | Enabled | `ALL` | `"Allow admin changes to profiles"`<br>`USING (public.is_admin(auth.uid()))` | Super Admin, Admin | Secure. |
| `public.settings` | Enabled | `SELECT` | `"Allow public read of settings"`<br>`USING (true)` | **Anyone (Public / Anon)** | **CRITICAL LEAK**: Exposes `meta_capi_access_token`, `telegram_bot_token`, and `telegram_chat_id` to the public internet. |
| `public.settings` | Enabled | `UPDATE` | `"Allow admin update of settings"`<br>`USING (role IN ('Super Admin', 'Admin', 'Manager'))` | Super Admin, Admin, Manager | Secure for writes. |
| `public.orders` | Enabled | `INSERT` | `"Allow public insert of orders"`<br>`WITH CHECK (true)` | Anyone (Public / Anon) | Required for guest checkout, but lacks rate limiting and price enforcement. |
| `public.orders` | Enabled | `SELECT` | `"Allow public tracking query"`<br>`USING (true)` | **Anyone (Public / Anon)** | **CRITICAL LEAK**: Allows any caller with the anon key to run `SELECT * FROM orders` and dump all customer names, phone numbers, delivery addresses, and purchase histories. |
| `public.orders` | Enabled | `ALL` | `"Allow admin order access"`<br>`USING (role IN ('Super Admin', 'Admin', 'Manager', 'Support', 'Delivery Manager'))` | Admin Staff | Secure. |
| `public.products` | Enabled | `SELECT` | `"Allow public read of products"`<br>`USING (true)` | Anyone | Standard public catalog browsing. |
| `public.products` | Enabled | `ALL` | `"Allow admin management of products"`<br>`USING (role IN ('Super Admin', 'Admin', 'Manager', 'Editor'))` | Admin Staff | Secure. |
| `public.sync_sources` | Enabled | `SELECT` | `"Allow admin read of sync sources"`<br>`USING (role IN ('Super Admin', 'Admin', 'Manager'))` | Admin Staff | Protected from public. |
| `public.sync_sources` | Enabled | `ALL` | `"Allow admin changes to sync sources"`<br>`USING (role IN ('Super Admin', 'Admin'))` | Super Admin, Admin | Protected from public. |
| `public.sync_logs` | Enabled | `SELECT` | `"Allow admin read of sync logs"`<br>`USING (role IN ('Super Admin', 'Admin', 'Manager', 'Support'))` | Admin Staff | Protected from public. |
| `public.sync_logs` | Enabled | `ALL` | `"Allow admin write of sync logs"`<br>`USING (role IN ('Super Admin', 'Admin'))` | Super Admin, Admin | Protected from public. |
| `public.reviews` | Enabled | `SELECT` | `"Allow public read of approved reviews"`<br>`USING (status = 'approved' OR is_admin)` | Anyone for approved; Admin for all | Secure. |
| `public.reviews` | Enabled | `INSERT` | `"Allow public review submission"`<br>`WITH CHECK (true)` | Anyone | Allows public review submission (default status pending). |
| `public.reviews` | Enabled | `ALL` | `"Allow admin review moderation"` | Admin Staff | Secure. |
| `public.coupons` | Enabled | `SELECT` | `"Allow public selection for checkout verification"`<br>`USING (true)` | Anyone | Intentional for checkout coupon verification. |
| `public.coupons` | Enabled | `ALL` | `"Allow admin coupon editing"` | Super Admin, Admin, Manager | Secure. |
| `public.banners` | Enabled | `SELECT` | `"Allow public read of active banners"`<br>`USING (is_active = true OR is_admin)` | Anyone for active; Admin for all | Secure. |
| `public.banners` | Enabled | `ALL` | `"Allow admin banner edits"` | Admin Staff | Secure. |
| `public.blogs` | Enabled | `SELECT` | `"Allow public read of published blogs"`<br>`USING (status = 'published' OR is_admin)` | Anyone for published; Admin for all | Secure. |
| `public.blogs` | Enabled | `ALL` | `"Allow admin blog edits"` | Admin Staff | Secure. |
| `storage.objects` (`banners` bucket) | Enabled | `SELECT` | `"Public Read Access Banners"`<br>`USING (bucket_id = 'banners')` | Anyone | Intentional for public banner display. |
| `storage.objects` (`banners` bucket) | Enabled | `INSERT` | `"Public Upload Access Banners"`<br>`WITH CHECK (bucket_id = 'banners')` | **Anyone (Public / Anon)** | **HIGH RISK**: Unauthenticated users can upload arbitrary files to the storage bucket. |
| `storage.objects` (`banners` bucket) | Enabled | `UPDATE` | `"Public Update Access Banners"`<br>`USING (bucket_id = 'banners')` | **Anyone (Public / Anon)** | **HIGH RISK**: Unauthenticated users can overwrite any existing file in the storage bucket. |
| `storage.objects` (`banners` bucket) | Enabled | `DELETE` | `"Public Delete Access Banners"`<br>`USING (bucket_id = 'banners')` | **CRITICAL RISK**: Unauthenticated users can delete any or all media files in the banners storage bucket. |

---

## 6.3 Secret Management & Exposed Credentials

In accordance with absolute rules, no actual secret values, passwords, or tokens are printed below. Findings document the file paths, line numbers, variable names, and sensitivity categories:

1. **Hardcoded Reseller API Key & Secret Key in SQL DDL**:
   - **File**: [`supabase/schema.sql#L217-L219`](file:///Users/Admin/Developer/antigravity/RupanV3/supabase/schema.sql#L217-L219)
   - **Fields**: `api_key` and `secret_key` in the `INSERT INTO public.sync_sources` statement.
   - **Category**: Third-party supplier API credentials (Mohasagor Reseller API).
   - **Remedy**: Credentials must be rotated immediately with Mohasagor and migrated to secure server environment variables or encrypted secrets.
2. **Third-Party Graph API and Telegram Bot Tokens in Public Database Table**:
   - **File**: [`supabase/add_capi_token_migration.sql#L16`](file:///Users/Admin/Developer/antigravity/RupanV3/supabase/add_capi_token_migration.sql#L16) and [`supabase/schema.sql#L800`](file:///Users/Admin/Developer/antigravity/RupanV3/supabase/schema.sql#L800)
   - **Columns**: `meta_capi_access_token`, `telegram_bot_token`, `telegram_chat_id` in `public.settings`.
   - **Category**: Meta System User Access Token & Telegram Bot Authorization Token.
   - **Remedy**: Move both tokens out of `public.settings` and configure them strictly as server-side environment variables in Vercel (`META_CAPI_ACCESS_TOKEN`, `TELEGRAM_BOT_TOKEN`).
3. **Telegram Bot Token Transmitted to and Executed by Customer Browser**:
   - **File**: [`frontend/src/store/useStore.ts#L652-L688`](file:///Users/Admin/Developer/antigravity/RupanV3/frontend/src/store/useStore.ts#L652-L688)
   - **Category**: Direct client-side invocation of `https://api.telegram.org/bot<token>/sendMessage`.
   - **Remedy**: Remove client-side Telegram dispatch entirely. All Telegram notifications must be handled exclusively by the serverless backend function (`api/place-order.ts`).

---

## 6.4 Security Threat Assessment

| Threat ID | Threat Description | Affected Files & Lines | Severity | Confidence | Business / Customer Impact |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **SEC-01** | **Customer Order PII Data Leakage via Open RLS** | [`supabase/schema.sql#L275`](file:///Users/Admin/Developer/antigravity/RupanV3/supabase/schema.sql#L275) | **CRITICAL** | **Confirmed (Static Analysis)** | Unauthenticated callers using the public anon key can read all records from `public.orders`, exposing names, phone numbers, home addresses, and purchases. |
| **SEC-02** | **User Profile & Admin Email Leakage via Open RLS** | [`supabase/schema.sql#L41`](file:///Users/Admin/Developer/antigravity/RupanV3/supabase/schema.sql#L41) | **CRITICAL** | **Confirmed (Static Analysis)** | Any user can query `public.profiles` to extract email addresses, full names, roles, and spending figures of all customers and staff. |
| **SEC-03** | **Meta CAPI and Telegram Bot Token Exposure via Settings** | [`supabase/schema.sql#L148`](file:///Users/Admin/Developer/antigravity/RupanV3/supabase/schema.sql#L148), [`frontend/src/services/settingsService.ts#L10`](file:///Users/Admin/Developer/antigravity/RupanV3/frontend/src/services/settingsService.ts#L10) | **CRITICAL** | **Confirmed (Static Analysis)** | Private Meta CAPI token and Telegram bot credentials are queryable by anonymous clients and stored in browser `localStorage`. |
| **SEC-04** | **Arbitrary Storage Deletion in Banners Bucket** | [`supabase/update_payment_settings.sql#L50-L52`](file:///Users/Admin/Developer/antigravity/RupanV3/supabase/update_payment_settings.sql#L50-L52) | **HIGH** | **Confirmed (Static Analysis)** | Storage RLS policy allows anonymous users to delete or overwrite any media file in the `banners` bucket. |
| **SEC-05** | **Order Price Manipulation & Lack of Total Enforcement** | [`supabase/schema.sql#L382-L447`](file:///Users/Admin/Developer/antigravity/RupanV3/supabase/schema.sql#L382-L447), [`frontend/api/place-order.ts#L61-L82`](file:///Users/Admin/Developer/antigravity/RupanV3/frontend/api/place-order.ts#L61-L82) | **HIGH** | **Confirmed (Static Analysis)** | Orders can be submitted with arbitrary prices (e.g. `total: 1`) via direct API calls because the trigger never overwrites `new.total` with `calc_subtotal`. |
| **SEC-06** | **Unauthenticated /api/place-order Abuse & Telegram Spam** | [`frontend/api/place-order.ts#L14-L26`](file:///Users/Admin/Developer/antigravity/RupanV3/frontend/api/place-order.ts#L14-L26) | **MEDIUM** | **Confirmed (Static Analysis)** | Open CORS (`*`) and lack of rate limiting allows bots to post bogus orders and spam the brand's Telegram channel. |
| **SEC-07** | **Unsafe HTML Rendering in Landing Pages (Stored XSS Risk)** | [`frontend/api/landing.ts#L455-L464`](file:///Users/Admin/Developer/antigravity/RupanV3/frontend/api/landing.ts#L455-L464) | **MEDIUM** | **Confirmed (Static Analysis)** | Landing page content is stored as raw HTML in `public.blogs` and served directly with `Content-Type: text/html`. Compromise of an Editor/Manager account allows serving malicious JavaScript to visitors. |
| **SEC-08** | **CAPI Token Injection into Public HTML** | [`frontend/api/landing.ts#L127`](file:///Users/Admin/Developer/antigravity/RupanV3/frontend/api/landing.ts#L127) | **HIGH** | **Confirmed (Static Analysis)** | Serverless handler replaces `RUPAN_META_CAPI_TOKEN` placeholders with the live token in HTML delivered to the customer browser. |
