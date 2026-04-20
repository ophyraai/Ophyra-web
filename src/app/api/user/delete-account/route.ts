import { NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase/server';
import { deleteUserData } from '@/lib/gdpr/delete-user-data';
import { checkRateLimit, generalLimiter, getClientIp } from '@/lib/security/rate-limit';

export async function DELETE(req: Request) {
  const rl = await checkRateLimit(generalLimiter, getClientIp(req));
  if (rl) return rl;

  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const summary = await deleteUserData(user.id);

    console.warn(
      `[GDPR] Account deleted: authId=${user.id}, email=${user.email}, summary=${JSON.stringify(summary)}`,
    );

    return NextResponse.json({ ok: true, summary });
  } catch (err) {
    console.error('[GDPR] Delete account error:', err);
    return NextResponse.json(
      { error: 'Failed to delete account' },
      { status: 500 },
    );
  }
}
