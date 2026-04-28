import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth/admin';

// GET /api/admin/settings?key=announcement_bar
export async function GET(req: Request) {
  const auth = await requireAdmin();
  if ('response' in auth) return auth.response;

  const { searchParams } = new URL(req.url);
  const key = searchParams.get('key');
  if (!key) {
    return NextResponse.json({ error: 'Missing key param' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('site_settings')
    .select('value')
    .eq('key', key)
    .single();

  if (error) {
    return NextResponse.json({ value: null });
  }
  return NextResponse.json({ value: data.value });
}

// PATCH /api/admin/settings
export async function PATCH(req: Request) {
  const auth = await requireAdmin();
  if ('response' in auth) return auth.response;

  let body: { key: string; value: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!body.key || body.value === undefined) {
    return NextResponse.json({ error: 'Missing key or value' }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from('site_settings')
    .upsert(
      { key: body.key, value: body.value, updated_at: new Date().toISOString() },
      { onConflict: 'key' },
    );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
