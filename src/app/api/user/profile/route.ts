import { NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabaseAdmin
    .from('users')
    .select('id, email, name, locale, avatar_url, created_at')
    .eq('auth_id', user.id)
    .single();

  if (error) { console.error('Profile error:', error); return NextResponse.json({ error: 'Operation failed' }, { status: 500 }); }
  return NextResponse.json(data);
}

export async function PATCH(req: Request) {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const allowed = ['name', 'locale'];
  const updates: Record<string, string> = {};
  for (const key of allowed) {
    if (body[key] !== undefined) updates[key] = body[key];
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('users')
    .update(updates)
    .eq('auth_id', user.id)
    .select('id, email, name, locale, avatar_url, created_at')
    .single();

  if (error) { console.error('Profile error:', error); return NextResponse.json({ error: 'Operation failed' }, { status: 500 }); }
  return NextResponse.json(data);
}
