-- =========================================================================
-- RUPAN MASTER DATABASE MIGRATION (LATEST)
-- Run this in your Supabase Dashboard -> SQL Editor -> Click 'Run'
-- Safe and idempotent: will NOT delete any existing data
-- =========================================================================

-- 1. PRODUCTS TABLE: Add final_price column and backfill baseline floor prices
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS final_price numeric(12,2);

-- Backfill final_price for existing products
UPDATE public.products
SET final_price = round(
  price - (0.25 * greatest(0, price - coalesce(purchase_price, price))),
  2
)
WHERE final_price IS NULL;


-- 2. COUPONS TABLE: Add is_recommended column for customer recommendations
ALTER TABLE public.coupons
  ADD COLUMN IF NOT EXISTS is_recommended boolean NOT NULL DEFAULT false;


-- 3. ORDERS TABLE: Add payment, location, and discount columns
ALTER TABLE public.orders 
  ADD COLUMN IF NOT EXISTS is_incognito_guest boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS user_id uuid,
  ADD COLUMN IF NOT EXISTS transaction_id text DEFAULT '',
  ADD COLUMN IF NOT EXISTS paid_confirm boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS payment_screenshot_url text,
  ADD COLUMN IF NOT EXISTS division text,
  ADD COLUMN IF NOT EXISTS district text,
  ADD COLUMN IF NOT EXISTS online_payment_discount numeric(10,2) DEFAULT 0;


-- 4. SETTINGS TABLE: Add pricing config, online discounts, telegram & social columns
ALTER TABLE public.settings
  ADD COLUMN IF NOT EXISTS pricing_config jsonb DEFAULT '{
    "deduction_percentage": 25,
    "default_margin_type": "percentage",
    "default_margin_value": 10,
    "discount_combination_rule": "stack",
    "online_payment_discount_type": "margin_percentage",
    "online_payment_discount_value": 50,
    "minimum_price_protection_enabled": true
  }'::jsonb,
  ADD COLUMN IF NOT EXISTS online_payment_discount_enabled boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS online_payment_discount_percent numeric(5,2) DEFAULT 50,
  ADD COLUMN IF NOT EXISTS telegram_bot_token text,
  ADD COLUMN IF NOT EXISTS telegram_chat_id text,
  ADD COLUMN IF NOT EXISTS telegram_notifications_enabled boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS meta_capi_access_token text,
  ADD COLUMN IF NOT EXISTS payment_screenshot_enabled boolean NOT NULL DEFAULT true;

-- Initialize pricing_config on settings row 1 if missing
UPDATE public.settings
SET pricing_config = '{
  "deduction_percentage": 25,
  "default_margin_type": "percentage",
  "default_margin_value": 10,
  "discount_combination_rule": "stack",
  "online_payment_discount_type": "margin_percentage",
  "online_payment_discount_value": 50,
  "minimum_price_protection_enabled": true
}'::jsonb
WHERE id = 1 AND (pricing_config IS NULL OR pricing_config = '{}'::jsonb);


-- 5. STORAGE BUCKETS: Payment Screenshots & Banners (with public upload/read)
DO $$
BEGIN
  -- Payment screenshots bucket
  INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  VALUES (
    'payment-screenshots',
    'payment-screenshots',
    true,
    5242880,
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  )
  ON CONFLICT (id) DO NOTHING;

  -- Banners bucket
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('banners', 'banners', true)
  ON CONFLICT (id) DO NOTHING;
END $$;

-- Storage RLS Policies
DROP POLICY IF EXISTS "Allow public upload to payment-screenshots" ON storage.objects;
CREATE POLICY "Allow public upload to payment-screenshots"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'payment-screenshots');

DROP POLICY IF EXISTS "Allow public read of payment-screenshots" ON storage.objects;
CREATE POLICY "Allow public read of payment-screenshots"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'payment-screenshots');

DROP POLICY IF EXISTS "Public Read Access Banners" ON storage.objects;
CREATE POLICY "Public Read Access Banners"
  ON storage.objects FOR SELECT 
  USING (bucket_id = 'banners');

DROP POLICY IF EXISTS "Public Upload Access Banners" ON storage.objects;
CREATE POLICY "Public Upload Access Banners"
  ON storage.objects FOR INSERT 
  WITH CHECK (bucket_id = 'banners');


-- 6. ORDERS TRIGGER: Backend Floor Price & Minimum Price Protection
CREATE OR REPLACE FUNCTION public.validate_order_total()
RETURNS trigger AS $$
DECLARE
  item jsonb;
  prod_id text;
  prod_qty integer;
  item_price numeric(12,2);
  found_selling_price numeric(12,2);
  found_final_price numeric(12,2);
  found_purchase_price numeric(12,2);
  current_stock integer;
  calc_selling_subtotal numeric(12,2) := 0;
  calc_floor_subtotal numeric(12,2) := 0;
  minimum_allowed_total numeric(12,2) := 0;
BEGIN
  -- Ensure new.items is valid JSON array
  IF new.items IS NULL OR jsonb_typeof(new.items) != 'array' THEN
    RETURN new;
  END IF;

  -- Process each item for stock deduction and subtotal/floor calculation
  FOR item IN SELECT * FROM jsonb_array_elements(new.items) LOOP
    prod_id := coalesce(item->>'productId', item->>'product_id');
    prod_qty := coalesce((item->>'quantity')::integer, 1);
    item_price := coalesce((item->>'price')::numeric, 0.00);

    IF prod_id IS NOT NULL THEN
      BEGIN
        SELECT 
          coalesce(discount_price, price), 
          coalesce(final_price, round(price - (0.25 * greatest(0, price - coalesce(purchase_price, price))), 2)),
          purchase_price,
          stock 
        INTO found_selling_price, found_final_price, found_purchase_price, current_stock 
        FROM public.products 
        WHERE id = prod_id;

        IF FOUND THEN
          -- Deduct stock if available (clamp at 0)
          UPDATE public.products 
          SET stock = greatest(0, stock - prod_qty) 
          WHERE id = prod_id;
        ELSE
          found_selling_price := item_price;
          found_final_price := item_price;
        END IF;
      EXCEPTION WHEN OTHERS THEN
        found_selling_price := item_price;
        found_final_price := item_price;
      END;
    ELSE
      found_selling_price := item_price;
      found_final_price := item_price;
    END IF;

    calc_selling_subtotal := calc_selling_subtotal + (found_selling_price * prod_qty);
    calc_floor_subtotal := calc_floor_subtotal + (found_final_price * prod_qty);
  END LOOP;

  -- Minimum Price Protection: Total cannot drop below Floor Subtotal + shipping
  minimum_allowed_total := calc_floor_subtotal + coalesce(new.shipping_fee, 0);

  IF new.total < (minimum_allowed_total - 1) THEN
    new.total := minimum_allowed_total;
    new.subtotal := calc_floor_subtotal;
  END IF;

  IF new.total < 0 THEN
    new.total := 0;
  END IF;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-attach trigger on public.orders
DROP TRIGGER IF EXISTS on_order_created ON public.orders;
CREATE TRIGGER on_order_created
  BEFORE INSERT ON public.orders
  FOR EACH ROW EXECUTE PROCEDURE public.validate_order_total();
