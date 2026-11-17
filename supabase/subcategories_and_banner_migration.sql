-- ==============================================================================
-- Migration: Add Subcategories Banner Image & Description Columns
-- Run this script in your Supabase Dashboard -> SQL Editor
-- ==============================================================================

-- 1. Add banner_image and description to categories table
ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS banner_image text,
  ADD COLUMN IF NOT EXISTS description text;

-- 2. Ensure parent_id column exists
ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS parent_id text;

-- 3. Ensure Row Level Security (RLS) policies permit read and write
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'categories' AND policyname = 'Allow public read categories'
  ) THEN
    CREATE POLICY "Allow public read categories" ON public.categories FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'categories' AND policyname = 'Allow all write categories'
  ) THEN
    CREATE POLICY "Allow all write categories" ON public.categories FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;
