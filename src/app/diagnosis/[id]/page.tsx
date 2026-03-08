import { notFound } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase/server';
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

  const isPaid = diagnosis.is_paid || unlocked === 'true';

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
    />
  );
}
