import { NextResponse } from 'next/server';
import { generateText } from 'ai';
import { deepseek } from '@ai-sdk/deepseek';
import { supabaseAdmin } from '@/lib/supabase/server';
import { createSupabaseServer } from '@/lib/supabase/server';

export async function POST(req: Request) {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { diagnosisId } = await req.json();
  if (!diagnosisId) {
    return NextResponse.json({ error: 'diagnosisId is required' }, { status: 400 });
  }

  const { data: diagnosis, error: diagError } = await supabaseAdmin
    .from('diagnoses')
    .select('*')
    .eq('id', diagnosisId)
    .eq('user_id', user.id)
    .single();

  if (diagError || !diagnosis) {
    return NextResponse.json({ error: 'Diagnosis not found' }, { status: 404 });
  }

  // thirty_day_plan is stored inside ai_analysis JSON
  let thirtyDayPlan: unknown = null;
  try {
    const parsed = diagnosis.ai_analysis ? JSON.parse(diagnosis.ai_analysis) : null;
    thirtyDayPlan = parsed?.thirty_day_plan;
  } catch {
    // ai_analysis might not be valid JSON
  }
  if (!thirtyDayPlan) {
    return NextResponse.json({ error: 'No plan found in diagnosis' }, { status: 400 });
  }

  const { text } = await generateText({
    model: deepseek('deepseek-chat'),
    system: `You are a health habit extraction assistant. Extract daily trackable habits from a 30-day wellness plan.
Return ONLY a valid JSON array of habit objects. Each object must have:
- "name": string (short, actionable habit name in Spanish)
- "description": string (brief description in Spanish, 1 sentence)
- "category": one of "sleep", "exercise", "nutrition", "hydration", "stress", "productivity"
- "target_frequency": number (days per week, 1-7)
- "sort_order": number (ordering within category)

Extract 8-10 concrete daily habits. Make them specific and achievable. Do not include any text outside the JSON array.`,
    prompt: `Extract daily trackable habits from this 30-day wellness plan:\n\n${typeof thirtyDayPlan === 'string' ? thirtyDayPlan : JSON.stringify(thirtyDayPlan)}`,
  });

  let suggestions: Array<{
    name: string;
    description: string;
    category: string;
    target_frequency: number;
    sort_order: number;
  }>;

  try {
    suggestions = JSON.parse(text);
    if (!Array.isArray(suggestions)) throw new Error('Not an array');
  } catch {
    return NextResponse.json({ error: 'Failed to parse suggestions from AI' }, { status: 500 });
  }

  // Return suggestions WITHOUT inserting — user will select which ones to keep
  return NextResponse.json(suggestions);
}
