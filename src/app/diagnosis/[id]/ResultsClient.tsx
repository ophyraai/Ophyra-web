'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import ScoreCounter from '@/components/results/ScoreCounter';
import RadarChartComponent from '@/components/results/RadarChart';
import AreaAnalysis from '@/components/results/AreaAnalysis';
import ActionPlan from '@/components/results/ActionPlan';
import PaywallOverlay from '@/components/results/PaywallOverlay';
import EmailGate from '@/components/results/EmailGate';
import ShareCard from '@/components/results/ShareCard';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Calendar, CheckCircle2 } from 'lucide-react';

interface DiagnosisData {
  id: string;
  email: string;
  name: string;
  locale: string;
  scores: Record<string, number>;
  overall_score: number;
  ai_analysis: string | null;
  ai_summary: string | null;
  is_paid: boolean;
}

interface AIData {
  summary: string;
  detailed_analysis: Array<{
    area: string;
    score: number;
    title: string;
    analysis: string;
    recommendations: string[];
  }>;
  priority_actions: Array<{
    action: string;
    reason: string;
    impact: 'high' | 'medium' | 'low';
  }>;
  thirty_day_plan: {
    week1: string;
    week2: string;
    week3: string;
    week4: string;
  } | null;
}

interface ResultsClientProps {
  diagnosis: DiagnosisData;
  aiData: AIData | null;
  isPaid: boolean;
  userEmail: string | null;
}

export default function ResultsClient({
  diagnosis,
  aiData,
  isPaid,
  userEmail: loggedInEmail,
}: ResultsClientProps) {
  const t = useTranslations('results');
  const isAnonymous = diagnosis.email.endsWith('@anonymous.ophyra');
  const hasRealEmail = !isAnonymous || !!loggedInEmail;
  const [emailUnlocked, setEmailUnlocked] = useState(hasRealEmail);
  const [userEmail, setUserEmail] = useState(loggedInEmail || diagnosis.email);

  const scores = diagnosis.scores || {
    sleep: 5,
    exercise: 5,
    nutrition: 5,
    stress: 5,
    productivity: 5,
    hydration: 5,
  };

  // Show email gate if user hasn't provided email yet
  if (!emailUnlocked) {
    return (
      <EmailGate
        diagnosisId={diagnosis.id}
        score={diagnosis.overall_score || 0}
        name={diagnosis.name || ''}
        onUnlock={(email) => {
          setUserEmail(email);
          setEmailUnlocked(true);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-ofira-bg px-4 py-8">
      <div className="mx-auto max-w-2xl">
        {/* Back button */}
        <Link href="/">
          <Button
            variant="ghost"
            className="mb-6 gap-2 text-ofira-text-secondary hover:text-ofira-text"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>
        </Link>

        {/* Header */}
        <motion.div
          className="mb-12 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="mb-2 text-sm text-ofira-text-secondary">
            {diagnosis.name ? `${diagnosis.name}, ` : ''}
            {t('title')}
          </p>
          <h1
            className="text-3xl font-bold md:text-4xl"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {t('overallScore')}
          </h1>
        </motion.div>

        {/* Score */}
        <div className="relative mb-12 flex justify-center">
          <ScoreCounter score={diagnosis.overall_score || 0} />
        </div>

        {/* Radar Chart */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <RadarChartComponent scores={scores as any} />
        </motion.div>

        {/* Free Summary */}
        {aiData?.summary && (
          <motion.div
            className="glass-card mb-8 rounded-xl border border-[rgba(13,148,136,0.08)] bg-ofira-surface1 p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <p className="text-sm leading-relaxed text-ofira-text-secondary">
              {aiData.summary}
            </p>
          </motion.div>
        )}

        {/* Area Analysis (premium) */}
        {aiData?.detailed_analysis && aiData.detailed_analysis.length > 0 && (
          <div className="relative mb-8">
            <AreaAnalysis areas={aiData.detailed_analysis} isPaid={isPaid} />
          </div>
        )}

        {/* Action Plan (premium) */}
        {aiData?.priority_actions && aiData.priority_actions.length > 0 && (
          <div className="relative mb-8">
            <ActionPlan actions={aiData.priority_actions} isPaid={isPaid} />
          </div>
        )}

        {/* Paywall */}
        {!isPaid && (
          <PaywallOverlay
            diagnosisId={diagnosis.id}
            email={userEmail}
            locale={diagnosis.locale}
          />
        )}

        {/* 30-day Plan (paid only) */}
        {isPaid && aiData?.thirty_day_plan && (
          <motion.div
            className="mb-8 rounded-xl border border-[rgba(13,148,136,0.08)] bg-ofira-surface1 p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <h3
              className="mb-4 text-xl font-bold"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              30-Day Plan
            </h3>
            <div className="space-y-4">
              {Object.entries(aiData.thirty_day_plan).map(
                ([week, description], i) => (
                  <div key={week} className="flex gap-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ofira-violet/10 text-sm font-bold text-ofira-violet">
                      {i + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium capitalize">
                        {week.replace('week', 'Week ')}
                      </p>
                      <p className="text-sm text-ofira-text-secondary">
                        {description}
                      </p>
                    </div>
                  </div>
                ),
              )}
            </div>
          </motion.div>
        )}

        {/* Start 30-day plan CTA */}
        {isPaid && aiData?.thirty_day_plan && (
          <motion.div className="mb-8 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
            <button
              onClick={async () => {
                const res = await fetch('/api/habits/generate', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ diagnosisId: diagnosis.id }),
                });
                if (res.ok) window.location.href = '/dashboard';
              }}
              className="inline-flex items-center gap-2 rounded-lg bg-ofira-violet px-6 py-3 font-medium text-white hover:bg-ofira-violet/90"
            >
              <Calendar className="size-4" />
              Empieza tu Plan de 30 Dias
            </button>
          </motion.div>
        )}

        {/* Share */}
        <ShareCard score={diagnosis.overall_score || 0} diagnosisId={diagnosis.id} name={diagnosis.name || ''} />

        {/* Account saved confirmation */}
        {loggedInEmail && (
          <motion.div
            className="mt-8 flex items-center justify-center gap-2.5 rounded-xl border border-emerald-500/15 bg-emerald-50/50 px-5 py-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
          >
            <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-emerald-600" />
            <div>
              <p className="text-sm font-medium text-emerald-900">{t('saveAccount.saved')}</p>
              <p className="text-xs text-emerald-700/60">{t('saveAccount.savedSub')}</p>
            </div>
          </motion.div>
        )}

        {/* Footer spacing */}
        <div className="h-16" />
      </div>
    </div>
  );
}
