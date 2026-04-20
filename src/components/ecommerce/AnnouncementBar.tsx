'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';

const STORAGE_KEY = 'ophyra:announcement-dismissed';
const DISMISS_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const ROTATE_MS = 4500;
const HEIGHT_PX = 36;

export default function AnnouncementBar() {
  const t = useTranslations('announcement');
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [index, setIndex] = useState(0);

  // No mostrar en rutas admin (tiene su propio nav a top-0)
  const isAdmin = pathname.startsWith('/admin');

  const messages = [t('msgShipping'), t('msgReturns'), t('msgDiagnosis')];

  useEffect(() => {
    setMounted(true);
    let shouldShow = true;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const dismissedAt = parseInt(raw, 10);
        if (!isNaN(dismissedAt) && Date.now() - dismissedAt < DISMISS_TTL_MS) {
          shouldShow = false;
        }
      }
    } catch {
      /* ignore */
    }
    setVisible(shouldShow);
  }, []);

  // Set CSS var on <html> so Navbar + body padding can react.
  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    const show = visible && !isAdmin;
    root.style.setProperty(
      '--announcement-height',
      show ? `${HEIGHT_PX}px` : '0px',
    );
    return () => {
      root.style.setProperty('--announcement-height', '0px');
    };
  }, [mounted, visible, isAdmin]);

  // Rotate messages
  useEffect(() => {
    if (!visible || messages.length <= 1) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % messages.length);
    }, ROTATE_MS);
    return () => clearInterval(id);
  }, [visible, messages.length]);

  function dismiss() {
    try {
      localStorage.setItem(STORAGE_KEY, String(Date.now()));
    } catch {
      /* ignore */
    }
    setVisible(false);
  }

  if (!mounted || !visible || isAdmin) return null;

  return (
    <div
      role="banner"
      className="fixed inset-x-0 top-0 z-[60] flex items-center justify-center bg-ofira-text text-white"
      style={{ height: HEIGHT_PX }}
    >
      <div className="mx-auto flex w-full max-w-6xl items-center justify-center px-10 sm:px-14">
        <AnimatePresence mode="wait">
          <motion.p
            key={index}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="text-center text-[13px] font-medium tracking-wide"
          >
            {messages[index]}
          </motion.p>
        </AnimatePresence>
      </div>
      <button
        type="button"
        onClick={dismiss}
        aria-label={t('close')}
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
      >
        <X className="size-3.5" />
      </button>
    </div>
  );
}
