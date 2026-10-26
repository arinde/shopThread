export type Store = {
  id: string;
  owner_id: string;
  slug: string;
  name: string;
  logo_path: string | null;
  brand_color: string;
  whatsapp: string;
  currency: string;
  bank_details: { bank_name: string; account_name: string; account_number: string } | null;
  delivery_fee_kobo: number;
  plan: "free" | "pro" | "business";
  next_order_number: number;
  created_at: string;
};

export type Product = {
  id: string;
  store_id: string;
  name: string;
  description: string | null;
  price_kobo: number;
  images: string[];
  category: string | null;
  stock: number | null;
  featured: boolean;
  active: boolean;
  created_at: string;
};

export type ProductVariant = {
  id: string;
  product_id: string;
  label: string;
  price_kobo: number | null;
  stock: number | null;
};

export type OrderStatus = "new" | "confirmed" | "paid" | "dispatched" | "delivered" | "cancelled";

export type Order = {
  id: string;
  store_id: string;
  number: number;
  customer_name: string;
  customer_phone: string;
  fulfilment: "delivery" | "pickup";
  address: string | null;
  note: string | null;
  subtotal_kobo: number;
  delivery_kobo: number;
  total_kobo: number;
  status: OrderStatus;
  payment_ref: string | null;
  created_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string | null;
  variant_id: string | null;
  name_snapshot: string;
  unit_kobo: number;
  qty: number;
};
