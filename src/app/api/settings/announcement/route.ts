import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

// Public endpoint — no auth needed
export async function GET() {
  const { data } = await supabaseAdmin
    .from('site_settings')
    .select('value')
    .eq('key', 'announcement_bar')
    .single();

  if (!data?.value) {
    return NextResponse.json({ messages: [], enabled: false });
  }

  return NextResponse.json(data.value);
}
