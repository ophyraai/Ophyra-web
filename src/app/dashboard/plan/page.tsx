'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase/client';
import { useDiagnosisPlan } from '@/hooks/useDiagnosisPlan';
import { useHabits } from '@/hooks/useHabits';
import WeeklyPlanCard from '@/components/dashboard/WeeklyPlanCard';
import { CalendarDays, ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function PlanPage() {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null);
    });
  }, []);

  const { plan, currentWeek, startDate, daysRemaining, daysElapsed, loading } = useDiagnosisPlan(userId);
  const { habits } = useHabits(userId);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-ofira-violet border-t-transparent" />
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-ofira-text">Mi Plan</h1>
          <p className="text-ofira-text-secondary">Tu plan personalizado de 30 días</p>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-elevated flex flex-col items-center p-12 text-center"
        >
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-ofira-violet/10">
            <CalendarDays className="size-8 text-ofira-violet" />
          </div>
          <h2 className="mb-2 text-xl font-bold text-ofira-text">Aún no tienes un plan</h2>
          <p className="mb-6 max-w-md text-sm text-ofira-text-secondary">
            Completa tu diagnóstico y desbloquea tu informe completo para recibir un plan personalizado de 30 días adaptado a tus objetivos.
          </p>
          <Link
            href="/diagnosis"
            className="inline-flex items-center gap-2 rounded-lg bg-ofira-violet px-6 py-3 text-sm font-medium text-white hover:bg-ofira-violet/90"
          >
            <Sparkles className="size-4" />
            Hacer mi diagnóstico
          </Link>
        </motion.div>
      </div>
    );
  }

  const planFinished = currentWeek > 4;
  const startFormatted = startDate
    ? new Date(startDate).toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-ofira-text">Mi Plan de 30 Días</h1>
        <p className="text-ofira-text-secondary">
          {startFormatted ? `Iniciado el ${startFormatted}` : 'Tu plan personalizado'}
        </p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-elevated card-hover p-5 text-center"
        >
          <p className="text-3xl font-bold text-ofira-violet">{daysElapsed}</p>
          <p className="text-xs text-ofira-text-secondary">Días completados</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="card-elevated card-hover p-5 text-center"
        >
          <p className="text-3xl font-bold text-ofira-text">
            {planFinished ? '✓' : `S${currentWeek}`}
          </p>
          <p className="text-xs text-ofira-text-secondary">Semana actual</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card-elevated card-hover p-5 text-center"
        >
          <p className="text-3xl font-bold text-ofira-mint">{habits.length}</p>
          <p className="text-xs text-ofira-text-secondary">Hábitos activos</p>
        </motion.div>
      </div>

      {/* Full weekly plan (non-compact) */}
      <WeeklyPlanCard
        plan={plan}
        currentWeek={currentWeek}
        daysRemaining={daysRemaining}
        daysElapsed={daysElapsed}
      />

      {/* CTA */}
      {planFinished && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="card-elevated flex items-center justify-between p-5"
        >
          <div>
            <p className="font-semibold text-ofira-text">¡Has completado tu plan! 🎉</p>
            <p className="text-sm text-ofira-text-secondary">
              Realiza un nuevo diagnóstico para medir tu progreso
            </p>
          </div>
          <Link
            href="/diagnosis?rediagnosis=true"
            className="inline-flex items-center gap-2 rounded-lg bg-ofira-violet px-4 py-2 text-sm font-medium text-white hover:bg-ofira-violet/90"
          >
            Nuevo diagnóstico <ArrowRight className="size-4" />
          </Link>
        </motion.div>
      )}
    </div>
  );
}
