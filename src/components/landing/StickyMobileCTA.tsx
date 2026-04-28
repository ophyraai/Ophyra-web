'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ArrowRight } from 'lucide-react';

export default function StickyMobileCTA() {
  const t = useTranslations('landing.stickyCta');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      // Show after scrolling past 600px, hide near footer
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight;
      const winHeight = window.innerHeight;
      const nearBottom = scrollY + winHeight > docHeight - 300;
      setVisible(scrollY > 600 && !nearBottom);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 border-t border-ofira-card-border bg-white/95 px-4 py-3 backdrop-blur-sm transition-transform duration-300 md:hidden ${
        visible ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      <Link
        href="/diagnosis"
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-ofira-violet px-6 py-3 text-sm font-semibold text-white shadow-sm"
      >
        {t('text')}
        <ArrowRight className="size-4" />
      </Link>
    </div>
  );
}
