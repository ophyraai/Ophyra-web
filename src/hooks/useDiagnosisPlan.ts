'use client';
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase/client';

export interface WeeklyPlan {
  week1: string;
  week2: string;
  week3: string;
  week4: string;
}

export interface DiagnosisPlanData {
  plan: WeeklyPlan | null;
  currentWeek: number; // 1-4, or 5 if plan is finished
  startDate: string | null;
  daysRemaining: number;
  daysElapsed: number;
  diagnosisId: string | null;
  loading: boolean;
}

export function useDiagnosisPlan(userId: string | null): DiagnosisPlanData {
  const [plan, setPlan] = useState<WeeklyPlan | null>(null);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [diagnosisId, setDiagnosisId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) { setLoading(false); return; }

    (async () => {
      // Find the most recent paid diagnosis for this user
      const { data: diagnosis } = await supabase
        .from('diagnoses')
        .select('id, ai_analysis, created_at')
        .eq('user_id', userId)
        .eq('is_paid', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (diagnosis) {
        setDiagnosisId(diagnosis.id);
        if (diagnosis.ai_analysis) {
          try {
            const parsed = JSON.parse(diagnosis.ai_analysis);
            if (parsed.thirty_day_plan) {
              setPlan(parsed.thirty_day_plan);
              setStartDate(diagnosis.created_at);
            }
          } catch {
            // ai_analysis might not be valid JSON
          }
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

  return { plan, currentWeek, startDate, daysRemaining, daysElapsed, diagnosisId, loading };
}
