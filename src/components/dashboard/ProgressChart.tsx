'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface ProgressChartProps {
  data: { date: string; rate: number }[];
}

export default function ProgressChart({ data }: ProgressChartProps) {
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
        <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="violetGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0d9488" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0eef5" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fill: '#6b6480', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: '#6b6480', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip
            contentStyle={{
              background: '#fff',
              border: '1px solid rgba(13,148,136,0.1)',
              borderRadius: '0.75rem',
              boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
              fontSize: 13,
            }}
            formatter={(value) => [`${value}%`, 'Completado']}
          />
          <Area
            type="monotone"
            dataKey="rate"
            stroke="#0d9488"
            strokeWidth={2}
            fill="url(#violetGradient)"
            dot={false}
            activeDot={{ r: 4, fill: '#0d9488', stroke: '#fff', strokeWidth: 2 }}
            animationDuration={1500}
            animationEasing="ease-in-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
