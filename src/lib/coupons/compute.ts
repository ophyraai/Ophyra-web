import type { AppliedCoupon } from '@/context/CartContext';

/**
 * Recalcula el discount_cents contra un subtotal dado.
 * Útil en el cliente cuando el subtotal cambia (qty updates) y el cupón
 * ya está aplicado — el server es el source of truth (revalida al checkout).
 */
export function computeDiscountCents(
  coupon: AppliedCoupon,
  subtotalCents: number,
): number {
  if (coupon.type === 'percent' && coupon.percent_off != null) {
    return Math.floor((subtotalCents * coupon.percent_off) / 100);
  }
  if (coupon.type === 'amount' && coupon.amount_off_cents != null) {
    return Math.min(coupon.amount_off_cents, subtotalCents);
  }
  return 0;
}
