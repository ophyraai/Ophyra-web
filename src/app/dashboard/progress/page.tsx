'use client';

import { useEffect, useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase/client';
import { useHabits } from '@/hooks/useHabits';
import { useStreaks } from '@/hooks/useStreaks';
import StreakCounter from '@/components/dashboard/StreakCounter';
import ProgressChart from '@/components/dashboard/ProgressChart';
import HabitHeatmap from '@/components/dashboard/HabitHeatmap';
import CategoryRadar from '@/components/dashboard/CategoryRadar';
import AnimatedStat from '@/components/dashboard/AnimatedStat';
import { ProgressSkeleton } from '@/components/dashboard/DashboardSkeleton';
import { TrendingUp, Target, Award, X, CheckCircle2, Circle } from 'lucide-react';

export default function ProgressPage() {
  const t = useTranslations('dashboard');
  const [userId, setUserId] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<7 | 30>(7);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null);
    });
  }, []);

  const { habits, entries, loading, fetchEntries } = useHabits(userId);
  const { currentStreak, longestStreak, completionRate, weeklyRate } = useStreaks(habits, entries);

  // Fetch more entries when switching to 30 days
  useEffect(() => {
    if (timeRange === 30 && userId) {
      fetchEntries(30);
    }
  }, [timeRange, userId, fetchEntries]);

  // Daily completion data for chart
  const dailyData = useMemo(() => {
    const days = timeRange;
    const data: { date: string; rate: number }[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];

      const dayEntries = entries.filter((e) => e.entry_date === dateStr);
      const completed = dayEntries.filter((e) => e.completed).length;
      const rate = habits.length > 0 ? Math.round((completed / habits.length) * 100) : 0;

      data.push({
        date: d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
        rate,
      });
    }

    return data;
  }, [entries, habits, timeRange]);

  // Category averages for radar chart
  const categoryData = useMemo(() => {
    const categories = new Map<string, { total: number; completed: number }>();

    for (const habit of habits) {
      const cat = habit.category || 'productivity';
      if (!categories.has(cat)) categories.set(cat, { total: 0, completed: 0 });
    }

    const last7 = new Date();
    last7.setDate(last7.getDate() - 7);
    const last7Str = last7.toISOString().split('T')[0];

    for (const entry of entries) {
      if (entry.entry_date < last7Str) continue;
      const habit = habits.find((h) => h.id === entry.habit_id);
      if (!habit) continue;
      const cat = habit.category || 'productivity';
      const data = categories.get(cat);
      if (data) {
        data.total++;
        if (entry.completed) data.completed++;
      }
    }

    return Array.from(categories.entries()).map(([category, data]) => ({
      category: category.charAt(0).toUpperCase() + category.slice(1),
      score: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0,
    }));
  }, [habits, entries]);

  // Heatmap data (last 84 days = 12 weeks)
  const heatmapData = useMemo(() => {
    const data: { date: string; rate: number }[] = [];

    for (let i = 83; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];

      const dayEntries = entries.filter((e) => e.entry_date === dateStr);
      const completed = dayEntries.filter((e) => e.completed).length;
      const rate = habits.length > 0 ? Math.round((completed / habits.length) * 100) : 0;

      data.push({ date: dateStr, rate });
    }

    return data;
  }, [entries, habits]);

  // Selected day detail
  const selectedDayDetail = useMemo(() => {
    if (!selectedDay) return null;
    return habits.map(habit => {
      const entry = entries.find(e => e.habit_id === habit.id && e.entry_date === selectedDay);
      return { habit, completed: entry?.completed ?? false };
    });
  }, [selectedDay, habits, entries]);

  if (loading) {
    return <ProgressSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-ofira-text">Progreso</h1>
        <p className="text-ofira-text-secondary">Tu avance a lo largo del tiempo</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StreakCounter streak={currentStreak} />
        <div className="card-elevated card-hover p-5">
          <div className="flex items-center gap-2">
            <Award className="size-5 text-ofira-mint" />
            <p className="text-sm text-ofira-text-secondary">Mejor racha</p>
          </div>
          <AnimatedStat value={longestStreak} className="text-2xl font-bold text-ofira-text" />
          <p className="text-xs text-ofira-text-secondary">dias</p>
        </div>
        <div className="card-elevated card-hover p-5">
          <div className="flex items-center gap-2">
            <Target className="size-5 text-ofira-violet" />
            <p className="text-sm text-ofira-text-secondary">Hoy</p>
          </div>
          <AnimatedStat value={Math.round(completionRate)} suffix="%" className="text-2xl font-bold text-ofira-text" />
          <p className="text-xs text-ofira-text-secondary">completado</p>
        </div>
        <div className="card-elevated card-hover p-5">
          <div className="flex items-center gap-2">
            <TrendingUp className="size-5 text-ofira-peach" />
            <p className="text-sm text-ofira-text-secondary">Semanal</p>
          </div>
          <AnimatedStat value={weeklyRate} suffix="%" className="text-2xl font-bold text-ofira-text" />
          <p className="text-xs text-ofira-text-secondary">promedio</p>
        </div>
      </div>

      {/* Area chart */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-elevated p-6"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ofira-text">Completado diario</h2>
          <div className="flex gap-1 rounded-lg bg-ofira-surface1 p-1">
            <button
              onClick={() => setTimeRange(7)}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                timeRange === 7
                  ? 'bg-white text-ofira-violet shadow-sm'
                  : 'text-ofira-text-secondary hover:text-ofira-text'
              }`}
            >
              7 dias
            </button>
            <button
              onClick={() => setTimeRange(30)}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                timeRange === 30
                  ? 'bg-white text-ofira-violet shadow-sm'
                  : 'text-ofira-text-secondary hover:text-ofira-text'
              }`}
            >
              30 dias
            </button>
          </div>
        </div>
        <ProgressChart data={dailyData} />
      </motion.div>

      {/* Heatmap & Radar side by side */}
      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card-elevated p-6"
        >
          <h2 className="mb-4 text-lg font-semibold text-ofira-text">Mapa de actividad</h2>
          <HabitHeatmap data={heatmapData} onDayClick={setSelectedDay} />

          {/* Day detail panel */}
          <AnimatePresence>
            {selectedDay && selectedDayDetail && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="mt-4 rounded-lg border border-ofira-card-border bg-ofira-surface1 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm font-semibold text-ofira-text">
                      {new Date(selectedDay + 'T12:00:00').toLocaleDateString('es-ES', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                      })}
                    </span>
                    <button
                      onClick={() => setSelectedDay(null)}
                      className="rounded-md p-1 text-ofira-text-secondary hover:bg-ofira-surface2"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                  <div className="space-y-1.5">
                    {selectedDayDetail.map(({ habit, completed }) => (
                      <div key={habit.id} className="flex items-center gap-2 text-sm">
                        {completed ? (
                          <CheckCircle2 className="size-4 text-ofira-violet" />
                        ) : (
                          <Circle className="size-4 text-ofira-text-secondary/40" />
                        )}
                        <span className={completed ? 'text-ofira-text' : 'text-ofira-text-secondary'}>
                          {habit.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {categoryData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card-elevated p-6"
          >
            <h2 className="mb-4 text-lg font-semibold text-ofira-text">Por categoria</h2>
            <CategoryRadar data={categoryData} />
          </motion.div>
        )}
      </div>
    </div>
  );
}
