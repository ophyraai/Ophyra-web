import { notFound } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase/server';
import ComparisonView from '@/components/dashboard/ComparisonView';

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ previous?: string }>;
}

export default async function ComparePage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { previous } = await searchParams;

  if (!previous) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-ofira-bg px-4">
        <div className="rounded-2xl bg-ofira-surface1 p-8 text-center shadow-sm">
          <h2 className="mb-2 text-xl font-semibold text-ofira-text">
            Comparación no disponible
          </h2>
          <p className="text-ofira-text-secondary">
            No se encontró un diagnóstico previo para comparar.
          </p>
        </div>
      </div>
    );
  }

  const [currentRes, previousRes] = await Promise.all([
    supabaseAdmin.from('diagnoses').select('*').eq('id', id).single(),
    supabaseAdmin.from('diagnoses').select('*').eq('id', previous).single(),
  ]);

  if (currentRes.error || !currentRes.data) {
    notFound();
  }

  if (previousRes.error || !previousRes.data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-ofira-bg px-4">
        <div className="rounded-2xl bg-ofira-surface1 p-8 text-center shadow-sm">
          <h2 className="mb-2 text-xl font-semibold text-ofira-text">
            Comparación no disponible
          </h2>
          <p className="text-ofira-text-secondary">
            El diagnóstico previo no fue encontrado.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ComparisonView
      current={{
        id: currentRes.data.id,
        scores: currentRes.data.scores,
        overall_score: currentRes.data.overall_score,
        created_at: currentRes.data.created_at,
      }}
      previous={{
        id: previousRes.data.id,
        scores: previousRes.data.scores,
        overall_score: previousRes.data.overall_score,
        created_at: previousRes.data.created_at,
      }}
    />
  );
}
