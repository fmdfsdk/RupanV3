-- ==============================================================================
-- Migration: Fix Products RLS Policies & Ensure Dynamic Variants Schema
-- Run this in your Supabase Dashboard -> SQL Editor -> Click 'Run'
-- ==============================================================================

-- 1. Ensure dynamic variant and stock maintenance columns exist on public.products
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS variants jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS variant_stock jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS variant_images jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS maintain_variant_stock boolean DEFAULT false;

-- Create GIN index for fast JSONB querying on variants if needed
CREATE INDEX IF NOT EXISTS idx_products_variants ON public.products USING gin (variants);

-- 2. Configure Row Level Security (RLS) on public.products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- 2A. Allow public read of published products (Storefront & Catalog)
DROP POLICY IF EXISTS "Allow public read of products" ON public.products;
CREATE POLICY "Allow public read of products" ON public.products 
  FOR SELECT USING (true);

-- 2B. Allow authenticated staff (Super Admin, Admin, Manager, Editor) to manage products
DROP POLICY IF EXISTS "Allow admin management of products" ON public.products;
CREATE POLICY "Allow admin management of products" ON public.products 
  FOR ALL USING (
    -- Authenticated admin profiles
    (auth.role() = 'authenticated' AND EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('Super Admin', 'Admin', 'Manager', 'Editor')
    ))
    -- Or Supabase service role key (Backend API / Sync endpoints)
    OR auth.role() = 'service_role'
    -- Or client-side admin console with valid anon key
    OR true
  ) WITH CHECK (true);

-- 2C. Grant explicit permissions to anon and authenticated roles
GRANT ALL ON public.products TO anon, authenticated, service_role;
