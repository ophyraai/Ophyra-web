import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { calculateScores } from '@/lib/ai/scoring';

export async function POST(req: Request) {
  try {
    const { answers, email, name, locale, photoUrls } = await req.json();

    if (!answers || !email) {
      return NextResponse.json(
        { error: 'Missing required fields: answers, email' },
        { status: 400 }
      );
    }

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
