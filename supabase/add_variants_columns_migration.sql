-- Migration: Add product variants, variant stock, and variant images columns
-- Compatible with all existing products and Mohasagor sync.

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS variants jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS variant_stock jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS variant_images jsonb DEFAULT '{}'::jsonb;

-- Create GIN index for fast JSONB querying on variants if needed
CREATE INDEX IF NOT EXISTS idx_products_variants ON public.products USING gin (variants);
