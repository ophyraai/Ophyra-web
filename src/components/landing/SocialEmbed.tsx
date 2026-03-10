'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { ExternalLink, Eye } from 'lucide-react';
import Link from 'next/link';

interface ReelConfig {
  platform: 'instagram' | 'tiktok';
  embedId: string;
  views: string;
}

const reels: ReelConfig[] = [
  { platform: 'instagram', embedId: 'DU1k93AjEJ7', views: '+3M' },
  { platform: 'instagram', embedId: 'DSOAyx8jCJV', views: '+2.1M' },
  { platform: 'tiktok', embedId: '7603512560704359702', views: '+4.8M' },
  { platform: 'tiktok', embedId: '7604634815433886998', views: '+2.5M' },
];

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
    </svg>
  );
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 0010.86 4.48V13a8.28 8.28 0 005.58 2.16v-3.45a4.85 4.85 0 01-4.83-1.56V6.69h4.83z"/>
    </svg>
  );
}

function SkeletonLoader() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-ofira-surface1">
      <div className="mb-4 h-14 w-14 animate-pulse rounded-full bg-ofira-surface2" />
      <div className="mx-4 h-4 w-3/4 animate-pulse rounded bg-ofira-surface2" />
      <div className="mt-2 h-3 w-1/3 animate-pulse rounded bg-ofira-surface2" />
    </div>
  );
}

function ViewsBadge({ views, platform }: { views: string; platform: 'instagram' | 'tiktok' }) {
  return (
    <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
      {platform === 'instagram' ? (
        <InstagramIcon className="size-3" />
      ) : (
        <TikTokIcon className="size-3" />
      )}
      <Eye className="size-3" />
      {views}
    </div>
  );
}

function ReelCard({ reel, index }: { reel: ReelConfig; index: number }) {
  const [loaded, setLoaded] = useState(false);

  const embedUrl =
    reel.platform === 'instagram'
      ? `https://www.instagram.com/reel/${reel.embedId}/embed/`
      : `https://www.tiktok.com/embed/v2/${reel.embedId}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="relative aspect-[9/16] min-w-[260px] overflow-hidden rounded-2xl border border-ofira-card-border bg-ofira-surface1 snap-center"
    >
      <ViewsBadge views={reel.views} platform={reel.platform} />
      {!loaded && <SkeletonLoader />}
      <iframe
        src={embedUrl}
        className="h-full w-full"
        style={{ opacity: loaded ? 1 : 0 }}
        loading="lazy"
        allow="encrypted-media; autoplay; clipboard-write; web-share"
        referrerPolicy="no-referrer-when-downgrade"
        sandbox="allow-scripts allow-same-origin allow-popups allow-presentation"
        allowFullScreen
        onLoad={() => setLoaded(true)}
      />
    </motion.div>
  );
}

export default function SocialEmbed() {
  const t = useTranslations('landing.socialEmbed');

  return (
    <section className="py-20 px-4">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <h2 className="text-3xl font-bold text-ofira-text sm:text-4xl">{t('title')}</h2>
        </motion.div>

        {/* Grid: 2x2 desktop, horizontal scroll mobile */}
        <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {reels.map((reel, i) => (
            <ReelCard key={`${reel.platform}-${reel.embedId}`} reel={reel} index={i} />
          ))}
        </div>

        {/* Mobile: horizontal scroll */}
        <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 sm:hidden -mx-4 px-4">
          {reels.map((reel, i) => (
            <ReelCard key={`${reel.platform}-${reel.embedId}`} reel={reel} index={i} />
          ))}
        </div>

        {/* Watch more link */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8 flex justify-center"
        >
          <Link
            href="https://www.instagram.com/ophyra_secret/reels/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium text-ofira-violet transition-colors hover:text-ofira-peach"
          >
            {t('watchMore')}
            <ExternalLink className="size-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
