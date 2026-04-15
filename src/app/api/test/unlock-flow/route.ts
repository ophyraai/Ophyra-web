/**
 * TEST ONLY — Remove before production deploy.
 *
 * Marks a diagnosis as paid and redirects to /habits/select.
 * Usage: GET /api/test/unlock-flow
 *
 * - Finds the latest diagnosis for the logged-in user
 * - Sets is_paid = true
 * - Creates a subscription if none exists
 * - Redirects to /habits/select?diagnosisId=X
 */
import { NextResponse } from 'next/server';
import { createSupabaseServer, supabaseAdmin } from '@/lib/supabase/server';

export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }

  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Log in first, then visit this URL' }, { status: 401 });
  }

  // Get latest diagnosis for this user
  const { data: diagnosis } = await supabaseAdmin
    .from('diagnoses')
    .select('id, is_paid, ai_analysis')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (!diagnosis) {
    return NextResponse.json({
      error: 'No diagnosis found. Complete a diagnosis first at /diagnosis',
    }, { status: 404 });
  }

  // Check it has ai_analysis with thirty_day_plan
  let hasPlan = false;
  try {
    const parsed = diagnosis.ai_analysis ? JSON.parse(diagnosis.ai_analysis) : null;
    hasPlan = !!parsed?.thirty_day_plan;
  } catch { /* ignore */ }

  if (!hasPlan) {
    return NextResponse.json({
      error: 'Diagnosis has no 30-day plan in ai_analysis. It may not have been fully processed.',
      diagnosisId: diagnosis.id,
    }, { status: 400 });
  }

  // Mark as paid
  if (!diagnosis.is_paid) {
    await supabaseAdmin
      .from('diagnoses')
      .update({ is_paid: true })
      .eq('id', diagnosis.id);
  }

  // Ensure active subscription exists
  const { data: existingSub } = await supabaseAdmin
    .from('user_subscriptions')
    .select('id')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .limit(1)
    .single();

  if (!existingSub) {
    await supabaseAdmin
      .from('user_subscriptions')
      .insert({
        user_id: user.id,
        email: user.email,
        plan: 'premium',
        is_active: true,
        started_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        daily_reminder_enabled: true,
      });
  }

  // Redirect to habit selection
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return NextResponse.redirect(`${baseUrl}/habits/select?diagnosisId=${diagnosis.id}`);
}
