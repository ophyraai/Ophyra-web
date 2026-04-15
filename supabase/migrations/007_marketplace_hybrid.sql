-- ============================================
-- Migration 007: Marketplace híbrido (afiliados + marca propia)
-- ============================================
-- Convierte el shop de afiliación-only a un marketplace híbrido:
--   - Productos de afiliación (existentes, badge Recomendación)
--   - Productos marca propia Ophyra (físicos, dropshipping, Stripe Checkout)
-- Añade carrito (order_drafts), pedidos (orders + order_items),
-- audit log (order_events), idempotencia de webhooks (webhook_events),
-- y storage bucket para imágenes de producto.

-- ============================================
-- 1. Extender tabla products
-- ============================================

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS type text NOT NULL DEFAULT 'affiliate'
    CHECK (type IN ('affiliate','own')),
  ADD COLUMN IF NOT EXISTS slug text UNIQUE,
  ADD COLUMN IF NOT EXISTS short_description text,
  ADD COLUMN IF NOT EXISTS long_description text,
  ADD COLUMN IF NOT EXISTS images jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS price_cents int,
  ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'eur',
  ADD COLUMN IF NOT EXISTS stripe_product_id text,
  ADD COLUMN IF NOT EXISTS stripe_price_id text,
  ADD COLUMN IF NOT EXISTS supplier_url text,         -- privado, dropshipping
  ADD COLUMN IF NOT EXISTS supplier_sku text,         -- privado
  ADD COLUMN IF NOT EXISTS supplier_notes text,       -- privado
  ADD COLUMN IF NOT EXISTS internal_ref text,         -- privado, SKU interno
  ADD COLUMN IF NOT EXISTS weight_grams int;

-- Backfill price_cents desde decimal price legacy
UPDATE products
SET price_cents = ROUND(price * 100)::int
WHERE price IS NOT NULL AND price_cents IS NULL;

-- Constraint: productos own DEBEN tener stripe_price_id y price_cents
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'products_own_requires_stripe'
  ) THEN
    ALTER TABLE products ADD CONSTRAINT products_own_requires_stripe
      CHECK (
        type = 'affiliate'
        OR (stripe_price_id IS NOT NULL AND price_cents IS NOT NULL)
      );
  END IF;
END $$;

-- Constraint: productos affiliate DEBEN tener affiliate_url
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'products_affiliate_requires_url'
  ) THEN
    ALTER TABLE products ADD CONSTRAINT products_affiliate_requires_url
      CHECK (
        type = 'own'
        OR affiliate_url IS NOT NULL
      );
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_products_type ON products(type);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);

-- ============================================
-- 2. order_drafts: pre-checkout (resuelve límite metadata Stripe)
-- ============================================

CREATE TABLE IF NOT EXISTS order_drafts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  email text NOT NULL,
  locale text NOT NULL DEFAULT 'es',
  items jsonb NOT NULL,                  -- [{product_id, qty, unit_price_cents, name, image, supplier_url, supplier_sku}]
  subtotal_cents int NOT NULL,
  shipping_cents int NOT NULL DEFAULT 0,
  tax_cents int NOT NULL DEFAULT 0,
  total_cents int NOT NULL,
  currency text NOT NULL DEFAULT 'eur',
  shipping_address jsonb,
  stripe_session_id text UNIQUE,
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft','converted','expired','cancelled')),
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '2 hours')
);

CREATE INDEX IF NOT EXISTS idx_order_drafts_session ON order_drafts(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_order_drafts_expires ON order_drafts(expires_at) WHERE status = 'draft';
CREATE INDEX IF NOT EXISTS idx_order_drafts_user ON order_drafts(user_id);

-- ============================================
-- 3. orders: registro post-pago
-- ============================================

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  draft_id uuid REFERENCES order_drafts(id),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  email text NOT NULL,
  phone text,
  locale text NOT NULL DEFAULT 'es',
  status text NOT NULL DEFAULT 'paid'
    CHECK (status IN ('paid','processing','shipped','delivered','cancelled','refunded')),
  subtotal_cents int NOT NULL,
  shipping_cents int NOT NULL,
  tax_cents int NOT NULL DEFAULT 0,
  total_cents int NOT NULL,
  currency text NOT NULL DEFAULT 'eur',
  stripe_session_id text UNIQUE NOT NULL,
  stripe_payment_intent_id text,
  stripe_customer_id text,
  shipping_name text NOT NULL,
  shipping_address jsonb NOT NULL,       -- {line1, line2, city, region, postal_code, country}
  tracking_number text,
  tracking_url text,
  tracking_carrier text,
  supplier_order_ref text,               -- referencia interna ander cuando compra al proveedor
  admin_notes text,
  access_token text UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(24), 'base64'),
  paid_at timestamptz,
  shipped_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(email);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);

-- ============================================
-- 4. order_items: snapshot inmutable de líneas
-- ============================================

CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  name_snapshot text NOT NULL,
  image_snapshot text,
  unit_price_cents int NOT NULL,
  quantity int NOT NULL CHECK (quantity > 0),
  line_total_cents int NOT NULL,
  supplier_url_snapshot text,
  supplier_sku_snapshot text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items(product_id);

-- ============================================
-- 5. order_events: audit log de cambios de estado
-- ============================================

CREATE TABLE IF NOT EXISTS order_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  type text NOT NULL,                    -- created|paid|status_changed|tracking_added|refunded|note
  from_status text,
  to_status text,
  note text,
  created_by text,                       -- email admin o 'system'
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_order_events_order ON order_events(order_id);

-- ============================================
-- 6. webhook_events: idempotencia para Stripe webhook retries
-- ============================================

CREATE TABLE IF NOT EXISTS webhook_events (
  id text PRIMARY KEY,                   -- Stripe event id (evt_xxx)
  type text NOT NULL,
  processed_at timestamptz DEFAULT now()
);

-- ============================================
-- 7. Row Level Security
-- ============================================

ALTER TABLE order_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;

-- orders: el usuario lee los suyos por user_id O por email
DROP POLICY IF EXISTS "Users read own orders" ON orders;
CREATE POLICY "Users read own orders" ON orders
  FOR SELECT USING (
    (user_id IS NOT NULL AND user_id = auth.uid())
    OR (auth.email() IS NOT NULL AND email = auth.email())
  );
DROP POLICY IF EXISTS "Service role all orders" ON orders;
CREATE POLICY "Service role all orders" ON orders
  FOR ALL USING (auth.role() = 'service_role');

-- order_items: el usuario lee items de pedidos suyos
DROP POLICY IF EXISTS "Users read own order items" ON order_items;
CREATE POLICY "Users read own order items" ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_items.order_id
        AND ((o.user_id IS NOT NULL AND o.user_id = auth.uid())
             OR (auth.email() IS NOT NULL AND o.email = auth.email()))
    )
  );
DROP POLICY IF EXISTS "Service role all order items" ON order_items;
CREATE POLICY "Service role all order items" ON order_items
  FOR ALL USING (auth.role() = 'service_role');

-- order_drafts: solo service role (el cliente nunca lee drafts directamente)
DROP POLICY IF EXISTS "Service role all drafts" ON order_drafts;
CREATE POLICY "Service role all drafts" ON order_drafts
  FOR ALL USING (auth.role() = 'service_role');

-- order_events: solo service role
DROP POLICY IF EXISTS "Service role all events" ON order_events;
CREATE POLICY "Service role all events" ON order_events
  FOR ALL USING (auth.role() = 'service_role');

-- webhook_events: solo service role
DROP POLICY IF EXISTS "Service role all webhook events" ON webhook_events;
CREATE POLICY "Service role all webhook events" ON webhook_events
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================
-- 8. Storage bucket: product-images
-- ============================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public read product-images" ON storage.objects;
CREATE POLICY "Public read product-images" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Service role write product-images" ON storage.objects;
CREATE POLICY "Service role write product-images" ON storage.objects
  FOR ALL USING (bucket_id = 'product-images' AND auth.role() = 'service_role');

-- ============================================
-- 9. Trigger reutilizable set_updated_at
-- ============================================

CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS orders_updated_at ON orders;
CREATE TRIGGER orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS products_updated_at ON products;
CREATE TRIGGER products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
