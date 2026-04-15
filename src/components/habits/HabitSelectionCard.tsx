'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Moon, Dumbbell, Apple, Brain, Zap, Droplets, Check } from 'lucide-react';

const categoryIcons: Record<string, { icon: typeof Moon; color: string; bg: string }> = {
  sleep:        { icon: Moon,     color: 'text-indigo-600',   bg: 'bg-indigo-50' },
  exercise:     { icon: Dumbbell, color: 'text-rose-600',     bg: 'bg-rose-50' },
  nutrition:    { icon: Apple,    color: 'text-emerald-600',  bg: 'bg-emerald-50' },
  stress:       { icon: Brain,    color: 'text-amber-600',    bg: 'bg-amber-50' },
  productivity: { icon: Zap,      color: 'text-ofira-violet', bg: 'bg-ofira-violet/10' },
  hydration:    { icon: Droplets, color: 'text-sky-600',      bg: 'bg-sky-50' },
};

interface HabitSuggestion {
  name: string;
  description: string;
  category: string;
  target_frequency: number;
  sort_order: number;
}

interface HabitSelectionCardProps {
  habit: HabitSuggestion;
  selected: boolean;
  onToggle: () => void;
  index: number;
}

export default function HabitSelectionCard({ habit, selected, onToggle, index }: HabitSelectionCardProps) {
  const t = useTranslations('dashboard');
  const config = categoryIcons[habit.category] || categoryIcons.productivity;
  const Icon = config.icon;

  return (
    <motion.button
      type="button"
      onClick={onToggle}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, type: 'spring', stiffness: 300, damping: 25 }}
      className={`group relative w-full rounded-xl border-2 p-4 text-left transition-all ${
        selected
          ? 'border-ofira-violet bg-ofira-violet/5 shadow-md'
          : 'border-ofira-border bg-ofira-surface1 hover:border-ofira-violet/30 hover:shadow-sm'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Category icon */}
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${config.bg}`}>
          <Icon className={`h-5 w-5 ${config.color}`} />
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <p className={`text-sm font-semibold ${selected ? 'text-ofira-violet' : 'text-ofira-text'}`}>
            {habit.name}
          </p>
          <p className="mt-0.5 text-xs text-ofira-text-secondary line-clamp-2">
            {habit.description}
          </p>
          <p className="mt-1.5 text-xs text-ofira-text-secondary/60">
            {habit.target_frequency}x / {t('habitSelect.frequencyUnit')}
          </p>
        </div>

        {/* Checkbox */}
        <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-all ${
          selected
            ? 'bg-ofira-violet text-white'
            : 'border-2 border-ofira-border group-hover:border-ofira-violet/40'
        }`}>
          {selected && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            >
              <Check className="h-3.5 w-3.5" />
            </motion.div>
          )}
        </div>
      </div>
    </motion.button>
  );
}
