-- ============================================================
-- Payment System Migration — Safe idempotent column additions
-- Run this in Supabase SQL Editor
-- ============================================================

-- Add missing columns to orders table
ALTER TABLE public.orders 
  ADD COLUMN IF NOT EXISTS is_incognito_guest boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS user_id uuid,
  ADD COLUMN IF NOT EXISTS transaction_id text DEFAULT '',
  ADD COLUMN IF NOT EXISTS paid_confirm boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS payment_screenshot_url text,
  ADD COLUMN IF NOT EXISTS division text,
  ADD COLUMN IF NOT EXISTS district text,
  ADD COLUMN IF NOT EXISTS online_payment_discount numeric(10,2) DEFAULT 0;

-- Add Telegram, Social & Online Discount settings to settings table (if missing)
ALTER TABLE public.settings
  ADD COLUMN IF NOT EXISTS telegram_bot_token text,
  ADD COLUMN IF NOT EXISTS telegram_chat_id text,
  ADD COLUMN IF NOT EXISTS telegram_notifications_enabled boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS online_payment_discount_enabled boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS online_payment_discount_percent numeric(5,2) DEFAULT 50,
  ADD COLUMN IF NOT EXISTS social_facebook text DEFAULT 'https://www.facebook.com/rupanbd',
  ADD COLUMN IF NOT EXISTS social_instagram text DEFAULT 'https://www.instagram.com/rupanbd',
  ADD COLUMN IF NOT EXISTS social_twitter text DEFAULT 'https://twitter.com',
  ADD COLUMN IF NOT EXISTS social_youtube text DEFAULT 'https://youtube.com',
  ADD COLUMN IF NOT EXISTS meta_capi_access_token text;

-- Create payment-screenshots storage bucket (safe — idempotent via DO block)
DO $$
BEGIN
  INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  VALUES (
    'payment-screenshots',
    'payment-screenshots',
    true,
    5242880,
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  )
  ON CONFLICT (id) DO NOTHING;
END $$;

-- RLS policies for payment-screenshots bucket (safe idempotent recreation)
DROP POLICY IF EXISTS "Allow public upload to payment-screenshots" ON storage.objects;
CREATE POLICY "Allow public upload to payment-screenshots"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'payment-screenshots');

DROP POLICY IF EXISTS "Allow public read of payment-screenshots" ON storage.objects;
CREATE POLICY "Allow public read of payment-screenshots"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'payment-screenshots');
