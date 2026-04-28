'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { X, Gift, Loader2 } from 'lucide-react';

const STORAGE_KEY = 'ophyra:welcome_popup_dismissed';
const DELAY_MS = 10000;

export default function WelcomePopup() {
  const t = useTranslations('welcomePopup');
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY)) return;
    } catch {
      return;
    }

    const timer = setTimeout(() => setVisible(true), DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  function dismiss() {
    setVisible(false);
    try {
      localStorage.setItem(STORAGE_KEY, '1');
    } catch {}
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setError(t('invalidEmail'));
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Error');
        return;
      }

      setSubmitted(true);
      try {
        localStorage.setItem(STORAGE_KEY, '1');
      } catch {}
    } catch {
      setError(t('connectionError'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={dismiss}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-[101] flex items-center justify-center p-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
              {/* Close button */}
              <button
                type="button"
                onClick={dismiss}
                className="absolute right-3 top-3 z-10 grid size-8 place-items-center rounded-full text-ofira-text-secondary transition-colors hover:bg-ofira-surface1 hover:text-ofira-text"
              >
                <X className="size-4" />
              </button>

              {/* Header gradient */}
              <div className="bg-gradient-to-br from-ofira-violet/10 to-emerald-500/10 px-6 pb-4 pt-8 text-center">
                <div className="mx-auto mb-3 grid size-14 place-items-center rounded-full bg-ofira-violet/15">
                  <Gift className="size-6 text-ofira-violet" />
                </div>
                <h2 className="text-2xl font-bold text-ofira-text">{t('title')}</h2>
                <p className="mt-1 text-sm text-ofira-text-secondary">{t('subtitle')}</p>
              </div>

              {/* Body */}
              <div className="px-6 pb-6 pt-4">
                {submitted ? (
                  <div className="rounded-xl bg-emerald-50 p-4 text-center">
                    <p className="font-semibold text-emerald-800">{t('successTitle')}</p>
                    <p className="mt-1 text-sm text-emerald-700">{t('successMessage')}</p>
                    <p className="mt-3 rounded-lg bg-white px-4 py-2 font-mono text-lg font-bold tracking-wider text-ofira-violet">
                      WELCOME10
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    <div className="flex gap-2">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={t('placeholder')}
                        className="flex-1 rounded-lg border border-ofira-card-border bg-white px-4 py-3 text-sm text-ofira-text placeholder:text-ofira-text-secondary/50 focus:border-ofira-violet focus:outline-none focus:ring-2 focus:ring-ofira-violet/20"
                      />
                      <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex items-center gap-2 rounded-lg bg-ofira-violet px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-ofira-violet/90 disabled:opacity-60"
                      >
                        {loading ? <Loader2 className="size-4 animate-spin" /> : t('cta')}
                      </button>
                    </div>
                    {error && (
                      <p className="mt-2 text-xs text-red-600">{error}</p>
                    )}
                    <p className="mt-3 text-center text-[11px] text-ofira-text-secondary">
                      {t('privacy')}
                    </p>
                  </form>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
