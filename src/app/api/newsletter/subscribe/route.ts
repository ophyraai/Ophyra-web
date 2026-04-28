import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { checkRateLimit, generalLimiter, getClientIp } from '@/lib/security/rate-limit';
import { upsertProfile } from '@/lib/customer-profiles';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email().max(254),
});

export async function POST(req: Request) {
  const rl = await checkRateLimit(generalLimiter, getClientIp(req));
  if (rl) return rl;

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

  // Upsert into newsletter_subscribers (idempotent)
  const { error } = await supabaseAdmin
    .from('newsletter_subscribers')
    .upsert(
      { email, subscribed_at: new Date().toISOString() },
      { onConflict: 'email' },
    );

  if (error) {
    console.error('Newsletter subscribe error:', error);
    return NextResponse.json({ error: 'Error al suscribir' }, { status: 500 });
  }

  // Sync to unified customer profile
  await upsertProfile(email, { newsletter_subscribed: true, source: 'welcome_popup' });

  return NextResponse.json({ ok: true });
}
