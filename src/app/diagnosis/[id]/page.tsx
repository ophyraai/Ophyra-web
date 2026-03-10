import { notFound } from 'next/navigation';
import { supabaseAdmin, createSupabaseServer } from '@/lib/supabase/server';
import ResultsClient from './ResultsClient';

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ unlocked?: string }>;
}

export default async function ResultsPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { unlocked } = await searchParams;

  const { data: diagnosis, error } = await supabaseAdmin
    .from('diagnoses')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !diagnosis) {
    notFound();
  }

  // Determine paid status securely
  let isPaid = diagnosis.is_paid;

  // If user just returned from Stripe (unlocked=true) but webhook hasn't fired yet,
  // verify that a real payment exists in the database before unlocking.
  if (!isPaid && unlocked === 'true') {
    const { data: payment } = await supabaseAdmin
      .from('payments')
      .select('status')
      .eq('diagnosis_id', id)
      .in('status', ['completed', 'pending'])
      .limit(1)
      .single();

    if (payment) {
      isPaid = true;
      await supabaseAdmin
        .from('diagnoses')
        .update({ is_paid: true })
        .eq('id', id);
    }
  }

  // Check if user is logged in → skip email gate
  let userEmail: string | null = null;
  try {
    const supabase = await createSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.email) {
      userEmail = user.email;
      // Also update diagnosis email if it was anonymous
      if (diagnosis.email.endsWith('@anonymous.ophyra')) {
        await supabaseAdmin
          .from('diagnoses')
          .update({ email: user.email, user_id: user.id })
          .eq('id', id);
      }

      // If user is premium → auto-unlock this diagnosis
      if (!isPaid) {
        const { data: sub } = await supabaseAdmin
          .from('user_subscriptions')
          .select('id, plan, is_active, free_reports')
          .eq('email', user.email)
          .eq('is_active', true)
          .single();

        if (sub && sub.plan === 'premium') {
          // Premium users: always unlocked
          isPaid = true;
          await supabaseAdmin
            .from('diagnoses')
            .update({ is_paid: true })
            .eq('id', id);
        } else if (sub && (sub.free_reports ?? 0) > 0) {
          // User has free reports available → use one
          isPaid = true;
          await supabaseAdmin
            .from('diagnoses')
            .update({ is_paid: true })
            .eq('id', id);
          await supabaseAdmin
            .from('user_subscriptions')
            .update({ free_reports: (sub.free_reports ?? 0) - 1 })
            .eq('id', sub.id);
        }
      }
    }
  } catch {
    // Not logged in, that's fine
  }

  let aiData = null;
  if (diagnosis.ai_analysis) {
    try {
      aiData = JSON.parse(diagnosis.ai_analysis);
    } catch {
      // AI analysis might be plain text, not JSON
      aiData = {
        summary: diagnosis.ai_summary || '',
        detailed_analysis: [],
        priority_actions: [],
        thirty_day_plan: null,
      };
    }
  }

  return (
    <ResultsClient
      diagnosis={diagnosis}
      aiData={aiData}
      isPaid={isPaid}
      userEmail={userEmail}
    />
  );
}

