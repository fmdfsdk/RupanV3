-- ==============================================================================
-- Migration: Categories Permissions & Product Variant Stock Flag
-- Run this in your Supabase Dashboard -> SQL Editor
-- ==============================================================================

-- 1. Ensure maintain_variant_stock column exists on products table
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS maintain_variant_stock boolean DEFAULT false;

-- 2. Ensure Row Level Security (RLS) on categories table allows Admin Panel read & write
DO $$ 
BEGIN
  -- Enable RLS
  ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

  -- Allow public read of categories
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'categories' AND policyname = 'Allow public read categories'
  ) THEN
    CREATE POLICY "Allow public read categories" ON public.categories FOR SELECT USING (true);
  END IF;

  -- Allow insert/update/delete for categories
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'categories' AND policyname = 'Allow all write categories'
  ) THEN
    CREATE POLICY "Allow all write categories" ON public.categories FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

-- Alternatively, you can disable RLS on categories if your store uses client-side admin:
-- ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;
