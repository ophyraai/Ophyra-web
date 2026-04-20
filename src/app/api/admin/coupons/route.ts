import { NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth/admin';
import { couponCreateSchema } from '@/lib/validation/coupon';
import { createStripeCoupon, deleteStripeCoupon } from '@/lib/stripe/coupons';

export async function GET() {
  const auth = await requireAdmin();
  if ('response' in auth) return auth.response;

  const { data, error } = await supabaseAdmin
    .from('coupons')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json(
      { error: 'Failed to fetch coupons' },
      { status: 500 },
    );
  }

  return NextResponse.json(data || []);
}

export async function POST(req: Request) {
  const auth = await requireAdmin();
  if ('response' in auth) return auth.response;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = couponCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: z.treeifyError(parsed.error) },
      { status: 400 },
    );
  }
  const data = parsed.data;

  // Código ya existe en BD?
  const { data: existing } = await supabaseAdmin
    .from('coupons')
    .select('id')
    .eq('code', data.code)
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      { error: `El código "${data.code}" ya está en uso.` },
      { status: 409 },
    );
  }

  // Crear primero en Stripe, luego en BD (compensamos si DB falla)
  let stripeCouponId: string;
  try {
    const result = await createStripeCoupon({
      code: data.code,
      type: data.type,
      percentOff: data.type === 'percent' ? data.percent_off : null,
      amountOffCents: data.type === 'amount' ? data.amount_off_cents : null,
      currency: 'eur',
      maxRedemptions: data.max_redemptions ?? null,
      expiresAt: data.expires_at ? new Date(data.expires_at) : null,
    });
    stripeCouponId = result.stripe_coupon_id;
  } catch (err) {
    console.error('Stripe coupon creation failed:', err);
    return NextResponse.json(
      { error: 'Stripe coupon creation failed: ' + (err as Error).message },
      { status: 502 },
    );
  }

  const insertPayload = {
    code: data.code,
    type: data.type,
    percent_off: data.type === 'percent' ? data.percent_off : null,
    amount_off_cents: data.type === 'amount' ? data.amount_off_cents : null,
    stripe_coupon_id: stripeCouponId,
    active: true,
    max_redemptions: data.max_redemptions ?? null,
    times_redeemed: 0,
    min_subtotal_cents: data.min_subtotal_cents ?? null,
    expires_at: data.expires_at ?? null,
  };

  const { data: created, error } = await supabaseAdmin
    .from('coupons')
    .insert(insertPayload)
    .select('*')
    .single();

  if (error) {
    console.error('Coupon insert failed:', error);
    await deleteStripeCoupon(stripeCouponId).catch(() => {});
    return NextResponse.json(
      { error: 'Database insert failed: ' + error.message },
      { status: 500 },
    );
  }

  return NextResponse.json(created, { status: 201 });
}
