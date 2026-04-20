import { NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase/server';
import { exportUserData } from '@/lib/gdpr/export-user-data';
import { checkRateLimit, generalLimiter, getClientIp } from '@/lib/security/rate-limit';

export async function GET(req: Request) {
  const rl = await checkRateLimit(generalLimiter, getClientIp(req));
  if (rl) return rl;

  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await exportUserData(user.id);

    if (!data) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const date = new Date().toISOString().slice(0, 10);

    return new NextResponse(JSON.stringify(data, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="ophyra-data-export-${date}.json"`,
      },
    });
  } catch (err) {
    console.error('[GDPR] Export error:', err);
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 },
    );
  }
}
