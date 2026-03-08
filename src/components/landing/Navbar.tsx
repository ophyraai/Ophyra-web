'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

export default function Navbar() {
  const t = useTranslations('landing.navbar');
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Check auth state
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setIsLoggedIn(!!data.user);
    });
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const navLinks = [
    { label: t('diagnosis'), href: '/diagnosis' },
    { label: t('shop'), href: '/shop' },
    isLoggedIn
      ? { label: t('dashboard'), href: '/dashboard' }
      : { label: t('signup'), href: '/auth/signup', highlight: true },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-md shadow-[0_1px_3px_rgba(0,0,0,0.06)]'
            : 'bg-transparent'
        }`}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          {/* Logo */}
          <Link href="/" className="text-xl font-bold">
            <span className="text-gradient">Ophyra</span>
          </Link>

          {/* Desktop links */}
          <div className="hidden items-center gap-8 md:flex">
            {navLinks.map(({ label, href, highlight }) =>
              highlight ? (
                <Link
                  key={href}
                  href={href}
                  className="rounded-lg bg-ofira-violet px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-ofira-violet/90"
                >
                  {label}
                </Link>
              ) : (
                <Link
                  key={href}
                  href={href}
                  className="text-sm font-medium text-ofira-text-secondary transition-colors hover:text-ofira-violet"
                >
                  {label}
                </Link>
              )
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex items-center justify-center rounded-lg p-2 text-ofira-text md:hidden"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-white md:hidden"
          >
            <div className="flex h-full flex-col items-center justify-center gap-8">
              {navLinks.map(({ label, href, highlight }, i) => (
                <motion.div
                  key={href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.08 }}
                >
                  <Link
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className={
                      highlight
                        ? 'rounded-xl bg-ofira-violet px-6 py-3 text-2xl font-semibold text-white transition-colors hover:bg-ofira-violet/90'
                        : 'text-2xl font-semibold text-ofira-text transition-colors hover:text-ofira-violet'
                    }
                  >
                    {label}
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
