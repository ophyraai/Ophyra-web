'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const FAQ_COUNT = 6;

export default function FAQ() {
  const t = useTranslations('landing.faq');
  const [open, setOpen] = useState(0);

  const faqs = Array.from({ length: FAQ_COUNT }, (_, i) => ({
    q: t(`q${i + 1}`),
    a: t(`a${i + 1}`),
  }));

  return (
    <section className="px-4 py-20 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-[760px]">
        {/* Header */}
        <div className="mb-10 text-center">
          <span className="mb-3 inline-block font-mono text-xs font-semibold uppercase tracking-[0.14em] text-teal-700">
            {t('eyebrow')}
          </span>
          <h2 className="text-3xl font-bold text-ofira-text sm:text-4xl">
            {t('title')}
          </h2>
        </div>

        {/* Accordion */}
        <div className="grid gap-2.5">
          {faqs.map((faq, i) => {
            const isOpen = open === i;
            return (
              <button
                key={i}
                type="button"
                onClick={() => setOpen(isOpen ? -1 : i)}
                className={`w-full rounded-2xl border bg-white px-5 py-5 text-left transition-colors sm:px-6 ${
                  isOpen
                    ? 'border-teal-200/60 shadow-sm'
                    : 'border-ofira-card-border hover:border-teal-200/40'
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="text-base font-semibold text-ofira-text sm:text-[17px]">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`size-[18px] flex-shrink-0 text-teal-600 transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </div>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="mt-3 text-[15px] leading-relaxed text-ofira-text-secondary">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
