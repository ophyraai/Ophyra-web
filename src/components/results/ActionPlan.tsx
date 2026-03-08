'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { ArrowRight } from 'lucide-react';

interface PriorityAction {
  action: string;
  reason: string;
  impact: 'high' | 'medium' | 'low';
}

interface ActionPlanProps {
  actions: PriorityAction[];
  isPaid: boolean;
}

const impactColors = {
  high: '#c4a1ff',
  medium: '#ff9e7a',
  low: '#8b82a8',
};

export default function ActionPlan({ actions, isPaid }: ActionPlanProps) {
  const t = useTranslations('results');

  return (
    <div className={!isPaid ? 'select-none' : ''}>
      <h3
        className="mb-6 text-xl font-bold"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        {t('actionPlan')}
      </h3>

      <div className={`space-y-4 ${!isPaid ? 'blur-sm' : ''}`}>
        {actions.map((action, i) => (
          <motion.div
            key={i}
            className="relative overflow-hidden rounded-xl border border-[rgba(196,161,255,0.08)] bg-ofira-surface1 p-5"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.15 }}
          >
            <div className="flex items-start gap-4">
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold"
                style={{
                  backgroundColor: `${impactColors[action.impact]}20`,
                  color: impactColors[action.impact],
                }}
              >
                {i + 1}
              </div>

              <div className="flex-1">
                <p className="font-medium">{action.action}</p>
                <p className="mt-1 text-sm text-ofira-text-secondary">
                  {action.reason}
                </p>
              </div>

              <div className="flex items-center gap-1">
                <span
                  className="rounded-full px-2 py-0.5 text-xs font-medium"
                  style={{
                    backgroundColor: `${impactColors[action.impact]}15`,
                    color: impactColors[action.impact],
                  }}
                >
                  {action.impact}
                </span>
                <ArrowRight
                  className="h-4 w-4 text-ofira-text-secondary"
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
