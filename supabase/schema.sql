-- DROP TABLES IF EXISTS FOR CLEAN START (As requested by user)
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();
drop table if exists public.reviews cascade;
drop table if exists public.orders cascade;
drop table if exists public.sync_logs cascade;
drop table if exists public.sync_sources cascade;
drop table if exists public.products cascade;
drop table if exists public.settings cascade;
drop table if exists public.profiles cascade;
drop table if exists public.coupons cascade;
drop table if exists public.banners cascade;
drop table if exists public.blogs cascade;

-- 1. Create Profiles table linked to Supabase Auth
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  role text not null default 'Customer' check (role in ('Super Admin', 'Admin', 'Manager', 'Editor', 'Support', 'Delivery Manager', 'Customer')),
  is_active boolean not null default true,
  total_spending numeric(12,2) not null default 0.00,
  last_login timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for profiles
alter table public.profiles enable row level security;

-- Helper function to check admin status bypassing RLS (security definer)
create or replace function public.is_admin(user_id uuid)
returns boolean as $$
begin
  return exists (
    select 1 from public.profiles 
    where id = user_id and role in ('Super Admin', 'Admin')
  );
end;
$$ language plpgsql security definer;

create policy "Allow public read of profiles" on public.profiles for select using (true);
create policy "Allow individual user profile updates" on public.profiles for update using (auth.uid() = id);
create policy "Allow admin changes to profiles" on public.profiles for all using (
  public.is_admin(auth.uid())
);

-- 2. Create Settings table
create table public.settings (
  id integer primary key default 1 check (id = 1), -- enforces single row
  logo_text text not null default 'RUPAN',
  logo_accent text not null default '.',
  tagline text default 'Style That Speaks.',
  whatsapp_number text,
  support_number text,
  currency_symbol text not null default '৳',
  inside_dhaka_shipping numeric(10,2) not null default 60.00,
  outside_dhaka_shipping numeric(10,2) not null default 120.00,
  free_shipping_min_order numeric(10,2) not null default 3000.00,
  theme text not null default 'sleek',
  -- Ad Tracking & Analytics Integrations
  meta_pixel_id text,
  meta_test_event_code text,
  google_tag_manager_id text,
  google_analytics_id text,
  homepage_config jsonb not null default '{
    "category_style": "circular",
    "featured_categories": [
      { "name": "Men Fashions", "desc": "Premium Royal Panjabis, thick cotton overshirts, tailored trousers, and formal wear.", "icon": "👕", "bg": "from-orange-50 to-amber-50/20", "mappedId": "men''s fashion" },
      { "name": "Women Fashions", "desc": "High-density silk sarees, customized cotton salwar kameez sets, and elegant drops.", "icon": "👗", "bg": "from-rose-50 to-pink-50/10", "mappedId": "women''s fashion" },
      { "name": "Couple Collection", "desc": "Perfectly coordinated matching couple outfits for special occasions and wedding festivals.", "icon": "👩‍❤️‍👨", "bg": "from-purple-50 to-indigo-50/10", "mappedId": "couple collection" },
      { "name": "Kids Fashions", "desc": "Extremely soft combed organic cotton comfort drops for children and growing toddlers.", "icon": "👶", "bg": "from-blue-50 to-sky-50/10", "mappedId": "kids zone" },
      { "name": "Accessories", "desc": "Classic chronometer watches, dial analogs, and smart leather everyday utility gear.", "icon": "⌚", "bg": "from-gray-100 to-zinc-50", "mappedId": "watch" }
    ],
    "homepage_categories": [
      { "name": "Women Fashions", "image": "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=150&auto=format&fit=crop", "mappedId": "women''s fashion" },
      { "name": "Watches", "image": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=150&auto=format&fit=crop", "mappedId": "watch" },
      { "name": "Toys Products", "image": "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?q=80&w=150&auto=format&fit=crop", "mappedId": "kids zone" },
      { "name": "Shoes", "image": "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=150&auto=format&fit=crop", "mappedId": "men''s fashion" },
      { "name": "Power Sanders", "image": "https://images.unsplash.com/photo-1504148455328-c376907d081c?q=80&w=150&auto=format&fit=crop", "mappedId": "gadgets & electronics" },
      { "name": "Men Fashions", "image": "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=150&auto=format&fit=crop", "mappedId": "men''s fashion" },
      { "name": "Shirts & Polos", "image": "https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=150&auto=format&fit=crop", "mappedId": "men''s fashion" },
      { "name": "Kitchen Items", "image": "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=150&auto=format&fit=crop", "mappedId": "home & lifestyle" },
      { "name": "Home & Living", "image": "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=150&auto=format&fit=crop", "mappedId": "home & lifestyle" },
      { "name": "Health Care", "image": "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?q=80&w=150&auto=format&fit=crop", "mappedId": "beauty" },
      { "name": "Grocery", "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=150&auto=format&fit=crop", "mappedId": "foods" },
      { "name": "Fitness", "image": "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=150&auto=format&fit=crop", "mappedId": "fitness" },
      { "name": "Electronics", "image": "https://images.unsplash.com/photo-1588508065123-287b28e013da?q=80&w=150&auto=format&fit=crop", "mappedId": "gadgets & electronics" },
      { "name": "Beauty", "image": "https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=150&auto=format&fit=crop", "mappedId": "beauty" },
      { "name": "Baby & Kids", "image": "https://images.unsplash.com/photo-1515488042361-404e9250afef?q=80&w=150&auto=format&fit=crop", "mappedId": "kids zone" },
      { "name": "Accessories", "image": "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=150&auto=format&fit=crop", "mappedId": "watch" }
    ],
    "featured_product_ids": {
      "trending": [],
      "new_arrivals": [],
      "best_sellers": []
    },
    "promo_banner": {
      "badge": "Store Promo",
      "title": "BIG SALE",
      "discount": "UP TO 70% OFF",
      "description": "Fashion • Electronics • Beauty • Home • Grocery",
      "image1": "https://images.unsplash.com/photo-1565026057447-bc90a3dca487?q=80&w=400&auto=format&fit=crop",
      "image2": "https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?q=80&w=400&auto=format&fit=crop",
      "cta_category": "All",
      "bg_color": "#ff5c00"
    }
  }'::jsonb,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  -- Payment Gateway Configurations
  payment_bangla_qr_enabled boolean not null default true,
  payment_bkash_enabled boolean not null default true,
  payment_nagad_enabled boolean not null default true,
  payment_cod_enabled boolean not null default true,
  payment_bkash_number text not null default '01600338318',
  payment_nagad_number text not null default '01600338318',
  payment_bangla_qr_image text not null default '/assets/BanglaQRcode.jpeg',
  payment_bangla_qr_instruction text not null default 'বিকাশ, নগদ, রকেট বা যেকোনো ব্যাংক অ্যাপের "Bangla QR" অথবা "Scan to Pay" অপশন ব্যবহার করে পাশের QR কোডটি স্ক্যান করুন এবং পেমেন্ট সম্পন্ন করুন।',
  payment_mfs_instruction text not null default 'নিচের নম্বরে {amount} সেন্ড মানি (Send Money) করার পর পেমেন্ট ভেরিফাই করতে ট্রানজেকশন আইডি (TrxID) নিচে দিন।',
  payment_cod_instruction text not null default 'অর্ডার প্লেস করুন এবং সারাদেশে হোম ডেলিভারি পাওয়ার পর কুরিয়ার এজেন্টের কাছে ক্যাশ টাকা দিয়ে আপনার পণ্য বুঝে নিন।',
  facebook_url text default 'https://www.facebook.com/rupanbd',
  twitter_url text default 'https://twitter.com',
  youtube_url text default 'https://youtube.com',
  instagram_url text default 'https://www.instagram.com/rupanbd'
);

-- Insert default configurations
insert into public.settings (
  id, logo_text, logo_accent, tagline, whatsapp_number, support_number, currency_symbol, 
  inside_dhaka_shipping, outside_dhaka_shipping, free_shipping_min_order, theme,
  payment_bangla_qr_enabled, payment_bkash_enabled, payment_nagad_enabled, payment_cod_enabled,
  payment_bkash_number, payment_nagad_number, payment_bangla_qr_image,
  payment_bangla_qr_instruction, payment_mfs_instruction, payment_cod_instruction,
  facebook_url, twitter_url, youtube_url, instagram_url
)
values (
  1, 'RUPAN', '.', 'Style That Speaks.', '+8801711223344', '+8809612345678', '৳', 
  60.00, 120.00, 3000.00, 'sleek',
  true, true, true, true,
  '01600338318', '01600338318', '/assets/BanglaQRcode.jpeg',
  'বিকাশ, নগদ, রকেট বা যেকোনো ব্যাংক অ্যাপের "Bangla QR" অথবা "Scan to Pay" অপশন ব্যবহার করে পাশের QR কোডটি স্ক্যান করুন এবং পেমেন্ট সম্পন্ন করুন।',
  'নিচের নম্বরে {amount} সেন্ড মানি (Send Money) করার পর পেমেন্ট ভেরিফাই করতে ট্রানজেকশন আইডি (TrxID) নিচে দিন।',
  'অর্ডার প্লেস করুন এবং সারাদেশে হোম ডেলিভারি পাওয়ার পর কুরিয়ার এজেন্টের কাছে ক্যাশ টাকা দিয়ে আপনার পণ্য বুঝে নিন।',
  'https://www.facebook.com/rupanbd', 'https://twitter.com', 'https://youtube.com', 'https://www.instagram.com/rupanbd'
)
on conflict (id) do nothing;

alter table public.settings enable row level security;
create policy "Allow public read of settings" on public.settings for select using (true);
create policy "Allow admin update of settings" on public.settings for update using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('Super Admin', 'Admin', 'Manager'))
);

-- 3. Create Products table
create table public.products (
  id text primary key, -- Text allows external IDs (e.g. 'mohasagor-14') and UUIDs/custom SKU format
  name text not null,
  slug text unique not null,
  sku text unique,
  brand text default 'Rupan',
  category text not null,
  sub_category text,
  tags text[] default '{}',
  gender text not null default 'Men',
  price numeric(12,2) not null,
  discount_price numeric(12,2),
  purchase_price numeric(12,2), -- Cost from reseller source (e.g. mohasagor sale_price)
  rating numeric(3,2) not null default 5.00,
  reviews_count integer not null default 0,
  images text[] not null default '{}',
  colors jsonb not null default '[]'::jsonb, -- Array of {name, class, hex}
  sizes text[] not null default '{}',
  description text not null,
  short_description text,
  features text[] not null default '{}',
  stock integer not null default 0,
  low_stock_warning integer not null default 5,
  weight numeric(8,3),
  material text,
  status text not null default 'published',
  is_featured boolean not null default false,
  is_trending boolean not null default false,
  is_new boolean not null default true,
  is_best_seller boolean not null default false,
  is_flash_sale boolean not null default false,
  flash_sale_limit integer,
  flash_sale_sold integer not null default 0,
  seo_title text,
  seo_description text,
  -- Sync properties
  source_id text not null default 'manual', -- 'manual', 'mohasagor', etc.
  source_product_id text, -- original product ID from source
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.products enable row level security;
create policy "Allow public read of products" on public.products for select using (true);
create policy "Allow admin management of products" on public.products for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('Super Admin', 'Admin', 'Manager', 'Editor'))
);

-- 4. Create Sync Sources table
create table public.sync_sources (
  id text primary key,
  name text not null,
  type text not null default 'api', -- 'api', 'manual', 'csv'
  api_url text,
  api_key text,
  secret_key text,
  config jsonb not null default '{"markup_percentage": 0, "auto_publish": true}'::jsonb,
  is_active boolean not null default true,
  last_sync_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Insert Mohasagor default source config
insert into public.sync_sources (id, name, type, api_url, api_key, secret_key, config)
values ('mohasagor', 'Mohasagor Reseller API', 'api', 'https://mohasagor.com.bd/api/reseller/product', 'A8niclztH9JtzS4t', '2ff380917a11d3a7c97bcf6dddfb8adf38194c7d6b726ab12c4d0d5fb136fef8', '{"markup_percentage": 25, "auto_publish": true}')
on conflict (id) do nothing;

alter table public.sync_sources enable row level security;
create policy "Allow admin read of sync sources" on public.sync_sources for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('Super Admin', 'Admin', 'Manager'))
);
create policy "Allow admin changes to sync sources" on public.sync_sources for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('Super Admin', 'Admin'))
);

-- 5. Create Sync Logs table
create table public.sync_logs (
  id uuid primary key default gen_random_uuid(),
  source_id text references public.sync_sources(id) on delete cascade not null,
  status text not null, -- 'running', 'success', 'failed'
  items_fetched integer not null default 0,
  items_imported integer not null default 0,
  items_updated integer not null default 0,
  items_failed integer not null default 0,
  error_message text,
  details jsonb not null default '{}'::jsonb,
  started_at timestamp with time zone default timezone('utc'::text, now()) not null,
  completed_at timestamp with time zone
);

alter table public.sync_logs enable row level security;
create policy "Allow admin read of sync logs" on public.sync_logs for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('Super Admin', 'Admin', 'Manager', 'Support'))
);
create policy "Allow admin write of sync logs" on public.sync_logs for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('Super Admin', 'Admin'))
);

-- 6. Create Orders table
create table public.orders (
  id text primary key,
  customer_name text not null,
  phone text not null,
  address text not null,
  area text not null,
  payment_method text not null,
  items jsonb not null, -- Array of {productId, productName, color, size, price, quantity, image}
  subtotal numeric(12,2) not null,
  shipping_fee numeric(10,2) not null,
  total numeric(12,2) not null,
  status text not null default 'Pending', -- 'Pending', 'Confirmed', 'Processing', 'Packed', 'Shipped', 'Delivered', 'Cancelled', 'Returned'
  payment_status text not null default 'Unpaid', -- 'Unpaid', 'Paid', 'Refunded'
  customer_notes text,
  admin_notes text,
  meta_event_id text, -- To associate pixel event and purchase order
  is_guest boolean not null default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.orders enable row level security;
create policy "Allow public insert of orders" on public.orders for insert with check (true);
create policy "Allow public tracking query" on public.orders for select using (true);
create policy "Allow admin order access" on public.orders for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('Super Admin', 'Admin', 'Manager', 'Support', 'Delivery Manager'))
);

-- 7. Create Reviews, Coupons, Banners, Blogs tables
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  user_name text not null,
  rating integer not null check (rating between 1 and 5),
  comment text not null,
  verified boolean not null default false,
  user_photo text,
  product_id text references public.products(id) on delete cascade,
  status text not null default 'pending', -- 'approved', 'pending', 'rejected'
  reply text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.reviews enable row level security;
create policy "Allow public read of approved reviews" on public.reviews for select using (status = 'approved' or exists (select 1 from public.profiles where id = auth.uid() and role in ('Super Admin', 'Admin', 'Manager', 'Support')));
create policy "Allow public review submission" on public.reviews for insert with check (true);
create policy "Allow admin review moderation" on public.reviews for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('Super Admin', 'Admin', 'Manager', 'Support'))
);

create table public.coupons (
  code text primary key,
  type text not null check (type in ('percentage', 'fixed', 'free_shipping')),
  value numeric(10,2) not null,
  min_order numeric(12,2) not null default 0.00,
  max_discount numeric(12,2),
  expiry_date date,
  is_active boolean not null default true,
  usage_limit integer,
  used_count integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.coupons enable row level security;
create policy "Allow public selection for checkout verification" on public.coupons for select using (true);
create policy "Allow admin coupon editing" on public.coupons for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('Super Admin', 'Admin', 'Manager'))
);

create table public.banners (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text,
  image text not null,
  cta_text text,
  category text,
  is_active boolean not null default true,
  type text not null default 'homepage',
  publish_date date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.banners enable row level security;
create policy "Allow public read of active banners" on public.banners for select using (is_active = true or exists (select 1 from public.profiles where id = auth.uid() and role in ('Super Admin', 'Admin', 'Manager')));
create policy "Allow admin banner edits" on public.banners for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('Super Admin', 'Admin', 'Manager', 'Editor'))
);

create table public.blogs (
  id text primary key,
  title text not null,
  excerpt text,
  content text not null,
  image text,
  read_time text,
  category text,
  status text not null default 'published',
  seo_title text,
  seo_description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.blogs enable row level security;
create policy "Allow public read of published blogs" on public.blogs for select using (status = 'published' or exists (select 1 from public.profiles where id = auth.uid() and role in ('Super Admin', 'Admin', 'Manager', 'Editor')));
create policy "Allow admin blog edits" on public.blogs for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('Super Admin', 'Admin', 'Manager', 'Editor'))
);

-- 8. Profile Sync Trigger
-- Syncs newly registered auth.users to public.profiles automatically
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role, is_active)
  values (
    new.id, 
    new.email, 
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)), 
    coalesce(new.raw_user_meta_data->>'role', 'Customer'),
    true
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 9. Order Price Verification Trigger
-- Computes and validates order subtotal and shipping fee database-side to prevent price manipulation
create or replace function public.validate_order_total()
returns trigger as $$
declare
  item jsonb;
  prod_id text;
  prod_qty integer;
  actual_price numeric(12,2);
  calc_subtotal numeric(12,2) := 0;
  shipping numeric(10,2);
  settings_record record;
begin
  -- Get settings for shipping fees (inside vs outside Dhaka)
  select * into settings_record from public.settings where id = 1;
  
  -- Calculate subtotal by querying the database for each item's actual price and stock
  for item in select * from jsonb_array_elements(new.items) loop
    prod_id := item->>'productId';
    prod_qty := (item->>'quantity')::integer;
    
    declare
      current_stock integer;
    begin
      select coalesce(discount_price, price), stock into actual_price, current_stock 
      from public.products 
      where id = prod_id;
      
      if not found then
        raise exception 'Product with ID % not found', prod_id;
      end if;
      
      if current_stock < prod_qty then
        raise exception 'Insufficient stock for product ID %. Available: %, requested: %', prod_id, current_stock, prod_qty;
      end if;
      
      -- Deduct stock
      update public.products 
      set stock = stock - prod_qty 
      where id = prod_id;
    end;
    
    calc_subtotal := calc_subtotal + (actual_price * prod_qty);
  end loop;
  
  -- Set correct shipping fee based on area and settings
  if settings_record is not null then
    if calc_subtotal >= settings_record.free_shipping_min_order then
      shipping := 0;
    elsif new.area = 'Inside Dhaka' then
      shipping := settings_record.inside_dhaka_shipping;
    else
      shipping := settings_record.outside_dhaka_shipping;
    end if;
  else
    shipping := new.shipping_fee;
  end if;
  
  -- Prevent subtotal price manipulation
  if abs(new.subtotal - calc_subtotal) > 1.00 then
    raise exception 'Subtotal mismatch: expected %, got %', calc_subtotal, new.subtotal;
  end if;
  
  -- Prevent shipping fee manipulation
  if abs(new.shipping_fee - shipping) > 1.00 then
    raise exception 'Shipping fee mismatch: expected %, got %', shipping, new.shipping_fee;
  end if;
  
  -- Prevent discount forgery (maximum discount of 35% allowed)
  if (new.subtotal + new.shipping_fee - new.total) > (new.subtotal * 0.35) then
    raise exception 'Discount cannot exceed 35%% of the subtotal';
  end if;
  
  -- Prevent negative totals or invalid totals
  if new.total < 0 then
    raise exception 'Order total cannot be negative';
  end if;
  
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_order_created
  before insert on public.orders
  for each row execute procedure public.validate_order_total();

-- ==========================================
-- 10. SEARCH & CATALOG PERFORMANCE INDEXES
-- ==========================================

-- Standard performance indexes for catalog filtering
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);
CREATE INDEX IF NOT EXISTS idx_products_gender ON public.products(gender);
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON public.products(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_products_is_trending ON public.products(is_trending) WHERE is_trending = true;
CREATE INDEX IF NOT EXISTS idx_products_is_new ON public.products(is_new) WHERE is_new = true;
CREATE INDEX IF NOT EXISTS idx_products_is_best_seller ON public.products(is_best_seller) WHERE is_best_seller = true;
CREATE INDEX IF NOT EXISTS idx_products_is_flash_sale ON public.products(is_flash_sale) WHERE is_flash_sale = true;
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_price ON public.products(price);
CREATE INDEX IF NOT EXISTS idx_products_stock ON public.products(stock);

-- GIN index for search on name, category, and description
CREATE INDEX IF NOT EXISTS idx_products_search ON public.products USING gin(
  to_tsvector('english', coalesce(name, '') || ' ' || coalesce(category, '') || ' ' || coalesce(sub_category, '') || ' ' || coalesce(description, ''))
);

-- Search products function with search ranking (RPC call support)
CREATE OR REPLACE FUNCTION public.search_products(search_query text, match_limit int DEFAULT 20)
RETURNS SETOF public.products AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM public.products
  WHERE 
    status = 'published' AND
    to_tsvector('english', coalesce(name, '') || ' ' || coalesce(category, '') || ' ' || coalesce(sub_category, '') || ' ' || coalesce(description, '')) 
    @@ plainto_tsquery('english', search_query)
  ORDER BY 
    ts_rank(
      to_tsvector('english', coalesce(name, '') || ' ' || coalesce(category, '') || ' ' || coalesce(sub_category, '') || ' ' || coalesce(description, '')),
      plainto_tsquery('english', search_query)
    ) DESC,
    created_at DESC
  LIMIT match_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

