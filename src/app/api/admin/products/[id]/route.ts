import { NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth/admin';
import { productUpdateSchema } from '@/lib/validation/product';
import {
  syncProductPrice,
  updateStripeProduct,
  archiveStripeProduct,
} from '@/lib/stripe/products';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// ============================================
// PATCH: actualizar producto
// ============================================
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

  const parsed = productUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: 'Validation failed',
        details: z.treeifyError(parsed.error),
      },
      { status: 400 },
    );
  }
  const updates = parsed.data;

  // Cargar producto actual para saber type + Stripe ids antes de tocar nada
  const { data: current, error: loadError } = await supabaseAdmin
    .from('products')
    .select('id, type, stripe_product_id, stripe_price_id, price_cents, currency, slug')
    .eq('id', id)
    .single();

  if (loadError || !current) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  // Si cambia el slug, verificar unicidad
  if (updates.slug && updates.slug !== current.slug) {
    const { data: existingSlug } = await supabaseAdmin
      .from('products')
      .select('id')
      .eq('slug', updates.slug)
      .neq('id', id)
      .maybeSingle();
    if (existingSlug) {
      return NextResponse.json(
        { error: `El slug "${updates.slug}" ya está en uso.` },
        { status: 409 },
      );
    }
  }

  // Construir payload BD (solo los campos que vienen, sin sobrescribir nulos por defecto)
  const dbPayload: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(updates)) {
    if (v !== undefined) dbPayload[k] = v;
  }

  // Mantener legacy `description` y `image_url` en sync para compat
  if (updates.long_description !== undefined) {
    dbPayload.description = updates.long_description ?? updates.short_description ?? null;
  }
  if (updates.images !== undefined) {
    dbPayload.image_url = updates.images[0] ?? null;
  }
  if (updates.price_cents !== undefined) {
    dbPayload.price = updates.price_cents != null ? updates.price_cents / 100 : null;
  }

  // Sincronización con Stripe (solo para productos own)
  if (current.type === 'own') {
    // 1. Si cambia el precio → archivar price antigua, crear nueva
    if (
      updates.price_cents !== undefined &&
      updates.price_cents !== current.price_cents &&
      current.stripe_product_id
    ) {
      try {
        const newPriceId = await syncProductPrice({
          stripeProductId: current.stripe_product_id,
          oldStripePriceId: current.stripe_price_id,
          newPriceCents: updates.price_cents!,
          currency: updates.currency || current.currency || 'eur',
        });
        dbPayload.stripe_price_id = newPriceId;
      } catch (err) {
        console.error('Stripe price sync failed:', err);
        return NextResponse.json(
          { error: 'Stripe price sync failed: ' + (err as Error).message },
          { status: 502 },
        );
      }
    }

    // 2. Si cambia name/desc/images/active → actualizar Stripe product (mutable)
    const stripeProductUpdates: {
      name?: string;
      description?: string | null;
      images?: string[];
      active?: boolean;
    } = {};
    if (updates.name !== undefined) stripeProductUpdates.name = updates.name;
    if (updates.short_description !== undefined || updates.long_description !== undefined) {
      stripeProductUpdates.description =
        updates.short_description ?? updates.long_description ?? null;
    }
    if (updates.images !== undefined) stripeProductUpdates.images = updates.images;
    if (updates.is_active !== undefined) stripeProductUpdates.active = updates.is_active;

    if (Object.keys(stripeProductUpdates).length > 0 && current.stripe_product_id) {
      try {
        await updateStripeProduct({
          stripeProductId: current.stripe_product_id,
          ...stripeProductUpdates,
        });
      } catch (err) {
        console.error('Stripe product update failed (non-fatal):', err);
        // No bloqueamos la actualización en BD por esto
      }
    }
  }

  const { data: updated, error: updateError } = await supabaseAdmin
    .from('products')
    .update(dbPayload)
    .eq('id', id)
    .select('id, name, slug, type, is_active')
    .single();

  if (updateError) {
    return NextResponse.json(
      { error: 'Database update failed: ' + updateError.message },
      { status: 500 },
    );
  }

  return NextResponse.json(updated);
}

// ============================================
// DELETE: borrar producto (soft si tiene order_items, hard si no)
// ============================================
export async function DELETE(_req: Request, ctx: RouteContext) {
  const auth = await requireAdmin();
  if ('response' in auth) return auth.response;

  const { id } = await ctx.params;

  // Cargar producto
  const { data: product, error: loadError } = await supabaseAdmin
    .from('products')
    .select('id, type, stripe_product_id')
    .eq('id', id)
    .single();

  if (loadError || !product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  // ¿Tiene order_items históricos?
  const { count: orderItemsCount } = await supabaseAdmin
    .from('order_items')
    .select('id', { count: 'exact', head: true })
    .eq('product_id', id);

  if ((orderItemsCount ?? 0) > 0) {
    // Soft delete: marcar inactivo, no borrar (para preservar histórico)
    const { error: softErr } = await supabaseAdmin
      .from('products')
      .update({ is_active: false })
      .eq('id', id);

    if (softErr) {
      return NextResponse.json(
        { error: 'Soft delete failed: ' + softErr.message },
        { status: 500 },
      );
    }

    // Archivar también en Stripe
    if (product.type === 'own' && product.stripe_product_id) {
      await archiveStripeProduct(product.stripe_product_id).catch(() => {});
    }

    return NextResponse.json({
      ok: true,
      mode: 'soft',
      reason: `Producto tiene ${orderItemsCount} pedido(s) históricos. Se ha desactivado en lugar de borrarse.`,
    });
  }

  // Hard delete
  const { error: deleteErr } = await supabaseAdmin
    .from('products')
    .delete()
    .eq('id', id);

  if (deleteErr) {
    return NextResponse.json(
      { error: 'Delete failed: ' + deleteErr.message },
      { status: 500 },
    );
  }

  // Archivar en Stripe (no se puede borrar si tuvo prices)
  if (product.type === 'own' && product.stripe_product_id) {
    await archiveStripeProduct(product.stripe_product_id).catch(() => {});
  }

  return NextResponse.json({ ok: true, mode: 'hard' });
}
