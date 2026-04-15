'use client';

import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { useTranslations } from 'next-intl';
import {
  Moon, Dumbbell, Apple, Brain, Zap, Droplets, CheckCircle2, Circle, GripVertical,
} from 'lucide-react';
import type { Habit, HabitEntry } from '@/hooks/useHabits';
import HabitActions from '@/components/habits/HabitActions';

const categoryConfig: Record<string, { icon: typeof Moon; color: string; bg: string }> = {
  sleep:        { icon: Moon,       color: 'text-indigo-600',  bg: 'bg-indigo-50' },
  exercise:     { icon: Dumbbell,   color: 'text-rose-600',    bg: 'bg-rose-50' },
  nutrition:    { icon: Apple,      color: 'text-emerald-600', bg: 'bg-emerald-50' },
  stress:       { icon: Brain,      color: 'text-amber-600',   bg: 'bg-amber-50' },
  productivity: { icon: Zap,        color: 'text-ofira-violet', bg: 'bg-ofira-violet/10' },
  hydration:    { icon: Droplets,   color: 'text-sky-600',     bg: 'bg-sky-50' },
};

function getCategoryConfig(category: string) {
  return categoryConfig[category] || categoryConfig.productivity;
}

interface HabitChecklistProps {
  habits: Habit[];
  entries: HabitEntry[];
  date: string;
  onToggle: (habitId: string, date: string) => void;
  compact?: boolean;
  onReorder?: (category: string, newOrder: Habit[]) => void;
  onEdit?: (habit: Habit) => void;
  onDelete?: (habitId: string) => void;
}

function HabitItem({
  habit,
  done,
  date,
  onToggle,
  compact,
  config,
  draggable,
  onEdit,
  onDelete,
}: {
  habit: Habit;
  done: boolean;
  date: string;
  onToggle: (habitId: string, date: string) => void;
  compact: boolean;
  config: { icon: typeof Moon; color: string; bg: string };
  draggable: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  const Icon = config.icon;

  return (
    <div className="flex items-center gap-1">
      {draggable && (
        <div className="flex h-8 w-5 cursor-grab items-center justify-center opacity-0 transition-opacity group-hover/item:opacity-60 hover:!opacity-100 active:cursor-grabbing">
          <GripVertical className="h-4 w-4 text-ofira-text-secondary" />
        </div>
      )}
      <button
        type="button"
        onClick={() => onToggle(habit.id, date)}
        className={`flex flex-1 items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
          done
            ? 'bg-ofira-violet/5'
            : 'bg-ofira-surface1 hover:bg-ofira-surface2'
        }`}
      >
        <motion.div
          initial={false}
          animate={{ scale: done ? 1 : 0.9 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        >
          {done ? (
            <CheckCircle2 className="h-5 w-5 text-ofira-violet" />
          ) : (
            <Circle className="h-5 w-5 text-ofira-text-secondary/40" />
          )}
        </motion.div>
        <div className="min-w-0 flex-1">
          <span
            className={`text-sm font-medium ${
              done ? 'text-ofira-violet line-through decoration-ofira-violet/30' : 'text-ofira-text'
            }`}
          >
            {habit.name}
          </span>
          {!compact && habit.description && (
            <p className="mt-0.5 truncate text-xs text-ofira-text-secondary">
              {habit.description}
            </p>
          )}
        </div>
        {compact && (
          <div className={`flex h-5 w-5 items-center justify-center rounded ${config.bg}`}>
            <Icon className={`h-3 w-3 ${config.color}`} />
          </div>
        )}
      </button>
      {onEdit && onDelete && !compact && (
        <HabitActions onEdit={onEdit} onDelete={onDelete} />
      )}
    </div>
  );
}

export default function HabitChecklist({
  habits,
  entries,
  date,
  onToggle,
  compact = false,
  onReorder,
  onEdit,
  onDelete,
}: HabitChecklistProps) {
  const t = useTranslations('dashboard');

  // Group by category
  const grouped = habits.reduce<Record<string, Habit[]>>((acc, habit) => {
    const cat = habit.category || 'productivity';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(habit);
    return acc;
  }, {});

  const isCompleted = (habitId: string) => {
    return entries.some(e => e.habit_id === habitId && e.entry_date === date && e.completed);
  };

  const categoryOrder = ['sleep', 'exercise', 'nutrition', 'hydration', 'stress', 'productivity'];
  const sortedCategories = Object.keys(grouped).sort(
    (a, b) => categoryOrder.indexOf(a) - categoryOrder.indexOf(b),
  );

  return (
    <div className="space-y-4">
      {sortedCategories.map(category => {
        const config = getCategoryConfig(category);
        const Icon = config.icon;
        const categoryHabits = grouped[category];

        return (
          <div key={category}>
            {!compact && (
              <div className="mb-2 flex items-center gap-2">
                <div className={`flex h-6 w-6 items-center justify-center rounded-md ${config.bg}`}>
                  <Icon className={`h-3.5 w-3.5 ${config.color}`} />
                </div>
                <span className="text-xs font-semibold uppercase tracking-wide text-ofira-text-secondary">
                  {category}
                </span>
              </div>
            )}
            {onReorder ? (
              <Reorder.Group
                axis="y"
                values={categoryHabits}
                onReorder={(newOrder) => onReorder(category, newOrder)}
                className="space-y-1"
              >
                {categoryHabits.map(habit => (
                  <Reorder.Item
                    key={habit.id}
                    value={habit}
                    className="group/item"
                  >
                    <HabitItem
                      habit={habit}
                      done={isCompleted(habit.id)}
                      date={date}
                      onToggle={onToggle}
                      compact={compact}
                      config={config}
                      draggable
                      onEdit={onEdit ? () => onEdit(habit) : undefined}
                      onDelete={onDelete ? () => onDelete(habit.id) : undefined}
                    />
                  </Reorder.Item>
                ))}
              </Reorder.Group>
            ) : (
              <div className="space-y-1">
                <AnimatePresence>
                  {categoryHabits.map(habit => {
                    const done = isCompleted(habit.id);
                    return (
                      <motion.div key={habit.id} layout whileTap={{ scale: 0.98 }}>
                        <HabitItem
                          habit={habit}
                          done={done}
                          date={date}
                          onToggle={onToggle}
                          compact={compact}
                          config={config}
                          draggable={false}
                          onEdit={onEdit ? () => onEdit(habit) : undefined}
                          onDelete={onDelete ? () => onDelete(habit.id) : undefined}
                        />
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>
        );
      })}

      {habits.length === 0 && (
        <div className="py-8 text-center">
          <p className="text-sm text-ofira-text-secondary">{t('noHabits')}</p>
        </div>
      )}
    </div>
  );
}
