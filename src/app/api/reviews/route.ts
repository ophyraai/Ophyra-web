import { NextResponse } from 'next/server';
import { createSupabaseServer, supabaseAdmin } from '@/lib/supabase/server';
import { reviewCreateSchema } from '@/lib/validation/review';
import { z } from 'zod';

export async function POST(req: Request) {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Debes iniciar sesión' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = reviewCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: z.treeifyError(parsed.error) },
      { status: 400 },
    );
  }
  const { product_id, rating, body: reviewBody, author_name } = parsed.data;

  // Verify user has purchased this product
  const { data: orderItem } = await supabaseAdmin
    .from('order_items')
    .select('id, order_id')
    .eq('product_id', product_id)
    .limit(1)
    .maybeSingle();

  // Check if any order with this item belongs to this user
  let hasPurchased = false;
  if (orderItem) {
    const { data: order } = await supabaseAdmin
      .from('orders')
      .select('id')
      .eq('id', orderItem.order_id)
      .eq('user_id', user.id)
      .in('status', ['paid', 'processing', 'shipped', 'delivered'])
      .maybeSingle();
    hasPurchased = !!order;
  }

  if (!hasPurchased) {
    return NextResponse.json(
      { error: 'Solo compradores verificados pueden dejar reseñas' },
      { status: 403 },
    );
  }

  // Check if user already reviewed this product
  const { data: existing } = await supabaseAdmin
    .from('reviews')
    .select('id')
    .eq('user_id', user.id)
    .eq('product_id', product_id)
    .eq('is_seed', false)
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      { error: 'Ya has dejado una reseña para este producto' },
      { status: 409 },
    );
  }

  // Get user's name for the review
  const { data: userProfile } = await supabaseAdmin
    .from('users')
    .select('name')
    .eq('auth_id', user.id)
    .maybeSingle();

  const displayName =
    author_name || userProfile?.name || user.email?.split('@')[0] || 'Usuario';

  // Insert the review
  const { data: review, error: insertError } = await supabaseAdmin
    .from('reviews')
    .insert({
      product_id,
      user_id: user.id,
      author_name: displayName,
      rating,
      body: reviewBody,
      is_seed: false,
      is_verified_purchase: true,
      locale: 'es',
    })
    .select()
    .single();

  if (insertError) {
    console.error('Failed to insert review:', insertError);
    return NextResponse.json({ error: 'Error al guardar la reseña' }, { status: 500 });
  }

  // Recalculate product rating: blend seed base + real reviews
  const { data: product } = await supabaseAdmin
    .from('products')
    .select('rating, review_count')
    .eq('id', product_id)
    .single();

  const { data: realReviews } = await supabaseAdmin
    .from('reviews')
    .select('rating')
    .eq('product_id', product_id)
    .eq('is_seed', false);

  const { data: seedReviews } = await supabaseAdmin
    .from('reviews')
    .select('rating')
    .eq('product_id', product_id)
    .eq('is_seed', true);

  if (product && realReviews) {
    const seedCount = seedReviews?.length || 0;
    const seedAvg = seedCount > 0
      ? seedReviews!.reduce((sum, r) => sum + r.rating, 0) / seedCount
      : 0;

    // The admin-set review_count is the "base" number (includes implied reviews not shown)
    // Real reviews add on top
    const baseCount = Math.max(product.review_count - seedCount, 0);
    const baseRating = product.rating || 0;

    const realCount = realReviews.length;
    const realSum = realReviews.reduce((sum, r) => sum + r.rating, 0);

    const totalCount = baseCount + seedCount + realCount;
    const blendedRating = totalCount > 0
      ? (baseRating * baseCount + seedAvg * seedCount + realSum) / totalCount
      : rating;

    await supabaseAdmin
      .from('products')
      .update({
        rating: Math.round(blendedRating * 10) / 10,
        review_count: totalCount,
      })
      .eq('id', product_id);
  }

  return NextResponse.json({ ok: true, review });
}
