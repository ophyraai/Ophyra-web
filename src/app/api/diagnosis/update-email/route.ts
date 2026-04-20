import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { diagnosisUpdateEmailSchema } from '@/lib/validation/diagnosis';
import { checkRateLimit, generalLimiter, getClientIp } from '@/lib/security/rate-limit';

export async function POST(req: Request) {
  const rl = await checkRateLimit(generalLimiter, getClientIp(req));
  if (rl) return rl;

  try {
    const body = await req.json();
    const parsed = diagnosisUpdateEmailSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input' },
        { status: 400 },
      );
    }
    const { diagnosisId, email } = parsed.data;

    // Only update if current email is anonymous
    const { data: diagnosis } = await supabaseAdmin
      .from('diagnoses')
      .select('email')
      .eq('id', diagnosisId)
      .single();

    if (!diagnosis) {
      return NextResponse.json(
        { error: 'Diagnosis not found' },
        { status: 404 }
      );
    }

    if (!diagnosis.email.endsWith('@anonymous.ophyra')) {
      // Already has a real email, just return success
      return NextResponse.json({ success: true });
    }

    const { error } = await supabaseAdmin
      .from('diagnoses')
      .update({ email })
      .eq('id', diagnosisId);

    if (error) {
      console.error('Update email error:', error);
      return NextResponse.json(
        { error: 'Failed to update email' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Update email error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
