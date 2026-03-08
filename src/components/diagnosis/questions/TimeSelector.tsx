'use client';

import { useTranslations } from 'next-intl';
import { Slider } from '@/components/ui/slider';

interface TimeSelectorProps {
  value: number;
  onChange: (value: number) => void;
}

function sliderToTime(val: number): string {
  const totalMinutes = 5 * 60 + val * 30;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours > 12 ? hours - 12 : hours;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

export default function TimeSelector({ value, onChange }: TimeSelectorProps) {
  const t = useTranslations('diagnosis.q2');
  const sliderValue = value ?? 5;

  return (
    <div className="w-full max-w-md text-center">
      <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
        {t('title')}
      </h2>
      <p className="mb-10 text-sm text-ofira-text-secondary">{t('subtitle')}</p>
      <div className="mb-8 text-6xl font-bold tracking-tight text-ofira-violet">
        {sliderToTime(sliderValue)}
      </div>
      <Slider
        min={0}
        max={14}
        step={1}
        value={[sliderValue]}
        onValueChange={(v) => onChange(v[0])}
        className="mx-auto max-w-sm"
      />
      <div className="mt-3 flex justify-between text-xs text-ofira-text-secondary">
        <span>5:00 AM</span>
        <span>12:00 PM</span>
      </div>
    </div>
  );
}
