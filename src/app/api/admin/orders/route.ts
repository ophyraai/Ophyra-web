import { NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth/admin';
import { orderListQuerySchema } from '@/lib/validation/order';

export async function GET(req: Request) {
  const auth = await requireAdmin();
  if ('response' in auth) return auth.response;

  const url = new URL(req.url);
  const parsed = orderListQuerySchema.safeParse(
    Object.fromEntries(url.searchParams.entries()),
  );
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid query', details: z.treeifyError(parsed.error) },
      { status: 400 },
    );
  }
  const { status, search, page, page_size } = parsed.data;

  // Construcción de query. Usamos service role (bypass RLS) porque ya
  // gateamos vía requireAdmin y queremos ver TODOS los pedidos.
  let query = supabaseAdmin
    .from('orders')
    .select(
      'id, status, email, shipping_name, total_cents, currency, tracking_number, created_at, paid_at',
      { count: 'exact' },
    );

  if (status) query = query.eq('status', status);

  if (search) {
    // Búsqueda por email, shipping_name o prefijo de ID.
    // PostgreSQL: ilike es case-insensitive.
    const s = search.replace(/[%_]/g, '\\$&'); // escape LIKE wildcards
    query = query.or(
      `email.ilike.%${s}%,shipping_name.ilike.%${s}%,id::text.ilike.${s}%`,
    );
  }

  const from = (page - 1) * page_size;
  const to = from + page_size - 1;

  const { data, count, error } = await query
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    console.error('Admin orders list failed:', error);
    return NextResponse.json(
      { error: 'Database query failed: ' + error.message },
      { status: 500 },
    );
  }

  return NextResponse.json({
    orders: data || [],
    total: count ?? 0,
    page,
    page_size,
  });
}
