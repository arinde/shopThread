-- ShopThread v0.1 schema: stores, products, variants, orders, order_items.
-- See plan.md for the product spec this implements.

create extension if not exists pgcrypto;

create table stores (
  id                uuid primary key default gen_random_uuid(),
  owner_id          uuid not null references auth.users(id) on delete cascade,
  slug              text unique not null,
  name              text not null,
  logo_path         text,
  brand_color       text not null default '#111111',
  whatsapp          text not null,                 -- E.164, e.g. 2348030000000
  currency          text not null default 'NGN',
  bank_details      jsonb,                          -- bank name, account name, account number (shown to customers on order page)
  delivery_fee_kobo bigint not null default 0,      -- flat delivery fee (v0.1); per-zone fees are a v0.3 feature
  plan              text not null default 'free' check (plan in ('free', 'pro', 'business')),
  next_order_number int not null default 1,
  created_at        timestamptz not null default now()
);

create table products (
  id          uuid primary key default gen_random_uuid(),
  store_id    uuid not null references stores(id) on delete cascade,
  name        text not null,
  description text,
  price_kobo  bigint not null check (price_kobo >= 0),
  images      text[] not null default '{}',
  category    text,
  stock       int,                                  -- null = not tracked
  featured    boolean not null default false,
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);

create table product_variants (
  id         uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  label      text not null,                          -- "M / Wine"
  price_kobo bigint check (price_kobo is null or price_kobo >= 0), -- null = same as product
  stock      int
);

create table orders (
  id             uuid primary key default gen_random_uuid(),
  store_id       uuid not null references stores(id) on delete cascade,
  number         int not null,                        -- per-store sequence for humans (#1042)
  customer_name  text not null,
  customer_phone text not null,
  fulfilment     text not null check (fulfilment in ('delivery', 'pickup')),
  address        text,
  note           text,
  subtotal_kobo  bigint not null check (subtotal_kobo >= 0),
  delivery_kobo  bigint not null default 0 check (delivery_kobo >= 0),
  total_kobo     bigint not null check (total_kobo >= 0),
  status         text not null default 'new' check (status in
                   ('new', 'confirmed', 'paid', 'dispatched', 'delivered', 'cancelled')),
  payment_ref    text,
  created_at     timestamptz not null default now(),
  unique (store_id, number)
);

create table order_items (
  id            uuid primary key default gen_random_uuid(),
  order_id      uuid not null references orders(id) on delete cascade,
  product_id    uuid references products(id) on delete set null,
  variant_id    uuid references product_variants(id) on delete set null,
  name_snapshot text not null,                        -- keep the name/price at order time
  unit_kobo     bigint not null check (unit_kobo >= 0),
  qty           int not null check (qty > 0)
);

create index products_store_id_idx on products(store_id);
create index product_variants_product_id_idx on product_variants(product_id);
create index orders_store_id_idx on orders(store_id);
create index order_items_order_id_idx on order_items(order_id);

-- Per-store human order numbers, assigned atomically via a row lock on stores.
create or replace function assign_order_number()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  assigned int;
begin
  update stores
     set next_order_number = next_order_number + 1
   where id = new.store_id
  returning next_order_number - 1 into assigned;

  if assigned is null then
    raise exception 'Unknown store_id %', new.store_id;
  end if;

  new.number := assigned;
  return new;
end;
$$;

create trigger orders_assign_number
  before insert on orders
  for each row
  execute function assign_order_number();

-- Row Level Security
alter table stores enable row level security;
alter table products enable row level security;
alter table product_variants enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

-- Vendors manage only their own store.
create policy "store owner full access" on stores
  for all
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

-- Anyone can look up a store by slug for the public storefront.
create policy "public can read stores" on stores
  for select
  using (true);

create policy "store owner full access" on products
  for all
  using (store_id in (select id from stores where owner_id = auth.uid()))
  with check (store_id in (select id from stores where owner_id = auth.uid()));

create policy "public can read active products" on products
  for select
  using (active = true);

create policy "store owner full access" on product_variants
  for all
  using (product_id in (
    select p.id from products p
    join stores s on s.id = p.store_id
    where s.owner_id = auth.uid()
  ))
  with check (product_id in (
    select p.id from products p
    join stores s on s.id = p.store_id
    where s.owner_id = auth.uid()
  ));

create policy "public can read variants of active products" on product_variants
  for select
  using (product_id in (select id from products where active = true));

-- Orders and order_items have NO public policies: customers never write or read
-- them directly. Order creation, the public order-status page, and payment
-- webhooks all go through server-side code using the service role key, which
-- bypasses RLS after recalculating prices from the products table. This is
-- deliberately stricter than "anon can insert" so the client cart is never
-- trusted for pricing (see "Security" in plan.md).
create policy "store owner reads own orders" on orders
  for select
  using (store_id in (select id from stores where owner_id = auth.uid()));

create policy "store owner updates own orders" on orders
  for update
  using (store_id in (select id from stores where owner_id = auth.uid()))
  with check (store_id in (select id from stores where owner_id = auth.uid()));

create policy "store owner reads own order items" on order_items
  for select
  using (order_id in (
    select o.id from orders o
    join stores s on s.id = o.store_id
    where s.owner_id = auth.uid()
  ));
