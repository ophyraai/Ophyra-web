-- Flag para destacar productos en la homepage.
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_products_featured
  ON products(is_featured, sort_order)
  WHERE is_featured AND is_active;
