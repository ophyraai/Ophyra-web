'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Sparkles, Loader2, ArrowRight } from 'lucide-react';
import HabitSelectionCard from '@/components/habits/HabitSelectionCard';

interface HabitSuggestion {
  name: string;
  description: string;
  category: string;
  target_frequency: number;
  sort_order: number;
}

export default function HabitSelectPage() {
  const t = useTranslations('dashboard');
  const searchParams = useSearchParams();
  const router = useRouter();
  const diagnosisId = searchParams.get('diagnosisId');

  const [suggestions, setSuggestions] = useState<HabitSuggestion[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!diagnosisId) return;
    setLoading(true);
    fetch('/api/habits/suggest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ diagnosisId }),
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setSuggestions(data);
          // Pre-select first 5
          setSelected(new Set(data.slice(0, 5).map((_: HabitSuggestion, i: number) => i)));
        } else {
          setError(data.error || 'Error loading suggestions');
        }
      })
      .catch(() => setError('Error loading suggestions'))
      .finally(() => setLoading(false));
  }, [diagnosisId]);

  const toggleSelection = (index: number) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else if (next.size < 10) {
        next.add(index);
      }
      return next;
    });
  };

  const handleConfirm = async () => {
    if (selected.size < 3 || !diagnosisId) return;
    setSubmitting(true);
    const selectedHabits = Array.from(selected).map(i => suggestions[i]);
    const res = await fetch('/api/habits/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ diagnosisId, habits: selectedHabits }),
    });
    if (res.ok) {
      router.push('/dashboard');
    } else {
      setError('Error saving habits');
      setSubmitting(false);
    }
  };

  if (!diagnosisId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ofira-bg px-4">
        <p className="text-ofira-text-secondary">Missing diagnosis ID</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ofira-bg px-4 py-8">
      <div className="mx-auto max-w-lg">
        {/* Header */}
        <motion.div
          className="mb-8 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-ofira-violet/10">
            <Sparkles className="h-6 w-6 text-ofira-violet" />
          </div>
          <h1
            className="text-2xl font-bold text-ofira-text md:text-3xl"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {t('habitSelect.title')}
          </h1>
          <p className="mt-2 text-sm text-ofira-text-secondary">
            {t('habitSelect.subtitle')}
          </p>
        </motion.div>

        {/* Loading state */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-ofira-violet" />
            <p className="mt-3 text-sm text-ofira-text-secondary">{t('habitSelect.generating')}</p>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="rounded-xl bg-red-50 p-4 text-center text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Suggestions list */}
        {!loading && suggestions.length > 0 && (
          <>
            {/* Counter */}
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm text-ofira-text-secondary">
                {t('habitSelect.selected', { count: selected.size })}
              </span>
              <span className="text-xs text-ofira-text-secondary/60">
                {t('habitSelect.minMax')}
              </span>
            </div>

            {/* Cards */}
            <div className="space-y-3">
              {suggestions.map((habit, i) => (
                <HabitSelectionCard
                  key={i}
                  habit={habit}
                  selected={selected.has(i)}
                  onToggle={() => toggleSelection(i)}
                  index={i}
                />
              ))}
            </div>

            {/* Confirm button */}
            <motion.div
              className="sticky bottom-6 mt-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <button
                onClick={handleConfirm}
                disabled={selected.size < 3 || submitting}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-ofira-violet px-6 py-4 text-base font-semibold text-white shadow-lg transition-all hover:bg-ofira-violet/90 disabled:opacity-50"
              >
                {submitting ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    {t('habitSelect.confirm', { count: selected.size })}
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}
