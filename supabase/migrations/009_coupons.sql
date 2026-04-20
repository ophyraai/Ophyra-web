-- Sistema de cupones.
-- Cada cupón vive en Stripe (source of truth del descuento) y se espeja aquí
-- con controles extra (uso máximo, mínimo de subtotal, expiración, código legible).

CREATE TABLE IF NOT EXISTS coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  type text NOT NULL CHECK (type IN ('percent', 'amount')),
  percent_off integer NULL CHECK (percent_off IS NULL OR (percent_off >= 1 AND percent_off <= 100)),
  amount_off_cents integer NULL CHECK (amount_off_cents IS NULL OR amount_off_cents > 0),
  stripe_coupon_id text NOT NULL,
  active boolean NOT NULL DEFAULT true,
  max_redemptions integer NULL CHECK (max_redemptions IS NULL OR max_redemptions > 0),
  times_redeemed integer NOT NULL DEFAULT 0,
  min_subtotal_cents integer NULL CHECK (min_subtotal_cents IS NULL OR min_subtotal_cents > 0),
  expires_at timestamptz NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  -- XOR: exactamente uno de percent_off o amount_off_cents
  CHECK (
    (type = 'percent' AND percent_off IS NOT NULL AND amount_off_cents IS NULL)
    OR
    (type = 'amount' AND amount_off_cents IS NOT NULL AND percent_off IS NULL)
  )
);

-- Lookup rápido por código (case-insensitive a través de storage en UPPERCASE)
CREATE UNIQUE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_active ON coupons(active) WHERE active;

-- Trigger updated_at
CREATE OR REPLACE FUNCTION set_coupons_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_coupons_updated_at ON coupons;
CREATE TRIGGER trg_coupons_updated_at
  BEFORE UPDATE ON coupons
  FOR EACH ROW
  EXECUTE FUNCTION set_coupons_updated_at();

-- Trazabilidad: qué cupón se usó en cada order draft
ALTER TABLE order_drafts
  ADD COLUMN IF NOT EXISTS coupon_id uuid NULL REFERENCES coupons(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS discount_cents integer NOT NULL DEFAULT 0;

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS coupon_id uuid NULL REFERENCES coupons(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS coupon_code text NULL,
  ADD COLUMN IF NOT EXISTS discount_cents integer NOT NULL DEFAULT 0;
