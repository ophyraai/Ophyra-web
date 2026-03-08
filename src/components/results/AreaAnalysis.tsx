'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { ChevronDown, Moon, Dumbbell, Apple, Brain, Zap, Droplets } from 'lucide-react';

interface AreaDetail {
  area: string;
  score: number;
  title: string;
  analysis: string;
  recommendations: string[];
}

interface AreaAnalysisProps {
  areas: AreaDetail[];
  isPaid: boolean;
}

const areaIcons: Record<string, React.ElementType> = {
  sleep: Moon,
  exercise: Dumbbell,
  nutrition: Apple,
  stress: Brain,
  productivity: Zap,
  hydration: Droplets,
};

const areaColors: Record<string, string> = {
  sleep: '#818cf8',
  exercise: '#059669',
  nutrition: '#22c55e',
  stress: '#ec4899',
  productivity: '#f59e0b',
  hydration: '#06b6d4',
};

export default function AreaAnalysis({ areas, isPaid }: AreaAnalysisProps) {
  const t = useTranslations('results');
  const [expandedArea, setExpandedArea] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      <h3
        className="mb-6 text-xl font-bold"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        {t('analysis')}
      </h3>

      {areas.map((area) => {
        const Icon = areaIcons[area.area] || Zap;
        const color = areaColors[area.area] || '#0d9488';
        const isExpanded = expandedArea === area.area;

        return (
          <motion.div
            key={area.area}
            className="overflow-hidden rounded-xl border border-[rgba(13,148,136,0.08)] bg-ofira-surface1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <button
              onClick={() => setExpandedArea(isExpanded ? null : area.area)}
              className="flex w-full items-center gap-4 p-4 text-left transition-colors hover:bg-ofira-surface2"
            >
              <div
                className="flex h-10 w-10 items-center justify-center rounded-lg"
                style={{ backgroundColor: `${color}20` }}
              >
                <Icon className="h-5 w-5" style={{ color }} />
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{area.title}</span>
                  <span
                    className="text-sm font-bold"
                    style={{ color }}
                  >
                    {area.score}/10
                  </span>
                </div>

                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-black/[0.05]">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${(area.score / 10) * 100}%` }}
                    transition={{ duration: 1, delay: 0.3 }}
                  />
                </div>
              </div>

              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="h-5 w-5 text-ofira-text-secondary" />
              </motion.div>
            </button>

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className={isPaid ? '' : 'select-none'}
                >
                  <div className={`border-t border-[rgba(13,148,136,0.08)] p-4 ${!isPaid ? 'blur-sm' : ''}`}>
                    <p className="mb-4 text-sm leading-relaxed text-ofira-text-secondary">
                      {area.analysis}
                    </p>
                    {area.recommendations.length > 0 && (
                      <ul className="space-y-2">
                        {area.recommendations.map((rec, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2 text-sm"
                          >
                            <span style={{ color }}>&#x2022;</span>
                            <span className="text-ofira-text-secondary">
                              {rec}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}
