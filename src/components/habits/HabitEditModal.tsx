'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { Habit } from '@/hooks/useHabits';

const categories = ['sleep', 'exercise', 'nutrition', 'hydration', 'stress', 'productivity'];

interface HabitEditModalProps {
  habit: Habit;
  onSave: (updates: { name: string; description: string; category: string; target_frequency: number }) => void;
  onClose: () => void;
}

export default function HabitEditModal({ habit, onSave, onClose }: HabitEditModalProps) {
  const t = useTranslations('dashboard');
  const [name, setName] = useState(habit.name);
  const [description, setDescription] = useState(habit.description || '');
  const [category, setCategory] = useState(habit.category);
  const [frequency, setFrequency] = useState(habit.target_frequency);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({ name: name.trim(), description: description.trim(), category, target_frequency: frequency });
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="w-full max-w-md rounded-2xl bg-ofira-bg p-6 shadow-xl"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-lg font-bold text-ofira-text">{t('habitSelect.editHabit')}</h3>
            <button onClick={onClose} className="rounded-lg p-1.5 text-ofira-text-secondary hover:bg-ofira-surface1">
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-ofira-text">{t('habitSelect.habitName')}</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-ofira-border bg-ofira-surface1 px-3 py-2 text-sm text-ofira-text focus:border-ofira-violet focus:outline-none"
                maxLength={100}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-ofira-text">{t('habitSelect.description')}</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-lg border border-ofira-border bg-ofira-surface1 px-3 py-2 text-sm text-ofira-text focus:border-ofira-violet focus:outline-none"
                rows={2}
                maxLength={200}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-ofira-text">{t('habitSelect.category')}</label>
              <div className="flex flex-wrap gap-2">
                {categories.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                      category === cat
                        ? 'bg-ofira-violet text-white'
                        : 'bg-ofira-surface2 text-ofira-text-secondary hover:bg-ofira-surface1'
                    }`}
                  >
                    {t(`categories.${cat}`)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-ofira-text">{t('habitSelect.frequency')}</label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={1}
                  max={7}
                  value={frequency}
                  onChange={(e) => setFrequency(Number(e.target.value))}
                  className="flex-1 accent-ofira-violet"
                />
                <span className="text-sm font-medium text-ofira-violet">{frequency}x</span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-lg border border-ofira-border px-4 py-2.5 text-sm font-medium text-ofira-text-secondary hover:bg-ofira-surface1"
              >
                {t('habitSelect.cancel')}
              </button>
              <button
                type="submit"
                className="flex-1 rounded-lg bg-ofira-violet px-4 py-2.5 text-sm font-medium text-white hover:bg-ofira-violet/90"
              >
                {t('habitSelect.save')}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
