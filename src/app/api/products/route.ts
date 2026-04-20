import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

// Columnas EXPLÍCITAS — nunca usar select('*') aquí porque la tabla
// products contiene campos privados (supplier_*, stripe_*, internal_ref).
const PUBLIC_COLUMNS =
  'id, name, slug, type, category, short_description, long_description, description, image_url, images, price, price_cents, compare_at_price_cents, currency, affiliate_url, is_active, is_featured, sort_order, created_at';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category');
  const type = searchParams.get('type');

  let query = supabaseAdmin
    .from('products')
    .select(PUBLIC_COLUMNS)
    .eq('is_active', true)
    .order('sort_order')
    .order('created_at', { ascending: false });

  if (category && category !== 'all') {
    query = query.eq('category', category);
  }

  if (type === 'affiliate' || type === 'own') {
    query = query.eq('type', type);
  }

  const { data, error } = await query;

  if (error) {
    console.error('GET /api/products failed:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 },
    );
  }

  return NextResponse.json(data || []);
}
