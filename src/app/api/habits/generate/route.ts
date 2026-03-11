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

  // Fetch the diagnosis
  const { data: diagnosis, error: diagError } = await supabaseAdmin
    .from('diagnoses')
    .select('*')
    .eq('id', diagnosisId)
    .eq('user_id', user.id)
    .single();

  if (diagError || !diagnosis) {
    return NextResponse.json({ error: 'Diagnosis not found' }, { status: 404 });
  }

  const thirtyDayPlan = diagnosis.thirty_day_plan || diagnosis.report?.thirty_day_plan;
  if (!thirtyDayPlan) {
    return NextResponse.json({ error: 'No plan found in diagnosis' }, { status: 400 });
  }

  // Use Claude to extract habits from the plan
  const { text } = await generateText({
    model: deepseek('deepseek-chat'),
    system: `You are a health habit extraction assistant. Extract daily trackable habits from a 30-day wellness plan.
Return ONLY a valid JSON array of habit objects. Each object must have:
- "name": string (short, actionable habit name in Spanish)
- "description": string (brief description in Spanish)
- "category": one of "sleep", "exercise", "nutrition", "hydration", "stress", "productivity"
- "target_frequency": number (days per week, 1-7)
- "sort_order": number (ordering within category)

Extract 5-10 concrete daily habits. Do not include any text outside the JSON array.`,
    prompt: `Extract daily trackable habits from this 30-day wellness plan:\n\n${typeof thirtyDayPlan === 'string' ? thirtyDayPlan : JSON.stringify(thirtyDayPlan)}`,
  });

  let habits: Array<{
    name: string;
    description: string;
    category: string;
    target_frequency: number;
    sort_order: number;
  }>;

  try {
    habits = JSON.parse(text);
    if (!Array.isArray(habits)) throw new Error('Not an array');
  } catch {
    return NextResponse.json({ error: 'Failed to parse habits from AI response' }, { status: 500 });
  }

  // Deactivate old habits for this user
  await supabaseAdmin
    .from('habits')
    .update({ is_active: false })
    .eq('user_id', user.id);

  // Insert new habits
  const habitsToInsert = habits.map((h, i) => ({
    user_id: user.id,
    name: h.name,
    description: h.description,
    category: h.category,
    target_frequency: h.target_frequency,
    sort_order: h.sort_order ?? i,
    is_active: true,
    diagnosis_id: diagnosisId,
  }));

  const { data: inserted, error: insertError } = await supabaseAdmin
    .from('habits')
    .insert(habitsToInsert)
    .select();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json(inserted, { status: 201 });
}
