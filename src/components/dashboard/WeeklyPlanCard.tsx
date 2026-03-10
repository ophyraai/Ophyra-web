'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Clock, CalendarDays } from 'lucide-react';
import type { WeeklyPlan } from '@/hooks/useDiagnosisPlan';

interface WeeklyPlanCardProps {
  plan: WeeklyPlan;
  currentWeek: number;
  daysRemaining: number;
  daysElapsed: number;
  compact?: boolean;
}

const weekLabels = ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4'];
const weekKeys: (keyof WeeklyPlan)[] = ['week1', 'week2', 'week3', 'week4'];

export default function WeeklyPlanCard({
  plan,
  currentWeek,
  daysRemaining,
  daysElapsed,
  compact = false,
}: WeeklyPlanCardProps) {
  const progressPercent = Math.min(Math.round((daysElapsed / 30) * 100), 100);
  const planFinished = currentWeek > 4;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-elevated overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-ofira-card-border bg-gradient-to-r from-ofira-violet/5 to-transparent p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-ofira-violet/10">
            <CalendarDays className="size-5 text-ofira-violet" />
          </div>
          <div>
            <h3 className="font-semibold text-ofira-text">Tu Plan de 30 Días</h3>
            <p className="text-xs text-ofira-text-secondary">
              {planFinished
                ? '¡Plan completado! 🎉'
                : `${daysRemaining} días restantes`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="size-3.5 text-ofira-text-secondary" />
          <span className="text-sm font-bold text-ofira-violet">{progressPercent}%</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="px-5 pt-4">
        <div className="h-1.5 overflow-hidden rounded-full bg-ofira-surface2">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-ofira-violet to-ofira-mint"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Weekly timeline */}
      <div className="p-5">
        <div className="space-y-3">
          {weekKeys.map((key, i) => {
            const weekNum = i + 1;
            const isPast = weekNum < currentWeek;
            const isCurrent = weekNum === currentWeek;
            const isFuture = weekNum > currentWeek;
            const description = plan[key];

            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`flex gap-3 rounded-lg px-3 py-2.5 transition-colors ${
                  isCurrent
                    ? 'bg-ofira-violet/5 ring-1 ring-ofira-violet/20'
                    : isPast
                      ? 'opacity-60'
                      : ''
                }`}
              >
                {/* Status icon */}
                <div className="mt-0.5 shrink-0">
                  {isPast ? (
                    <CheckCircle2 className="size-5 text-ofira-mint" />
                  ) : isCurrent ? (
                    <motion.div
                      animate={{ scale: [1, 1.15, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <div className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-ofira-violet bg-ofira-violet/10">
                        <div className="h-2 w-2 rounded-full bg-ofira-violet" />
                      </div>
                    </motion.div>
                  ) : (
                    <Circle className="size-5 text-ofira-text-secondary/30" />
                  )}
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm font-semibold ${
                        isCurrent
                          ? 'text-ofira-violet'
                          : isPast
                            ? 'text-ofira-text line-through decoration-ofira-text-secondary/30'
                            : 'text-ofira-text-secondary'
                      }`}
                    >
                      {weekLabels[i]}
                    </span>
                    {isCurrent && (
                      <span className="rounded-full bg-ofira-violet/10 px-2 py-0.5 text-[10px] font-bold text-ofira-violet">
                        ACTUAL
                      </span>
                    )}
                  </div>
                  {(!compact || isCurrent) && description && (
                    <p
                      className={`mt-1 text-sm leading-relaxed ${
                        isCurrent ? 'text-ofira-text' : 'text-ofira-text-secondary'
                      }`}
                    >
                      {description}
                    </p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
