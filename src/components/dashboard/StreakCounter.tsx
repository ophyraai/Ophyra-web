'use client';

import { Flame } from 'lucide-react';
import AnimatedStat from './AnimatedStat';

interface StreakCounterProps {
  streak: number;
}

export default function StreakCounter({ streak }: StreakCounterProps) {
  return (
    <div className="card-elevated card-hover p-5">
      <div className="flex items-center gap-2">
        <Flame className={`size-5 ${streak > 0 ? 'text-ofira-peach' : 'text-ofira-text-secondary'}`} />
        <p className="text-sm text-ofira-text-secondary">Racha</p>
      </div>
      <AnimatedStat value={streak} className="text-2xl font-bold text-ofira-text" />
      <p className="text-xs text-ofira-text-secondary">dias</p>
    </div>
  );
}
