'use client';
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase/client';

export interface WeeklyPlan {
  week1: string;
  week2: string;
  week3: string;
  week4: string;
}

export type DiagnosisStatus = 'none' | 'unpaid' | 'paid';

export interface DiagnosisPlanData {
  plan: WeeklyPlan | null;
  currentWeek: number; // 1-4, or 5 if plan is finished
  startDate: string | null;
  daysRemaining: number;
  daysElapsed: number;
  diagnosisId: string | null;
  status: DiagnosisStatus;
  loading: boolean;
}

export function useDiagnosisPlan(userId: string | null): DiagnosisPlanData {
  const [plan, setPlan] = useState<WeeklyPlan | null>(null);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [diagnosisId, setDiagnosisId] = useState<string | null>(null);
  const [status, setStatus] = useState<DiagnosisStatus>('none');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!userId) { setLoading(false); return; }

    (async () => {
      // 1) ¿Hay algún diagnóstico pagado?
      const { data: paid } = await supabase
        .from('diagnoses')
        .select('id, ai_analysis, created_at')
        .eq('user_id', userId)
        .eq('is_paid', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (paid) {
        setStatus('paid');
        setDiagnosisId(paid.id);
        if (paid.ai_analysis) {
          try {
            const parsed = JSON.parse(paid.ai_analysis);
            if (parsed.thirty_day_plan) {
              setPlan(parsed.thirty_day_plan);
              setStartDate(paid.created_at);
            }
          } catch {
            // ai_analysis might not be valid JSON
          }
        }
      } else {
        // 2) No hay pagados — ¿hay al menos uno sin pagar?
        const { data: unpaid } = await supabase
          .from('diagnoses')
          .select('id')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (unpaid) {
          setStatus('unpaid');
          setDiagnosisId(unpaid.id);
        } else {
          setStatus('none');
        }
      }
      setLoading(false);
    })();
  }, [userId]);

  const { currentWeek, daysRemaining, daysElapsed } = useMemo(() => {
    if (!startDate) return { currentWeek: 1, daysRemaining: 30, daysElapsed: 0 };

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const elapsed = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const remaining = Math.max(0, 30 - elapsed);
    const week = Math.min(Math.floor(elapsed / 7) + 1, 5);

    return { currentWeek: week, daysRemaining: remaining, daysElapsed: elapsed };
  }, [startDate]);

  return { plan, currentWeek, startDate, daysRemaining, daysElapsed, diagnosisId, status, loading };
}
