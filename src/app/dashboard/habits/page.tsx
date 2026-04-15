'use client';

import { useEffect, useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase/client';
import { useHabits } from '@/hooks/useHabits';
import { useStreaks } from '@/hooks/useStreaks';
import HabitChecklist from '@/components/dashboard/HabitChecklist';
import HabitEditModal from '@/components/habits/HabitEditModal';
import AddHabitForm from '@/components/habits/AddHabitForm';
import { HabitsSkeleton } from '@/components/dashboard/DashboardSkeleton';
import { ChevronLeft, ChevronRight, Calendar, Plus } from 'lucide-react';
import type { Habit } from '@/hooks/useHabits';

export default function HabitsPage() {
  const t = useTranslations('dashboard');
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null);
    });
  }, []);

  const { habits, entries, loading, toggleEntry, reorderHabits, addHabit, updateHabit, deleteHabit } = useHabits(userId);
  const { completionRate } = useStreaks(habits, entries);

  // Date navigation
  const goToDate = (offset: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + offset);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  // Completion for selected date
  const completedCount = useMemo(() => {
    return entries.filter(
      (e) => e.entry_date === selectedDate && e.completed
    ).length;
  }, [entries, selectedDate]);

  const handleEditSave = async (updates: { name: string; description: string; category: string; target_frequency: number }) => {
    if (!editingHabit) return;
    await updateHabit(editingHabit.id, updates);
    setEditingHabit(null);
  };

  const handleAdd = async (habit: { name: string; description: string; category: string; target_frequency: number }) => {
    await addHabit(habit);
    setShowAddForm(false);
  };

  const handleDelete = async (habitId: string) => {
    await deleteHabit(habitId);
  };

  if (loading) {
    return <HabitsSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ofira-text">{t('habits')}</h1>
          <p className="text-ofira-text-secondary">
            {completedCount} / {habits.length} {t('completed')}
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-ofira-violet text-white shadow-sm hover:bg-ofira-violet/90"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>

      {/* Date picker */}
      <div className="card-elevated flex items-center justify-between p-4">
        <button
          onClick={() => goToDate(-1)}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-ofira-text-secondary hover:bg-ofira-surface1"
        >
          <ChevronLeft className="size-5" />
        </button>

        <div className="flex items-center gap-2 text-center">
          <Calendar className="size-4 text-ofira-violet" />
          <span className="text-sm font-semibold text-ofira-text">
            {new Date(selectedDate + 'T12:00:00').toLocaleDateString('es-ES', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}
          </span>
          {isToday && (
            <span className="rounded-full bg-ofira-violet/10 px-2 py-0.5 text-xs font-medium text-ofira-violet">
              {t('today')}
            </span>
          )}
        </div>

        <button
          onClick={() => goToDate(1)}
          disabled={isToday}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-ofira-text-secondary hover:bg-ofira-surface1 disabled:opacity-30"
        >
          <ChevronRight className="size-5" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="card-elevated p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium text-ofira-text">{t('habitSelect.dailyProgress')}</span>
          <span className="text-sm font-bold text-ofira-violet">
            {habits.length > 0 ? Math.round((completedCount / habits.length) * 100) : 0}%
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-ofira-surface2">
          <motion.div
            className="h-full rounded-full bg-ofira-violet"
            initial={{ width: 0 }}
            animate={{
              width: habits.length > 0 ? `${(completedCount / habits.length) * 100}%` : '0%',
            }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Habits grouped by category */}
      {habits.length > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-elevated p-6"
        >
          <HabitChecklist
            habits={habits}
            entries={entries}
            date={selectedDate}
            onToggle={toggleEntry}
            onReorder={reorderHabits}
            onEdit={(habit) => setEditingHabit(habit)}
            onDelete={handleDelete}
          />
        </motion.div>
      ) : (
        <div className="card-elevated p-8 text-center">
          <p className="text-ofira-text-secondary">{t('noHabits')}</p>
        </div>
      )}

      {/* Edit modal */}
      {editingHabit && (
        <HabitEditModal
          habit={editingHabit}
          onSave={handleEditSave}
          onClose={() => setEditingHabit(null)}
        />
      )}

      {/* Add form modal */}
      {showAddForm && (
        <AddHabitForm
          onAdd={handleAdd}
          onClose={() => setShowAddForm(false)}
        />
      )}
    </div>
  );
}
