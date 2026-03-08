'use client';

import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

interface CategoryRadarProps {
  data: { category: string; score: number }[];
}

export default function CategoryRadar({ data }: CategoryRadarProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center">
        <p className="text-sm text-ofira-text-secondary">Sin datos aun</p>
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} cx="50%" cy="50%" outerRadius="75%">
          <PolarGrid stroke="#f0eef5" />
          <PolarAngleAxis
            dataKey="category"
            tick={{ fill: '#6b6480', fontSize: 11 }}
          />
          <PolarRadiusAxis
            domain={[0, 100]}
            tick={{ fill: '#6b6480', fontSize: 10 }}
            axisLine={false}
            tickCount={5}
          />
          <Tooltip
            contentStyle={{
              background: '#fff',
              border: '1px solid rgba(13,148,136,0.1)',
              borderRadius: '0.75rem',
              boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
              fontSize: 13,
            }}
            formatter={(value) => [`${value}%`, 'Cumplimiento']}
          />
          <Radar
            dataKey="score"
            stroke="#0d9488"
            strokeWidth={2}
            fill="#0d9488"
            fillOpacity={0.15}
            dot={{ r: 3, fill: '#0d9488', stroke: '#fff', strokeWidth: 1 }}
            animationDuration={1200}
            animationEasing="ease-out"
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
