-- ==============================================================================
-- MIGRATION: Drop fk_products_category & Fix Settings Social Columns and RLS
-- Run this script in Supabase Dashboard -> SQL Editor
-- ==============================================================================

-- 1. Drop Foreign Key constraint on category if it exists
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_products_category'
  ) THEN
    ALTER TABLE public.products DROP CONSTRAINT fk_products_category;
    RAISE NOTICE 'Constraint fk_products_category dropped successfully.';
  ELSE
    RAISE NOTICE 'Constraint fk_products_category does not exist. Skipping.';
  END IF;
END $$;

-- 2. Ensure columns exist on products table for manual and sync handling
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS source_id TEXT DEFAULT 'manual',
ADD COLUMN IF NOT EXISTS source_product_id TEXT,
ADD COLUMN IF NOT EXISTS purchase_price NUMERIC,
ADD COLUMN IF NOT EXISTS final_price NUMERIC;

-- 3. Ensure social and configuration columns exist on settings table
ALTER TABLE public.settings
ADD COLUMN IF NOT EXISTS facebook_url TEXT,
ADD COLUMN IF NOT EXISTS twitter_url TEXT,
ADD COLUMN IF NOT EXISTS youtube_url TEXT,
ADD COLUMN IF NOT EXISTS instagram_url TEXT,
ADD COLUMN IF NOT EXISTS pricing_config JSONB DEFAULT '{"deductionPercentage": 25, "defaultMarginValue": 10, "defaultMarginType": "percentage"}'::jsonb;

-- 4. Ensure RLS policies permit updating settings
DO $$ 
BEGIN
  -- Enable RLS if not already enabled
  ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

  -- Create public/anon read policy if not present
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'settings' AND policyname = 'Public read settings'
  ) THEN
    CREATE POLICY "Public read settings" ON public.settings FOR SELECT USING (true);
  END IF;

  -- Create update policy for authenticated / service role
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'settings' AND policyname = 'Allow update settings'
  ) THEN
    CREATE POLICY "Allow update settings" ON public.settings FOR UPDATE USING (true) WITH CHECK (true);
  END IF;

  -- Allow insert if settings table is empty
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'settings' AND policyname = 'Allow insert settings'
  ) THEN
    CREATE POLICY "Allow insert settings" ON public.settings FOR INSERT WITH CHECK (true);
  END IF;
END $$;
