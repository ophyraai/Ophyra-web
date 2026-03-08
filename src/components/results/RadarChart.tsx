'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import {
  RadarChart as RechartsRadar,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
} from 'recharts';

interface Scores {
  sleep: number;
  exercise: number;
  nutrition: number;
  stress: number;
  productivity: number;
  hydration: number;
}

interface RadarChartProps {
  scores: Scores;
}

export default function RadarChartComponent({ scores }: RadarChartProps) {
  const t = useTranslations('results.areas');

  const data = [
    { area: t('sleep'), value: scores.sleep, fullMark: 10 },
    { area: t('exercise'), value: scores.exercise, fullMark: 10 },
    { area: t('nutrition'), value: scores.nutrition, fullMark: 10 },
    { area: t('stress'), value: scores.stress, fullMark: 10 },
    { area: t('productivity'), value: scores.productivity, fullMark: 10 },
    { area: t('hydration'), value: scores.hydration, fullMark: 10 },
  ];

  return (
    <motion.div
      className="mx-auto w-full max-w-md"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.5, type: 'spring' }}
    >
      <ResponsiveContainer width="100%" height={350}>
        <RechartsRadar data={data} cx="50%" cy="50%" outerRadius="75%">
          <PolarGrid
            stroke="rgba(13,148,136,0.08)"
            strokeDasharray="3 3"
          />
          <PolarAngleAxis
            dataKey="area"
            tick={{
              fill: '#6b6480',
              fontSize: 12,
              fontFamily: 'var(--font-sans)',
            }}
          />
          <Radar
            name="Score"
            dataKey="value"
            stroke="#0d9488"
            fill="#0d9488"
            fillOpacity={0.2}
            strokeWidth={2}
            dot={{
              r: 4,
              fill: '#0d9488',
              stroke: '#ffffff',
              strokeWidth: 2,
            }}
          />
        </RechartsRadar>
      </ResponsiveContainer>
    </motion.div>
  );
}
