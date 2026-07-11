-- ============================================================
-- Migration: Add Meta Conversations API Token to Settings
-- Run this in: Supabase Dashboard → SQL Editor
-- Safe to run multiple times (uses IF NOT EXISTS logic)
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'settings'
      AND column_name  = 'meta_capi_access_token'
  ) THEN
    ALTER TABLE public.settings
      ADD COLUMN meta_capi_access_token text;
    RAISE NOTICE 'Column meta_capi_access_token added successfully.';
  ELSE
    RAISE NOTICE 'Column meta_capi_access_token already exists. Skipping.';
  END IF;
END $$;
