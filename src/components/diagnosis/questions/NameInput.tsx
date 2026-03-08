'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';

interface NameInputProps {
  value: string;
  onChange: (value: string) => void;
}

export default function NameInput({ value, onChange }: NameInputProps) {
  const t = useTranslations('diagnosis.q1');
  const inputRef = useRef<HTMLInputElement>(null);
  const [focused, setFocused] = useState(false);
  const hasValue = value && value.length > 0;
  const labelUp = focused || hasValue;
  const showGreeting = value && value.length >= 2;

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="w-full max-w-md text-center">
      <h2 className="mb-10 text-3xl font-bold tracking-tight sm:text-4xl">
        {t('title')}
      </h2>
      <div className="relative">
        <motion.label
          className="pointer-events-none absolute left-4 text-ofira-text-secondary"
          animate={{
            y: labelUp ? -28 : 0,
            scale: labelUp ? 0.85 : 1,
            color: labelUp ? '#c4a1ff' : '#8b82a8',
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          style={{ originX: 0, top: '50%', translateY: '-50%' }}
        >
          {t('placeholder')}
        </motion.label>
        <input
          ref={inputRef}
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="w-full rounded-xl border border-ofira-card-border bg-ofira-card px-4 py-4 text-lg text-ofira-text outline-none transition-all focus:border-ofira-violet focus:shadow-[0_0_15px_rgba(196,161,255,0.2)]"
        />
      </div>
      <AnimatePresence>
        {showGreeting && (
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.3 }}
            className="mt-4 text-lg text-ofira-violet"
          >
            Hola, {value}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
