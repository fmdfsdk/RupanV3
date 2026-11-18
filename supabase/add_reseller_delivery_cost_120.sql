-- =========================================================================
-- Migration: Add ৳120 Reseller Supplier Delivery Cost to Mohasagor Products
-- Run this script in your Supabase Dashboard -> SQL Editor -> Click 'Run'
-- File Path: supabase/add_reseller_delivery_cost_120.sql
-- =========================================================================

-- 1. Configure default reseller delivery cost (৳120) in settings table
UPDATE public.settings
SET pricing_config = jsonb_set(
  coalesce(pricing_config, '{}'::jsonb),
  '{reseller_delivery_cost}',
  '120'::jsonb,
  true
)
WHERE id = 1;

-- 2. Bulk update all Mohasagor products to add ৳120 to Reseller Cost & Selling Price
-- purchase_price: Wholesale reseller cost (+120 BDT supplier courier/delivery)
-- price: Regular MSRP (+120 BDT)
-- discount_price: Customer selling price (+120 BDT if exists)
-- final_price: Floor minimum price (+120 BDT if exists)
UPDATE public.products
SET
  purchase_price = coalesce(purchase_price, 0) + 120,
  price = coalesce(price, 0) + 120,
  discount_price = CASE 
    WHEN discount_price IS NOT NULL THEN discount_price + 120 
    ELSE NULL 
  END,
  final_price = CASE 
    WHEN final_price IS NOT NULL THEN final_price + 120 
    ELSE coalesce(price, 0) + 120 
  END
WHERE source_id = 'mohasagor' 
   OR id LIKE 'mohasagor-%' 
   OR sku LIKE 'MOHASAGOR-%';
