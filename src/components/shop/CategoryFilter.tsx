'use client';

import { useTranslations } from 'next-intl';

const categories = ['all', 'sleep', 'exercise', 'nutrition', 'stress', 'productivity', 'hydration'] as const;

interface CategoryFilterProps {
  selected: string;
  onChange: (category: string) => void;
}

export default function CategoryFilter({ selected, onChange }: CategoryFilterProps) {
  const t = useTranslations('shop.categories');

  return (
    <div className="flex flex-wrap gap-2">
      {categories.map(cat => (
        <button
          key={cat}
          type="button"
          onClick={() => onChange(cat)}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            selected === cat
              ? 'bg-ofira-violet text-white'
              : 'bg-ofira-surface1 text-ofira-text-secondary hover:bg-ofira-surface2 hover:text-ofira-text'
          }`}
        >
          {t(cat)}
        </button>
      ))}
    </div>
  );
}
