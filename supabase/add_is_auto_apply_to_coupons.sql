-- Migration: Add is_auto_apply column to coupons table
ALTER TABLE public.coupons 
ADD COLUMN IF NOT EXISTS is_auto_apply BOOLEAN DEFAULT false;

COMMENT ON COLUMN public.coupons.is_auto_apply IS 'Automatically applies this coupon at checkout when cart reaches minimum order without requiring customer input';
