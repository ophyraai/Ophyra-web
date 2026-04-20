-- Precio de referencia (tachado) para productos con oferta.
-- Display-only: el cobro real sigue siendo price_cents via stripe_price_id.
-- NULL = sin oferta. Debe ser > price_cents para que el badge -XX% tenga sentido
-- (la app lo valida, pero no ponemos CHECK a nivel DB para permitir configuración
-- transitoria — p.ej. bajar el precio primero y luego setear compare_at).

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS compare_at_price_cents INTEGER NULL
  CHECK (compare_at_price_cents IS NULL OR compare_at_price_cents > 0);

COMMENT ON COLUMN products.compare_at_price_cents IS
  'Precio PVP/anterior tachado. Display-only, no afecta el cobro. NULL = sin oferta.';
