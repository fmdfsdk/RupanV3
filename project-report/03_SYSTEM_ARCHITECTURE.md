# 03. System Architecture and Dependency Map

## 3.1 Architecture and Deployment Topology

Rupan operates on a decoupled client-server architecture deployed primarily on **Vercel** with a managed **Supabase** backend.

```
                      ┌──────────────────────────────────────────────┐
                      │              PUBLIC INTERNET                 │
                      └───────┬──────────────────────────────┬───────┘
                              │                              │
                    https://myrupan.com             https://admin.myrupan.com
                              │                              │
                              ▼                              ▼
             ┌────────────────────────────────┐  ┌──────────────────────────────┐
             │       VERCEL PROJECT:          │  │       VERCEL PROJECT:        │
             │          FRONTEND              │  │           ADMIN              │
             │ ┌────────────────────────────┐ │  │ ┌──────────────────────────┐ │
             │ │ Vercel Edge / CDN Rewrites │ │  │ │ Vercel Edge Rewrites     │ │
             │ └──────────────┬─────────────┘ │  │ └────────────┬─────────────┘ │
             │                │               │  │              │               │
             │   ┌────────────┴───────────┐   │  │   ┌──────────┴──────────┐    │
             │   ▼                        ▼   │  │   ▼                     ▼    │
             │ Static SPA       Serverless    │  │ Static SPA      Serverless   │
             │ (index.html)     Functions:    │  │ (index.html)    Functions:   │
             │                  - landing.ts  │  │                 - sync.ts    │
             │                  - place-order │  │                 - place-order│
             │                  - meta-capi   │  │                 - meta-capi  │
             └─────────┬──────────────┬───────┘  └─────────┬──────────────┬─────┘
                       │              │                    │              │
                       │              └──────────┬─────────┘              │
                       │                         │                        │
                       ▼                         ▼                        ▼
        ┌────────────────────────────────────────────────────────────────────────┐
        │                        SUPABASE MANAGED CLOUD                          │
        │  ┌───────────────────────┐  ┌──────────────────┐  ┌──────────────────┐ │
        │  │ PostgreSQL 15 Database│  │ Supabase Auth    │  │ Supabase Storage │ │
        │  │  - Row Level Security │  │  - JWT & Sessions│  │  - 'banners'     │ │
        │  │  - SQL Triggers       │  │  - profiles sync │  │    public bucket │ │
        │  │  - Realtime Channels  │  └──────────────────┘  └──────────────────┘ │
        │  └───────────────────────┘                                             │
        └───────────────────────────────────┬────────────────────────────────────┘
                                            │
                                            ▼
                           ┌─────────────────────────────────┐
                           │       EXTERNAL SERVICES         │
                           │  - Telegram Bot API             │
                           │  - Meta Graph API (v21.0)       │
                           │  - Mohasagor Reseller API       │
                           │  - wsrv.nl Image CDN Proxy      │
                           └─────────────────────────────────┘
```

### Architectural Boundaries & Data Ownership
1. **Frontend Boundary (`frontend/`)**:
   - Single-Page Application (SPA) built with React Router 7.
   - Responsible for presentation, cart state, local UI filtering, guest checkout, and client-side pixel events.
   - Connects directly to Supabase PostgREST API using the public anonymous key (`VITE_SUPABASE_ANON_KEY`).
2. **Admin Boundary (`admin/`)**:
   - Isolated management SPA deployed under `admin.myrupan.com`.
   - Requires Supabase Auth authentication and role verification against `public.profiles`.
   - Interacts with Supabase PostgREST via user session tokens and connects to the `/api/sync` serverless worker.
3. **Serverless Boundary (`api/`)**:
   - Node.js functions running on Vercel's serverless infrastructure.
   - `landing.ts`: Dynamic HTML rendering and script injection for marketing pages.
   - `place-order.ts`: Backend order persistence and Telegram notification dispatch.
   - `meta-capi.ts`: Server-side conversions forwarding to Meta Graph API.
   - `sync.ts`: Privileged reseller product synchronization executing with `SUPABASE_SERVICE_ROLE_KEY`.
4. **Data Ownership & Source of Truth**:
   - **Catalog & Orders**: Managed PostgreSQL in Supabase is the primary source of truth.
   - **Local Browser Cache**: The frontend maintains substantial data copies in browser `localStorage` (`rup_db_products`, `rup_db_settings`, `rup_cart`, `rup_orders`). When offline or when keys are missing, the client reads and writes exclusively to this local sandbox.

---

## 3.2 System Architecture Diagrams

### Diagram 1: High-Level System Architecture

```mermaid
flowchart TD
    subgraph Clients["Client Tier"]
        C_User["Customer Browser (Storefront)"]
        C_Admin["Admin Staff Browser (Admin Hub)"]
        Ad_Traffic["Ad Traffic (Facebook / Instagram)"]
    end

    subgraph CDN["Vercel Edge & Routing"]
        V_FrontRoute["Frontend Rewrites (vercel.json)"]
        V_AdminRoute["Admin Rewrites (vercel.json)"]
    end

    subgraph Serverless["Vercel Serverless Functions"]
        F_Landing["api/landing.ts (HTML Injection)"]
        F_Order["api/place-order.ts (Order Worker)"]
        F_CAPI["api/meta-capi.ts (CAPI Gateway)"]
        A_Sync["admin/api/sync.ts (Reseller Sync)"]
    end

    subgraph Supabase["Supabase Cloud Infrastructure"]
        S_DB[("PostgreSQL DB (RLS Enabled)")]
        S_Auth["Supabase Auth"]
        S_Storage["Storage Bucket ('banners')"]
        S_Realtime["Supabase Realtime Engine"]
    end

    subgraph ThirdParty["External Services & APIs"]
        Ext_Meta["Meta Graph API (CAPI)"]
        Ext_Telegram["Telegram Bot API"]
        Ext_Mohasagor["Mohasagor Reseller API"]
        Ext_Wsrv["wsrv.nl Image Cache Proxy"]
    end

    Ad_Traffic -->|Dynamic Routes /eid-sale| V_FrontRoute
    C_User -->|SPA Routes /shop, /cart| V_FrontRoute
    C_Admin -->|Management App| V_AdminRoute

    V_FrontRoute -->|Static Match| C_User
    V_FrontRoute -->|Catch-all Fallback| F_Landing
    V_AdminRoute --> C_Admin

    C_User -->|REST Read Products/Settings| S_DB
    C_User -->|Optimize Images| Ext_Wsrv
    C_User -->|Dual Fire Events| F_CAPI
    C_User -->|Checkout Submission| F_Order

    C_Admin -->|Authenticate| S_Auth
    C_Admin -->|Direct DB Management| S_DB
    C_Admin -->|Listen New Orders| S_Realtime
    C_Admin -->|Trigger Product Import| A_Sync

    F_Landing -->|Read Landing Page & Settings| S_DB
    F_Order -->|Insert Order & Order Items| S_DB
    F_Order -->|Alert Telegram Channel| Ext_Telegram
    F_CAPI -->|Forward Hashed Events| Ext_Meta
    A_Sync -->|Fetch Products| Ext_Mohasagor
    A_Sync -->|Bypass RLS via Service Key| S_DB
```

---

### Diagram 2: Customer Storefront Request Flow

```mermaid
sequenceDiagram
    autonumber
    actor Customer as Customer Browser
    participant Vercel as Vercel Edge CDN
    participant Serverless as api/landing.ts
    participant Supabase as Supabase DB (PostgreSQL)

    Customer->>Vercel: GET /shop or /checkout
    Note over Vercel: Checks vercel.json explicit routes
    Vercel-->>Customer: 200 OK (Static dist/index.html)
    Customer->>Customer: Bootstraps React Router & Zustand Store
    Customer->>Supabase: SELECT * FROM products WHERE status = 'published' LIMIT 1000
    Supabase-->>Customer: 200 OK (Product JSON Array)
    Customer->>Supabase: SELECT * FROM settings WHERE id = 1
    Supabase-->>Customer: 200 OK (Settings JSON)
    Customer->>Customer: Initialize Telemetry (Pixel, GTM, GA4)
```

---

### Diagram 3: Order Creation and Persistence Flow

```mermaid
sequenceDiagram
    autonumber
    actor Customer as Customer Browser
    participant ClientOrder as orderService.ts / Store
    participant Serverless as api/place-order.ts
    participant Supabase as Supabase PostgreSQL
    participant Telegram as Telegram Bot API
    participant Meta as Meta Graph API (CAPI)

    Customer->>ClientOrder: Clicks 'Place Order' (Cash on Delivery / bKash / Bangla QR)
    ClientOrder->>ClientOrder: 1. Backup order to localStorage ('rupan_local_orders')
    
    rect rgb(240, 248, 255)
        Note over ClientOrder,Serverless: Primary Path: Vercel Serverless Function
        ClientOrder->>Serverless: POST /api/place-order { order, metaEventId, isGuest }
        Serverless->>Supabase: INSERT INTO orders (full payload)
        alt Full Payload Schema Error
            Serverless->>Supabase: Fallback: INSERT INTO orders (core columns)
        end
        Serverless->>Supabase: INSERT INTO order_items
        Serverless->>Telegram: POST /sendMessage (HTML Invoice Template)
        Serverless-->>ClientOrder: { success: true, dbSaved: true }
    end

    rect rgb(255, 250, 240)
        Note over ClientOrder,Supabase: Redundant Client Fallback Path
        ClientOrder->>Supabase: Direct Client INSERT INTO orders
        ClientOrder->>Telegram: Direct Client fetch to api.telegram.org (Duplicate Alert)
    end

    ClientOrder->>Meta: POST /api/meta-capi ('Purchase' event with hashed phone/name)
    ClientOrder-->>Customer: Navigate to /order-success
```

---

### Diagram 4: Admin Operations and Realtime Access Flow

```mermaid
sequenceDiagram
    autonumber
    actor Admin as Admin Browser
    participant AdminApp as admin/src/App.tsx
    participant SupabaseAuth as Supabase Auth
    participant SupabaseDB as Supabase DB
    participant Realtime as Supabase Realtime Engine

    Admin->>AdminApp: Enter email & password
    AdminApp->>SupabaseAuth: signInWithPassword(email, password)
    SupabaseAuth-->>AdminApp: Session Token + User Info
    AdminApp->>SupabaseDB: SELECT * FROM profiles WHERE id = user.id
    SupabaseDB-->>AdminApp: User Profile { role: 'Super Admin', is_active: true }
    
    AdminApp->>Realtime: Subscribe channel('admin-orders-realtime') table='orders'
    Realtime-->>AdminApp: Channel Subscribed (Active)

    Note over SupabaseDB,Realtime: Storefront Customer Places Order
    SupabaseDB->>Realtime: Postgres Change Event (INSERT on orders)
    Realtime-->>AdminApp: Broadcast new order payload
    AdminApp->>AdminApp: Prepend order to state & update KPI badges
```

---

### Diagram 5: Reseller Catalog Synchronization Flow

```mermaid
sequenceDiagram
    autonumber
    actor Admin as Admin Staff
    participant SyncTab as admin/src/components/tabs/SyncTab.tsx
    participant SyncAPI as admin/api/sync.ts
    participant Supabase as Supabase Database
    participant Mohasagor as Mohasagor API (mohasagor.com.bd)

    Admin->>SyncTab: Click 'Sync Page X' or 'Auto Sync All'
    SyncTab->>SyncAPI: POST /api/sync?source=mohasagor&page=1 (Authorization: Bearer <token>)
    SyncAPI->>Supabase: Verify User Session & Role (Super Admin / Admin / Manager)
    SyncAPI->>Supabase: SELECT * FROM sync_sources WHERE id = 'mohasagor'
    SyncAPI->>Supabase: INSERT INTO sync_logs (status: 'running')
    
    SyncAPI->>Mohasagor: GET /api/reseller/product?page=1 (Headers: API-KEY, SECRET-KEY)
    Mohasagor-->>SyncAPI: Products Payload { products: [...], total, last_page }
    
    SyncAPI->>Supabase: SELECT homepage_config FROM settings (Read Category Margins)
    SyncAPI->>SyncAPI: Calculate sellingPrice = purchasePrice * (1 + margin / 100)
    SyncAPI->>SyncAPI: Sanitize JSONB control characters & extract variants
    
    SyncAPI->>Supabase: UPSERT categories (Ensure FK satisfaction)
    SyncAPI->>Supabase: UPSERT products (Batch upsert with service_role)
    
    SyncAPI->>Supabase: UPDATE sync_logs (status: 'success', imported, updated)
    SyncAPI->>Supabase: UPDATE sync_sources (last_sync_at: now())
    SyncAPI-->>SyncTab: 200 OK { success: true, imported, updated, failed }
```

---

### Diagram 6: Meta Conversions API (CAPI) Event Flow

```mermaid
flowchart LR
    subgraph Browser["Customer Browser"]
        Action["Customer Interaction\n(PageView, ViewContent, AddToCart, Purchase)"]
        Fbq["Client Pixel (fbq)\nSends cookie & eventId"]
        Telemetry["telemetry.ts\nExtracts PII & cookies"]
    end

    subgraph Serverless["Vercel Serverless Function"]
        Endpoint["POST /api/meta-capi\nAccepts payload & access_token"]
        Hasher["PII Normalization Engine\nSHA-256 hash(phone, email, name, city)"]
    end

    subgraph Meta["Meta Systems"]
        GraphAPI["Meta Graph API v21.0\n/v21.0/{pixel_id}/events"]
        Deduplicator["Meta Event Deduplication\nMatches event_id between Browser & CAPI"]
    end

    Action --> Fbq
    Action --> Telemetry
    Fbq -->|Browser Event with event_id| Meta
    Telemetry -->|Event Payload + unhashed PII| Endpoint
    Endpoint --> Hasher
    Hasher -->|Hashed Payload with event_id| GraphAPI
    GraphAPI --> Deduplicator
```

---

### Diagram 7: Product and Landing Page Routing Architecture

```mermaid
flowchart TD
    Req["Incoming HTTP Request\nURL Path"] --> CheckVercel{"vercel.json Rewrites"}

    CheckVercel -->|Explicit Route Match\n/shop, /cart, /checkout, /account, /product/:id*| CDN["Serve dist/index.html (Static CDN Cache)"]
    CDN --> ReactApp["React Client Router (App.tsx)"]
    
    ReactApp -->|Standard Route| RouteComp["Render Route Component\n(ShopPage, ProductDetailPage, etc.)"]
    ReactApp -->|/product?id=123| ClientRedirect["ProductRedirect Component\nResolves offset 3000 & redirects"]
    ReactApp -->|Unmatched Route /*| CatchAll["CatchAllRoute Component\nQueries dbBlogs in Store"]

    CheckVercel -->|Catch-all Fallback\n/:path*| LandingHandler["frontend/api/landing.ts"]
    
    LandingHandler --> IsProductQuery{"Path === '/product'\nAND query.id present?"}
    IsProductQuery -->|Yes| ResolveProduct["Query products table\nApply exact or 3000 offset tolerance"]
    ResolveProduct --> Redirect301["Return 301 Redirect to /product/{slug}-{id}"]

    IsProductQuery -->|No| CheckReactRoutes{"isKnownReactRoute(path)?"}
    CheckReactRoutes -->|Yes| ServeIndex["Read & return local dist/index.html"]

    CheckReactRoutes -->|No| QueryBlogs["Query blogs table\nWHERE id = path AND status = 'published'"]
    QueryBlogs --> BlogFound{"Blog Record Found?"}
    
    BlogFound -->|No| ServeIndex
    BlogFound -->|Yes| IsLanding{"category === '__landing_page__'?"}
    IsLanding -->|No| ServeIndex
    IsLanding -->|Yes| InjectHTML["injectMarketingAndSEO()\n- Inject Meta Pixel\n- Inject GTM & GA4\n- Replace RUPAN_* tokens\n- Return compiled HTML"]
```

---

### Diagram 8: Authentication and Authorization Boundaries

```mermaid
flowchart TD
    subgraph PublicBoundary["Public / Unauthenticated Realm"]
        Storefront["Storefront Customers"]
        GuestCheckout["Guest Checkout Users"]
    end

    subgraph AuthBoundary["Supabase Auth Barrier"]
        AuthUser["auth.users (JWT Bearer Token)"]
        SyncTrigger["SQL Trigger on_auth_user_created"]
        Profiles["public.profiles table\n(email, role, is_active)"]
    end

    subgraph Roles["Role-Based Permissions (RBAC)"]
        SuperAdmin["Super Admin / Admin\nFull control over DB, Settings, Sync"]
        Manager["Manager\nCatalog, Orders, Inventory, Margins"]
        Editor["Editor\nProducts, Blogs, Banners"]
        Support["Support / Delivery Manager\nOrder status, View reviews"]
        Customer["Customer\nProfile update only"]
    end

    Storefront -->|Anonymous anon key| SupabaseAnon["PostgREST Anon Endpoint"]
    AuthUser --> SyncTrigger --> Profiles

    Profiles -->|role check| Roles

    Roles -->|Super Admin / Admin| AdminRoutes["Access admin.myrupan.com\nExecute /api/sync\nUpdate Settings & Sources"]
    Roles -->|Manager / Editor| CatalogRoutes["Edit Products & Blogs"]
    Roles -->|Customer| CustomerDashboard["View own orders in /account"]

    SupabaseAnon -.->|SECURITY HOLE| LeakOrders["Can SELECT * FROM orders (RLS = true)"]
    SupabaseAnon -.->|SECURITY HOLE| LeakProfiles["Can SELECT * FROM profiles (RLS = true)"]
    SupabaseAnon -.->|SECURITY HOLE| LeakSettings["Can SELECT * FROM settings (RLS = true)"]
```

---

## 3.3 Module Dependency Map and Drift Analysis

### Evaluation of `shared/` and `sync-shared.js`

The monorepo attempts to avoid code duplication across `frontend/` and `admin/` by maintaining a single source of truth in `shared/` and copying files at build/dev time using [`sync-shared.js`](file:///Users/Admin/Developer/antigravity/RupanV3/sync-shared.js).

#### Verified Synchronization Drift
A line-by-line diff reveals that `shared/` is **outdated and desynchronized** from both `frontend/src/` and `admin/src/`:

1. **`types.ts` Drift**:
   - `frontend/src/types.ts` and `admin/src/types.ts` were updated to include `purchasePrice?: number;`, `sourceProductId?: string;`, and `supabaseUrl?: string;`.
   - `shared/types.ts` is missing these properties.
2. **`supabase.ts` Drift**:
   - `frontend/src/lib/supabase.ts` and `admin/src/lib/supabase.ts` include `removeChannel()` mock stubs, `items` JSON column handling, and `is_incognito_guest` field serialization.
   - `shared/supabase.ts` lacks these updates.
3. **`orderService.ts` Drift**:
   - `frontend/src/services/orderService.ts` has been heavily modified to execute `/api/place-order`, backup orders to `rupan_local_orders`, and implement core-column insert fallbacks.
   - `shared/services/orderService.ts` contains none of this logic.
4. **Build Destruction Vulnerability**:
   - Running `npm run dev` or `npm run build` in either application triggers `node ../sync-shared.js`.
   - Because `sync-shared.js` executes **unidirectional copying from `shared/` to apps**, running a build will **silently overwrite and delete** all recent fixes in `frontend/src` and `admin/src`!
5. **Unmanaged `api/` Duplication**:
   - `sync-shared.js` does not cover `api/` directories.
   - `frontend/api/place-order.ts` and `admin/api/place-order.ts` have diverged. Frontend includes critical fixes (such as chat ID normalization and fallback inserts) that are missing from `admin/api/place-order.ts`.
   - `frontend/api/meta-capi.ts` and `admin/api/meta-capi.ts` have also drifted.

### Single Points of Failure
1. **Single Database Row for Global Settings**:
   - All store configuration, payment phone numbers, Bangla QR image path, shipping charges, ad tracking credentials, and Telegram tokens reside in a single row (`id = 1`) in `public.settings`. If this row is deleted or malformed, the storefront cannot calculate shipping, render payments, or send notifications.
2. **External Image Proxy (`wsrv.nl`)**:
   - All product images are routed through `https://wsrv.nl/?url=...` in [`image.ts`](file:///Users/Admin/Developer/antigravity/RupanV3/frontend/src/utils/image.ts). If `wsrv.nl` experiences downtime, rate limits Rupan, or is blocked by local Bangladeshi ISPs, product thumbnails across the entire catalog fail to load.
3. **Client-Side Initial 1,000 Product Load**:
   - [`productService.ts#L16`](file:///Users/Admin/Developer/antigravity/RupanV3/frontend/src/services/productService.ts#L16) queries `limit(1000)` on initial page load, followed by background chunked pagination of the complete catalog index. As the reseller catalog grows beyond 5,000 items, client browser memory and initial payload size will degrade severely.
