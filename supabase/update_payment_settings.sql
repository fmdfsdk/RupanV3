-- Migration SQL to add Payment Gateway and Wallet Settings to public.settings table
-- Copy and run this script in your Supabase SQL Editor:

ALTER TABLE public.settings
ADD COLUMN IF NOT EXISTS payment_bangla_qr_enabled boolean NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS payment_bkash_enabled boolean NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS payment_nagad_enabled boolean NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS payment_cod_enabled boolean NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS payment_bkash_number text NOT NULL DEFAULT '01600338318',
ADD COLUMN IF NOT EXISTS payment_nagad_number text NOT NULL DEFAULT '01600338318',
ADD COLUMN IF NOT EXISTS payment_bangla_qr_image text NOT NULL DEFAULT '/assets/logo-banglaqr.svg',
ADD COLUMN IF NOT EXISTS payment_bangla_qr_instruction text NOT NULL DEFAULT 'বিকাশ, নগদ, রকেট বা যেকোনো ব্যাংক অ্যাপের "Bangla QR" অথবা "Scan to Pay" অপশন ব্যবহার করে পাশের QR কোডটি স্ক্যান করুন এবং পেমেন্ট সম্পন্ন করুন।',
ADD COLUMN IF NOT EXISTS payment_mfs_instruction text NOT NULL DEFAULT 'নিচের নম্বরে {amount} সেন্ড মানি (Send Money) করার পর পেমেন্ট ভেরিফাই করতে ট্রানজেকশন আইডি (TrxID) নিচে দিন।',
ADD COLUMN IF NOT EXISTS payment_cod_instruction text NOT NULL DEFAULT 'অর্ডার প্লেস করুন এবং সারাদেশে হোম ডেলিভারি পাওয়ার পর কুরিয়ার এজেন্টের কাছে ক্যাশ টাকা দিয়ে আপনার পণ্য বুঝে নিন।';
