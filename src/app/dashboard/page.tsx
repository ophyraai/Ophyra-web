'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase/client';
import { useHabits } from '@/hooks/useHabits';
import { useStreaks } from '@/hooks/useStreaks';
import { useSubscription } from '@/hooks/useSubscription';
import { useDiagnosisPlan } from '@/hooks/useDiagnosisPlan';
import HabitChecklist from '@/components/dashboard/HabitChecklist';
import StreakCounter from '@/components/dashboard/StreakCounter';
import AnimatedStat from '@/components/dashboard/AnimatedStat';
import WeeklyPlanCard from '@/components/dashboard/WeeklyPlanCard';
import { OverviewSkeleton } from '@/components/dashboard/DashboardSkeleton';
import Link from 'next/link';
import { RefreshCw, ArrowRight } from 'lucide-react';
import RenewalBanner from '@/components/dashboard/RenewalBanner';

export default function DashboardPage() {
  const t = useTranslations('dashboard');
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null);
    });
  }, []);

  const { habits, entries, loading, toggleEntry } = useHabits(userId);
  const { currentStreak, completionRate } = useStreaks(habits, entries);
  const { isPremium, followUpDate, isExpired, renewalOfferExpires, email } = useSubscription(userId);
  const { plan, currentWeek, daysRemaining, daysElapsed, diagnosisId } = useDiagnosisPlan(userId);

  // Check for ?renewed=true in URL
  const [showRenewedToast, setShowRenewedToast] = useState(false);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('renewed') === 'true') {
        setShowRenewedToast(true);
        window.history.replaceState({}, '', '/dashboard');
        setTimeout(() => setShowRenewedToast(false), 5000);
      }
    }
  }, []);

  const today = new Date().toISOString().split('T')[0];
  const isFollowUpDue = followUpDate && new Date(followUpDate) <= new Date();

  if (loading) {
    return <OverviewSkeleton />;
  }

  return (
    <div className="space-y-8">
      {/* Renewed toast */}
      {showRenewedToast && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="rounded-xl border border-teal-500/20 bg-teal-500/10 p-4 text-center"
        >
          <p className="font-semibold text-teal-400">{t('renewed')}</p>
        </motion.div>
      )}

      {/* Renewal banner */}
      {isExpired && email && (
        <RenewalBanner email={email} renewalOfferExpires={renewalOfferExpires} />
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-ofira-text">{t('title')}</h1>
        <p className="text-ofira-text-secondary">
          {new Date().toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>

      {/* Re-diagnosis banner */}
      {isFollowUpDue && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between rounded-xl border border-ofira-violet/20 bg-ofira-violet/5 p-4"
        >
          <div className="flex items-center gap-3">
            <RefreshCw className="size-5 text-ofira-violet" />
            <div>
              <p className="font-semibold text-ofira-text">{t('rediagnosis')}</p>
              <p className="text-sm text-ofira-text-secondary">{t('rediagnosisDesc')}</p>
            </div>
          </div>
          <Link
            href={`/diagnosis?rediagnosis=true${diagnosisId ? `&previous=${diagnosisId}` : ''}`}
            className="rounded-lg bg-ofira-violet px-4 py-2 text-sm font-medium text-white hover:bg-ofira-violet/90"
          >
            {t('rediagnosisCta')}
          </Link>
        </motion.div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StreakCounter streak={currentStreak} />
        <div className="card-elevated card-hover p-5">
          <p className="text-sm text-ofira-text-secondary">{t('today')}</p>
          <AnimatedStat value={Math.round(completionRate)} suffix="%" className="text-2xl font-bold text-ofira-text" />
          <p className="text-xs text-ofira-text-secondary">{t('completed')}</p>
        </div>
        <div className="card-elevated card-hover p-5">
          <p className="text-sm text-ofira-text-secondary">{t('habits')}</p>
          <AnimatedStat value={habits.length} className="text-2xl font-bold text-ofira-text" />
          <p className="text-xs text-ofira-text-secondary">activos</p>
        </div>
      </div>

      {/* Weekly Plan Card */}
      {plan && (
        <WeeklyPlanCard
          plan={plan}
          currentWeek={currentWeek}
          daysRemaining={daysRemaining}
          daysElapsed={daysElapsed}
          compact
        />
      )}

      {/* Today's habits */}
      {habits.length > 0 ? (
        <div className="card-elevated p-6">
          <h2 className="mb-4 text-lg font-semibold text-ofira-text">{t('today')}</h2>
          <HabitChecklist habits={habits} entries={entries} date={today} onToggle={toggleEntry} />
        </div>
      ) : (
        <div className="card-elevated p-8 text-center">
          <p className="mb-4 text-ofira-text-secondary">{t('noHabits')}</p>
          <Link
            href="/diagnosis"
            className="inline-flex items-center gap-2 rounded-lg bg-ofira-violet px-5 py-2.5 text-sm font-medium text-white hover:bg-ofira-violet/90"
          >
            {t('startPlan')} <ArrowRight className="size-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
