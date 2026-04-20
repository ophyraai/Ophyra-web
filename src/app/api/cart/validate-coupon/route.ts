import { NextResponse } from 'next/server';
import { z } from 'zod';
import { couponValidateSchema } from '@/lib/validation/coupon';
import { validateCouponCode } from '@/lib/coupons/validate';
import { checkRateLimit, couponLimiter, getClientIp } from '@/lib/security/rate-limit';

export async function POST(req: Request) {
  const rl = await checkRateLimit(couponLimiter, getClientIp(req));
  if (rl) return rl;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = couponValidateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: z.treeifyError(parsed.error) },
      { status: 400 },
    );
  }

  const { code, subtotal_cents } = parsed.data;
  const result = await validateCouponCode(code, subtotal_cents);

  if (!result.ok) {
    return NextResponse.json(
      {
        valid: false,
        error: result.error.message,
        code: result.error.code,
      },
      { status: 200 },
    );
  }

  return NextResponse.json({
    valid: true,
    code: result.coupon.code,
    type: result.coupon.type,
    percent_off: result.coupon.percent_off,
    amount_off_cents: result.coupon.amount_off_cents,
    discount_cents: result.coupon.discount_cents,
  });
}
