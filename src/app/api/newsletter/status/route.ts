import { NextResponse } from 'next/server';
import { createSupabaseServer, supabaseAdmin } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.json({ subscribed: false });
  }

  const { data } = await supabaseAdmin
    .from('newsletter_subscribers')
    .select('email')
    .eq('email', user.email)
    .maybeSingle();

  return NextResponse.json({ subscribed: !!data });
}
