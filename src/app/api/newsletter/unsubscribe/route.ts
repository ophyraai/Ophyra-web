import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email().max(254),
});

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Email inválido' }, { status: 400 });
  }

  const { email } = parsed.data;

  await supabaseAdmin
    .from('newsletter_subscribers')
    .delete()
    .eq('email', email);

  return NextResponse.json({ ok: true });
}
