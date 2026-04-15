import { NextResponse } from 'next/server';
import { z } from 'zod';
import { stripe } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth/admin';
import { orderRefundSchema } from '@/lib/validation/order';

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin();
  if ('response' in auth) return auth.response;

  const { id } = await ctx.params;
  const { user } = auth;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = orderRefundSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: z.treeifyError(parsed.error) },
      { status: 400 },
    );
  }
  const { amount_cents, reason, note } = parsed.data;

  // Cargar pedido
  const { data: order } = await supabaseAdmin
    .from('orders')
    .select('id, status, total_cents, stripe_payment_intent_id')
    .eq('id', id)
    .maybeSingle();

  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  if (!order.stripe_payment_intent_id) {
    return NextResponse.json(
      { error: 'No hay payment_intent asociado — no se puede reembolsar' },
      { status: 400 },
    );
  }

  if (['refunded', 'cancelled'].includes(order.status)) {
    return NextResponse.json(
      { error: `El pedido ya está en estado "${order.status}"` },
      { status: 409 },
    );
  }

  const amount = amount_cents ?? order.total_cents;
  if (amount > order.total_cents) {
    return NextResponse.json(
      { error: 'El importe excede el total del pedido' },
      { status: 400 },
    );
  }

  // Crear refund en Stripe
  let refund;
  try {
    // Stripe solo acepta estos reasons nativos; "other" lo omitimos
    // (Stripe guardará la info en el metadata en su lugar).
    const stripeReason =
      reason === 'other' ? undefined : reason;

    refund = await stripe.refunds.create({
      payment_intent: order.stripe_payment_intent_id,
      amount,
      ...(stripeReason && { reason: stripeReason }),
      metadata: {
        order_id: id,
        admin: user.email || '',
        reason,
      },
    });
  } catch (err) {
    console.error('Stripe refund failed:', err);
    return NextResponse.json(
      { error: 'Stripe refund failed: ' + (err as Error).message },
      { status: 502 },
    );
  }

  // Si es reembolso total, marcar status=refunded
  const isFullRefund = amount === order.total_cents;
  const newStatus = isFullRefund ? 'refunded' : order.status;

  // Nota: el amount y timestamp del refund quedan registrados en order_events
  // (insert más abajo) — no tenemos columnas dedicadas en orders.
  await supabaseAdmin
    .from('orders')
    .update({ status: newStatus })
    .eq('id', id);

  await supabaseAdmin.from('order_events').insert({
    order_id: id,
    type: 'refunded',
    from_status: order.status,
    to_status: newStatus,
    note: note || `Refund ${isFullRefund ? 'total' : 'parcial'}: ${(amount / 100).toFixed(2)}€ (${reason})`,
    created_by: user.email || 'admin',
  });

  return NextResponse.json({
    ok: true,
    refund_id: refund.id,
    amount,
    status: newStatus,
  });
}
