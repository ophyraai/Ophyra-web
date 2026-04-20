import { supabaseAdmin } from '@/lib/supabase/server';

export interface ValidatedCoupon {
  id: string;
  code: string;
  stripe_coupon_id: string;
  type: 'percent' | 'amount';
  percent_off: number | null;
  amount_off_cents: number | null;
  discount_cents: number;
}

export interface CouponValidationError {
  code:
    | 'NOT_FOUND'
    | 'INACTIVE'
    | 'EXPIRED'
    | 'MAX_REDEEMED'
    | 'MIN_SUBTOTAL'
    | 'INVALID';
  message: string;
  min_subtotal_cents?: number;
}

/**
 * Valida un código de cupón contra un subtotal.
 * Devuelve `{ coupon, discount_cents }` o `{ error }`.
 *
 * IMPORTANTE: el descuento se calcula sobre el subtotal (sin envío).
 * Si amount_off > subtotal, el descuento queda capped al subtotal para que
 * no salga negativo en el checkout.
 */
export async function validateCouponCode(
  codeUpper: string,
  subtotalCents: number,
): Promise<
  | { ok: true; coupon: ValidatedCoupon }
  | { ok: false; error: CouponValidationError }
> {
  const { data, error } = await supabaseAdmin
    .from('coupons')
    .select(
      'id, code, stripe_coupon_id, type, percent_off, amount_off_cents, active, max_redemptions, times_redeemed, min_subtotal_cents, expires_at',
    )
    .eq('code', codeUpper)
    .maybeSingle();

  if (error || !data) {
    return {
      ok: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Cupón no encontrado',
      },
    };
  }

  if (!data.active) {
    return {
      ok: false,
      error: { code: 'INACTIVE', message: 'Este cupón ya no está disponible' },
    };
  }

  if (data.expires_at && new Date(data.expires_at).getTime() < Date.now()) {
    return {
      ok: false,
      error: { code: 'EXPIRED', message: 'Este cupón ha expirado' },
    };
  }

  if (
    data.max_redemptions != null &&
    data.times_redeemed >= data.max_redemptions
  ) {
    return {
      ok: false,
      error: {
        code: 'MAX_REDEEMED',
        message: 'Este cupón ha alcanzado el límite de usos',
      },
    };
  }

  if (
    data.min_subtotal_cents != null &&
    subtotalCents < data.min_subtotal_cents
  ) {
    return {
      ok: false,
      error: {
        code: 'MIN_SUBTOTAL',
        message: `Este cupón requiere un subtotal mínimo de ${(data.min_subtotal_cents / 100).toFixed(2)}€`,
        min_subtotal_cents: data.min_subtotal_cents,
      },
    };
  }

  let discountCents = 0;
  if (data.type === 'percent' && data.percent_off != null) {
    discountCents = Math.floor((subtotalCents * data.percent_off) / 100);
  } else if (data.type === 'amount' && data.amount_off_cents != null) {
    discountCents = Math.min(data.amount_off_cents, subtotalCents);
  } else {
    return {
      ok: false,
      error: { code: 'INVALID', message: 'Cupón mal configurado' },
    };
  }

  return {
    ok: true,
    coupon: {
      id: data.id,
      code: data.code,
      stripe_coupon_id: data.stripe_coupon_id,
      type: data.type,
      percent_off: data.percent_off,
      amount_off_cents: data.amount_off_cents,
      discount_cents: discountCents,
    },
  };
}
