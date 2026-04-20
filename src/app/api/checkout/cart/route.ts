import { NextResponse } from 'next/server';
import { stripe, STRIPE_TAX_ENABLED } from '@/lib/stripe';
import { calculateShipping, SHIPPING_ZONES } from '@/lib/shipping';
import { supabaseAdmin } from '@/lib/supabase/server';
import { createSupabaseServer } from '@/lib/supabase/server';
import { cartCheckoutSchema } from '@/lib/validation/product';
import { validateCouponCode } from '@/lib/coupons/validate';
import type { DraftItem } from '@/types/marketplace';
import { z } from 'zod';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function POST(req: Request) {
  // 1. Auth: el checkout requiere login (v1 sin guest checkout)
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: 'Debes iniciar sesión para pagar.' },
      { status: 401 },
    );
  }

  // 2. Parse + validar body con Zod
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = cartCheckoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: z.treeifyError(parsed.error) },
      { status: 400 },
    );
  }
  const { items, locale, shipping_country, coupon_code } = parsed.data;

  // 3. Verificar productos: existen, activos, type=own, precio no cambió
  const productIds = items.map((i) => i.product_id);
  const { data: products, error: productsError } = await supabaseAdmin
    .from('products')
    .select(
      'id, type, name, slug, image_url, images, price_cents, compare_at_price_cents, currency, stripe_price_id, supplier_url, supplier_sku, is_active',
    )
    .in('id', productIds);

  if (productsError || !products) {
    return NextResponse.json(
      { error: 'Error al verificar productos' },
      { status: 500 },
    );
  }

  const productMap = new Map(products.map((p) => [p.id, p]));
  const lineItems: { price: string; quantity: number }[] = [];
  const draftItems: DraftItem[] = [];
  let subtotalCents = 0;
  const priceMismatches: string[] = [];

  for (const item of items) {
    const p = productMap.get(item.product_id);
    if (!p) {
      return NextResponse.json(
        { error: `Producto ${item.product_id} no encontrado` },
        { status: 400 },
      );
    }
    if (!p.is_active) {
      return NextResponse.json(
        { error: `"${p.name}" ya no está disponible` },
        { status: 400 },
      );
    }
    if (p.type !== 'own') {
      return NextResponse.json(
        {
          error: `"${p.name}" es un producto de afiliación y no se puede comprar aquí`,
        },
        { status: 400 },
      );
    }
    if (!p.stripe_price_id) {
      return NextResponse.json(
        {
          error: `"${p.name}" no tiene precio configurado en Stripe`,
        },
        { status: 500 },
      );
    }

    // Verificación de precio: si el cliente envió un precio esperado distinto,
    // notificamos con 409 para que refresque el carrito.
    if (p.price_cents !== item.expected_unit_price_cents) {
      priceMismatches.push(p.name);
    }

    const lineTotalCents = p.price_cents! * item.quantity;
    subtotalCents += lineTotalCents;

    lineItems.push({
      price: p.stripe_price_id,
      quantity: item.quantity,
    });

    const thumb =
      p.images && Array.isArray(p.images) && p.images.length > 0
        ? p.images[0]
        : p.image_url;

    draftItems.push({
      product_id: p.id,
      name: p.name,
      image: thumb,
      unit_price_cents: p.price_cents!,
      compare_at_price_cents: p.compare_at_price_cents ?? null,
      quantity: item.quantity,
      supplier_url: p.supplier_url,
      supplier_sku: p.supplier_sku,
    });
  }

  if (priceMismatches.length > 0) {
    return NextResponse.json(
      {
        error: `El precio de ${priceMismatches.join(', ')} ha cambiado. Refresca tu carrito.`,
        code: 'PRICE_CHANGED',
      },
      { status: 409 },
    );
  }

  // 4. Calcular envío según zona del país + umbral de envío gratis
  const shipping = calculateShipping(shipping_country, subtotalCents);
  const shippingCents = shipping.shipping_cents;

  // 4.5 Validar cupón (si viene)
  let couponId: string | null = null;
  let stripeCouponId: string | null = null;
  let discountCents = 0;
  if (coupon_code) {
    const result = await validateCouponCode(coupon_code, subtotalCents);
    if (!result.ok) {
      return NextResponse.json(
        { error: `Cupón no válido: ${result.error.message}`, code: 'COUPON_INVALID' },
        { status: 400 },
      );
    }
    couponId = result.coupon.id;
    stripeCouponId = result.coupon.stripe_coupon_id;
    discountCents = result.coupon.discount_cents;
  }

  const totalCents = Math.max(0, subtotalCents - discountCents) + shippingCents;

  const { data: draft, error: draftError } = await supabaseAdmin
    .from('order_drafts')
    .insert({
      user_id: user.id,
      email: user.email!,
      locale,
      items: draftItems,
      subtotal_cents: subtotalCents,
      shipping_cents: shippingCents,
      discount_cents: discountCents,
      coupon_id: couponId,
      total_cents: totalCents,
      currency: 'eur',
      status: 'draft',
    })
    .select('id')
    .single();

  if (draftError || !draft) {
    console.error('Failed to create order draft:', draftError);
    return NextResponse.json(
      { error: 'Error al crear el borrador de pedido' },
      { status: 500 },
    );
  }

  // 5. Crear Stripe Checkout Session
  try {
    const shippingText =
      locale === 'es'
        ? 'El envío puede tardar varios días dependiendo del destino. Recibirás un email con el seguimiento.'
        : 'Shipping may take several days depending on destination. You will receive a tracking email.';

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      ...(STRIPE_TAX_ENABLED && { automatic_tax: { enabled: true } }),
      ...(stripeCouponId && {
        discounts: [{ coupon: stripeCouponId }],
      }),
      shipping_address_collection: {
        // Restringimos al país elegido en /cart para evitar que el cliente
        // pague una zona (ej. ES) y luego entregue en otra (ej. US).
        allowed_countries: [shipping_country as 'ES'],
      },
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: {
              amount: shippingCents,
              currency: 'eur',
            },
            display_name: (() => {
              const zoneLabel =
                locale === 'es'
                  ? SHIPPING_ZONES[shipping.zone].label_es
                  : SHIPPING_ZONES[shipping.zone].label_en;
              if (shipping.is_free) {
                return locale === 'es'
                  ? `Envío GRATIS (${zoneLabel})`
                  : `FREE shipping (${zoneLabel})`;
              }
              return locale === 'es'
                ? `Envío estándar — ${zoneLabel}`
                : `Standard shipping — ${zoneLabel}`;
            })(),
          },
        },
      ],
      phone_number_collection: { enabled: true },
      custom_text: {
        submit: { message: shippingText },
      },
      customer_email: user.email!,
      client_reference_id: user.id,
      success_url: `${APP_URL}/dashboard/account/orders?checkout=success`,
      cancel_url: `${APP_URL}/cart`,
      metadata: {
        type: 'cart',
        draft_id: draft.id,
        locale,
        shipping_zone: String(shipping.zone),
        shipping_country,
        ...(couponId && { coupon_id: couponId, coupon_code: coupon_code! }),
      },
    });

    // Actualizar el draft con el stripe_session_id
    await supabaseAdmin
      .from('order_drafts')
      .update({ stripe_session_id: session.id })
      .eq('id', draft.id);

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('Stripe checkout session creation failed:', err);
    return NextResponse.json(
      { error: 'Checkout session failed' },
      { status: 502 },
    );
  }
}
