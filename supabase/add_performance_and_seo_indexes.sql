-- ==============================================================================
-- Rupan Performance & SEO Database Indexes Migration
-- Target Table: products
-- Purpose:
--   1. Accelerate crawler & AI bot lookups by product slug (api/landing.ts)
--   2. Accelerate landing page matching (category = '__landing_page__')
--   3. Optimize storefront initial queries (featured, trending, flash sales)
--   4. Reduce database CPU & I/O usage to protect free-tier rate limits
-- ==============================================================================

-- 1. Index on product slug for published products (Critical for Social Previews & AI Bot lookups)
CREATE INDEX IF NOT EXISTS idx_products_published_slug 
ON products(slug) 
WHERE status = 'published';

-- 2. Index on landing pages lookup
CREATE INDEX IF NOT EXISTS idx_products_landing_pages 
ON products(slug) 
WHERE category = '__landing_page__';

-- 3. Composite indexes for storefront homepage sections
CREATE INDEX IF NOT EXISTS idx_products_published_featured 
ON products(is_featured, updated_at DESC) 
WHERE status = 'published';

CREATE INDEX IF NOT EXISTS idx_products_published_trending 
ON products(is_trending, updated_at DESC) 
WHERE status = 'published';

CREATE INDEX IF NOT EXISTS idx_products_published_flash_sale 
ON products(is_flash_sale, updated_at DESC) 
WHERE status = 'published';

-- 4. Index on category filtering
CREATE INDEX IF NOT EXISTS idx_products_published_category 
ON products(category, updated_at DESC) 
WHERE status = 'published';
