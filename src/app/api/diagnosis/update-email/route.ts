import { NextResponse } from 'next/server';
import { createSupabaseServer, supabaseAdmin } from '@/lib/supabase/server';
import { diagnosisUpdateEmailSchema } from '@/lib/validation/diagnosis';
import { checkRateLimit, generalLimiter, getClientIp } from '@/lib/security/rate-limit';

export async function POST(req: Request) {
  const rl = await checkRateLimit(generalLimiter, getClientIp(req));
  if (rl) return rl;

  // Require authentication
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = diagnosisUpdateEmailSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }
    const { diagnosisId, email } = parsed.data;

    // Only allow updating if diagnosis has anonymous email
    const { data: diagnosis } = await supabaseAdmin
      .from('diagnoses')
      .select('email')
      .eq('id', diagnosisId)
      .single();

    if (!diagnosis) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    if (!diagnosis.email.endsWith('@anonymous.ophyra')) {
      return NextResponse.json({ success: true });
    }

    // Only allow the authenticated user's email
    const userEmail = user.email;
    if (email !== userEmail) {
      return NextResponse.json({ error: 'Email mismatch' }, { status: 403 });
    }

    const { error } = await supabaseAdmin
      .from('diagnoses')
      .update({ email })
      .eq('id', diagnosisId);

    if (error) {
      console.error('Update email failed');
      return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
