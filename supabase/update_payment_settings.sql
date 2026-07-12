-- =========================================================================
-- Migration: Add Payment Gateway Settings and Enable Supabase Storage Bucket
-- Run this script in your Supabase Dashboard -> SQL Editor
-- Safe to run multiple times
-- =========================================================================

-- 1. Create columns in settings table if they do not exist
ALTER TABLE public.settings
ADD COLUMN IF NOT EXISTS payment_bangla_qr_enabled boolean NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS payment_bkash_enabled boolean NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS payment_nagad_enabled boolean NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS payment_cod_enabled boolean NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS payment_bkash_number text NOT NULL DEFAULT '01600338318',
ADD COLUMN IF NOT EXISTS payment_nagad_number text NOT NULL DEFAULT '01600338318',
ADD COLUMN IF NOT EXISTS payment_bangla_qr_image text NOT NULL DEFAULT '/assets/BanglaQRcode.jpeg',
ADD COLUMN IF NOT EXISTS payment_bangla_qr_instruction text NOT NULL DEFAULT 'বিকাশ, নগদ, রকেট বা যেকোনো ব্যাংক অ্যাপের "Bangla QR" অথবা "Scan to Pay" অপশন ব্যবহার করে পাশের QR কোডটি স্ক্যান করুন এবং পেমেন্ট সম্পন্ন করুন।',
ADD COLUMN IF NOT EXISTS payment_mfs_instruction text NOT NULL DEFAULT 'নিচের নম্বরে {amount} সেন্ড মানি (Send Money) করার পর পেমেন্ট ভেরিফাই করতে ট্রানজেকশন আইডি (TrxID) নিচে দিন।',
ADD COLUMN IF NOT EXISTS payment_cod_instruction text NOT NULL DEFAULT 'অর্ডার প্লেস করুন এবং সারাদেশে হোম ডেলিভারি পাওয়ার পর কুরিয়ার এজেন্টের কাছে ক্যাশ টাকা দিয়ে আপনার পণ্য বুঝে নিন।';

-- 2. Create the 'banners' storage bucket if it does not exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('banners', 'banners', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Enable RLS on storage objects (it is enabled by default in Supabase)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 4. Re-create storage policies for 'banners' bucket to allow public uploads and reads
DROP POLICY IF EXISTS "Public Read Access Banners" ON storage.objects;
DROP POLICY IF EXISTS "Public Upload Access Banners" ON storage.objects;
DROP POLICY IF EXISTS "Public Update Access Banners" ON storage.objects;
DROP POLICY IF EXISTS "Public Delete Access Banners" ON storage.objects;

CREATE POLICY "Public Read Access Banners" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'banners' );

CREATE POLICY "Public Upload Access Banners" 
ON storage.objects FOR INSERT 
WITH CHECK ( bucket_id = 'banners' );

CREATE POLICY "Public Update Access Banners" 
ON storage.objects FOR UPDATE 
USING ( bucket_id = 'banners' );

CREATE POLICY "Public Delete Access Banners" 
ON storage.objects FOR DELETE 
USING ( bucket_id = 'banners' );
