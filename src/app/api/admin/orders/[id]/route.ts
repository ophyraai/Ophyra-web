import { NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth/admin';
import { orderUpdateSchema } from '@/lib/validation/order';
import { sendEmail } from '@/lib/emails/send';
import OrderShippedEmail, {
  getOrderShippedSubject,
} from '@/lib/emails/templates/order-shipped';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://ophyra.com';

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin();
  if ('response' in auth) return auth.response;

  const { id } = await ctx.params;

  const [orderRes, itemsRes, eventsRes] = await Promise.all([
    supabaseAdmin.from('orders').select('*').eq('id', id).maybeSingle(),
    supabaseAdmin
      .from('order_items')
      .select('*')
      .eq('order_id', id)
      .order('created_at'),
    supabaseAdmin
      .from('order_events')
      .select('*')
      .eq('order_id', id)
      .order('created_at', { ascending: false }),
  ]);

  if (!orderRes.data) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({
    order: orderRes.data,
    items: itemsRes.data || [],
    events: eventsRes.data || [],
  });
}

export async function PATCH(
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

  const parsed = orderUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: z.treeifyError(parsed.error) },
      { status: 400 },
    );
  }
  const data = parsed.data;

  // Cargar pedido actual para detectar transiciones
  const { data: current } = await supabaseAdmin
    .from('orders')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (!current) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  // Construir payload de update — solo campos que vinieron
  const updatePayload: Record<string, unknown> = {};
  if (data.status !== undefined) updatePayload.status = data.status;
  if (data.tracking_number !== undefined)
    updatePayload.tracking_number = data.tracking_number;
  if (data.tracking_url !== undefined)
    updatePayload.tracking_url = data.tracking_url;
  if (data.tracking_carrier !== undefined)
    updatePayload.tracking_carrier = data.tracking_carrier;
  if (data.admin_notes !== undefined) updatePayload.admin_notes = data.admin_notes;

  // Timestamps asociados a transiciones de status
  const now = new Date().toISOString();
  if (data.status === 'shipped' && current.status !== 'shipped') {
    updatePayload.shipped_at = now;
  }
  if (data.status === 'delivered' && current.status !== 'delivered') {
    updatePayload.delivered_at = now;
  }

  const { error: updateErr } = await supabaseAdmin
    .from('orders')
    .update(updatePayload)
    .eq('id', id);

  if (updateErr) {
    console.error('Order update failed:', updateErr);
    return NextResponse.json(
      { error: 'Update failed: ' + updateErr.message },
      { status: 500 },
    );
  }

  // Registrar evento si cambió el status
  if (data.status && data.status !== current.status) {
    await supabaseAdmin.from('order_events').insert({
      order_id: id,
      type: 'status_changed',
      from_status: current.status,
      to_status: data.status,
      note: data.admin_notes || null,
      created_by: user.email || 'admin',
    });
  } else if (data.tracking_number && !current.tracking_number) {
    // Se añadió tracking sin cambiar status explícitamente
    await supabaseAdmin.from('order_events').insert({
      order_id: id,
      type: 'tracking_added',
      note: `Tracking: ${data.tracking_number}`,
      created_by: user.email || 'admin',
    });
  }

  // Enviar email de envío si:
  //  - se pasa a status shipped, Y
  //  - hay tracking (actual o nuevo)
  const finalTracking = data.tracking_number ?? current.tracking_number;
  const finalStatus = data.status ?? current.status;
  const transitioningToShipped =
    data.status === 'shipped' && current.status !== 'shipped';

  if (transitioningToShipped && finalTracking) {
    try {
      const shortId = id.slice(0, 8).toUpperCase();
      const locale = (current.locale as 'es' | 'en') || 'es';
      const orderUrl = `${BASE_URL}/dashboard/account/orders/${id}`;

      await sendEmail({
        template: `order-shipped-${id}`,
        to: current.email,
        subscriptionId: id,
        subject: getOrderShippedSubject(locale, shortId),
        react: OrderShippedEmail({
          locale,
          orderId: id,
          shippingName: current.shipping_name || current.email.split('@')[0],
          trackingNumber: finalTracking,
          trackingUrl: data.tracking_url ?? current.tracking_url,
          trackingCarrier: data.tracking_carrier ?? current.tracking_carrier,
          orderUrl,
        }),
      });
    } catch (emailErr) {
      console.error('order-shipped email failed:', emailErr);
      // No romper la actualización por un fallo de email
    }
  }

  return NextResponse.json({ ok: true, status: finalStatus });
}
