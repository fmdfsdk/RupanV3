-- =========================================================================
-- Migration: Add Payment Screenshot Verification Setting to settings table
-- Run this script in your Supabase Dashboard -> SQL Editor
-- Safe to run multiple times (idempotent)
-- =========================================================================

-- 1. Add payment_screenshot_enabled column to settings table if it doesn't exist
ALTER TABLE public.settings 
ADD COLUMN IF NOT EXISTS payment_screenshot_enabled boolean NOT NULL DEFAULT true;

-- 2. Ensure any existing rows have the default value set to true
UPDATE public.settings 
SET payment_screenshot_enabled = true 
WHERE payment_screenshot_enabled IS NULL;

-- 3. Notify PostgREST to reload schema cache so changes take effect immediately
NOTIFY pgrst, 'reload schema';
