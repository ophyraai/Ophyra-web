'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { TrendingUp, TrendingDown, Minus, ArrowLeft, Star } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from 'recharts';
import Link from 'next/link';

interface DiagnosisData {
  id: string;
  scores: Record<string, number>;
  overall_score: number;
  created_at: string;
}

interface ComparisonViewProps {
  current: DiagnosisData;
  previous: DiagnosisData;
}

const areas = ['sleep', 'exercise', 'nutrition', 'stress', 'productivity', 'hydration'];
const areaLabels: Record<string, string> = {
  sleep: 'Sueno', exercise: 'Ejercicio', nutrition: 'Alimentacion',
  stress: 'Estres', productivity: 'Productividad', hydration: 'Hidratacion',
};

export default function ComparisonView({ current, previous }: ComparisonViewProps) {
  const overallDiff = current.overall_score - previous.overall_score;
  const improved = overallDiff > 0;

  const radarData = areas.map(area => ({
    area: areaLabels[area] || area,
    previous: previous.scores[area] || 0,
    current: current.scores[area] || 0,
  }));

  return (
    <div className="min-h-screen bg-ofira-bg px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <Link href="/dashboard" className="mb-6 inline-flex items-center gap-2 text-sm text-ofira-text-secondary hover:text-ofira-text">
          <ArrowLeft className="size-4" /> Volver al dashboard
        </Link>

        {/* Overall comparison */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <h1 className="mb-6 text-2xl font-bold text-ofira-text">Tu Progreso</h1>

          <div className="flex items-center justify-center gap-8">
            <div>
              <p className="text-sm text-ofira-text-secondary">Antes</p>
              <p className="text-4xl font-bold text-ofira-text-secondary">{previous.overall_score}</p>
            </div>
            <div className="text-3xl">&rarr;</div>
            <div>
              <p className="text-sm text-ofira-text-secondary">Ahora</p>
              <p className="text-4xl font-bold text-ofira-violet">{current.overall_score}</p>
            </div>
          </div>

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: 'spring' }}
            className={`mt-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ${
              improved ? 'bg-green-50 text-green-600' : overallDiff < 0 ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-600'
            }`}
          >
            {improved ? <TrendingUp className="size-4" /> : overallDiff < 0 ? <TrendingDown className="size-4" /> : <Minus className="size-4" />}
            {improved ? `+${overallDiff} puntos` : overallDiff < 0 ? `${overallDiff} puntos` : 'Sin cambios'}
          </motion.div>

          {improved && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="mt-4 flex items-center justify-center gap-2 text-ofira-violet"
            >
              <Star className="size-5" />
              <span className="font-medium">Gran mejora!</span>
            </motion.div>
          )}
        </motion.div>

        {/* Radar chart comparison */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-8 rounded-xl bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
        >
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#f0eef5" />
              <PolarAngleAxis dataKey="area" tick={{ fill: '#6b6480', fontSize: 12 }} />
              <Radar name="Antes" dataKey="previous" stroke="#d1d5db" fill="#d1d5db" fillOpacity={0.2} />
              <Radar name="Ahora" dataKey="current" stroke="#0d9488" fill="#0d9488" fillOpacity={0.2} />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Per-area comparison */}
        <div className="space-y-3">
          {areas.map((area, i) => {
            const prev = previous.scores[area] || 0;
            const curr = current.scores[area] || 0;
            const diff = curr - prev;
            return (
              <motion.div
                key={area}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.08 }}
                className="flex items-center justify-between rounded-xl bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
              >
                <span className="font-medium text-ofira-text">{areaLabels[area]}</span>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-ofira-text-secondary">{prev}</span>
                  <span className="text-ofira-text-secondary">&rarr;</span>
                  <span className="font-semibold text-ofira-text">{curr}</span>
                  <span className={`flex items-center gap-1 text-sm font-medium ${
                    diff > 0 ? 'text-green-600' : diff < 0 ? 'text-red-500' : 'text-gray-400'
                  }`}>
                    {diff > 0 ? <TrendingUp className="size-3.5" /> : diff < 0 ? <TrendingDown className="size-3.5" /> : <Minus className="size-3.5" />}
                    {diff > 0 ? `+${diff}` : diff}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
