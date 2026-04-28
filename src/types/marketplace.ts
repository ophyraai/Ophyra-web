// Tipos compartidos del marketplace híbrido (afiliados + marca propia).
// Mantener en sync con supabase/migrations/007_marketplace_hybrid.sql.

export type ProductType = 'affiliate' | 'own';

// Categoría libre. Sugerencias en el form admin via datalist.
// Las 6 categorías originales (sleep, exercise, nutrition, stress, productivity, hydration)
// siguen siendo válidas y son las que conectan con el sistema de diagnóstico.
export type ProductCategory = string;

/**
 * Vista pública del producto. NO contiene supplier_*, stripe_* ni otros
 * campos privados — esos solo se exponen en `AdminProduct`.
 */
export interface Product {
  id: string;
  type: ProductType;
  name: string;
  slug: string | null;
  category: ProductCategory;
  short_description: string | null;
  long_description: string | null;
  description: string | null; // legacy, mantener por compat
  image_url: string | null;
  images: string[];
  price: number | null; // legacy decimal — usar price_cents para cálculos
  price_cents: number | null;
  compare_at_price_cents: number | null;
  currency: string;
  affiliate_url: string | null;
  is_active: boolean;
  is_featured: boolean;
  sort_order: number;
  badge: string | null;
  rating: number | null;
  review_count: number;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  product_id: string;
  user_id: string | null;
  author_name: string;
  rating: number;
  body: string;
  is_seed: boolean;
  is_verified_purchase: boolean;
  locale: string;
  created_at: string;
}

/**
 * Vista admin: incluye campos privados (supplier, stripe, internal_ref).
 * NUNCA exponer este shape al cliente público.
 */
export interface AdminProduct extends Product {
  stripe_product_id: string | null;
  stripe_price_id: string | null;
  supplier_url: string | null;
  supplier_sku: string | null;
  supplier_notes: string | null;
  internal_ref: string | null;
  weight_grams: number | null;
}

/**
 * Item del carrito en el cliente (localStorage). Solo productos type='own'.
 */
export interface CartItem {
  product_id: string;
  slug: string;
  name: string;
  image: string | null;
  unit_price_cents: number;
  compare_at_price_cents?: number | null;
  currency: string;
  quantity: number;
}

/**
 * Item del carrito tal como se almacena en order_drafts.items y order_items
 * (con snapshots de supplier para fulfillment).
 */
export interface DraftItem {
  product_id: string;
  name: string;
  image: string | null;
  unit_price_cents: number;
  compare_at_price_cents?: number | null;
  quantity: number;
  supplier_url: string | null;
  supplier_sku: string | null;
}

export interface ShippingAddress {
  line1: string;
  line2?: string | null;
  city: string;
  region?: string | null;
  postal_code: string;
  country: string; // ISO 3166-1 alpha-2 (ES, FR, US…)
}

export type OrderStatus =
  | 'paid'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export type DraftStatus = 'draft' | 'converted' | 'expired' | 'cancelled';

export interface OrderDraft {
  id: string;
  user_id: string | null;
  email: string;
  locale: 'es' | 'en';
  items: DraftItem[];
  subtotal_cents: number;
  shipping_cents: number;
  tax_cents: number;
  total_cents: number;
  currency: string;
  shipping_address: ShippingAddress | null;
  stripe_session_id: string | null;
  status: DraftStatus;
  created_at: string;
  expires_at: string;
}

export interface Order {
  id: string;
  draft_id: string | null;
  user_id: string | null;
  email: string;
  phone: string | null;
  locale: 'es' | 'en';
  status: OrderStatus;
  subtotal_cents: number;
  shipping_cents: number;
  tax_cents: number;
  total_cents: number;
  currency: string;
  stripe_session_id: string;
  stripe_payment_intent_id: string | null;
  stripe_customer_id: string | null;
  shipping_name: string;
  shipping_address: ShippingAddress;
  tracking_number: string | null;
  tracking_url: string | null;
  tracking_carrier: string | null;
  supplier_order_ref: string | null;
  admin_notes: string | null;
  access_token: string;
  paid_at: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  name_snapshot: string;
  image_snapshot: string | null;
  unit_price_cents: number;
  quantity: number;
  line_total_cents: number;
  supplier_url_snapshot: string | null;
  supplier_sku_snapshot: string | null;
  created_at: string;
}

export interface OrderEvent {
  id: string;
  order_id: string;
  type: string;
  from_status: string | null;
  to_status: string | null;
  note: string | null;
  created_by: string | null;
  created_at: string;
}
