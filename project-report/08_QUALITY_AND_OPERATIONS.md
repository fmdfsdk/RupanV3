# 08. Testing, Quality Assurance, and Operations

## 8.1 Automated Test Suite & Coverage

Static inspection of the repository reveals **zero automated tests** in application source trees:

| Test Category | Framework / Tool | Test Files Found | Current Status | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Unit Tests** | None (Vitest / Jest missing) | 0 files | **Non-existent** | No test runner configured in `frontend/package.json` or `admin/package.json`. |
| **Component Tests** | None (React Testing Library missing) | 0 files | **Non-existent** | No component rendering or interaction tests. |
| **Integration Tests** | None | 0 files | **Non-existent** | No automated tests verifying order placement, checkout validation, or CAPI transmission. |
| **End-to-End Tests** | None (Playwright / Cypress missing) | 0 files | **Non-existent** | No browser automation tests for customer purchase flows. |
| **Diagnostic Scripts** | Plain Node.js scripts in `scratch/` | 2 scripts | Ad-hoc manual verification | [`scratch/test_supabase_rest.js`](file:///Users/Admin/Developer/antigravity/RupanV3/scratch/test_supabase_rest.js), [`scratch/test_blog_crud.js`](file:///Users/Admin/Developer/antigravity/RupanV3/scratch/test_blog_crud.js). |

### Test Execution Command Verification
In accordance with Rule 8, command execution checks were attempted:
```zsh
$ cd frontend && npm run lint
Command exited with code 127: zsh:1: command not found: npm
```
- **Runtime Finding**: Node.js and npm are not installed or present in the execution environment PATH (`which node`, `which npm` returned not found).
- **Result**: Automated build, lint, and type checking (`tsc --noEmit`) could not be executed dynamically. All findings are verified through static analysis of manifests, source files, and configuration DDLs.

---

## 8.2 Deployment and Hosting Configuration

The application is architected for dual-project deployment on **Vercel** connected to a managed **Supabase** backend.

### 1. Storefront Deployment (`frontend/vercel.json`)
The storefront relies on an explicit static whitelist rewrite rule strategy in [`frontend/vercel.json`](file:///Users/Admin/Developer/antigravity/RupanV3/frontend/vercel.json):

```json
{
  "functions": {
    "api/landing.ts": {
      "includeFiles": "dist/index.html"
    }
  },
  "rewrites": [
    { "source": "/api/:path*", "destination": "/api/:path*" },
    { "source": "/shop", "destination": "/index.html" },
    { "source": "/cart", "destination": "/index.html" },
    { "source": "/checkout", "destination": "/index.html" },
    { "source": "/account", "destination": "/index.html" },
    { "source": "/wishlist", "destination": "/index.html" },
    { "source": "/track-order", "destination": "/index.html" },
    { "source": "/order-success", "destination": "/index.html" },
    { "source": "/product-search", "destination": "/index.html" },
    { "source": "/about-us", "destination": "/index.html" },
    { "source": "/contact-us", "destination": "/index.html" },
    { "source": "/offers", "destination": "/index.html" },
    { "source": "/new-arrivals", "destination": "/index.html" },
    { "source": "/categories", "destination": "/index.html" },
    { "source": "/faq", "destination": "/index.html" },
    { "source": "/policy", "destination": "/index.html" },
    { "source": "/blogs", "destination": "/index.html" },
    { "source": "/blog", "destination": "/index.html" },
    { "source": "/blog/:id*", "destination": "/index.html" },
    { "source": "/product/:id*", "destination": "/index.html" },
    { "source": "/:path*", "destination": "/api/landing?__path=/:path*" }
  ]
}
```

#### Operational Mechanics of the Rewrite Table
- **Static CDN Acceleration**: All primary SPA paths bypass serverless functions completely and are served directly from Vercel's Edge CDN (`/index.html`).
- **Function Bundle Inclusion**: `"includeFiles": "dist/index.html"` ensures that `api/landing.ts` can read and return the storefront shell when requested.
- **Dynamic Catch-All**: The final rule `"/:path*"` -> `"/api/landing?__path=/:path*"` catches campaign landing pages and legacy URLs.

### 2. Admin Hub Deployment (`admin/vercel.json`)
```json
{
  "rewrites": [
    {
      "source": "/((?!api/).*)",
      "destination": "/index.html"
    }
  ]
}
```
All paths except `/api/*` are rewritten directly to `/index.html` for client-side routing.

---

## 8.3 CI/CD, Migrations, and Disaster Recovery

### Continuous Integration / Delivery
- **GitHub Actions / CI Pipelines**: None configured in repository (`.github/workflows` does not exist).
- **Deployment Trigger**: Vercel Git integration deploys commits pushed to branch `main`.

### Database Migrations Procedure
- There is no programmatic migration runner (e.g. Prisma, Flyway, Knex, or Supabase CLI migration directory).
- Schema updates exist as standalone SQL scripts in `supabase/`:
  - [`supabase/schema.sql`](file:///Users/Admin/Developer/antigravity/RupanV3/supabase/schema.sql)
  - [`supabase/add_capi_token_migration.sql`](file:///Users/Admin/Developer/antigravity/RupanV3/supabase/add_capi_token_migration.sql)
  - [`supabase/update_payment_settings.sql`](file:///Users/Admin/Developer/antigravity/RupanV3/supabase/update_payment_settings.sql)
- Migrations are intended to be executed manually via the Supabase Dashboard SQL Editor.

### Observability, Logging, and Error Monitoring
1. **APM & Crash Reporting**:
   - No error tracking SDK (such as Sentry, Datadog, or Bugsnag) is integrated.
   - Client errors trigger `console.error` in the browser console.
   - Unhandled React errors are caught by `<ErrorBoundary>` components in `frontend/src/components/ErrorBoundary.tsx` and `admin/src/components/ErrorBoundary.tsx`, rendering a fallback UI.
2. **Serverless Logs**:
   - Vercel Serverless Function runtime logs retain stdout/stderr for diagnostic inspection.
3. **Database Logs**:
   - `public.sync_logs` records execution history, duration, imported/updated counts, and error details for reseller synchronization.

### Disaster Recovery and Data Backups
- **Database Backups**: Relies on Supabase Cloud automated point-in-time recovery (PITR) and daily backups. No repository-managed database dump or backup workflow exists.
- **Rollback Procedure**: Vercel Instant Rollback allows reverting to prior deployment hashes. However, database schema migrations must be reversed manually via SQL editor.
