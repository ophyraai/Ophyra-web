import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { createSupabaseServer } from '@/lib/supabase/server';

export async function POST(req: Request) {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { diagnosisId, habits } = await req.json();
  if (!diagnosisId) {
    return NextResponse.json({ error: 'diagnosisId is required' }, { status: 400 });
  }
  if (!Array.isArray(habits) || habits.length < 3) {
    return NextResponse.json({ error: 'At least 3 habits are required' }, { status: 400 });
  }
  if (habits.length > 10) {
    return NextResponse.json({ error: 'Maximum 10 habits allowed' }, { status: 400 });
  }

  // Verify diagnosis belongs to user
  const { data: diagnosis, error: diagError } = await supabaseAdmin
    .from('diagnoses')
    .select('id')
    .eq('id', diagnosisId)
    .eq('user_id', user.id)
    .single();

  if (diagError || !diagnosis) {
    return NextResponse.json({ error: 'Diagnosis not found' }, { status: 404 });
  }

  // Deactivate old habits for this user
  await supabaseAdmin
    .from('habits')
    .update({ is_active: false })
    .eq('user_id', user.id);

  // Insert selected habits
  const habitsToInsert = habits.map((h: { name: string; description: string; category: string; target_frequency: number; sort_order?: number }, i: number) => ({
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
