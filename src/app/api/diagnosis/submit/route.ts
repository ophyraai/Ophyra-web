import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { calculateScores } from '@/lib/ai/scoring';
import { diagnosisSubmitSchema } from '@/lib/validation/diagnosis';
import { checkRateLimit, diagnosisLimiter, getClientIp } from '@/lib/security/rate-limit';

export async function POST(req: Request) {
  const rl = await checkRateLimit(diagnosisLimiter, getClientIp(req));
  if (rl) return rl;

  try {
    const body = await req.json();
    const parsed = diagnosisSubmitSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input' },
        { status: 400 },
      );
    }
    const { answers, email, name, locale, photoUrls } = parsed.data;

    const { scores, overall_score } = calculateScores(answers);

    const { data, error } = await supabaseAdmin
      .from('diagnoses')
      .insert({
        email,
        name: name || null,
        locale: locale || 'es',
        answers,
        scores,
        overall_score,
        photo_urls: photoUrls || null,
      })
      .select('id, scores, overall_score')
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json(
        { error: 'Failed to save diagnosis' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      id: data.id,
      scores: data.scores,
      overall_score: data.overall_score,
    });
  } catch (err) {
    console.error('Submit diagnosis error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
