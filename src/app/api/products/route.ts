import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category');

  let query = supabaseAdmin
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('sort_order');

  if (category && category !== 'all') {
    query = query.eq('category', category);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }

  return NextResponse.json(data || []);
}
