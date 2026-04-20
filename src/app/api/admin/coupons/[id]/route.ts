import { NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth/admin';
import { couponUpdateSchema } from '@/lib/validation/coupon';
import { deleteStripeCoupon } from '@/lib/stripe/coupons';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_req: Request, ctx: RouteContext) {
  const auth = await requireAdmin();
  if ('response' in auth) return auth.response;

  const { id } = await ctx.params;
  const { data, error } = await supabaseAdmin
    .from('coupons')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json(data);
}

export async function PATCH(req: Request, ctx: RouteContext) {
  const auth = await requireAdmin();
  if ('response' in auth) return auth.response;

  const { id } = await ctx.params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = couponUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: z.treeifyError(parsed.error) },
      { status: 400 },
    );
  }

  const updates: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(parsed.data)) {
    if (v !== undefined) updates[k] = v;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No changes' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('coupons')
    .update(updates)
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    return NextResponse.json(
      { error: 'Update failed: ' + error.message },
      { status: 500 },
    );
  }

  return NextResponse.json(data);
}

export async function DELETE(_req: Request, ctx: RouteContext) {
  const auth = await requireAdmin();
  if ('response' in auth) return auth.response;

  const { id } = await ctx.params;

  const { data: coupon, error: loadErr } = await supabaseAdmin
    .from('coupons')
    .select('id, stripe_coupon_id, times_redeemed')
    .eq('id', id)
    .maybeSingle();

  if (loadErr || !coupon) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  // Soft-delete: marcar inactivo. Preservamos el registro para trazabilidad
  // de órdenes que lo usaron. Archivamos también en Stripe.
  const { error: updErr } = await supabaseAdmin
    .from('coupons')
    .update({ active: false })
    .eq('id', id);

  if (updErr) {
    return NextResponse.json(
      { error: 'Delete failed: ' + updErr.message },
      { status: 500 },
    );
  }

  if (coupon.stripe_coupon_id) {
    await deleteStripeCoupon(coupon.stripe_coupon_id).catch(() => {});
  }

  return NextResponse.json({ ok: true });
}
