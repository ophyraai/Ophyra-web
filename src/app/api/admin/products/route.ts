import { NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth/admin';
import { productCreateSchema } from '@/lib/validation/product';
import {
  createStripeProductAndPrice,
  archiveStripeProduct,
} from '@/lib/stripe/products';

export async function POST(req: Request) {
  const auth = await requireAdmin();
  if ('response' in auth) return auth.response;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  // Validar con Zod (discriminated union por type)
  const parsed = productCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: 'Validation failed',
        details: z.treeifyError(parsed.error),
      },
      { status: 400 },
    );
  }
  const data = parsed.data;

  // Verificar que el slug no exista
  const { data: existingSlug } = await supabaseAdmin
    .from('products')
    .select('id')
    .eq('slug', data.slug)
    .maybeSingle();

  if (existingSlug) {
    return NextResponse.json(
      { error: `El slug "${data.slug}" ya está en uso. Elige otro.` },
      { status: 409 },
    );
  }

  // Si es own → crear primero en Stripe, luego BD
  let stripeProductId: string | null = null;
  let stripePriceId: string | null = null;

  if (data.type === 'own') {
    try {
      const result = await createStripeProductAndPrice({
        name: data.name,
        description: data.short_description || data.long_description || null,
        priceCents: data.price_cents,
        currency: data.currency,
        images: data.images,
        metadata: { slug: data.slug },
      });
      stripeProductId = result.stripe_product_id;
      stripePriceId = result.stripe_price_id;
    } catch (err) {
      console.error('Stripe product creation failed:', err);
      return NextResponse.json(
        { error: 'Stripe product creation failed: ' + (err as Error).message },
        { status: 502 },
      );
    }
  }

  // Insertar en BD
  const insertPayload: Record<string, unknown> = {
    type: data.type,
    name: data.name,
    slug: data.slug,
    category: data.category,
    short_description: data.short_description ?? null,
    long_description: data.long_description ?? null,
    description: data.long_description ?? data.short_description ?? null,
    images: data.images,
    image_url: data.images[0] ?? null,
    is_active: data.is_active,
    is_featured: data.is_featured,
    sort_order: data.sort_order,
    price_cents: data.price_cents ?? null,
    price: data.price_cents != null ? data.price_cents / 100 : null,
  };

  if (data.type === 'own') {
    insertPayload.currency = data.currency;
    insertPayload.compare_at_price_cents = data.compare_at_price_cents ?? null;
    insertPayload.weight_grams = data.weight_grams ?? null;
    insertPayload.supplier_url = data.supplier_url ?? null;
    insertPayload.supplier_sku = data.supplier_sku ?? null;
    insertPayload.supplier_notes = data.supplier_notes ?? null;
    insertPayload.internal_ref = data.internal_ref ?? null;
    insertPayload.stripe_product_id = stripeProductId;
    insertPayload.stripe_price_id = stripePriceId;
  } else {
    insertPayload.affiliate_url = data.affiliate_url;
  }

  const { data: created, error } = await supabaseAdmin
    .from('products')
    .insert(insertPayload)
    .select('id, name, slug, type')
    .single();

  if (error) {
    console.error('Insert product failed:', error);
    // Compensar Stripe si la inserción en BD falló
    if (stripeProductId) {
      await archiveStripeProduct(stripeProductId).catch(() => {});
    }
    return NextResponse.json(
      { error: 'Database insert failed: ' + error.message },
      { status: 500 },
    );
  }

  return NextResponse.json(created, { status: 201 });
}
