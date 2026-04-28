import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase/server';
import { sendEmail } from '@/lib/emails/send';
import { upsertProfile } from '@/lib/customer-profiles';
import WelcomeEmail, { getWelcomeSubject } from '@/lib/emails/templates/welcome';
import OrderConfirmationEmail, {
  getOrderConfirmationSubject,
} from '@/lib/emails/templates/order-confirmation';
import { markEventProcessed } from '@/lib/webhooks/idempotency';
import Stripe from 'stripe';
import type { DraftItem, ShippingAddress } from '@/types/marketplace';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://ophyra.com';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  let event: Stripe.Event;

  try {
    const body = await req.text();
    const sig = req.headers.get('stripe-signature')!;
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error('Stripe webhook signature verification failed:', err);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  // Idempotencia: Stripe reintenta los webhooks varias veces (~3 días).
  // Sin este guard las ramas downstream duplicarían side-effects
  // (ej. free_reports se incrementaba dos veces en cada retry).
  const fresh = await markEventProcessed(event.id, event.type);
  if (!fresh) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const isRenewal = session.metadata?.type === 'renewal';

      const isCartCheckout = session.metadata?.type === 'cart';

      if (isCartCheckout) {
        // =============================================
        // MARKETPLACE: convertir draft → order + items
        // =============================================
        const draftId = session.metadata?.draft_id;
        const locale = (session.metadata?.locale as 'es' | 'en') || 'es';

        if (!draftId) {
          console.error('Cart checkout without draft_id');
          return NextResponse.json({ error: 'Missing draft_id' }, { status: 400 });
        }

        // 1. Cargar el draft
        const { data: draft, error: draftErr } = await supabaseAdmin
          .from('order_drafts')
          .select('*')
          .eq('id', draftId)
          .maybeSingle();

        if (draftErr || !draft) {
          console.error('Draft not found:', draftId, draftErr);
          return NextResponse.json({ error: 'Draft not found' }, { status: 400 });
        }

        if (draft.status === 'converted') {
          // Ya procesado (defensa extra sobre la idempotencia de webhook_events)
          return NextResponse.json({ received: true, duplicate: true });
        }

        // 2. Extraer dirección de envío del session de Stripe
        const stripeShipping = session.collected_information?.shipping_details;
        const addr = stripeShipping?.address;
        const shippingAddress: ShippingAddress = {
          line1: addr?.line1 || '',
          line2: addr?.line2 || null,
          city: addr?.city || '',
          region: addr?.state || null,
          postal_code: addr?.postal_code || '',
          country: addr?.country || '',
        };
        const shippingName = stripeShipping?.name || draft.email.split('@')[0];
        const phone = session.customer_details?.phone ?? null;

        // 3. Crear order
        const now = new Date().toISOString();
        const { data: order, error: orderErr } = await supabaseAdmin
          .from('orders')
          .insert({
            draft_id: draft.id,
            user_id: draft.user_id,
            email: draft.email,
            phone,
            locale,
            status: 'paid',
            subtotal_cents: draft.subtotal_cents,
            shipping_cents: draft.shipping_cents,
            tax_cents: draft.tax_cents || 0,
            discount_cents: draft.discount_cents || 0,
            coupon_id: draft.coupon_id || null,
            coupon_code: session.metadata?.coupon_code || null,
            total_cents: draft.total_cents,
            currency: draft.currency,
            stripe_session_id: session.id,
            stripe_payment_intent_id:
              typeof session.payment_intent === 'string'
                ? session.payment_intent
                : null,
            stripe_customer_id:
              typeof session.customer === 'string' ? session.customer : null,
            shipping_name: shippingName,
            shipping_address: shippingAddress,
            paid_at: now,
          })
          .select('id')
          .single();

        if (orderErr || !order) {
          console.error('Order insert failed:', orderErr);
          return NextResponse.json({ error: 'Order insert failed' }, { status: 500 });
        }

        // 4. Crear order_items con snapshots
        const draftItems = (draft.items || []) as DraftItem[];
        const orderItems = draftItems.map((item) => ({
          order_id: order.id,
          product_id: item.product_id,
          name_snapshot: item.name,
          image_snapshot: item.image || null,
          unit_price_cents: item.unit_price_cents,
          quantity: item.quantity,
          line_total_cents: item.unit_price_cents * item.quantity,
          supplier_url_snapshot: item.supplier_url || null,
          supplier_sku_snapshot: item.supplier_sku || null,
        }));

        const { error: itemsErr } = await supabaseAdmin
          .from('order_items')
          .insert(orderItems);

        if (itemsErr) {
          console.error('Order items insert failed:', itemsErr);
        }

        // 5. Marcar draft como convertido + incrementar redenciones del cupón
        await supabaseAdmin
          .from('order_drafts')
          .update({ status: 'converted' })
          .eq('id', draft.id);

        if (draft.coupon_id) {
          // RPC-less increment: leemos y sumamos. Idempotencia de webhook
          // garantiza que esto solo corre una vez por pedido.
          const { data: curr } = await supabaseAdmin
            .from('coupons')
            .select('times_redeemed')
            .eq('id', draft.coupon_id)
            .maybeSingle();
          if (curr) {
            await supabaseAdmin
              .from('coupons')
              .update({ times_redeemed: (curr.times_redeemed ?? 0) + 1 })
              .eq('id', draft.coupon_id);
          }
        }

        // 6. Insertar order_event
        await supabaseAdmin.from('order_events').insert({
          order_id: order.id,
          type: 'created',
          to_status: 'paid',
          note: `Pedido creado desde draft ${draft.id}`,
          created_by: 'system',
        });

        // 6.5 Update customer profile (orders + LTV)
        upsertProfile(draft.email, {
          total_orders_increment: 1,
          lifetime_value_increment_cents: draft.total_cents,
        }).catch(() => {});

        // 7. Enviar email de confirmación
        try {
          const shortId = order.id.slice(0, 8).toUpperCase();
          const orderUrl = `${BASE_URL}/dashboard/account/orders/${order.id}`;

          // Email dedup: usamos template + order_id para evitar duplicados.
          // El sendEmail actual usa subscription_id; pasamos el order.id como
          // subscriptionId para dedup — funciona porque es un UUID único.
          await sendEmail({
            template: `order-confirmation-${order.id}`,
            to: draft.email,
            subscriptionId: order.id,
            subject: getOrderConfirmationSubject(locale, shortId),
            react: OrderConfirmationEmail({
              locale,
              orderId: order.id,
              items: draftItems.map((i) => ({
                name: i.name,
                quantity: i.quantity,
                unit_price_cents: i.unit_price_cents,
              })),
              subtotalCents: draft.subtotal_cents,
              shippingCents: draft.shipping_cents,
              totalCents: draft.total_cents,
              currency: draft.currency,
              shippingName,
              shippingCity: shippingAddress.city,
              shippingCountry: shippingAddress.country,
              orderUrl,
            }),
          });
        } catch (emailErr) {
          console.error('Order confirmation email failed:', emailErr);
          // No falla el webhook por un email — el pedido ya está creado
        }
      } else if (isRenewal) {
        // Handle renewal payment
        const email = session.metadata?.email;
        const subscriptionId = session.metadata?.subscriptionId;
        const locale = (session.metadata?.locale as 'es' | 'en') || 'es';

        if (email && subscriptionId) {
          const now = new Date();
          const followUpDate = new Date();
          followUpDate.setDate(followUpDate.getDate() + 30);

          const { data: existingSub } = await supabaseAdmin
            .from('user_subscriptions')
            .select('free_reports, renewal_count')
            .eq('id', subscriptionId)
            .single();

          await supabaseAdmin
            .from('user_subscriptions')
            .update({
              started_at: now.toISOString(),
              follow_up_date: followUpDate.toISOString(),
              free_reports: (existingSub?.free_reports ?? 0) + 1,
              renewal_count: (existingSub?.renewal_count ?? 0) + 1,
              renewal_offer_expires: null,
              updated_at: now.toISOString(),
            })
            .eq('id', subscriptionId);

          // Get user name for welcome email
          const { data: diagnosis } = await supabaseAdmin
            .from('diagnoses')
            .select('answers')
            .eq('email', email)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          const name = diagnosis?.answers?.name || email.split('@')[0];

          await sendEmail({
            template: 'welcome-renewal',
            to: email,
            subscriptionId,
            subject: getWelcomeSubject(locale),
            react: WelcomeEmail({ name, locale, dashboardUrl: `${BASE_URL}/dashboard` }),
          });
        }
      } else {
        // Handle initial purchase
        const diagnosisId = session.metadata?.diagnosisId;

        if (diagnosisId) {
          await supabaseAdmin
            .from('diagnoses')
            .update({
              is_paid: true,
              stripe_session_id: session.id,
            })
            .eq('id', diagnosisId);

          await supabaseAdmin
            .from('payments')
            .update({ status: 'completed' })
            .eq('stripe_session_id', session.id);

          // Create or update user subscription with 30-day follow-up + 1 free report
          const email = session.customer_email || session.metadata?.email;
          const locale = (session.metadata?.locale as 'es' | 'en') || 'es';

          if (email) {
            const now = new Date();
            const followUpDate = new Date();
            followUpDate.setDate(followUpDate.getDate() + 30);

            // Check if subscription already exists for this email
            const { data: existingSub } = await supabaseAdmin
              .from('user_subscriptions')
              .select('id, free_reports')
              .eq('email', email)
              .eq('is_active', true)
              .single();

            let subId: string;

            if (existingSub) {
              subId = existingSub.id;
              await supabaseAdmin
                .from('user_subscriptions')
                .update({
                  plan: 'premium',
                  follow_up_date: followUpDate.toISOString(),
                  free_reports: (existingSub.free_reports ?? 0) + 1,
                  started_at: now.toISOString(),
                  updated_at: now.toISOString(),
                })
                .eq('id', existingSub.id);
            } else {
              const { data: newSub } = await supabaseAdmin
                .from('user_subscriptions')
                .insert({
                  email,
                  plan: 'premium',
                  stripe_customer_id: typeof session.customer === 'string' ? session.customer : null,
                  follow_up_date: followUpDate.toISOString(),
                  is_active: true,
                  free_reports: 1,
                  started_at: now.toISOString(),
                })
                .select('id')
                .single();
              subId = newSub?.id;
            }

            // Send welcome email
            if (subId) {
              const { data: diagnosis } = await supabaseAdmin
                .from('diagnoses')
                .select('answers')
                .eq('id', diagnosisId)
                .single();

              const name = diagnosis?.answers?.name || email.split('@')[0];

              await sendEmail({
                template: 'welcome',
                to: email,
                subscriptionId: subId,
                subject: getWelcomeSubject(locale),
                react: WelcomeEmail({ name, locale, dashboardUrl: `${BASE_URL}/dashboard` }),
              });
            }
          }
        }
      }
    }
  } catch (err) {
    console.error('Stripe webhook handler error:', err);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}
