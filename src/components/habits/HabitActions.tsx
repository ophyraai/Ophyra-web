'use client';

import { useState, useRef, useEffect } from 'react';
import { MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface HabitActionsProps {
  onEdit: () => void;
  onDelete: () => void;
}

export default function HabitActions({ onEdit, onDelete }: HabitActionsProps) {
  const t = useTranslations('dashboard');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        className="flex h-7 w-7 items-center justify-center rounded-md text-ofira-text-secondary/60 hover:bg-ofira-surface2 hover:text-ofira-text-secondary"
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {open && (
        <div className="absolute right-0 top-8 z-20 min-w-[140px] rounded-lg border border-ofira-border bg-ofira-bg py-1 shadow-lg">
          <button
            onClick={(e) => { e.stopPropagation(); setOpen(false); onEdit(); }}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-ofira-text hover:bg-ofira-surface1"
          >
            <Pencil className="h-3.5 w-3.5" />
            {t('habitSelect.edit')}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setOpen(false); onDelete(); }}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
            {t('habitSelect.delete')}
          </button>
        </div>
      )}
    </div>
  );
}
