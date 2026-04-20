import { stripe } from '@/lib/stripe';

/**
 * Helpers para cupones en Stripe.
 *
 * Decisión: los cupones son inmutables una vez creados en Stripe (igual que los
 * prices). Si el admin quiere cambiar un % o un importe, lo correcto es crear
 * un cupón nuevo. Aquí solo ofrecemos crear y borrar (soft-delete en BD).
 */

interface CreateResult {
  stripe_coupon_id: string;
}

export async function createStripeCoupon(params: {
  code: string;
  type: 'percent' | 'amount';
  percentOff?: number | null;
  amountOffCents?: number | null;
  currency?: string;
  maxRedemptions?: number | null;
  expiresAt?: Date | null;
}): Promise<CreateResult> {
  const {
    code,
    type,
    percentOff,
    amountOffCents,
    currency = 'eur',
    maxRedemptions,
    expiresAt,
  } = params;

  const payload: import('stripe').Stripe.CouponCreateParams = {
    // Usamos `id` para que el admin vea el mismo código en Stripe dashboard.
    id: code,
    name: code,
    duration: 'once',
  };

  if (type === 'percent' && percentOff != null) {
    payload.percent_off = percentOff;
  } else if (type === 'amount' && amountOffCents != null) {
    payload.amount_off = amountOffCents;
    payload.currency = currency;
  } else {
    throw new Error('Invalid coupon params: specify percentOff or amountOffCents');
  }

  if (maxRedemptions != null) payload.max_redemptions = maxRedemptions;
  if (expiresAt) {
    payload.redeem_by = Math.floor(expiresAt.getTime() / 1000);
  }

  const coupon = await stripe.coupons.create(payload);
  return { stripe_coupon_id: coupon.id };
}

export async function deleteStripeCoupon(stripeCouponId: string): Promise<void> {
  try {
    await stripe.coupons.del(stripeCouponId);
  } catch (err) {
    // Si ya no existe, no bloqueante
    console.error(`deleteStripeCoupon failed for ${stripeCouponId}:`, err);
  }
}
