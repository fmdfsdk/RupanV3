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
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Insert default configurations
insert into public.settings (id, logo_text, logo_accent, tagline, whatsapp_number, support_number, currency_symbol, inside_dhaka_shipping, outside_dhaka_shipping, free_shipping_min_order, theme)
values (1, 'RUPAN', '.', 'Style That Speaks.', '+8801711223344', '+8809612345678', '৳', 60.00, 120.00, 3000.00, 'sleek')
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
  source_raw_data jsonb, -- ALL raw API data preserved
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
