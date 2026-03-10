import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const { diagnosisId, email } = await req.json();

    if (!diagnosisId || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

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
