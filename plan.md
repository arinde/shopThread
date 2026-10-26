# ShopThread

> Turn your WhatsApp product list into a real storefront, in five minutes, without leaving WhatsApp behind.

ShopThread gives small vendors a clean, shareable online store built from their product list. Customers browse, pick items, and check out, and the order lands back in the vendor's WhatsApp as a neatly formatted message (and in a simple order dashboard). No website builder, no tech skills, and no need to change how they already sell.

---

## Table of contents

- [The problem](#the-problem)
- [Who it's for](#who-its-for)
- [Features](#features)
- [How an order works](#how-an-order-works)
- [Roadmap](#roadmap)
- [Pricing idea](#pricing-idea)
- [Data model](#data-model)
- [Architecture](#architecture)
- [Tech stack](#tech-stack)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Project structure](#project-structure)
- [Performance on Nigerian networks](#performance-on-nigerian-networks)
- [Security](#security)
- [Contributing](#contributing)
- [License](#license)

---

## The problem

Many small businesses sell through WhatsApp status, broadcast lists, and Instagram DMs. It works, but:

- Customers ask "how much?" for every item, again and again.
- Prices and stock live in the vendor's head or in scattered status posts.
- Orders get lost in chat, and details (size, color, address) are collected one message at a time.
- Payment confirmation means checking transfer alerts against chats by hand.

Full website builders are too heavy for these vendors. ShopThread meets them where they are.

---

## Who it's for

- Fashion, beauty, food, gadget, and craft vendors selling via WhatsApp and Instagram
- Home bakers and caterers taking pre-orders
- Anyone with "DM to order" in their bio

---

## Features

### Store setup (MVP)
- Sign up with phone number (OTP)
- Store name, logo, color, WhatsApp number, and short link: `shopthread.app/amaka-styles`
- Add products in seconds: photo, name, price, variants (size/color), stock or "available on request"
- **Bulk import:** paste a WhatsApp-style list (`Ankara gown - 15,000`) and it becomes products
- Categories and a "featured" section

### Customer storefront (MVP)
- Fast, mobile-first, light pages that work well on slow networks
- Search, categories, product page with variants
- Cart and simple checkout: name, phone, delivery or pickup, address, note
- **Send order on WhatsApp:** opens WhatsApp with a pre-filled, formatted order message to the vendor via a `wa.me` link

Example message:
```
🛍️ New order #1042 from ShopThread
Name: Tolu A.
Phone: 0803 000 0000

1 × Ankara gown (Size M)        ₦15,000
2 × Silk scarf (Wine)           ₦9,000
Delivery: Yaba                  ₦2,000
Total:                          ₦26,000

Address: 12 Example Street, Yaba
Note: Please call before delivery

View order: shopthread.app/o/1042
```

### Vendor dashboard (MVP)
- Orders list with status: `new → confirmed → paid → dispatched → delivered → cancelled`
- Mark an order paid and send a templated reply via WhatsApp ("Payment received, thank you!")
- Low-stock alerts

### Payments (v0.2)
- Show bank transfer details on the order page with the order number as the narration
- Optional online payment link via a Nigerian payment gateway
- Automatic "paid" status when a gateway payment is confirmed by webhook

### Growth (v0.3)
- Share cards: auto-generated product images sized for WhatsApp status and Instagram stories
- Delivery zones and fees by area
- Discount codes
- Simple analytics: store views, top products, conversion from view to order

### WhatsApp Business API (v0.4)
- For larger vendors: order notifications and status updates sent automatically via the WhatsApp Business Cloud API, instead of the customer having to press send
- Catalog sync to WhatsApp Business

---

## How an order works

```
Customer opens store link (from status, bio, or broadcast)
          │
          ▼
 Browses → adds to cart → checkout form
          │
          ▼
 Order saved (status: new)  ──►  vendor dashboard + push notification
          │
          ▼
 "Send on WhatsApp" opens chat with formatted order
          │
          ▼
 Vendor confirms → customer pays (transfer or link)
          │
          ▼
 Vendor marks paid / webhook marks paid → dispatched → delivered
```

Saving the order **before** opening WhatsApp means it's never lost, even if the customer doesn't press send.

---

## Roadmap

| Version | Scope | Status |
|---|---|---|
| v0.1 | Store setup, products, bulk paste import, storefront, cart, WhatsApp order message, order dashboard | Planned |
| v0.2 | Transfer details per order, payment gateway links + webhooks | Planned |
| v0.3 | Share cards for status/stories, delivery zones, discounts, analytics | Planned |
| v0.4 | WhatsApp Business Cloud API notifications, catalog sync | Idea |
| v0.5 | Custom domains, multiple staff accounts, inventory history | Idea |

---

## Pricing idea

| Plan | For | Includes |
|---|---|---|
| Free | Trying it out | Up to 20 products, ShopThread branding, WhatsApp orders |
| Pro (monthly) | Active vendors | Unlimited products, payment links, delivery zones, analytics, no branding |
| Business | Growing teams | WhatsApp API automation, staff accounts, custom domain |

Price in naira, with easy monthly payment. Validate with real vendors before setting numbers.

---

## Data model

```sql
create table stores (
  id            uuid primary key default gen_random_uuid(),
  owner_id      uuid not null references auth.users(id) on delete cascade,
  slug          text unique not null,
  name          text not null,
  logo_path     text,
  brand_color   text default '#111111',
  whatsapp      text not null,                 -- E.164, e.g. 2348030000000
  currency      text not null default 'NGN',
  bank_details  jsonb,                         -- bank name, account name, account number (vendor's own, shown to customers)
  plan          text not null default 'free',
  created_at    timestamptz default now()
);

create table products (
  id            uuid primary key default gen_random_uuid(),
  store_id      uuid not null references stores(id) on delete cascade,
  name          text not null,
  description   text,
  price_kobo    bigint not null,
  images        text[] default '{}',
  category      text,
  stock         int,                           -- null = not tracked
  featured      boolean default false,
  active        boolean default true,
  created_at    timestamptz default now()
);

create table product_variants (
  id            uuid primary key default gen_random_uuid(),
  product_id    uuid not null references products(id) on delete cascade,
  label         text not null,                 -- "M / Wine"
  price_kobo    bigint,                        -- null = same as product
  stock         int
);

create table orders (
  id            uuid primary key default gen_random_uuid(),
  store_id      uuid not null references stores(id) on delete cascade,
  number        int not null,                  -- per-store sequence for humans (#1042)
  customer_name text not null,
  customer_phone text not null,
  fulfilment    text not null check (fulfilment in ('delivery','pickup')),
  address       text,
  note          text,
  subtotal_kobo bigint not null,
  delivery_kobo bigint default 0,
  total_kobo    bigint not null,
  status        text not null default 'new' check (status in
                  ('new','confirmed','paid','dispatched','delivered','cancelled')),
  payment_ref   text,
  created_at    timestamptz default now(),
  unique (store_id, number)
);

create table order_items (
  id            uuid primary key default gen_random_uuid(),
  order_id      uuid not null references orders(id) on delete cascade,
  product_id    uuid references products(id) on delete set null,
  variant_id    uuid references product_variants(id) on delete set null,
  name_snapshot text not null,                 -- keep the name/price at order time
  unit_kobo     bigint not null,
  qty           int not null check (qty > 0)
);
```

**RLS:** vendors can read and write only their own store's data. The public can read active products of a store and insert orders, but can't read other customers' orders (an order page is reachable only by its unguessable link).

---

## Architecture

```
Customer (browser) ──► Next.js storefront (SSR/ISR, edge-cached)
                              │
Vendor (browser/PWA) ──► Next.js dashboard
                              │
                              ▼
                          Supabase
                          ├── Auth (phone OTP)
                          ├── Postgres + RLS
                          ├── Storage (product images, resized)
                          └── Edge Functions
                              ├── create-order     (validates prices server-side)
                              ├── payment-webhook  (marks orders paid)
                              └── share-card       (generates status/story images)
```

Prices and totals are always **recalculated on the server** when an order is created; the client cart is never trusted.

---

## Tech stack

| Part | Choice |
|---|---|
| Web (storefront + dashboard) | Next.js (App Router), TypeScript, Tailwind CSS |
| Vendor app | Installable PWA first; Expo app later if needed |
| Backend | Supabase (Auth, Postgres, Storage, Edge Functions) |
| Images | Supabase Storage with on-the-fly resizing, served as WebP/AVIF |
| Share cards | `@vercel/og` / Satori |
| Payments | A Nigerian payment gateway (hosted payment links + webhooks) |
| Messaging | `wa.me` links (MVP), WhatsApp Business Cloud API (later) |
| Validation | Zod |
| Testing | Vitest for pricing and import parser, Playwright for checkout flow |

---

## Getting started

```bash
git clone https://github.com/arinde/shopthread.git
cd shopthread
npm install

npx supabase start
npx supabase db reset           # migrations + a demo store with products

npm run dev                     # http://localhost:3000
# Demo store: http://localhost:3000/demo-store
```

---

## Environment variables

| Variable | Where | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | client | Supabase URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | client | Public anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | server only | Order creation, webhooks |
| `PAYMENT_SECRET_KEY` | server only | Payment gateway secret |
| `PAYMENT_WEBHOOK_SECRET` | server only | Verifies webhook signatures |
| `NEXT_PUBLIC_APP_URL` | client | Base URL used in order links |

---

## Project structure

```
shopthread/
├── app/
│   ├── [store]/                  # public storefront
│   │   ├── page.tsx
│   │   ├── p/[productId]/page.tsx
│   │   ├── cart/page.tsx
│   │   └── checkout/page.tsx
│   ├── o/[orderId]/page.tsx      # order status page for customers
│   ├── dashboard/                # vendor area (auth required)
│   │   ├── page.tsx              # orders
│   │   ├── products/
│   │   ├── settings/
│   │   └── import/               # bulk paste import
│   └── api/
│       └── webhooks/payment/route.ts
├── lib/
│   ├── pricing.ts                # totals in kobo, server-side
│   ├── whatsappMessage.ts        # formats the order message + wa.me link
│   ├── importParser.ts           # "Ankara gown - 15,000" → product
│   └── supabase/
├── components/
├── supabase/
│   ├── migrations/
│   ├── seed.sql
│   └── functions/
└── README.md
```

---

## Performance on Nigerian networks

- Storefront pages are server-rendered and edge-cached; target a fast first load on 3G.
- Images are resized and served in modern formats, lazy-loaded below the fold.
- Minimal client JavaScript on the storefront; the cart is a small client component.
- Works on low-end Android browsers; tested at narrow widths.

---

## Security

- Server-side price and stock validation for every order.
- Payment webhooks verified by signature; orders marked paid only by verified events or by the vendor.
- Rate limiting on order creation to stop spam.
- Unguessable order IDs in public links.
- ShopThread never stores customer card details; online payments are handled entirely by the payment gateway.

---

## Contributing

Good first contributions: the bulk import parser (more list formats), share-card templates, and storefront themes.

---

## License

MIT © Arinde Victor