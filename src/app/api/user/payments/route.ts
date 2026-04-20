import { NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabaseAdmin
    .from('payments')
    .select('id, diagnosis_id, email, amount, currency, status, created_at')
    .eq('email', user.email!)
    .order('created_at', { ascending: false });

  if (error) { console.error('Payments fetch error:', error); return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 }); }
  return NextResponse.json(data ?? []);
}
