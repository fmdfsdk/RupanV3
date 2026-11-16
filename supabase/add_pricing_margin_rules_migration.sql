-- =========================================================================
-- Migration: MOHASAGOR API Price Calculation & Custom Margin Rules
-- Run this script in your Supabase Dashboard -> SQL Editor
-- Safe and idempotent to run multiple times
-- =========================================================================

-- 1. Add final_price column to public.products if it does not exist
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS final_price numeric(12,2);

-- 2. Backfill final_price for existing products where final_price is null
-- Formula: Website Price (Final Price) = price - (0.25 * greatest(0, price - coalesce(purchase_price, price)))
UPDATE public.products
SET final_price = round(
  price - (0.25 * greatest(0, price - coalesce(purchase_price, price))),
  2
)
WHERE final_price IS NULL;

-- 3. Add pricing_config jsonb column to public.settings if it does not exist
ALTER TABLE public.settings
  ADD COLUMN IF NOT EXISTS pricing_config jsonb DEFAULT '{
    "deduction_percentage": 25,
    "default_margin_type": "percentage",
    "default_margin_value": 10,
    "discount_combination_rule": "stack",
    "online_payment_discount_type": "margin_percentage",
    "online_payment_discount_value": 50,
    "minimum_price_protection_enabled": true
  }'::jsonb;

-- Also ensure settings row 1 has valid pricing_config initialized
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

-- 3.5. Add is_recommended column to public.coupons for customer recommendation feature
ALTER TABLE public.coupons
  ADD COLUMN IF NOT EXISTS is_recommended boolean NOT NULL DEFAULT false;

-- 4. Update order price verification trigger to enforce Final Price floor protection
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
  max_allowed_discount numeric(12,2) := 0;
  actual_discount numeric(12,2) := 0;
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

  -- Critical Floor Protection: Customer subtotal cannot drop below Floor Subtotal
  -- Minimum allowable total = Floor Subtotal + shipping_fee
  minimum_allowed_total := calc_floor_subtotal + coalesce(new.shipping_fee, 0);

  -- If submitted total is less than the protected minimum floor (allowing 1 Tk rounding tolerance),
  -- clamp it to the protected minimum
  IF new.total < (minimum_allowed_total - 1) THEN
    new.total := minimum_allowed_total;
    new.subtotal := calc_floor_subtotal;
  END IF;

  -- Ensure non-negative total
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
